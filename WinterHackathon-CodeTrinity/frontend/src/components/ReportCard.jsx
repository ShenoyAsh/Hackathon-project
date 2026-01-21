import React from 'react';
import { MapPin, Calendar, ThumbsUp, Activity, Sparkles, Cloud } from 'lucide-react';
import { motion } from 'framer-motion';
import Badge from './ui/Badge';
import Button from './ui/Button';

const ReportCard = ({ report, onClick }) => {
  const getStatusVariant = (status) => {
    switch (status) {
      case 'approved': return 'success';
      case 'pending': return 'warning';
      case 'in_progress': return 'primary';
      case 'completed': return 'success';
      case 'rejected': return 'danger';
      default: return 'secondary';
    }
  };

  const getRiskColor = (risk) => {
    switch (risk?.toLowerCase()) {
      case 'high': return 'text-red-600';
      case 'medium': return 'text-yellow-600';
      case 'low': return 'text-green-600';
      default: return 'text-gray-600';
    }
  };

  return (
    <motion.div
      whileHover={{ y: -5 }}
      transition={{ duration: 0.2 }}
      className="group bg-white rounded-2xl shadow-sm hover:shadow-lg border border-gray-100 overflow-hidden cursor-pointer"
      onClick={onClick}
    >
      {/* Image Section */}
      <div className="relative h-48 overflow-hidden bg-gray-100">
        <img
          src={report.imageUrl}
          alt={report.title}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
        />
        <div className="absolute top-2 right-2 bg-black/50 backdrop-blur-md px-2 py-1 rounded text-[10px] text-white flex items-center gap-1">
          <Cloud className="w-3 h-3" />
          Google Cloud Vision
        </div>
        <div className="absolute top-2 left-2">
          <Badge variant={getStatusVariant(report.status)}>
            {report.status.charAt(0).toUpperCase() + report.status.slice(1)}
          </Badge>
        </div>
      </div>

      {/* Content Section */}
      <div className="p-5">
        <h3 className="text-lg font-bold text-gray-900 mb-2 line-clamp-1 group-hover:text-primary-600 transition-colors">
          {report.title}
        </h3>

        <p className="text-gray-600 text-sm mb-4 line-clamp-2">
          {report.description}
        </p>

        {/* AI Analysis Section */}
        {report.aiAnalysis && (
          <div className="mt-4 p-3 bg-indigo-50 rounded-lg border border-indigo-100">
            <div className="flex items-center gap-1 mb-2">
              <Sparkles className="w-3 h-3 text-indigo-600" />
              <span className="text-xs font-bold text-indigo-700 uppercase tracking-wide">Powered by Google Gemini</span>
            </div>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div>
                <span className="text-gray-500 text-xs">Risk Level</span>
                <p className={`font-medium ${getRiskColor(report.aiAnalysis.riskLevel)}`}>
                  {report.aiAnalysis.riskLevel}
                </p>
              </div>
              <div>
                <span className="text-gray-500 text-xs">Confidence</span>
                <p className="font-medium text-gray-900">
                  {(report.aiAnalysis.confidence * 100).toFixed(0)}%
                </p>
              </div>
            </div>
          </div>
        )}

        <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-100 text-sm text-gray-500">
          <div className="flex items-center space-x-2">
            <MapPin className="w-4 h-4" />
            <span className="line-clamp-1 max-w-[100px]">{report.location.address}</span>
          </div>
          <div className="flex items-center space-x-1">
            <ThumbsUp className="w-4 h-4" />
            <span>{report.upvotes || 0}</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default ReportCard;
