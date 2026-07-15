# CareerVault AI 🚀
> Your centralized, AI-powered professional asset vault, job application tracker, and placement preparation suite.

CareerVault AI is designed to take the chaos out of placement drives and job hunting for tech students. It provides a secure vault to store resumes and verified certificates, an interactive Kanban board to track job applications, a deadline reminder dashboard for upcoming assessments, and a Chrome extension that scrapes and logs job details directly from registration pages.

---

## ✨ Features

### 1. 📂 Professional Asset Vault
* **Resume Vault**: Upload, store, and manage multiple versions of your resume (e.g. SDE, Web, Data Analyst). Designate one as your *active resume* for quick applications.
* **Certificate Vault**: Catalog your verified credentials and certificates with validation links for easy sharing.

### 2. 📋 Kanban Placement Tracker
* Track applications dynamically through different stages: **Applied ➔ OA (Online Assessment) ➔ Interviewing ➔ Offered ➔ Rejected**.
* Set salary packages (LPA), job description URLs, additional notes, and attach the specific resume version used for each application.

### 3. ⏰ Online Assessment (OA) & Interview Reminders
* Input exam/interview dates to get visual alerts directly on your Kanban cards.
* **Urgent Badge**: Cards glow red and pulse when tests are less than 48 hours away.
* **Dashboard Alerts**: A dynamic alert panel on your home screen lists all upcoming tests sorted by date with live countdowns (e.g., *TODAY!*, *Tomorrow*, or *In X days*).

### 4. 🧩 Chrome Auto-Scraper Extension
* Automatically intercepts campus placement Google Forms or drive registrations.
* Captures company and role details instantly and sends them straight to your tracker board in the background.

### 5. 🤖 AI-Powered ATS Resume Analyzer
* Paste any job description to instantly analyze how well your active resume matches.
* Receives a compatibility score, key gap analysis, and tailored bullet-point recommendations.

---

## 🛠️ Tech Stack

* **Frontend**: React (Vite), Tailwind CSS, Axios, Lucide Icons, React Router
* **Backend**: Node.js, Express, Mongoose
* **Database**: MongoDB (In-memory fallback for local environments)
* **Browser Extension**: Chrome Extension MV3 (Content Scripts, Service Workers)

---

## 🚀 Getting Started

### Prerequisites
* [Node.js](https://nodejs.org/) installed on your computer.

### Step 1: Run the Backend Server
1. Navigate to the `backend` folder:
   ```bash
   cd backend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the development server:
   ```bash
   npm run dev
   ```
   > 💡 **Note**: If no MongoDB connection URI is configured in `.env`, the server automatically spins up an **In-Memory MongoDB Server in RAM**. The app is ready to run immediately!

---

### Step 2: Run the Frontend Client
1. Navigate to the `frontend` folder:
   ```bash
   cd ../frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the Vite client:
   ```bash
   npm run dev
   ```
4. Open [http://localhost:5173](http://localhost:5173) in your browser.

---

### Step 3: Install the Chrome Extension
1. Open Google Chrome and go to `chrome://extensions/`.
2. Toggle on **Developer mode** (top-right switch).
3. Click **Load unpacked** (top-left button).
4. Select the `chrome-extension` folder inside your CareerVault project directory.
5. Pin the CareerVault extension to your browser toolbar!

---

## ⚙️ Environment Configuration (`backend/.env`)

Create a `.env` file inside the `backend` folder to configure credentials:

```env
PORT=5000
NODE_ENV=development
JWT_SECRET=your_jwt_secret_key

# Optional: Add Atlas DB for persistent cloud data
MONGO_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/careervault

# Optional: Add Gemini AI API for LLM Resume Analysis & Career Chat
GEMINI_API_KEY=your_gemini_api_key

# Optional: Add Cloudinary for persistent resume cloud hosting
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

---

## 🛡️ Built-in Local Fallbacks
Don't have API keys? No problem! The application runs completely offline using:
* **MongoDB Memory Server**: Stores data dynamically in RAM.
* **Local Disk Storage**: Uploads PDFs to `backend/uploads/` on your local disk.
* **Local AI Analyzer**: Employs a local rule-based matching engine to calculate ATS scores.
