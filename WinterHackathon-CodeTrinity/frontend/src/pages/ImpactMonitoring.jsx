import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { reportsAPI } from '../services/api';
import {
  TreePine,
  TrendingUp,
  Thermometer,
  Droplets,
  Users,
  Leaf,
  BarChart3,
  Calendar,
  MapPin,
  Award,
  Target,
  Activity
} from 'lucide-react';
import { LineChart, Line, BarChart, Bar, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, RadialBarChart, RadialBar, PieChart, Pie, Cell } from 'recharts';

const AnimatedCounter = ({ value, prefix = '', suffix = '' }) => {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let start = 0;
    const end = parseFloat(value) || 0; // Support float
    if (start === end) return;

    const duration = 2000;
    const incrementTime = 50;
    const steps = duration / incrementTime;
    const increment = (end - start) / steps;

    const timer = setInterval(() => {
      start += increment;
      if (start >= end) {
        setCount(end);
        clearInterval(timer);
      } else {
        // Check if original value was int or float
        setCount(Number.isInteger(end) ? Math.ceil(start) : parseFloat(start.toFixed(1)));
      }
    }, incrementTime);

    return () => clearInterval(timer);
  }, [value]);

  return <span>{prefix}{count}{suffix}</span>;
};

const ImpactMonitoring = () => {
  const [reports, setReports] = useState([]);
  const [impactData, setImpactData] = useState({
    treesPlanted: 0,
    greenCoverIncrease: 0,
    heatReduction: 0,
    co2Absorbed: 0,
    waterConserved: 0,
    communityEngagement: 0
  });
  const [timeSeriesData, setTimeSeriesData] = useState([]);
  const [regionalData, setRegionalData] = useState([]);
  const [loading, setLoading] = useState(true);

  const calculateImpactMetrics = (reportsData) => {
    const completedProjects = reportsData.filter(r => r.status === 'completed' || r.status === 'implemented' || r.status === 'approved');

    const treesPlanted = completedProjects.length * 15; // Base estimate
    const greenCoverIncrease = completedProjects.length * 0.5;
    const heatReduction = completedProjects.length * 0.8;

    // Parse Real-Time AI Data for Carbon
    let totalCarbon = 0;
    reportsData.forEach(r => {
      if (r.aiAnalysis?.estimated_carbon_offset) {
        // Extract number from string like "25 kg/year" or "100 lbs"
        const match = r.aiAnalysis.estimated_carbon_offset.match(/(\d+(\.\d+)?)/);
        if (match) {
          totalCarbon += parseFloat(match[0]);
        } else {
          totalCarbon += 48; // Fallback
        }
      } else if (r.status === 'approved') {
        totalCarbon += 48; // Fallback
      }
    });

    const co2Absorbed = Math.round(totalCarbon);
    const waterConserved = completedProjects.length * 1000;
    const communityEngagement = reportsData.reduce((sum, r) => sum + (r.upvotes || 0), 0);

    setImpactData({
      treesPlanted,
      greenCoverIncrease,
      heatReduction,
      co2Absorbed,
      waterConserved,
      communityEngagement
    });
  };

  const prepareTimeSeriesData = (reportsData) => {
    const monthlyData = [];
    for (let i = 11; i >= 0; i--) {
      const date = new Date();
      date.setMonth(date.getMonth() - i);
      date.setDate(1);
      date.setHours(0, 0, 0, 0);
      const nextDate = new Date(date);
      nextDate.setMonth(nextDate.getMonth() + 1);

      const monthProjects = reportsData.filter(report => {
        let reportDate;
        if (report.createdAt && report.createdAt.seconds) { // Firestore Timestamp
          reportDate = new Date(report.createdAt.seconds * 1000);
        } else if (report.createdAt) { // ISO String
          reportDate = new Date(report.createdAt);
        } else {
          return false;
        }
        return reportDate >= date && reportDate < nextDate;
      });

      monthlyData.push({
        month: date.toLocaleDateString('en', { month: 'short' }),
        projects: monthProjects.length,
        trees: monthProjects.length * 15, // Suggested multiplier
        heatReduction: monthProjects.length * 0.8,
        upvotes: monthProjects.reduce((sum, r) => sum + (r.upvotes || 0), 0)
      });
    }
    setTimeSeriesData(monthlyData);
  };

  const prepareRegionalData = (reportsData) => {
    // Dynamic Zone Calculation based on Bangalore Center (approx 12.97, 77.59)
    const centerLat = 12.97;
    const centerLng = 77.59;

    const zones = {
      'North Zone': { count: 0, color: '#10b981' },
      'South Zone': { count: 0, color: '#3b82f6' },
      'East Zone': { count: 0, color: '#f59e0b' },
      'West Zone': { count: 0, color: '#ef4444' },
      'Central Zone': { count: 0, color: '#8b5cf6' }
    };

    reportsData.forEach(r => {
      if (r.location && r.location.lat && r.location.lng) {
        if (Math.abs(r.location.lat - centerLat) < 0.02 && Math.abs(r.location.lng - centerLng) < 0.02) {
          zones['Central Zone'].count++;
        } else if (r.location.lat > centerLat) {
          zones['North Zone'].count++;
        } else if (r.location.lat < centerLat) {
          zones['South Zone'].count++;
        } else if (r.location.lng > centerLng) {
          zones['East Zone'].count++;
        } else {
          zones['West Zone'].count++;
        }
      }
    });

    const dynamicRegions = Object.keys(zones).map(name => ({
      name,
      projects: zones[name].count,
      trees: zones[name].count * 15,
      heatReduction: zones[name].count * 0.5,
      color: zones[name].color
    })).filter(z => z.projects > 0); // Only show active zones

    // If no data, show empty state or defaults
    if (dynamicRegions.length === 0) {
      dynamicRegions.push({ name: 'No Data', projects: 0, trees: 0, heatReduction: 0, color: '#ccc' });
    }

    setRegionalData(dynamicRegions);
  };

  useEffect(() => {
    const fetchReports = async () => {
      try {
        const response = await reportsAPI.getAll({ limit: 100 });
        const reportsData = response.reports || [];
        setReports(reportsData);
        calculateImpactMetrics(reportsData);
        prepareTimeSeriesData(reportsData);
        prepareRegionalData(reportsData);
      } catch (error) {
        console.error("Failed to load impact data", error);
      } finally {
        setLoading(false);
      }
    };

    fetchReports();
  }, []);


  const radialData = [
    { name: 'Trees', value: Math.min((impactData.treesPlanted / 1000) * 100, 100), fill: '#10b981' },
    { name: 'Green Cover', value: Math.min((impactData.greenCoverIncrease / 10) * 100, 100), fill: '#3b82f6' },
    { name: 'Heat Reduction', value: Math.min((impactData.heatReduction / 20) * 100, 100), fill: '#ef4444' },
    { name: 'CO2 Absorption', value: Math.min((impactData.co2Absorbed / 10000) * 100, 100), fill: '#f59e0b' }
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading impact monitoring data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <h1 className="text-3xl font-bold text-gray-800">Real-Time Impact Monitoring</h1>
          <p className="text-gray-600 mt-2">Track environmental impact and community engagement metrics</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Projected Impact Banner */}
        <div className="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-2xl p-6 text-white shadow-lg mb-8 flex flex-col md:flex-row items-center justify-between">
          <div className="flex items-center space-x-4 mb-4 md:mb-0">
            <div className="p-3 bg-white/20 rounded-full backdrop-blur-sm">
              <Target className="w-8 h-8 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold">Projected Impact</h2>
              <p className="text-indigo-100 text-sm">
                If the <span className="font-bold text-white">{reports.filter(r => r.status !== 'completed').length} pending areas</span> are greened,
                we project a <span className="font-bold text-yellow-300">{(reports.filter(r => r.status !== 'completed').length * 0.04).toFixed(2)}°C</span> local cooling effect.
              </p>
            </div>
          </div>
          <button className="px-6 py-2 bg-white text-indigo-600 rounded-lg font-bold hover:bg-gray-100 transition shadow-md">
            View Targets
          </button>
        </div>


        {/* Key Metrics */}

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6 transform hover:scale-105 transition-transform duration-300">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-green-100 rounded-full">
                <TreePine className="w-6 h-6 text-green-600" />
              </div>
              <span className="text-2xl font-bold text-green-600">
                <AnimatedCounter value={impactData.treesPlanted} prefix="+" />
              </span>
            </div>
            <h3 className="text-sm font-medium text-gray-600">Trees Planted</h3>
            <p className="text-xs text-gray-500 mt-1">This year</p>
          </div>

          <div className="bg-white rounded-lg shadow p-6 transform hover:scale-105 transition-transform duration-300">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-blue-100 rounded-full">
                <Leaf className="w-6 h-6 text-blue-600" />
              </div>
              <span className="text-2xl font-bold text-blue-600">
                <AnimatedCounter value={impactData.greenCoverIncrease} prefix="+" />
              </span>
            </div>
            <h3 className="text-sm font-medium text-gray-600">Acres Green Cover</h3>
            <p className="text-xs text-gray-500 mt-1">Total increase</p>
          </div>

          <div className="bg-white rounded-lg shadow p-6 transform hover:scale-105 transition-transform duration-300">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-red-100 rounded-full">
                <Thermometer className="w-6 h-6 text-red-600" />
              </div>
              {/* Special case for float */}
              <span className="text-2xl font-bold text-red-600">
                -<AnimatedCounter value={Math.abs(impactData.heatReduction)} />°C
              </span>
            </div>
            <h3 className="text-sm font-medium text-gray-600">Heat Reduction</h3>
            <p className="text-xs text-gray-500 mt-1">Average impact</p>
          </div>

          <div className="bg-white rounded-lg shadow p-6 transform hover:scale-105 transition-transform duration-300">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-yellow-100 rounded-full">
                <Activity className="w-6 h-6 text-yellow-600" />
              </div>
              <span className="text-2xl font-bold text-yellow-600">
                <AnimatedCounter value={impactData.co2Absorbed} />
              </span>
            </div>
            <h3 className="text-sm font-medium text-gray-600">CO₂ Absorbed (lbs)</h3>
            <p className="text-xs text-gray-500 mt-1">Annually</p>
          </div>

          <div className="bg-white rounded-lg shadow p-6 transform hover:scale-105 transition-transform duration-300">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-cyan-100 rounded-full">
                <Droplets className="w-6 h-6 text-cyan-600" />
              </div>
              <span className="text-2xl font-bold text-cyan-600">
                <AnimatedCounter value={impactData.waterConserved} />
              </span>
            </div>
            <h3 className="text-sm font-medium text-gray-600">Gallons Conserved</h3>
            <p className="text-xs text-gray-500 mt-1">Total savings</p>
          </div>

          <div className="bg-white rounded-lg shadow p-6 transform hover:scale-105 transition-transform duration-300">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-purple-100 rounded-full">
                <Users className="w-6 h-6 text-purple-600" />
              </div>
              <span className="text-2xl font-bold text-purple-600">
                <AnimatedCounter value={impactData.communityEngagement} />
              </span>
            </div>
            <h3 className="text-sm font-medium text-gray-600">Community Upvotes</h3>
            <p className="text-xs text-gray-500 mt-1">Total engagement</p>
          </div>
        </div>

        {/* Charts Row 1 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Time Series Impact Chart */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Monthly Impact Trends</h3>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={timeSeriesData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Area type="monotone" dataKey="projects" stackId="1" stroke="#10b981" fill="#10b981" fillOpacity={0.6} />
                <Area type="monotone" dataKey="trees" stackId="2" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.6} />
                <Area type="monotone" dataKey="upvotes" stackId="3" stroke="#8b5cf6" fill="#8b5cf6" fillOpacity={0.6} />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Radial Progress Chart */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Impact Goals Progress</h3>
            <ResponsiveContainer width="100%" height={300}>
              <RadialBarChart cx="50%" cy="50%" innerRadius="10%" outerRadius="90%" data={radialData}>
                <RadialBar dataKey="value" cornerRadius={10} fill="#8884d8" />
                <Legend iconSize={10} layout="vertical" verticalAlign="middle" align="right" />
                <Tooltip />
              </RadialBarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Regional Impact */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Regional Impact Distribution</h3>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={regionalData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="projects" fill="#10b981" />
                <Bar dataKey="trees" fill="#3b82f6" />
              </BarChart>
            </ResponsiveContainer>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={regionalData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, value }) => `${name}: ${value}`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="heatReduction"
                >
                  {regionalData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Recent Achievements */}
        <div className="bg-white rounded-lg shadow">
          <div className="p-6 border-b">
            <h3 className="text-lg font-semibold text-gray-800">Recent Achievements</h3>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="flex items-center space-x-4 p-4 bg-green-50 rounded-lg">
                <div className="p-3 bg-green-200 rounded-full">
                  <Award className="w-6 h-6 text-green-700" />
                </div>
                <div>
                  <h4 className="font-medium text-green-900">100 Trees Milestone</h4>
                  <p className="text-sm text-green-700">Reached 100 trees planted this month</p>
                </div>
              </div>

              <div className="flex items-center space-x-4 p-4 bg-blue-50 rounded-lg">
                <div className="p-3 bg-blue-200 rounded-full">
                  <Target className="w-6 h-6 text-blue-700" />
                </div>
                <div>
                  <h4 className="font-medium text-blue-900">Heat Reduction Goal</h4>
                  <p className="text-sm text-blue-700">5°C reduction achieved in downtown</p>
                </div>
              </div>

              <div className="flex items-center space-x-4 p-4 bg-purple-50 rounded-lg">
                <div className="p-3 bg-purple-200 rounded-full">
                  <Users className="w-6 h-6 text-purple-700" />
                </div>
                <div>
                  <h4 className="font-medium text-purple-900">Community Champion</h4>
                  <p className="text-sm text-purple-700">500+ community upvotes this week</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ImpactMonitoring;
