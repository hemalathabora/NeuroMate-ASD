🌟NeuroMate – AI-Powered Adaptive ASD Screening System
Smart · Adaptive · Category-Aware Autism Screening with PDF Reports

NeuroMate is an AI-enhanced Autism Spectrum Disorder (ASD) early screening system that uses an adaptive questioning model, category-based scoring, and real-time interaction to provide a modern, accessible, and evidence-aligned screening experience.

It is designed for hospitals, clinics, researchers, and parents/caregivers seeking an early, structured evaluation tool.

🚀 Key Features
🧠 1. Adaptive Questioning Logic

The system intelligently decides when to dive deeper into a category.

If the first question of a category is NO → skip full category.

If YES → explore more detailed questions.

Provides highly sensitive & personalized screening flow.

📊 2. Category-Based ASD Assessment

Six ASD-related behavior categories:

Social Interaction

Communication

Hyperactivity & Attention

Repetitive Behaviors

Sensory Processing

Learning & Cognitive Patterns

Each category receives:

✔ Score

✔ Severity level (“Normal”, “Mild”, “Moderate”, “High”, “Severe”)

🏥 3. Hospital-Grade PDF Report

Automatically generated PDF includes:

User demographics

Category scores

Severity analysis

Total YES count

Professional suggestions

Disclaimer & timestamp

Ideal for sharing with specialists.

🤖 4. AI-Styled Frontend (React + Tailwind)

ChatGPT-like demographic assistant

Smooth animations & dark futuristic UI

Adaptive buttons (text input OR Yes/No)

Progress indicators

Real-time backend connection

⚡ 5. FastAPI Backend

Clean, lightweight Python backend

Deterministic logic (no machine learning model required)

PDF generator (ReportLab)

CORS-enabled for React frontend

🛠 Tech Stack
Frontend

React.js

Tailwind CSS

React Router

Custom AI-style animated UI

Backend

FastAPI

Python 3.9+

ReportLab (for PDF generation)

Tools

Git & GitHub

Postman (optional for testing)

📦 Project Structure
NeuroMate-ASD/
│
├── asd_project_frontend/
│   ├── src/
│   │   ├── pages/ (Demographics, Screening, Result)
│   │   ├── api/backend.js
│   │   └── App.js / index.js
│   ├── public/
│   ├── package.json
│   └── tailwind setup
│
└── asd_project_backend/
    ├── main.py
    ├── pdf_utils.py
    ├── utils.py
    ├── requirements.txt
    └── venv/ (ignored)

🧩 How It Works (Flow)
Step 1 — Start Session

User clicks “Start Screening” → backend generates unique session ID.

Step 2 — Demographics (Chat Assistant UI)

Name

Age

Gender

Country

Ethnicity

Relation

Jaundice history

Prior ASD screening

Step 3 — Adaptive ASD Screening

Each category:

If Q1 = no → skip full category

If Q1 = yes → ask deeper questions

Step 4 — Final Assessment

Backend calculates:

Total YES count

Category severity

Overall ASD likelihood

Guidance & suggestions

Step 5 — PDF Report

User can download report.

🖥 Running the Project Locally
Backend
cd asd_project_backend
pip install -r requirements.txt
uvicorn main:app --reload


Runs at: http://127.0.0.1:8000

Frontend
cd asd_project_frontend
npm install
npm start


Runs at: http://localhost:3000

📄 Sample Output Labels
Total YES	Category Scores	Final Result
0–2	Mostly Normal	No ASD
3–6	Mild levels	At Risk
7–12	Moderate signs	Probable ASD
13+	High severity	Likely ASD
🧪 Why This System Is Effective

✔ More accurate than flat questionnaires
✔ Reduces unnecessary questions
✔ Faster screening time
✔ Personalized experience
✔ Professional reporting

🎯 Use Cases

Hospitals

Clinical psychologists

Early childhood centers

Special education schools

AI healthcare research projects

Parent-guided screening

📜 License

MIT License — Free for academic & personal use.

❤️ Team Message

NeuroMate was built with one goal:
make ASD early screening accessible, efficient, and modern for everyone.

