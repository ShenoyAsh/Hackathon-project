import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { reportsAPI, votingAPI } from '../services/api';
import toast from 'react-hot-toast';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import {
  MapPin,
  Users,
  FileText,
  Activity,
  ThumbsUp,
  Clock,
  CheckCircle,
  Cloud,
  Zap,
  Box
} from 'lucide-react';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import PageTransition from '../components/layout/PageTransition';
import { motion } from 'framer-motion';

const Dashboard = () => {
  const { user, role } = useAuth();
  const [reports, setReports] = useState([]);
  const [votingSessions, setVotingSessions] = useState([]);
  const [stats, setStats] = useState({
    totalReports: 0,
    pendingReports: 0,
    approvedReports: 0,
    userReports: 0,
    userVotes: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      const reportsResponse = await reportsAPI.getAll({ limit: 10 });
      setReports(reportsResponse.reports);

      if (['expert', 'authority'].includes(role)) {
        const votingResponse = await votingAPI.getSessions({ limit: 5 });
        setVotingSessions(votingResponse.sessions);
      }

      const totalReports = reportsResponse.reports.length;
      const pendingReports = reportsResponse.reports.filter(r => r.status === 'pending').length;
      const approvedReports = reportsResponse.reports.filter(r => r.status === 'approved').length;

      setStats({
        totalReports,
        pendingReports,
        approvedReports,
        userReports: user?.reportsCount || 0,
        userVotes: user?.votesCount || 0
      });

    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleVoteOnReport = async (reportId, voteType) => {
    try {
      await reportsAPI.vote(reportId, voteType);
      loadDashboardData();
    } catch (error) {
      console.error('Error voting:', error);
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      pending: 'warning',
      approved: 'success',
      rejected: 'danger'
    };
    return colors[status] || 'secondary';
  };

  const getStatusIcon = (status) => {
    const icons = {
      pending: Clock,
      approved: CheckCircle,
      rejected: CheckCircle
    };
    return icons[status] || Clock;
  };

  const reportTypeData = [
    { name: 'Unused Space', value: reports.filter(r => r.reportType === 'unused_space').length, color: '#10b981' },
    { name: 'Tree Loss', value: reports.filter(r => r.reportType === 'tree_loss').length, color: '#ef4444' },
    { name: 'Heat Hotspot', value: reports.filter(r => r.reportType === 'heat_hotspot').length, color: '#f59e0b' }
  ];

  const statusData = [
    { name: 'Pending', value: stats.pendingReports, color: '#f59e0b' },
    { name: 'Approved', value: stats.approvedReports, color: '#10b981' }
  ];

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <PageTransition>
      <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-accent-50">
        <div className="bg-white/80 backdrop-blur-xl border-b border-secondary-200/60 sticky top-0 z-40">
          <div className="max-w-7xl mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-gradient-to-br from-primary-500 to-primary-600 rounded-xl">
                  <Activity className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-gray-900">Dashboard</h1>
                  <p className="text-sm text-gray-500">Welcome back, {user?.fullName}</p>
                </div>
              </div>
              <Button variant="outline" onClick={() => window.location.href = '/report'}>
                New Report
              </Button>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 py-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, staggerChildren: 0.1 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
          >
            {/* Google Cloud Status Card */}
            <motion.div whileHover={{ y: -5 }} transition={{ duration: 0.2 }}>
              <Card hover={false} className="p-6 h-full border-l-4 border-blue-500 shadow-lg relative overflow-hidden">
                <div className="absolute top-0 right-0 p-4 opacity-10">
                  <Cloud className="w-24 h-24 text-blue-600" />
                </div>
                <div className="flex items-center justify-between mb-2 relative z-10">
                  <p className="text-sm font-bold text-gray-600 uppercase tracking-wide">Google Cloud Status</p>
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <Zap className="w-5 h-5 text-blue-600" />
                  </div>
                </div>
                <div className="space-y-3 mt-4 relative z-10">
                  <div className="flex items-center justify-between text-sm">
                    <span className="flex items-center gap-2 text-gray-700 font-medium"><div className="w-2.5 h-2.5 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)]"></div> Maps Platform</span>
                    <span className="text-green-600 font-bold text-xs bg-green-50 px-2 py-0.5 rounded">Active</span>
                  </div>
                 
                  <div className="flex items-center justify-between text-sm">
                    <span className="flex items-center gap-2 text-gray-700 font-medium"><div className="w-2.5 h-2.5 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)]"></div> Firebase</span>
                    <span className="text-green-600 font-bold text-xs bg-green-50 px-2 py-0.5 rounded">Connected</span>
                  </div>
                </div>
              </Card>
            </motion.div>

            <motion.div whileHover={{ y: -5 }} transition={{ duration: 0.2 }}>
              <Card hover={false} className="p-6 h-full border-l-4 border-primary-500">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total Reports</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.totalReports}</p>
                  </div>
                  <div className="p-3 bg-primary-100 rounded-lg">
                    <FileText className="w-6 h-6 text-primary-600" />
                  </div>
                </div>
              </Card>
            </motion.div>

            <motion.div whileHover={{ y: -5 }} transition={{ duration: 0.2 }}>
              <Card hover={false} className="p-6 h-full border-l-4 border-warning-500">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Pending Review</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.pendingReports}</p>
                  </div>
                  <div className="p-3 bg-warning-100 rounded-lg">
                    <Clock className="w-6 h-6 text-warning-600" />
                  </div>
                </div>
              </Card>
            </motion.div>

            <motion.div whileHover={{ y: -5 }} transition={{ duration: 0.2 }}>
              <Card hover={false} className="p-6 h-full border-l-4 border-secondary-500">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Your Reports</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.userReports}</p>
                  </div>
                  <div className="p-3 bg-secondary-100 rounded-lg">
                    <Users className="w-6 h-6 text-secondary-600" />
                  </div>
                </div>
              </Card>
            </motion.div>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            <Card hover={false} className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Reports by Type</h3>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={reportTypeData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {reportTypeData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </Card>

            <Card hover={false} className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Reports by Status</h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={statusData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="value" fill="#10b981" />
                </BarChart>
              </ResponsiveContainer>
            </Card>
          </div>


          {/* Enhanced Status & AI Feedback Section */}
          <Card hover={false} className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900">Recent Reports & Analysis</h3>
              <Button variant="ghost" size="sm">
                View All
              </Button>
            </div>

            <div className="space-y-4">
              {reports.slice(0, 5).map((report) => {
                const StatusIcon = getStatusIcon(report.status);

                // Determine detailed status message
                let statusMessage = "Processing...";
                let statusColor = "secondary";

                if (report.status === 'pending_analysis') {
                  statusMessage = "AI Analysis: Proposals are pending feasibility and cooling impact assessment.";
                  statusColor = "warning";
                } else if (report.status === 'pending_review' || report.status === 'pending') {
                  statusMessage = "Review and Voting: Ideas are pending community evaluation and expert feedback.";
                  statusColor = "info";
                } else if (report.status === 'pending_approval') {
                  statusMessage = "Government Approval: Final execution is pending permit and funding checks.";
                  statusColor = "primary";
                } else if (report.status === 'approved') {
                  statusMessage = "Approved for Implementation";
                  statusColor = "success";
                }

                return (
                  <div key={report.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow group">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          <h4 className="font-medium text-gray-900 group-hover:text-green-700 transition-colors">{report.title}</h4>
                          <Badge variant={statusColor} size="sm">
                            {report.status.replace('_', ' ').toUpperCase()}
                          </Badge>
                          {report.aiAnalysis && (
                            <Badge variant="purple" size="sm" className="flex items-center gap-1">
                              <Activity className="w-3 h-3" />
                              AI Verified
                            </Badge>
                          )}
                        </div>

                        <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                          {report.aiAnalysis?.summary ? (
                            <span className="font-medium text-purple-900 bg-purple-50 px-2 py-0.5 rounded mr-2">AI Summary: {report.aiAnalysis.summary}</span>
                          ) : report.description}
                        </p>

                        {/* AI Insights Snippet */}
                        {report.aiAnalysis && (
                          <div className="mb-3 p-3 bg-gray-50 rounded-lg text-xs space-y-2 border border-gray-100">
                            <div className="grid grid-cols-2 gap-2">
                              <div className="flex flex-col">
                                <span className="font-bold text-gray-500 uppercase text-[10px]">Feasibility</span>
                                <span className={(report.aiAnalysis.feasibilityScore || 0) > 70 ? "text-green-600 font-bold" : "text-yellow-600 font-bold"}>
                                  {report.aiAnalysis.feasibilityScore !== undefined ? `${report.aiAnalysis.feasibilityScore}%` : 'N/A'}
                                  <span className="font-normal text-gray-500 ml-1">
                                    ({report.aiAnalysis.plantation_possible ? 'Viable' : 'Difficult'})
                                  </span>
                                </span>
                              </div>
                              <div className="flex flex-col">
                                <span className="font-bold text-gray-500 uppercase text-[10px]">Land Est.</span>
                                <span className="text-gray-800 font-bold">{report.aiAnalysis.land_ownership_estimate || 'Pending'}</span>
                              </div>
                            </div>

                            {/* Vision Tags */}
                            {report.aiAnalysis.labels && report.aiAnalysis.labels.length > 0 && (
                              <div className="flex flex-wrap gap-1 mt-1 pt-2 border-t border-gray-100">
                                {report.aiAnalysis.labels.slice(0, 3).map((l, i) => (
                                  <span key={i} className="px-1.5 py-0.5 bg-blue-50 text-blue-600 rounded text-[10px] border border-blue-100">
                                    {l.description}
                                  </span>
                                ))}
                              </div>
                            )}

                            {/* Advanced AI: Species & Carbon */}
                            {(report.aiAnalysis.native_species_recommendations || report.aiAnalysis.estimated_carbon_offset) && (
                              <div className="mt-2 pt-2 border-t border-gray-100 grid grid-cols-1 gap-2">
                                {report.aiAnalysis.native_species_recommendations && (
                                  <div className="flex flex-col">
                                    <span className="text-[10px] font-bold text-gray-500 uppercase">Recommended Flora</span>
                                    <div className="flex flex-wrap gap-1 mt-0.5">
                                      {report.aiAnalysis.native_species_recommendations.map((species, i) => (
                                        <span key={i} className="px-1.5 py-0.5 bg-green-50 text-green-700 rounded text-[10px] border border-green-100 flex items-center">
                                          <span className="w-1.5 h-1.5 rounded-full bg-green-500 mr-1"></span>
                                          {species}
                                        </span>
                                      ))}
                                    </div>
                                  </div>
                                )}
                                {report.aiAnalysis.estimated_carbon_offset && (
                                  <div className="flex items-center justify-between bg-emerald-50/50 p-1.5 rounded border border-emerald-100">
                                    <span className="text-[10px] font-bold text-gray-500 uppercase">Est. Carbon Offset</span>
                                    <span className="text-xs font-bold text-emerald-700">{report.aiAnalysis.estimated_carbon_offset}</span>
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        )}

                        <div className="flex items-center gap-2 text-xs text-orange-600 bg-orange-50 px-3 py-2 rounded-md border border-orange-100">
                          <Clock className="w-3.5 h-3.5" />
                          <span className="font-medium">{statusMessage}</span>
                        </div>

                        <div className="flex items-center space-x-4 text-xs text-gray-400 mt-3">
                          <div className="flex items-center space-x-1">
                            <MapPin className="w-3.5 h-3.5" />
                            <span>{report.location.address}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <span>{new Date(report.createdAt?.seconds * 1000).toLocaleDateString()}</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex flex-col space-y-2 ml-4">
                        <div className="flex items-center space-x-2 text-sm">
                          <span className="font-medium text-gray-500">{report.upvotes || 0}</span>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleVoteOnReport(report.id, 'upvote')}
                            className="text-gray-400 hover:text-green-600"
                          >
                            <ThumbsUp className="w-4 h-4" />
                          </Button>
                        </div>

                        {report.aiAnalysis?.plantation_possible && (
                          <Button
                            to="/ar-view"
                            size="xs"
                            className="bg-indigo-50 text-indigo-600 hover:bg-indigo-100 border border-indigo-200 mt-2 w-full flex items-center justify-center gap-1"
                          >
                            <Box className="w-3 h-3" />
                            Global AR View
                          </Button>
                        )}

                        {/* Authority Actions */}
                        {['authority', 'expert'].includes(role) && ['pending_review', 'pending_approval', 'pending'].includes(report.status) && (
                          <div className="mt-2 pt-2 border-t border-gray-100 flex flex-col gap-1 w-full">
                            <Button
                              size="xs"
                              className="w-full bg-green-50 text-green-700 hover:bg-green-100 border border-green-200"
                              onClick={async () => {
                                try {
                                  await reportsAPI.updateStatus(report.id, { status: 'approved' });
                                  loadDashboardData();
                                } catch (e) { console.error(e); }
                              }}
                            >
                              Approve
                            </Button>
                          </div>
                        )}

                        {/* Guardian Feature (New) */}
                        {report.status === 'approved' && (
                          <div className="mt-2 pt-2 border-t border-gray-100">
                            <Button
                              size="xs"
                              variant="outline"
                              className="w-full border-dashed border-emerald-300 text-emerald-700 hover:bg-emerald-50"
                              onClick={() => toast.success("You are now a Guardian! 🌱 We'll send watering reminders.", { icon: '🛡️' })}
                            >
                              <Users className="w-3 h-3 mr-1" /> Join as Guardian
                            </Button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>

          {['expert', 'authority'].includes(role) && votingSessions.length > 0 && (
            <Card hover={false} className="p-6 mt-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Active Voting Sessions</h3>
              <div className="space-y-4">
                {votingSessions.map((session) => (
                  <div key={session.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium text-gray-900">{session.title}</h4>
                      <Badge variant={session.status === 'active' ? 'success' : 'secondary'} size="sm">
                        {session.status}
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-600 mb-3">{session.description}</p>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4 text-sm text-gray-500">
                        <span>{session.totalVotes} votes</span>
                        <span>Ends: {new Date(session.endDate?.seconds * 1000).toLocaleDateString()}</span>
                      </div>
                      <Button size="sm" variant="outline">
                        View Details
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          )}

          {/* Future Scope Section */}
          <div className="mt-8 mb-12">
            <div className="flex items-center space-x-2 mb-6">
              <h3 className="text-xl font-bold text-gray-800">Future Scope</h3>
              <span className="px-2 py-1 rounded-full bg-gray-100 text-xs font-medium text-gray-500 border border-gray-200">Pending Implementation</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="p-6 border-t-4 border-teal-500 bg-gradient-to-br from-white to-teal-50/30">
                <div className="w-10 h-10 rounded-full bg-teal-100 flex items-center justify-center text-teal-600 mb-4">
                  <MapPin className="w-5 h-5" />
                </div>
                <h4 className="font-bold text-gray-900 mb-2">Multi-City Deployment</h4>
                <p className="text-sm text-gray-600">Rolling out the platform beyond the initial focus on Bangalore and Mangalore.</p>
                <div className="mt-4 pt-4 border-t border-teal-100 flex justify-between items-center text-xs text-teal-700 font-medium">
                  <span>Expansion Phase</span>
                  <span className="bg-teal-100 px-2 py-1 rounded">+2 Priority</span>
                </div>
              </Card>

              <Card className="p-6 border-t-4 border-emerald-500 bg-gradient-to-br from-white to-emerald-50/30">
                <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600 mb-4">
                  <Activity className="w-5 h-5" />
                </div>
                <h4 className="font-bold text-gray-900 mb-2">Carbon Impact Reporting</h4>
                <p className="text-sm text-gray-600">Tracking long-term carbon absorption and environmental ROI through advanced analytics.</p>
                <div className="mt-4 pt-4 border-t border-emerald-100 flex justify-between items-center text-xs text-emerald-700 font-medium">
                  <span>Data Analytics</span>
                  <span className="bg-emerald-100 px-2 py-1 rounded">+2 Priority</span>
                </div>
              </Card>

              <Card className="p-6 border-t-4 border-indigo-500 bg-gradient-to-br from-white to-indigo-50/30">
                <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 mb-4">
                  <Zap className="w-5 h-5" />
                </div>
                <h4 className="font-bold text-gray-900 mb-2">Smart City Integration</h4>
                <p className="text-sm text-gray-600">Connecting via APIs to municipal smart city systems for automated data exchange.</p>
                <div className="mt-4 pt-4 border-t border-indigo-100 flex justify-between items-center text-xs text-indigo-700 font-medium">
                  <span>API Integration</span>
                  <span className="bg-indigo-100 px-2 py-1 rounded">+1 Priority</span>
                </div>
              </Card>
            </div>
          </div>

        </div>
      </div>
    </PageTransition>
  );
};

export default Dashboard;