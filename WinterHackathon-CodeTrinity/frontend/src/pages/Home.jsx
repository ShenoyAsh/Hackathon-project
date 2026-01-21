// src/pages/Home.jsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  MapPin, Users, TrendingUp, Shield,
  ArrowRight, CheckCircle, Clock, BarChart2, Search
} from 'lucide-react';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import Container from '../components/layout/Container';
import MapView from '../components/MapView';
import { motion } from 'framer-motion';
import PageTransition from '../components/layout/PageTransition';

import { reportsAPI } from '../services/api';

// Reports now fetched from backend

const Home = () => {
  const [activeTab, setActiveTab] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isScrolled, setIsScrolled] = useState(false);
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);

    // Fetch reports
    const fetchReports = async () => {
      try {
        // We could use the API service or direct Firestore. 
        // Using Firestore listener for real-time updates on Home page is nice.
        // But for consistency let's use the API service we verified.
        // Actually, for "Real-Time Updates" feature mentioned in the landing page, 
        // a listener (onSnapshot) would be better, similar to Dashboard.
        // Let's stick to the API for simplicity and consistency with the service layer 
        // unless I want to import firebase directly again.
        // Let's use the reportsAPI.getAll() and maybe set an interval or just load once.
        const response = await reportsAPI.getAll({ limit: 6 });
        if (response && response.reports) {
          setReports(response.reports);
        }
      } catch (error) {
        console.error('Failed to fetch reports:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchReports();

    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const filteredReports = reports.filter(report => {
    // Map UI tabs to Status values
    // 'all' -> any
    // 'pending' -> 'pending'
    // 'in-progress' -> 'under_review', 'in_progress', 'implemented'
    // 'resolved' -> 'approved', 'completed', 'resolved'

    let statusMatch = false;
    if (activeTab === 'all') statusMatch = true;
    else if (activeTab === 'pending') statusMatch = report.status === 'pending';
    else if (activeTab === 'in-progress') statusMatch = ['under_review', 'in_progress', 'implemented'].includes(report.status);
    else if (activeTab === 'resolved') statusMatch = ['approved', 'completed', 'resolved'].includes(report.status);

    const textMatch = report.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      report.location.address?.toLowerCase().includes(searchQuery.toLowerCase());

    return statusMatch && textMatch;
  });

  const stats = [
    { value: '1,200+', label: 'Reports Submitted', icon: <BarChart2 className="w-6 h-6" /> },
    { value: '850+', label: 'Issues Resolved', icon: <CheckCircle className="w-6 h-6" /> },
    { value: '95%', label: 'Satisfaction', icon: <TrendingUp className="w-6 h-6" /> },
    { value: '24/7', label: 'Support', icon: <Clock className="w-6 h-6" /> }
  ];

  const features = [
    {
      icon: <MapPin className="w-6 h-6 text-white" />,
      title: 'Geo-Tagged Reports',
      description: 'Pinpoint environmental issues with precise location tracking',
      gradient: 'from-emerald-400 to-teal-500'
    },
    {
      icon: <Users className="w-6 h-6 text-white" />,
      title: 'Community Driven',
      description: 'Join thousands making a difference in their communities',
      gradient: 'from-blue-400 to-indigo-500'
    },
    {
      icon: <TrendingUp className="w-6 h-6 text-white" />,
      title: 'Real-time Updates',
      description: 'Track the progress of reported issues in real-time',
      gradient: 'from-amber-400 to-orange-500'
    },
    {
      icon: <Shield className="w-6 h-6 text-white" />,
      title: 'Verified Actions',
      description: 'Trust in our verification system for legitimate reports',
      gradient: 'from-rose-400 to-pink-500'
    }
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  };

  const [currentBgIndex, setCurrentBgIndex] = useState(0);

  const backgrounds = [
    "https://images.unsplash.com/photo-1518173946687-a4c8892bbd9f?q=80&w=1920&auto=format&fit=crop", // Nature
    "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?q=80&w=1920&auto=format&fit=crop", // Forest
    "https://images.unsplash.com/photo-1466692476868-aef1dfb1e735?q=80&w=1920&auto=format&fit=crop",
    "/bg_image.png" 
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentBgIndex((prev) => (prev + 1) % backgrounds.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <PageTransition>
      <div className="min-h-screen bg-gray-50 font-sans">
        {/* Hero Section */}
        <section className="relative overflow-hidden min-h-[700px] flex items-center justify-center bg-gradient-hero text-white pt-24 pb-20">

          {/* Animated Background Elements */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary-500/20 rounded-full blur-[100px] animate-float"></div>
            <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-secondary-500/20 rounded-full blur-[100px] animate-float" style={{ animationDelay: '2s' }}></div>
          </div>

          {/* Rotating Background Image */}
          {backgrounds.map((bg, index) => (
            <motion.img
              key={index}
              src={bg}
              alt={`Background ${index}`}
              initial={{ opacity: 0 }}
              animate={{ opacity: index === currentBgIndex ? 0.4 : 0 }}
              transition={{ duration: 1.5 }}
              className="absolute inset-0 w-full h-full object-cover object-center"
              style={{ zIndex: 0 }}
            />
          ))}

          <Container className="relative z-10">
            <div className="max-w-5xl mx-auto text-center px-4">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-md border border-white/20 mb-8 animate-fade-in">
                <span className="w-2 h-2 rounded-full bg-primary-400 animate-pulse"></span>

              </div>

              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.1 }}
                className="text-5xl md:text-7xl font-display font-bold tracking-tight mb-8 leading-tight"
              >
                Empowering Communities for a Greener Tomorrow
              </motion.h1>

              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="text-xl md:text-2xl font-light mb-10 text-primary-50 max-w-3xl mx-auto leading-relaxed"
              >
                Report, track, and resolve environmental issues in your area. Join the movement to make a real impact.
              </motion.p>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.3 }}
                className="flex flex-col sm:flex-row gap-5 justify-center"
              >
                <Link to="/report">
                  <Button size="lg" className="rounded-full px-8 py-4 text-lg font-semibold shadow-xl hover:scale-105 transition-transform duration-300">
                    Report an Issue <ArrowRight className="inline ml-2 w-5 h-5" />
                  </Button>
                </Link>
                <Link to="/dashboard">
                  <Button variant="glass" size="lg" className="rounded-full px-8 py-4 text-lg font-semibold hover:bg-white/20 transition-all duration-300">
                    View Dashboard
                  </Button>
                </Link>
              </motion.div>
            </div>
          </Container>
        </section>

        {/* Search & Filter Section */}
        <section className="relative z-20 -mt-16 px-4">
          <Container>
            <div className="bg-white/80 backdrop-blur-xl border border-white/40 p-6 rounded-3xl shadow-soft-lg max-w-4xl mx-auto">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="relative flex-1 group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Search className="h-5 w-5 text-gray-400 group-focus-within:text-primary-500 transition-colors" />
                  </div>
                  <input
                    type="text"
                    placeholder="Search for issues..."
                    className="w-full pl-11 pr-4 py-3 bg-gray-50/50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                <div className="flex gap-2 overflow-x-auto pb-2 md:pb-0 scrollbar-hide">
                  {['all', 'pending', 'in-progress', 'resolved'].map((tab) => (
                    <button
                      key={tab}
                      onClick={() => setActiveTab(tab)}
                      className={`px-5 py-3 rounded-xl font-medium whitespace-nowrap transition-all duration-200 ${activeTab === tab
                        ? 'bg-primary-600 text-white shadow-lg shadow-primary-500/30'
                        : 'bg-gray-100/50 text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                        }`}
                    >
                      {tab.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </Container>
        </section>

        {/* Map View Section */}
        <section className="py-20 md:py-28">
          <Container>
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-5xl font-display font-bold mb-6 text-gray-900">Explore Environmental Issues</h2>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto leading-relaxed">
                Browse through reported environmental issues in your area and track their progress through our interactive map.
              </p>
            </div>

            <div className="bg-white rounded-3xl shadow-2xl shadow-gray-200/50 overflow-hidden border border-gray-100 transform hover:scale-[1.01] transition-transform duration-500 h-[600px] w-full">
              <MapView reports={filteredReports} />
            </div>

            {/* Search Results Feedback */}
            <div className="mt-8 text-center">
              <p className="text-gray-600 mb-4">
                Found <span className="font-bold text-primary-600">{filteredReports.length}</span> reports matching your criteria.
              </p>

              {/* Optional: List View for better Search UX */}
              {searchQuery && filteredReports.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 text-left">
                  {filteredReports.slice(0, 3).map(report => (
                    <Card key={report.id} className="p-4 border hover:shadow-md transition">
                      <h4 className="font-bold text-gray-800">{report.title}</h4>
                      <p className="text-sm text-gray-500 mb-2 truncate">{report.location?.address}</p>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${report.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                        report.status === 'approved' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                        }`}>
                        {report.status.charAt(0).toUpperCase() + report.status.slice(1)}
                      </span>
                    </Card>
                  ))}
                  {filteredReports.length > 3 && (
                    <p className="col-span-full text-center text-sm text-gray-500">...and {filteredReports.length - 3} more on the map.</p>
                  )}
                </div>
              )}
            </div>
          </Container>
        </section>

        {/* Features Section */}
        <section className="py-24 bg-white relative">
          <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-[0.02]"></div>
          <Container className="relative">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-5xl font-display font-bold mb-6 text-gray-900">How It Works</h2>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                Our platform empowers you to make a tangible difference in three simple steps.
              </p>
            </div>

            <motion.div
              variants={containerVariants}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true, margin: "-50px" }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8"
            >
              {features.map((feature, index) => (
                <motion.div variants={itemVariants} key={index}>
                  <Card
                    className="p-8 text-center group border border-gray-100 shadow-soft hover:shadow-soft-lg hover:-translate-y-2 transition-all duration-300 h-full"
                  >
                    <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6 bg-gradient-to-br ${feature.gradient} shadow-lg shadow-gray-200 group-hover:scale-110 transition-transform duration-300`}>
                      {feature.icon}
                    </div>
                    <h3 className="text-xl font-bold mb-3 text-gray-900">{feature.title}</h3>
                    <p className="text-gray-600 leading-relaxed">{feature.description}</p>
                  </Card>
                </motion.div>
              ))}
            </motion.div>
          </Container>
        </section>

        {/* Stats Section */}
        <section className="py-20 bg-gradient-stats text-white relative overflow-hidden">
          <div className="absolute inset-0 bg-[url('/pattern.svg')] opacity-10"></div>
          <Container className="relative z-10">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center divide-x divide-white/10"
            >
              {stats.map((stat, index) => (
                <div key={index} className="px-4 group">
                  <div className="flex justify-center mb-4 text-primary-300 group-hover:text-white transition-colors duration-300 transform group-hover:scale-110">
                    {stat.icon}
                  </div>
                  <div className="text-4xl md:text-5xl font-bold mb-2 font-display tracking-tight">{stat.value}</div>
                  <div className="text-primary-200 font-medium">{stat.label}</div>
                </div>
              ))}
            </motion.div>
          </Container>
        </section>

        {/* CTA Section */}
        <section className="py-24">
          <Container>
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="relative overflow-hidden rounded-3xl bg-gradient-cta p-12 md:p-20 text-white text-center shadow-2xl shadow-primary-500/25"
            >
              <div className="absolute -right-20 -top-20 w-80 h-80 bg-white/10 rounded-full blur-3xl animate-pulse-slow"></div>
              <div className="absolute -left-20 -bottom-20 w-96 h-96 bg-secondary-900/20 rounded-full blur-3xl animate-pulse-slow" style={{ animationDelay: '1.5s' }}></div>

              <div className="relative z-10 max-w-4xl mx-auto">
                <h2 className="text-4xl md:text-6xl font-display font-bold mb-8 leading-tight">
                  Ready to make a <span className="text-primary-200">difference?</span>
                </h2>
                <p className="text-xl text-primary-50 mb-10 max-w-2xl mx-auto opacity-90 leading-relaxed">
                  Join thousands of citizens already making their communities greener and more sustainable today. Every report counts.
                </p>
                <div className="flex flex-col sm:flex-row justify-center gap-5">
                  <Button
                    to="/auth"
                    size="lg"
                    className="bg-white text-primary-700 hover:bg-gray-50 shadow-xl border-0 font-bold px-10 py-4 text-xl"
                  >
                    Get Started Now <ArrowRight className="ml-2 w-5 h-5" />
                  </Button>
                  <Button
                    to="/impact"
                    variant="glass"
                    size="lg"
                    className="border-white/40 hover:bg-white/10 px-10 py-4 text-xl"
                  >
                    See Real Impact
                  </Button>
                </div>
              </div>
            </motion.div>
          </Container>
        </section>
      </div>
    </PageTransition>
  );
};

export default Home;