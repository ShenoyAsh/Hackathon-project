import React, { useState, useEffect } from 'react';
import { reportsAPI } from '../services/api';
import MapView from '../components/MapView';

const MapVisualization = () => {
  const [reports, setReports] = useState([]);
  const [predictions, setPredictions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState('all');

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        // Fetch reports using the API Client
        const response = await reportsAPI.getAll({ limit: 100 });
        const reportsData = response.reports || [];
        setReports(reportsData);

        // Calculate Heat Zones / Predictions data from 'heat_hotspot' reports
        const heatPoints = reportsData
          .filter(r => r.reportType === 'heat_hotspot')
          .map(r => ({
            lat: r.location.lat,
            lng: r.location.lng,
            score: 5 // Weight for heatmap
          }));
        setPredictions(heatPoints);

      } catch (error) {
        console.error("Failed to load map data", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const filteredReports = activeFilter === 'all'
    ? reports
    : reports.filter(r => r.reportType === activeFilter);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading map data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      {/* Header */}
      <div className="bg-white shadow-sm border-b z-10">
        <div className="max-w-7xl mx-auto px-4 py-4 flex flex-col md:flex-row justify-between items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">GreenPulse Earth View</h1>
            <p className="text-gray-600 text-sm">Powered by Google Maps & "Earth Engine" Analytics</p>
          </div>

          <div className="flex bg-gray-100 p-1 rounded-lg">
            {[
              { id: 'all', label: 'All Layers' },
              { id: 'heat_hotspot', label: '🔥 Heat' },
              { id: 'tree_loss', label: '🌳 Reforestation' },
              { id: 'unused_space', label: '🏚️ Land' },
            ].map(filter => (
              <button
                key={filter.id}
                onClick={() => setActiveFilter(filter.id)}
                className={`px-4 py-2 text-sm font-medium rounded-md transition-all ${activeFilter === filter.id
                    ? 'bg-white text-green-700 shadow-sm'
                    : 'text-gray-500 hover:text-gray-700'
                  }`}
              >
                {filter.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Map Container */}
      <div className="flex-grow relative h-[calc(100vh-140px)]">
        <MapView
          reports={filteredReports}
          predictions={predictions}
        />
      </div>
    </div>
  );
};

export default MapVisualization;

