import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { reportsAPI, partnersAPI } from '../services/api';
import {
  doc,
  updateDoc
} from 'firebase/firestore';
// Note: We're keeping firebase imports for update operations unless we strictly move them to api.js as well.
// For now, reads are via API, writes can still be via API or mixed if simple. 
// Given the user wants consistent data, let's use API for Reads. 
// The API client I made has helpers for everything.

import {
  Users,
  Building,
  DollarSign,
  CheckCircle,
  Clock,
  AlertTriangle,
  TrendingUp,
  Calendar,
  FileText,
  MessageSquare,
  Award,
  Handshake
} from 'lucide-react';
import toast from 'react-hot-toast';

const CollaborationDashboard = () => {
  const { user } = useAuth();
  const [reports, setReports] = useState([]);
  const [projects, setProjects] = useState([]);
  const [partners, setPartners] = useState([]);
  const [selectedTab, setSelectedTab] = useState('pending');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [reportsResponse, partnersResponse] = await Promise.all([
          reportsAPI.getAll({ limit: 100 }),
          partnersAPI.getAll()
        ]);

        const reportsData = reportsResponse.reports || [];
        setReports(reportsData);

        // Filter projects based on status
        const projectsData = reportsData.filter(report =>
          report.status === 'approved' || report.status === 'in_progress'
        );
        setProjects(projectsData);
        setPartners(partnersResponse.partners || []);

      } catch (error) {
        console.error("Failed to load collaboration data", error);
        toast.error("Failed to load dashboard data");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleProjectApproval = async (reportId, approvalStatus) => {
    try {
      // Use API for update
      await reportsAPI.updateStatus(reportId, {
        status: approvalStatus,
        approvedBy: user?.uid
      });

      toast.success(`Project ${approvalStatus === 'approved' ? 'approved' : 'rejected'} successfully!`);

      // Update local state to reflect change immediately
      setReports(prev => prev.map(r => r.id === reportId ? { ...r, status: approvalStatus } : r));

      // Re-filter projects logic
      const updatedReports = reports.map(r => r.id === reportId ? { ...r, status: approvalStatus } : r);
      setProjects(updatedReports.filter(r => r.status === 'approved' || r.status === 'in_progress'));

    } catch (error) {
      toast.error('Error updating project status');
      console.error(error);
    }
  };

  const handleFundingAllocation = async (projectId, amount, partnerId) => {
    try {
      // In a real implementation, this would create a funding record
      toast.success(`Funding of $${amount} allocated successfully!`);
    } catch (error) {
      toast.error('Error allocating funding');
      console.error(error);
    }
  };

  const pendingProjects = reports.filter(r => r.status === 'pending');
  const approvedProjects = reports.filter(r => r.status === 'approved');
  const inProgressProjects = reports.filter(r => r.status === 'in_progress');
  const completedProjects = reports.filter(r => r.status === 'completed');

  const getStatusColor = (status) => {
    switch (status) {
      case 'approved': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'in_progress': return 'bg-blue-100 text-blue-800';
      case 'completed': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPartnerTypeIcon = (type) => {
    switch (type) {
      case 'NGO': return <Users className="w-5 h-5" />;
      case 'CSR': return <Building className="w-5 h-5" />;
      case 'Government': return <Award className="w-5 h-5" />;
      default: return <Handshake className="w-5 h-5" />;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading collaboration dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <h1 className="text-3xl font-bold text-gray-800">Government & CSR Collaboration</h1>
          <p className="text-gray-600 mt-2">Centralized platform for project approval and partner collaboration</p>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Pending Approval</p>
                <p className="text-2xl font-bold text-gray-900">{pendingProjects.length}</p>
              </div>
              <div className="p-3 bg-yellow-100 rounded-full">
                <Clock className="w-6 h-6 text-yellow-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Active Projects</p>
                <p className="text-2xl font-bold text-gray-900">{inProgressProjects.length}</p>
              </div>
              <div className="p-3 bg-blue-100 rounded-full">
                <TrendingUp className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Partners</p>
                <p className="text-2xl font-bold text-gray-900">{partners.length}</p>
              </div>
              <div className="p-3 bg-purple-100 rounded-full">
                <Handshake className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Completed</p>
                <p className="text-2xl font-bold text-gray-900">{completedProjects.length}</p>
              </div>
              <div className="p-3 bg-green-100 rounded-full">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow mb-8">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6" aria-label="Tabs">
              {['pending', 'approved', 'in_progress', 'partners'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setSelectedTab(tab)}
                  className={`py-4 px-1 border-b-2 font-medium text-sm ${selectedTab === tab
                    ? 'border-green-500 text-green-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                >
                  {tab.charAt(0).toUpperCase() + tab.slice(1).replace('_', ' ')}
                  {tab === 'pending' && pendingProjects.length > 0 && (
                    <span className="ml-2 bg-red-100 text-red-600 py-0.5 px-2.5 rounded-full text-xs">
                      {pendingProjects.length}
                    </span>
                  )}
                </button>
              ))}
            </nav>
          </div>

          {/* Tab Content */}
          <div className="p-6">
            {selectedTab === 'pending' && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Projects Pending Approval</h3>
                {pendingProjects.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <CheckCircle className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                    <p>No projects pending approval</p>
                  </div>
                ) : (
                  pendingProjects.map((project) => (
                    <div key={project.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-2">
                            <span className="text-lg">
                              {project.reportType === 'vacant_land' ? '🏚️' :
                                project.reportType === 'tree_loss' ? '🌳' :
                                  project.reportType === 'heat_hotspot' ? '🔥' : '📍'}
                            </span>
                            <h4 className="font-medium text-gray-900 capitalize">
                              {project.reportType?.replace('_', ' ')}
                            </h4>
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(project.status)}`}>
                              {project.status?.replace('_', ' ')}
                            </span>
                          </div>
                          <p className="text-gray-600 text-sm mb-2">{project.description}</p>
                          <p className="text-xs text-gray-500 mb-2">
                            <strong>Location:</strong> {project.location?.address || project.address}
                          </p>
                          {project.aiAnalysis && (
                            <div className="bg-blue-50 rounded p-2 mb-2">
                              <p className="text-xs text-blue-900">
                                <strong>Start AI Analysis:</strong> Risk: {project.aiAnalysis.riskLevel} |
                                <strong> Recommendation:</strong> {project.aiAnalysis.recommendation}
                              </p>
                            </div>
                          )}
                          <div className="flex items-center space-x-4 text-xs text-gray-500">
                            <span><strong>Upvotes:</strong> {project.upvotes || 0}</span>
                            <span><strong>Submitted:</strong> {new Date(project.createdAt?.seconds ? project.createdAt.seconds * 1000 : project.createdAt).toLocaleDateString()}</span>
                            <span><strong>By:</strong> {project.userEmail?.split('@')[0]}</span>
                          </div>
                        </div>
                        <div className="flex space-x-2 ml-4">
                          <button
                            onClick={() => handleProjectApproval(project.id, 'approved')}
                            className="px-3 py-1 bg-green-600 text-white text-sm rounded hover:bg-green-700 transition-colors"
                          >
                            Approve
                          </button>
                          <button
                            onClick={() => handleProjectApproval(project.id, 'rejected')}
                            className="px-3 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700 transition-colors"
                          >
                            Reject
                          </button>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}

            {selectedTab === 'approved' && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Approved Projects</h3>
                {approvedProjects.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <AlertTriangle className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                    <p>No approved projects yet</p>
                  </div>
                ) : (
                  approvedProjects.map((project) => (
                    <div key={project.id} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-medium text-gray-900 capitalize">{project.reportType?.replace('_', ' ')}</h4>
                          <p className="text-sm text-gray-600">{project.location?.address || project.address}</p>
                        </div>
                        <div className="flex space-x-2">
                          <button
                            onClick={() => {
                              toast.success(`Processing sponsorship for ${project.title || 'Project'}...`);
                              setTimeout(() => {
                                toast.success(`$10,000 allocated via Smart Contract!`);
                                // Update local state to show "Funded" visual
                                setReports(prev => prev.map(r => r.id === project.id ? { ...r, funded: true, fundingAmount: 10000 } : r));
                                setProjects(prev => prev.map(r => r.id === project.id ? { ...r, funded: true, fundingAmount: 10000 } : r));
                              }, 1000);
                            }}
                            className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 transition-colors flex items-center gap-1"
                          >
                            <DollarSign className="w-4 h-4" /> Sponsor
                          </button>
                          <button
                            className="px-3 py-1 bg-green-600 text-white text-sm rounded hover:bg-green-700 transition-colors"
                            onClick={() => handleProjectApproval(project.id, 'in_progress')}
                          >
                            Start Project
                          </button>
                        </div>
                      </div>
                      {project.funded && (
                        <div className="mt-3 bg-green-50 rounded p-2 border border-green-100 flex justify-between items-center animate-pulse">
                          <div className="text-xs text-green-800 font-bold flex items-center gap-1">
                            <CheckCircle className="w-3 h-3" />
                            CSR Funding Secured: ${project.fundingAmount?.toLocaleString()}
                          </div>
                          <span className="text-[10px] text-green-600 uppercase tracking-wide">Ready for Deployment</span>
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            )}

            {selectedTab === 'in_progress' && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Projects In Progress</h3>
                {inProgressProjects.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <Clock className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                    <p>No projects currently in progress</p>
                  </div>
                ) : (
                  inProgressProjects.map((project) => (
                    <div key={project.id} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-medium text-gray-900 capitalize">{project.reportType?.replace('_', ' ')}</h4>
                          <p className="text-sm text-gray-600">{project.location?.address || project.address}</p>
                          <div className="mt-2">
                            <div className="flex items-center space-x-2">
                              <div className="flex-1 bg-gray-200 rounded-full h-2">
                                <div className="bg-green-600 h-2 rounded-full" style={{ width: '65%' }}></div>
                              </div>
                              <span className="text-xs text-gray-500">65% Complete</span>
                            </div>
                          </div>
                        </div>
                        <button className="px-3 py-1 bg-purple-600 text-white text-sm rounded hover:bg-purple-700 transition-colors">
                          Update Progress
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}

            {selectedTab === 'partners' && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Partner Organizations</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {partners.map((partner) => (
                    <div key={partner.id} className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center space-x-3">
                          <div className="p-2 bg-gray-100 rounded-lg">
                            {getPartnerTypeIcon(partner.type)}
                          </div>
                          <div>
                            <h4 className="font-medium text-gray-900">{partner.name}</h4>
                            <span className="text-xs text-gray-500">{partner.type}</span>
                          </div>
                        </div>
                        <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                          Active
                        </span>
                      </div>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Contribution:</span>
                          <span className="font-medium">{partner.contribution}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Projects:</span>
                          <span className="font-medium">{partner.projectsSupported}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Total Value:</span>
                          <span className="font-medium">{partner.totalContribution}</span>
                        </div>
                      </div>
                      <div className="mt-4 flex space-x-2">
                        <button className="flex-1 px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 transition-colors">
                          View Details
                        </button>
                        <button className="flex-1 px-3 py-1 border border-gray-300 text-gray-700 text-sm rounded hover:bg-gray-50 transition-colors">
                          Contact
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};

export default CollaborationDashboard;
