🌱 GreenPulse
Description

GreenPulse is a community-driven urban greening platform designed to combat rising urban heat islands and loss of green cover caused by rapid urbanization.
It empowers citizens to report unused spaces, tree loss, and heat-prone areas using geo-tagged data, while AI-driven analysis helps experts and government bodies prioritize, approve, and implement impactful greening initiatives.

The platform bridges the gap between citizens, environmental experts, industries, and government authorities, ensuring data-backed, collaborative, and scalable urban sustainability solutions.

🚀 Features

🌍 Citizen-powered geo-tagged reporting of unused spaces, tree loss, and heat hotspots

🤖 AI-driven feasibility & impact analysis for urban greening proposals

🗳️ Community voting & expert feedback on greening ideas

🏛️ Government & authority workflow for review, approval, and execution

📊 Real-time monitoring dashboard tracking green cover and temperature reduction

🔐 Role-based authentication (Citizen, Expert, Authority)

🛠 Tech Stack

Frontend: React.js, Vite, Tailwind CSS

Backend: Firebase Cloud Functions

Database: Firebase Firestore

Authentication: Firebase Authentication

Maps & Geo-location: Google Maps API

AI & Analysis: Google Gemini API, Google Cloud Vision API

Cloud Infrastructure: Google Cloud Platform, Firebase Hosting

☁️ Google Technologies Used

⚠️ Using Google products is mandatory for this hackathon

Firebase Authentication – Secure role-based login for citizens, experts, and authorities

Firebase Firestore – Real-time storage for geo-tagged reports, votes, and feedback

Firebase Hosting – Hosting the web application

Google Maps Platform – Location tagging, heat-zone visualization, and mapping unused spaces

Google Cloud Vision API – Analyzes uploaded images to identify land type and vegetation loss

Google Gemini API – AI-powered feasibility analysis, idea prioritization, and summarization

Google Cloud Platform & Cloud Storage – Scalable infrastructure and secure data storage

⚙️ Setup Instructions
Prerequisites

Node.js (v18+ recommended)

Firebase CLI

Google Maps API key

Firebase project setup

Steps to Run Locally
# Clone the repository
git clone <your-repository-url>

# Navigate to frontend
cd frontend
npm install
npm run dev

# Navigate to backend
cd ../backend/functions
npm install
firebase emulators:start


🔑 Add required API keys and Firebase configuration in .env files before running.

🌍 Impact & Feasibility

Reduces urban heat by targeting high-impact greening zones

Improves city planning through real-time citizen insights

Encourages community ownership and participation

Enables faster, data-backed government decisions

Scalable from streets → cities → regions
