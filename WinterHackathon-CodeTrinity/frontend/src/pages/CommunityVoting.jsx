import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { reportsAPI } from '../services/api';
import {
  ThumbsUp,
  MessageSquare,
  Clock,
  CheckCircle,
  User,
  TrendingUp,
  Filter,
  Search
} from 'lucide-react';
import toast from 'react-hot-toast';

const CommunityVoting = () => {
  const { user } = useAuth();
  const [reports, setReports] = useState([]);
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('upvotes');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchReports = async () => {
      try {
        const response = await reportsAPI.getAll();
        setReports(response.reports || []);
      } catch (error) {
        console.error("Failed to load reports", error);
        toast.error("Could not load reports");
      } finally {
        setLoading(false);
      }
    };

    fetchReports();
  }, []);

  const handleUpvote = async (reportId) => {
    if (!user) {
      toast.error('Please sign in to upvote');
      return;
    }

    // Optimistic UI update
    setReports(prevReports =>
      prevReports.map(report => {
        if (report.id === reportId) {
          const hasUpvoted = report.upvotedBy?.includes(user.uid);
          return {
            ...report,
            upvotes: (report.upvotes || 0) + (hasUpvoted ? -1 : 1),
            upvotedBy: hasUpvoted
              ? (report.upvotedBy || []).filter(id => id !== user.uid)
              : [...(report.upvotedBy || []), user.uid]
          };
        }
        return report;
      })
    );

    try {
      await reportsAPI.vote(reportId, 'upvote');
      toast.success('Vote updated');
    } catch (error) {
      toast.error('Error updating upvote');
      console.error(error);
      // Revert optimistic update could be added here
    }
  };

  const filteredAndSortedReports = reports
    .filter(report => {
      // Filter by status
      if (filter !== 'all' && report.status !== filter) return false;

      // Filter by search term
      if (searchTerm) {
        const searchLower = searchTerm.toLowerCase();
        return (
          report.description?.toLowerCase().includes(searchLower) ||
          report.location?.address?.toLowerCase().includes(searchLower) ||
          report.reportType?.toLowerCase().includes(searchLower)
        );
      }

      return true;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'upvotes':
          return (b.upvotes || 0) - (a.upvotes || 0);
        case 'recent':
          // Handle both Firestore Timestamp and ISO string/Mock dates
          const dateA = a.createdAt?.seconds ? a.createdAt.seconds * 1000 : new Date(a.createdAt).getTime();
          const dateB = b.createdAt?.seconds ? b.createdAt.seconds * 1000 : new Date(b.createdAt).getTime();
          return dateB - dateA;
        case 'feasibility':
          return (b.aiAnalysis?.confidence || 0) - (a.aiAnalysis?.confidence || 0);
        default:
          return 0;
      }
    });

  const getStatusColor = (status) => {
    switch (status) {
      case 'approved': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'in_progress': return 'bg-blue-100 text-blue-800';
      case 'completed': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getReportTypeIcon = (type) => {
    switch (type) {
      case 'unused_space': return '🏚️';
      case 'vacant_land': return '🏚️';
      case 'tree_loss': return '🌳';
      case 'heat_hotspot': return '🔥';
      default: return '📍';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading community reports...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <h1 className="text-3xl font-bold text-gray-800">Community Voting</h1>
          <p className="text-gray-600 mt-2">Upvote and prioritize greening projects in your community</p>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex flex-wrap gap-4 items-center">
            {/* Search */}
            <div className="flex-1 min-w-64">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search reports..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Status Filter */}
            <div className="flex items-center space-x-2">
              <Filter className="w-5 h-5 text-gray-500" />
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              >
                <option value="all">All Status</option>
                <option value="pending">Pending</option>
                <option value="approved">Approved</option>
                <option value="in_progress">In Progress</option>
                <option value="completed">Completed</option>
              </select>
            </div>

            {/* Sort */}
            <div className="flex items-center space-x-2">
              <TrendingUp className="w-5 h-5 text-gray-500" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              >
                <option value="upvotes">Most Upvotes</option>
                <option value="recent">Most Recent</option>
                <option value="feasibility">Highest Feasibility</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Reports Grid */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        {filteredAndSortedReports.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-gray-400 text-6xl mb-4">📋</div>
            <h3 className="text-xl font-semibold text-gray-600 mb-2">No reports found</h3>
            <p className="text-gray-500">Try adjusting your filters or search terms</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredAndSortedReports.map((report) => (
              <div key={report.id} className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow">
                {/* Report Header */}
                <div className="p-4 border-b">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-2">
                      <span className="text-2xl">{getReportTypeIcon(report.reportType)}</span>
                      <div>
                        <h3 className="font-semibold text-gray-800 capitalize">
                          {report.reportType?.replace('_', ' ')}
                        </h3>
                        <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(report.status)}`}>
                          {report.status?.replace('_', ' ')}
                        </span>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-500">
                        {report.createdAt?.seconds
                          ? new Date(report.createdAt.seconds * 1000).toLocaleDateString()
                          : new Date(report.createdAt).toLocaleDateString()
                        }
                      </p>
                    </div>
                  </div>
                </div>

                {/* Report Content */}
                <div className="p-4">
                  {report.imageUrl && (
                    <img
                      src={report.imageUrl}
                      alt="Report"
                      className="w-full h-48 object-cover rounded-lg mb-3"
                    />
                  )}

                  <p className="text-gray-700 text-sm mb-3 line-clamp-3">
                    {report.description}
                  </p>

                  <p className="text-xs text-gray-500 mb-3">
                    <strong>Location:</strong> {report.location?.address || report.address}
                  </p>

                  {/* AI Analysis */}
                  {report.aiAnalysis && (
                    <div className="bg-blue-50 rounded-lg p-3 mb-3">
                      <h4 className="font-medium text-blue-900 text-sm mb-2">AI Analysis</h4>
                      <div className="space-y-1 text-xs">
                        <div className="flex justify-between">
                          <span className="font-medium">Risk:</span> {report.aiAnalysis.riskLevel}
                        </div>
                        <div>
                          <span className="font-medium">Recommendation:</span> <span className="line-clamp-1">{report.aiAnalysis.recommendation}</span>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Feasibility Score - from previous implementation consistency */}
                  {report.feasibility && (
                    <div className="bg-green-50 rounded-lg p-3 mb-3">
                      <h4 className="font-medium text-green-900 text-sm mb-2">Feasibility</h4>
                      <div className="flex justify-between text-xs">
                        <span>Score:</span>
                        <span className="font-medium">{report.feasibility.feasibilityScore}%</span>
                      </div>
                    </div>
                  )}

                </div>

                {/* Actions */}
                <div className="p-4 border-t bg-gray-50">
                  <div className="flex items-center justify-between">
                    <button
                      onClick={() => handleUpvote(report.id)}
                      className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-colors ${report.upvotedBy?.includes(user?.uid)
                          ? 'bg-green-600 text-white'
                          : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
                        }`}
                    >
                      <ThumbsUp className="w-4 h-4" />
                      <span className="text-sm font-medium">{report.upvotes || 0}</span>
                    </button>

                    <div className="flex items-center space-x-2 text-xs text-gray-500">
                      <User className="w-4 h-4" />
                      <span>{report.userEmail?.split('@')[0] || 'Anonymous'}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default CommunityVoting;
