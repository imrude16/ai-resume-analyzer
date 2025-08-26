# AI Resume Analyzer

AI Resume Analyzer is a web application that evaluates resumes against job descriptions using AI-powered scoring and analysis. It helps job seekers improve their resumes by providing insights such as ATS (Applicant Tracking System) compatibility, keyword matching, and overall resume quality.

---

## 🚀 Features

- 📂 Upload resumes in PDF format  
- 🔍 Extracts and analyzes resume content  
- 🤖 AI-powered scoring for ATS optimization  
- 📊 Visual feedback via scorecards, gauges, and summaries  
- 📝 Suggestions for improvement  
- 🌐 Modern UI built with **React + TypeScript + Vite**

---

## 📂 Project Structure

- **app/** → Core frontend logic (components, routes, styles, utilities)  
- **components/** → UI building blocks (Uploader, ScoreCard, Navbar, etc.)  
- **routes/** → Pages (auth, home, resume analysis, upload, etc.)  
- **lib/** → Helper functions (PDF processing, utilities, Puter.js integration)  
- **constants/** → Reusable constants across the app  
- **Dockerfile** → Containerization support  
- **vite.config.ts** → Vite configuration  
- **react-router.config.ts** → Router setup  

---

## 🛠️ Setup & Installation

### 1️⃣ Clone the Repository
\`\`\`bash
git clone https://github.com/yourusername/AI-Resume-Analyzer.git
cd AI-Resume-Analyzer/AI\ RESUME\ ANALYZER
\`\`\`

### 2️⃣ Install Dependencies
\`\`\`bash
npm install
\`\`\`

### 3️⃣ Start Development Server
\`\`\`bash
npm run dev
\`\`\`
Then open **http://localhost:5173** in your browser.

### 4️⃣ Build for Production
\`\`\`bash
npm run build
npm run preview
\`\`\`

---

## 🐳 Docker Setup (Optional)

If you want to run using Docker:

\`\`\`bash
docker build -t ai-resume-analyzer .
docker run -p 5173:5173 ai-resume-analyzer
\`\`\`

---

## ⚙️ Environment Variables

Create a `.env` file in the project root with the following values (example):

\`\`\`bash
VITE_API_URL=http://localhost:5000
VITE_PUTER_API_KEY=your_puter_api_key
\`\`\`

These environment variables configure API endpoints and **Puter.js** integration.

---

## 📌 Tech Stack

- **Frontend Framework:** React (with TypeScript)  
- **Build Tool:** Vite  
- **Routing:** React Router  
- **Styling:** CSS (extendable with Tailwind)  
- **Containerization:** Docker  
- **AI & Resume Parsing:** Custom parsing with helper libraries  
- **Puter.js:** A cloud-native JavaScript SDK for storage, API handling, and integrations  

---

## 🔍 What is Puter.js?

[Puter.js](https://puter.com/) is a **cloud-native JavaScript SDK** that simplifies integration with APIs, cloud storage, and remote services.  

In this project, it is used for:
- Secure API calls  
- Managing cloud-based resume processing  
- Handling file uploads and storage seamlessly  

This makes the app scalable, ensuring resumes can be uploaded, analyzed, and stored efficiently without relying only on local storage.

---

## 📖 How It Works

1. Upload your resume (PDF format).  
2. The app extracts text from the resume.  
3. AI algorithms evaluate the content against job-relevant criteria.  
4. Results are displayed with:  
   - ATS score  
   - Resume summary  
   - Visual scorecards & gauges  
   - Suggestions for improvement  

---

## 🤝 Contributing

Pull requests are welcome! Please open an issue first to discuss any major changes.

