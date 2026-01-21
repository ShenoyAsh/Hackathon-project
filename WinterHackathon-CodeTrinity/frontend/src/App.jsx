import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import Layout from './components/layout/Layout';
import Home from './pages/Home';
import Auth from './pages/Auth';
import Dashboard from './pages/Dashboard';
import Report from './pages/Report';
import MapVisualization from './pages/MapVisualization';
import CommunityVoting from './pages/CommunityVoting';
import CollaborationDashboard from './pages/CollaborationDashboard';
import ImpactMonitoring from './pages/ImpactMonitoring';
import Profile from './pages/Profile';
import PageNotFound from './pages/PageNotFound';
import IntroVideo from './components/IntroVideo';
import ARView from './pages/ARView';
import Leaderboard from './pages/Leaderboard';
import ReviewReports from './pages/ReviewReports';
import UrbanForestryGuide from './pages/UrbanForestryGuide';
import { LanguageProvider } from './context/LanguageContext';

function App() {
  const [showIntro, setShowIntro] = useState(true);

  if (showIntro) {
    return <IntroVideo onComplete={() => setShowIntro(false)} />;
  }

  return (
    <BrowserRouter>
      <LanguageProvider>
        <AuthProvider>
          <Toaster position="top-right" />
          <Layout>
            <AnimatedRoutes />
          </Layout>
        </AuthProvider>
      </LanguageProvider>
    </BrowserRouter>
  );
}

// Separate component to use useLocation hook
const AnimatedRoutes = () => {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<PageWrapper><Home /></PageWrapper>} />
        <Route path="/auth" element={<PageWrapper><Auth /></PageWrapper>} />
        <Route path="/dashboard" element={<PageWrapper><Dashboard /></PageWrapper>} />
        <Route path="/report" element={<PageWrapper><Report /></PageWrapper>} />
        <Route path="/map" element={<PageWrapper><MapVisualization /></PageWrapper>} />
        <Route path="/voting" element={<PageWrapper><CommunityVoting /></PageWrapper>} />
        <Route path="/collaboration" element={<PageWrapper><CollaborationDashboard /></PageWrapper>} />
        <Route path="/impact" element={<PageWrapper><ImpactMonitoring /></PageWrapper>} />
        <Route path="/profile" element={<PageWrapper><Profile /></PageWrapper>} />
        <Route path="/ar-view" element={<PageWrapper><ARView /></PageWrapper>} />
        <Route path="/leaderboard" element={<PageWrapper><Leaderboard /></PageWrapper>} />
        <Route path="/review" element={<PageWrapper><ReviewReports /></PageWrapper>} />
        <Route path="/guide" element={<PageWrapper><UrbanForestryGuide /></PageWrapper>} />
        <Route path="*" element={<PageWrapper><PageNotFound /></PageWrapper>} />
      </Routes>
    </AnimatePresence>
  );
};

// Animation Wrapper
const PageWrapper = ({ children }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -20 }}
    transition={{ duration: 0.3 }}
  >
    {children}
  </motion.div>
);

export default App;
