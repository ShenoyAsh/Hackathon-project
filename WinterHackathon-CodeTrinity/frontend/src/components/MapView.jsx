import React, { useState, useEffect, useMemo } from 'react';
import { APIProvider, Map, AdvancedMarker, Pin, InfoWindow, useMap, useMapsLibrary } from '@vis.gl/react-google-maps';
import { Layers, Sun, Leaf, Thermometer, Wind, DollarSign, Activity } from 'lucide-react';

const GOOGLE_MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || '';

// --- Google Earth Engine Simulation Layer ---
const EarthEngineLayer = ({ visible }) => {
  const map = useMap();
  useEffect(() => {
    if (!map) return;

    // Create a simulation of NDVI (Vegetation Index)
    // In a real app, this would fetch tiles from Earth Engine API
    const cityCircle = new window.google.maps.Circle({
      strokeColor: '#00FF00',
      strokeOpacity: 0.0,
      strokeWeight: 2,
      fillColor: '#00FF00',
      fillOpacity: visible ? 0.25 : 0, // Toggle visibility
      map,
      center: { lat: 12.9716, lng: 77.5946 },
      radius: 3000,
    });

    const parkCircle = new window.google.maps.Circle({
      strokeColor: '#10b981',
      strokeOpacity: 0.0,
      fillColor: '#10b981',
      fillOpacity: visible ? 0.4 : 0,
      map,
      center: { lat: 12.9352, lng: 77.6245 }, // Koramangala
      radius: 1500,
    });

    return () => {
      cityCircle.setMap(null);
      parkCircle.setMap(null);
    };
  }, [map, visible]);

  return null;
};

const HeatmapLayer = ({ points }) => {
  const map = useMap();
  const visualization = useMapsLibrary('visualization');

  useEffect(() => {
    if (!map || !visualization || !points) return;

    const heatmapData = points.map(p => ({
      location: new window.google.maps.LatLng(p.lat, p.lng),
      weight: p.score || 1
    }));

    const heatmap = new visualization.HeatmapLayer({
      data: heatmapData,
      radius: 50,
      opacity: 0.7,
      gradient: [
        'rgba(0, 255, 255, 0)',
        'rgba(0, 255, 255, 1)',
        'rgba(255, 255, 0, 1)', // Yellow
        'rgba(255, 165, 0, 1)', // Orange
        'rgba(255, 0, 0, 1)'    // Red
      ]
    });

    heatmap.setMap(map);
    return () => heatmap.setMap(null);
  }, [map, visualization, points]);

  return null;
};

const MapView = ({ reports = [], predictions = [] }) => {
  const [selectedReport, setSelectedReport] = useState(null);
  const [showSatelliteAnalysis, setShowSatelliteAnalysis] = useState(false);
  const defaultCenter = { lat: 12.9716, lng: 77.5946 };

  const getMarkerConfig = (type, status) => {
    switch (type) {
      case 'heat_hotspot': return { bg: '#ef4444', glyph: '🔥', border: '#7f1d1d' }; // Red
      case 'tree_loss': return { bg: '#10b981', glyph: '🌳', border: '#064e3b' }; // Green
      case 'unused_space': return { bg: '#f59e0b', glyph: '🏚️', border: '#78350f' }; // Brown
      default: return { bg: '#3b82f6', glyph: '📍', border: '#1e3a8a' }; // Blue
    }
  };

  return (
    <div className="relative w-full h-full min-h-[500px]">
      {!GOOGLE_MAPS_API_KEY || GOOGLE_MAPS_API_KEY === 'YOUR_GOOGLE_MAPS_API_KEY' ? (
        <div className="bg-red-50 p-4 rounded-lg text-center h-full flex flex-col items-center justify-center">
          <h3 className="text-red-800 font-bold text-lg">Google Maps API Key Missing</h3>
          <p className="text-red-600">Please add VITE_GOOGLE_MAPS_API_KEY to your .env file.</p>
        </div>
      ) : (
        <APIProvider apiKey={GOOGLE_MAPS_API_KEY} libraries={['visualization', 'marker']}>
          <Map
            defaultCenter={defaultCenter}
            defaultZoom={12}
            mapId="DEMO_MAP_ID"
            gestureHandling={'greedy'}
            disableDefaultUI={false}
            heading={0} // Allows 3D rotation
            tilt={45}   // 45 degree tilt for 3D effect
          >
            {/* Layers */}
            {predictions.length > 0 && <HeatmapLayer points={predictions} />}
            <EarthEngineLayer visible={showSatelliteAnalysis} />

            {/* Simulated Earth Engine Toggle Button */}
            <div className="absolute top-4 right-4 bg-white p-2 rounded-lg shadow-xl z-50">
              <button
                onClick={() => setShowSatelliteAnalysis(!showSatelliteAnalysis)}
                className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm font-bold transition-colors ${showSatelliteAnalysis ? 'bg-green-100 text-green-800 border border-green-300' : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-200'}`}
              >
                <Layers className="w-4 h-4" />
                {showSatelliteAnalysis ? 'Earth Engine: Active' : 'Enable Satellite Analysis'}
              </button>
            </div>

            {/* Markers */}
            {reports.map((report) => {
              const config = getMarkerConfig(report.reportType, report.status);
              return (
                <AdvancedMarker
                  key={report.id}
                  position={{
                    lat: report.location?.lat || defaultCenter.lat,
                    lng: report.location?.lng || defaultCenter.lng
                  }}
                  onClick={() => setSelectedReport(report)}
                  zIndex={selectedReport?.id === report.id ? 100 : 1}
                >
                  <Pin
                    background={config.bg}
                    borderColor={config.border}
                    glyph={config.glyph}
                    scale={selectedReport?.id === report.id ? 1.2 : 1.0}
                  />
                </AdvancedMarker>
              );
            })}

            {/* Enhanced Popups */}
            {selectedReport && (
              <InfoWindow
                position={{
                  lat: selectedReport.location?.lat || defaultCenter.lat,
                  lng: selectedReport.location?.lng || defaultCenter.lng
                }}
                onCloseClick={() => setSelectedReport(null)}
                headerContent={<div className="font-bold text-gray-800 text-sm px-1">{selectedReport.title}</div>}
              >
                <div className="p-1 max-w-[250px]">
                  {/* Image */}
                  {selectedReport.imageUrl && (
                    <img src={selectedReport.imageUrl} alt="Context" className="w-full h-24 object-cover rounded-md mb-2" />
                  )}

                  {/* Chips */}
                  <div className="flex flex-wrap gap-1 mb-2">
                    <span className="px-2 py-0.5 text-[10px] rounded bg-gray-100 text-gray-600 font-medium">
                      {selectedReport.reportType}
                    </span>
                    <span className="px-2 py-0.5 text-[10px] rounded bg-blue-50 text-blue-600 font-bold border border-blue-100 flex items-center gap-1">
                      <Activity className="w-3 h-3" /> AQI: 85 (Moderate)
                    </span>
                  </div>

                  <p className="text-xs text-gray-600 mb-3">{selectedReport.description}</p>

                  {/* Google Products Integration Section */}
                  <div className="bg-gray-50 rounded-lg p-2 mb-3 border border-gray-200">
                    <div className="flex items-center gap-1 mb-1">
                      <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Google Analysis</span>
                    </div>

                    {/* Solar Potential for Unused Space */}
                    {selectedReport.reportType === 'unused_space' && (
                      <div className="flex items-center gap-2 mb-1">
                        <Sun className="w-4 h-4 text-orange-500" />
                        <div className="text-xs">
                          <span className="font-medium">Solar Potential:</span> High
                          <div className="text-[10px] text-gray-500">~1,450 kWh/year (Project Sunroof)</div>
                        </div>
                      </div>
                    )}

                    {/* Carbon for Tree Loss */}
                    {selectedReport.reportType === 'tree_loss' && (
                      <div className="flex items-center gap-2">
                        <Leaf className="w-4 h-4 text-green-500" />
                        <div className="text-xs">
                          <span className="font-medium">Carbon Loss:</span> Critical
                          <div className="text-[10px] text-gray-500">Retrieval Cost: $500</div>
                        </div>
                      </div>
                    )}

                    {/* Heat analysis */}
                    {selectedReport.reportType === 'heat_hotspot' && (
                      <div className="flex items-center gap-2">
                        <Thermometer className="w-4 h-4 text-red-500" />
                        <div className="text-xs">
                          <span className="font-medium">Surface Temp:</span> +4°C vs Avg
                          <div className="text-[10px] text-gray-500">Landsat 8 Thermal Band</div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Business Action - "Smart" Feature */}
                  <button className="w-full bg-black text-white py-1.5 rounded text-xs font-medium hover:bg-gray-800 flex items-center justify-center gap-2">
                    <DollarSign className="w-3 h-3" />
                    Sponsor This Zone
                  </button>
                  <p className="text-[9px] text-center text-gray-400 mt-1">Earn Carbon Credits for your company</p>

                </div>
              </InfoWindow>
            )}
          </Map>
        </APIProvider>
      )}
    </div>
  );
};

export default MapView;