import {type FormEvent, useState} from 'react'
import Navbar from "~/components/Navbar";
import FileUploader from "~/components/FileUploader";
import {usePuterStore} from "~/lib/puter";
import {useNavigate} from "react-router";
import {convertPdfToImage} from "~/lib/pdf2img";
import {generateUUID} from "~/lib/utils";
import {prepareInstructions} from "../../constants";

const Upload = () => {
    const { auth, isLoading, fs, ai, kv } = usePuterStore();
    const navigate = useNavigate();
    const [isProcessing, setIsProcessing] = useState(false);
    const [statusText, setStatusText] = useState('');
    const [errorText, setErrorText] = useState('');
    const [file, setFile] = useState<File | null>(null);

    const handleFileSelect = (file: File | null) => {
        setFile(file)
    }

    const isValidFeedback = (feedback: unknown): feedback is Feedback => {
        return (
            !!feedback &&
            typeof feedback === 'object' &&
            typeof (feedback as Feedback).overallScore === 'number' &&
            !!(feedback as Feedback).ATS &&
            typeof (feedback as Feedback).ATS.score === 'number'
        );
    }

    const getErrorMessage = (error: unknown) => {
        const getStringValue = (value: unknown): string => {
            if (!value) return '';
            if (typeof value === 'string') return value;
            if (value instanceof Error) return value.message;
            if (typeof value !== 'object') return String(value);

            const record = value as Record<string, unknown>;
            const directMessage =
                getStringValue(record.message) ||
                getStringValue(record.error) ||
                getStringValue(record.code);

            if (directMessage) return directMessage;

            try {
                return JSON.stringify(value);
            } catch {
                return '';
            }
        }

        const message = getStringValue(error);
        const lowerMessage = message.toLowerCase();

        if (
            lowerMessage.includes('all free ai providers') ||
            lowerMessage.includes('upstream_provider_unavailable')
        ) {
            return 'All free AI providers are currently unavailable. Please try again later.';
        }

        if (
            lowerMessage.includes('model') ||
            lowerMessage.includes('not found') ||
            lowerMessage.includes('unavailable') ||
            lowerMessage.includes('bad_request')
        ) {
            return 'Free AI model is unavailable right now. Please try again later.';
        }

        if (lowerMessage.includes('json')) {
            return 'AI returned an invalid response. Please try again.';
        }

        return message || 'Error: Failed to analyze resume';
    }

    const parseFeedback = (feedbackText: string) => {
        const trimmedFeedback = feedbackText.trim();
        const jsonText = trimmedFeedback.startsWith('```')
            ? trimmedFeedback.replace(/^```(?:json)?/i, '').replace(/```$/i, '').trim()
            : trimmedFeedback;

        try {
            return JSON.parse(jsonText);
        } catch (error) {
            throw new Error('json_parse_failed');
        }
    }

    const handleAnalyze = async ({ companyName, jobTitle, jobDescription, file }: { companyName: string, jobTitle: string, jobDescription: string, file: File  }) => {
        setIsProcessing(true);
        setErrorText('');

        try {
            setStatusText('Uploading the file...');
            const uploadedFile = await fs.upload([file]);
            if(!uploadedFile) {
                setErrorText('Error: Failed to upload file');
                return;
            }

            setStatusText('Converting to image...');
            const imageFile = await convertPdfToImage(file);
            if(!imageFile.file) {
                setErrorText('Error: Failed to convert PDF to image');
                return;
            }

            setStatusText('Uploading the image...');
            const uploadedImage = await fs.upload([imageFile.file]);
            if(!uploadedImage) {
                setErrorText('Error: Failed to upload image');
                return;
            }

            setStatusText('Analyzing...');

            const feedback = await ai.feedback(
                uploadedImage.path,
                prepareInstructions({ jobTitle, jobDescription })
            )
            if (!feedback) {
                setErrorText('Error: Failed to analyze resume');
                return;
            }

            const feedbackText = typeof feedback.message.content === 'string'
                ? feedback.message.content
                : feedback.message.content[0].text;

            const parsedFeedback = parseFeedback(feedbackText);
            if (!isValidFeedback(parsedFeedback)) {
                setErrorText('AI returned an invalid response. Please try again.');
                return;
            }

            setStatusText('Preparing data...');
            const uuid = generateUUID();
            const data = {
                id: uuid,
                resumePath: uploadedFile.path,
                imagePath: uploadedImage.path,
                companyName, jobTitle, jobDescription,
                feedback: parsedFeedback,
            }

            await kv.set(`resume:${uuid}`, JSON.stringify(data));
            setStatusText('Analysis complete, redirecting...');
            console.log(data);
            navigate(`/resume/${uuid}`);
        } catch (error) {
            setErrorText(getErrorMessage(error));
        } finally {
            setIsProcessing(false);
        }
    }

    const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const form = e.currentTarget.closest('form');
        if(!form) return;
        const formData = new FormData(form);

        const companyName = formData.get('company-name') as string;
        const jobTitle = formData.get('job-title') as string;
        const jobDescription = formData.get('job-description') as string;

        if(!file) {
            setErrorText('Error: Please upload a resume first');
            return;
        }

        handleAnalyze({ companyName, jobTitle, jobDescription, file });
    }

    return (
        <main className="bg-[url('/images/bg-main.svg')] bg-cover">
            <Navbar />

            <section className="main-section">
                <div className="page-heading py-16">
                    <h1>Smart feedback for your dream job</h1>
                    {isProcessing ? (
                        <>
                            <h2>{statusText}</h2>
                            <img src="/images/resume-scan.gif" className="w-full" />
                        </>
                    ) : (
                        <>
                            <h2>Drop your resume for an ATS score and improvement tips</h2>
                            {errorText && <p className="text-red-600 font-semibold mt-4">{errorText}</p>}
                        </>
                    )}
                    {!isProcessing && (
                        <form id="upload-form" onSubmit={handleSubmit} className="flex flex-col gap-4 mt-8">
                            <div className="form-div">
                                <label htmlFor="company-name">Company Name</label>
                                <input type="text" name="company-name" placeholder="Company Name" id="company-name" />
                            </div>
                            <div className="form-div">
                                <label htmlFor="job-title">Job Title</label>
                                <input type="text" name="job-title" placeholder="Job Title" id="job-title" />
                            </div>
                            <div className="form-div">
                                <label htmlFor="job-description">Job Description</label>
                                <textarea rows={5} name="job-description" placeholder="Job Description" id="job-description" />
                            </div>

                            <div className="form-div">
                                <label htmlFor="uploader">Upload Resume</label>
                                <FileUploader onFileSelect={handleFileSelect} />
                            </div>

                            <button className="primary-button" type="submit">
                                Analyze Resume
                            </button>
                        </form>
                    )}
                </div>
            </section>
        </main>
    )
}
export default Upload
