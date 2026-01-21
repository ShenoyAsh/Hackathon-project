# GreenPulse - Urban Greening Platform

A comprehensive citizen-driven platform for identifying and transforming urban spaces into green zones, powered by Google Cloud technologies.

## 🌱 Features

### 1️⃣ Citizen Geo-Tagged Issue Reporting
- **Photo Upload**: Citizens upload photos of unused land, tree loss areas, and heat hotspots
- **Automatic Location Capture**: GPS coordinates and reverse geocoding
- **Google Products**: Google Maps Platform, Firebase (Firestore + Storage)

### 2️⃣ Heat Zone & Green Cover Visualization
- **Interactive City Map**: Real-time visualization of heat intensity and green zones
- **Map Layers**: Multiple layers for better decision-making
- **Google Products**: Google Maps Platform, Google Cloud Platform

### 3️⃣ AI-Based Image & Land Analysis
- **Automated Detection**: Land type, vegetation presence, and suitability analysis
- **Google Products**: Google Cloud Vision API, Google Cloud Platform

### 4️⃣ Feasibility & Impact Prediction
- **AI Engine**: Predicts feasibility, temperature reduction, and environmental impact
- **Smart Ranking**: AI-driven proposal prioritization
- **Google Products**: Google Gemini API, Google Cloud Platform

### 5️⃣ Community Voting & Expert Review
- **Democratic Process**: Citizens upvote priority areas
- **Expert Review**: Planners and experts review proposals
- **Google Products**: Firebase Firestore, Firebase Authentication

### 6️⃣ Government & CSR Collaboration
- **Digital Approval**: Authorities approve projects digitally
- **Partner Platform**: NGOs and CSR partners contribute resources
- **Google Products**: Firebase, Google Cloud Platform

### 7️⃣ Real-Time Impact Monitoring
- **Live Tracking**: Trees planted, green cover increase, heat reduction
- **Visual Dashboards**: Comprehensive impact analytics
- **Google Products**: Firebase Realtime Updates, Google Cloud Platform

### 8️⃣ Scalable Smart City Platform
- **Multi-Level Scaling**: Streets → wards → cities
- **Smart City Integration**: Compatible with climate programs
- **Google Products**: Google Cloud Platform, Google Maps Platform

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn
- Google Cloud Project with required APIs enabled
- Firebase project

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd WinterHackathon-CodeTrinity/frontend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Configuration**
   ```bash
   cp .env.example .env
   ```
   
   Configure your environment variables:
   ```env
   # Firebase Configuration
   VITE_FIREBASE_API_KEY=your_firebase_api_key
   VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
   VITE_FIREBASE_PROJECT_ID=your_project_id
   VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
   VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
   VITE_FIREBASE_APP_ID=your_app_id

   # Google Maps Platform
   VITE_GOOGLE_MAPS_API_KEY=your_google_maps_api_key

   # Google Cloud Platform
   VITE_GOOGLE_CLOUD_PROJECT_ID=your_gcp_project_id
   VITE_GOOGLE_CLOUD_API_KEY=your_gcp_api_key

   # Google Gemini API
   VITE_GEMINI_API_KEY=your_gemini_api_key
   ```

4. **Start the development server**
   ```bash
   npm run dev
   ```

5. **Open your browser**
   Navigate to `http://localhost:5173`

## 🏗️ Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── layout/         # Layout components
│   └── ui/             # UI components
├── context/            # React contexts
├── pages/              # Page components
│   ├── Auth.jsx                    # Authentication
│   ├── Dashboard.jsx               # Main dashboard
│   ├── Report.jsx                  # Issue reporting
│   ├── MapVisualization.jsx        # Interactive maps
│   ├── CommunityVoting.jsx         # Community voting
│   ├── CollaborationDashboard.jsx  # Gov/CSR collaboration
│   └── ImpactMonitoring.jsx        # Impact analytics
├── services/            # External services
│   ├── firebase.js      # Firebase configuration
│   └── googleCloud.js   # Google Cloud services
└── utils/               # Utility functions
```

## 🔧 Google Cloud Setup

### Required APIs & Services

1. **Firebase**
   - Firestore Database
   - Firebase Storage
   - Firebase Authentication

2. **Google Maps Platform**
   - Maps JavaScript API
   - Geocoding API

3. **Google Cloud Platform**
   - Cloud Vision API
   - Cloud Functions (for backend processing)

4. **Google Gemini API**
   - Generative AI for feasibility analysis

### Configuration Steps

1. **Create Firebase Project**
   - Enable Firestore and Storage
   - Configure Authentication providers
   - Set up security rules

2. **Enable Google Cloud APIs**
   - Enable Vision API
   - Set up API keys with proper restrictions
   - Configure billing

3. **Google Maps Setup**
   - Get Maps JavaScript API key
   - Enable Geocoding API
   - Set up proper referrer restrictions

## 📱 Responsive Design

The application is fully responsive and optimized for:
- **Desktop**: Full functionality with enhanced UI
- **Tablet**: Optimized touch interactions
- **Mobile**: Streamlined interface with essential features

## 🎯 Key Technologies

- **Frontend**: React 19, Vite, Tailwind CSS
- **Maps**: Leaflet, React-Leaflet
- **Charts**: Recharts
- **Authentication**: Firebase Auth
- **Database**: Firebase Firestore
- **Storage**: Firebase Storage
- **AI/ML**: Google Cloud Vision, Gemini API
- **Icons**: Lucide React

## 🔒 Security Features

- Firebase Authentication with role-based access
- API key restrictions and environment variables
- Firestore security rules
- Input validation and sanitization
- HTTPS enforcement

## 🌍 Environment Variables

All sensitive configuration is handled through environment variables:
- Firebase credentials
- Google Cloud API keys
- Google Maps API keys
- Gemini API keys

## 📊 Data Flow

1. **Report Submission**: User captures photo → Location data → AI analysis → Firebase storage
2. **Community Voting**: Users upvote → Real-time updates → Priority ranking
3. **Expert Review**: Authorities review → Approval workflow → Project initiation
4. **Impact Tracking**: Progress updates → Analytics calculation → Dashboard visualization

## 🚀 Deployment

### Build for Production
```bash
npm run build
```

### Preview Production Build
```bash
npm run preview
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

For support and questions:
- Create an issue in the repository
- Check the documentation
- Review the Firebase and Google Cloud documentation

## 🌟 Impact Metrics

The platform tracks:
- Trees planted and green cover increase
- Temperature reduction in urban areas
- CO₂ absorption and air quality improvement
- Community engagement and participation
- Water conservation and biodiversity impact

---

**GreenPulse** - Transforming urban spaces, one community at a time. 🌱🏙️
