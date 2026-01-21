import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Camera, MapPin, Upload, X, Loader2, Sparkles, Leaf, TreePine, ThermometerSun, Info } from 'lucide-react';
import { APIProvider, Map, AdvancedMarker, Pin } from '@vis.gl/react-google-maps';
import { reportsAPI, aiAPI } from '../services/api';
import toast from 'react-hot-toast';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';
import LoadingSpinner from '../components/ui/LoadingSpinner';

const GOOGLE_MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || '';

const Report = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [image, setImage] = useState(null);
  const [location, setLocation] = useState(null); // { lat, lng }
  const [address, setAddress] = useState('');
  const [reportType, setReportType] = useState('unused_space');
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState(null);
  const fileInputRef = useRef(null);

  // Default center for map (if no location yet)
  const [mapCenter, setMapCenter] = useState({ lat: 12.9716, lng: 77.5946 });

  const reportTypes = [
    {
      value: 'unused_space',
      label: 'Vacant Land',
      icon: '🏚️',
      description: 'Empty plot available for greening',
      gradient: 'from-orange-50 to-orange-100',
      border: 'group-hover:border-orange-300'
    },
    {
      value: 'tree_loss',
      label: 'Tree Loss',
      icon: '🌳',
      description: 'Area needing reforestation',
      gradient: 'from-green-50 to-green-100',
      border: 'group-hover:border-green-300'
    },
    {
      value: 'heat_hotspot',
      label: 'Heat Hotspot',
      icon: '🔥',
      description: 'High temperature zone',
      gradient: 'from-red-50 to-red-100',
      border: 'group-hover:border-red-300'
    }
  ];

  // Auto-detect location on load
  useEffect(() => {
    if (navigator.geolocation && !location) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setMapCenter({ lat: latitude, lng: longitude });
          // Don't auto-set location to avoid accidental selection, just center map
        },
        (error) => console.log('Location access denied or error')
      );
    }
  }, []);

  const handleMapClick = async (e) => {
    if (e.detail.latLng) {
      const newLoc = { lat: e.detail.latLng.lat, lng: e.detail.latLng.lng };
      setLocation(newLoc);

      // Default coordinate string
      setAddress(`${newLoc.lat.toFixed(5)}, ${newLoc.lng.toFixed(5)}`);

      // Reverse Geocoding via Google Maps API
      try {
        const response = await fetch(
          `https://maps.googleapis.com/maps/api/geocode/json?latlng=${newLoc.lat},${newLoc.lng}&key=${GOOGLE_MAPS_API_KEY}`
        );
        const data = await response.json();
        if (data.results && data.results[0]) {
          setAddress(data.results[0].formatted_address);
          toast.success("Location identified: " + data.results[0].formatted_address.split(',')[0]);
        }
      } catch (error) {
        console.error("Geocoding failed:", error);
      }
    }
  };

  const handleImageCapture = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImage(file);
      // Optional: Auto-analyze implementation could go here
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!user) {
      toast.error('Please sign in to submit a report');
      navigate('/auth');
      return;
    }

    if (!location || !description) {
      toast.error('Please provide location and description');
      return;
    }

    setIsSubmitting(true);

    try {
      let imageUrl = '';
      let imageBase64 = '';

      if (image) {
        // Mock URL for UI purposes
        imageUrl = URL.createObjectURL(image); // This is a local blob, won't work on backend if not uploaded

        // Convert to Base64 for real AI analysis
        const reader = new FileReader();
        const base64Promise = new Promise((resolve) => {
          reader.onload = (e) => resolve(e.target.result);
        });
        reader.readAsDataURL(image);
        imageBase64 = await base64Promise;
      }

      const reportData = {
        title: `${reportType.replace('_', ' ').toUpperCase()}`,
        description,
        location: { ...location, address },
        reportType,
        imageUrl: imageBase64 ? '' : imageUrl, // If sending base64, usually we'd upload to storage first. For now, pass base64?
        // Note: Sending huge base64 in JSON body might hit limits. 
        // For Hackathon: Send base64. Ideally: Upload to Firebase Storage -> Get URL -> Send URL.
        imageBase64: imageBase64,
        additionalInfo: analysis ? JSON.stringify(analysis) : ''
      };

      const response = await reportsAPI.create(reportData);

      // Trigger Post-Submission Analysis
      if (imageUrl) {
        try {
          aiAPI.analyze({
            reportId: response.id,
            imageUrl,
            reportType,
            location: { ...location, address },
            description
          });
        } catch (e) { console.error("Async analysis trigger failed", e); }
      }

      toast.success('Report submitted successfully!');
      navigate('/dashboard');

    } catch (error) {
      toast.error(error.message || 'Error submitting report');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-12">
      {/* Hero Header */}
      <div className="bg-white border-b sticky top-0 z-30 shadow-sm glass-header">
        <div className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center text-green-600">
              <Leaf className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">New Report</h1>
              <p className="text-xs text-gray-500">Submit a greening opportunity</p>
            </div>
          </div>
          <Button variant="ghost" size="sm" onClick={() => navigate(-1)}>Cancel</Button>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-8">
        <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-8">

          {/* Left Column: Form Inputs */}
          <div className="lg:col-span-7 space-y-6">

            {/* Type Selection */}
            <section>
              <label className="block text-sm font-semibold text-gray-700 mb-3 ml-1">What are you reporting?</label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {reportTypes.map((type) => (
                  <button
                    key={type.value}
                    type="button"
                    onClick={() => setReportType(type.value)}
                    className={`relative p-4 rounded-xl border-2 text-left transition-all duration-200 group ${reportType === type.value
                      ? 'border-green-500 bg-green-50 shadow-md transform scale-[1.02]'
                      : 'border-gray-200 bg-white hover:border-gray-300 hover:shadow-sm'
                      }`}
                  >
                    <span className="text-2xl mb-2 block">{type.icon}</span>
                    <h3 className="font-semibold text-gray-900 text-sm">{type.label}</h3>
                    <p className="text-xs text-gray-500 mt-1 leading-tight">{type.description}</p>

                    {reportType === type.value && (
                      <div className="absolute top-2 right-2 text-green-500">
                        <div className="w-2 h-2 rounded-full bg-green-500 shadow-lg ring-4 ring-green-100" />
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </section>

            {/* Photo Upload */}
            <section className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
              <h2 className="text-sm font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <Camera className="w-4 h-4 text-gray-500" />
                Evidence Photo
              </h2>

              <div className="relative group">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleImageCapture}
                  className="hidden"
                  id="photo-upload"
                />

                {!image ? (
                  <label
                    htmlFor="photo-upload"
                    className="flex flex-col items-center justify-center w-full h-48 border-2 border-dashed border-gray-300 rounded-xl cursor-pointer hover:border-green-500 hover:bg-green-50 transition-colors"
                  >
                    <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                      <Upload className="w-6 h-6 text-gray-400 group-hover:text-green-600" />
                    </div>
                    <span className="text-sm font-medium text-gray-600">Click to upload or capture</span>
                    <span className="text-xs text-gray-400 mt-1">JPG, PNG (Max 5MB)</span>
                  </label>
                ) : (
                  <div className="relative h-64 rounded-xl overflow-hidden shadow-inner group-hover:shadow-md transition-shadow">
                    <img src={URL.createObjectURL(image)} alt="Preview" className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => setImage(null)}
                      className="absolute top-3 right-3 p-1.5 bg-white/90 backdrop-blur rounded-full shadow-sm hover:bg-red-50 hover:text-red-500 transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>

                    <div className="absolute bottom-3 left-3 bg-white/90 backdrop-blur px-3 py-1.5 rounded-lg text-xs font-medium text-green-700 flex items-center gap-1.5 shadow-sm">
                      <Sparkles className="w-3 h-3" />
                      Ready for AI Analysis
                    </div>
                  </div>
                )}
              </div>
            </section>

            {/* Description */}
            <section className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
              <h2 className="text-sm font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <Info className="w-4 h-4 text-gray-500" />
                Details
              </h2>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={4}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-green-500 focus:ring-4 focus:ring-green-500/10 transition-all resize-none text-sm"
                placeholder="Describe the area conditions, estimated size, and potential benefits of greening..."
              />
            </section>
            {/* AI Assistant Section - NEW FEATURE */}
            {(reportType === 'tree_loss' || reportType === 'unused_space') && (
              <section className="bg-gradient-to-br from-indigo-50 to-purple-50 p-6 rounded-2xl border border-indigo-100 shadow-sm relative overflow-hidden">
                <div className="absolute top-0 right-0 p-4 opacity-10">
                  <Sparkles className="w-24 h-24 text-indigo-500" />
                </div>

                <h2 className="text-sm font-semibold text-indigo-900 mb-2 flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-indigo-600" />
                  Gemini Nature Advisor
                </h2>

                <p className="text-xs text-indigo-700 mb-4 max-w-md">
                  Unsure what to plant? Let Google's Gemini analyze the local climate and soil data (simulated) to recommend the best native species.
                </p>

                {!analysis ? (
                  <Button
                    type="button"
                    onClick={async () => {
                      if (!image) {
                        toast.error("Please upload an image first for AI analysis.");
                        return;
                      }

                      setIsAnalyzing(true);
                      try {
                        // Convert image to Base64
                        const reader = new FileReader();
                        reader.readAsDataURL(image);
                        reader.onloadend = async () => {
                          const base64data = reader.result.split(',')[1];

                          try {
                            const result = await aiAPI.analyze({
                              reportType,
                              imageBase64: base64data
                            });

                            // Stricter Check: Must be explicitly true, or we assume failure if it's missing (unless legacy mock)
                            if (result.isRelevant !== true && result.typeConfirmed !== true) {
                              // If it's missing, it might be the legacy mock which I updated to have isRelevant: true.
                              // But if it's the "Analysis Connection Failed" block, isRelevant is false.
                              if (result.isRelevant === false) {
                                toast.error(result.spamReason || 'Image irrelevant or analysis failed');
                                setAnalysis(null); // Clear previous analysis
                                return;
                              }
                              // Do not set analysis result to prevent using irrelevant data
                              // Or we can save it to show "Rejected" state UI.
                              setAnalysis({ ...result, rejected: true });
                              return;
                            }

                            setAnalysis(result);
                            toast.success("Cloud Vision Verified: Relevant Image", { icon: '✅' });

                          } catch (err) {
                            console.error("AI Analysis failed:", err);
                            toast.error("AI Analysis failed. Using offline simulation.");
                            // Fallback (Optional, but good for hackathon safety)
                            setAnalysis({
                              recommendation: "Native Species (Offline)",
                              benefits: "Could not connect to AI, but planting is encouraged.",
                              plantingSeason: "Check local guides"
                            });
                          } finally {
                            setIsAnalyzing(false);
                          }
                        };
                      } catch (error) {
                        console.error("Image processing error:", error);
                        setIsAnalyzing(false);
                      }
                    }}
                    className="bg-white hover:bg-white/80 text-indigo-600 border-indigo-200"
                    isLoading={isAnalyzing}
                  >
                    {isAnalyzing ? 'Analyzing Ecosystem...' : '✨ Recommend Species'}
                  </Button>
                ) : (
                  <div className="bg-white/80 backdrop-blur rounded-lg p-3 border border-indigo-100 text-sm animate-in fade-in slide-in-from-bottom-2">
                    <div className="flex justify-between items-start mb-1">
                      <span className="font-bold text-indigo-900">Recommended Species:</span>
                      <button onClick={() => setAnalysis(null)} className="text-gray-400 hover:text-gray-600"><X className="w-3 h-3" /></button>
                    </div>
                    <p className="text-indigo-800 font-medium mb-1">{analysis.recommendation}</p>
                    <p className="text-xs text-gray-600">Why: {analysis.environmentalImpact || analysis.benefits}</p>
                    <p className="text-xs text-gray-500 mt-1">Best Season: {analysis.plantingSeason}</p>
                  </div>
                )}
              </section>
            )}
          </div>

          {/* Right Column: Map */}
          <div className="lg:col-span-5 h-fit sticky top-24">
            <div className="bg-white p-1 rounded-2xl border border-gray-200 shadow-lg overflow-hidden">
              <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                <h2 className="text-sm font-semibold text-gray-800 flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-red-500" />
                  Pin Location
                </h2>
                <span className="text-xs text-xs text-gray-500 bg-white px-2 py-1 rounded border">
                  {location ? 'Location Selected' : 'Tap on map'}
                </span>
              </div>

              <div className="h-[400px] w-full relative bg-gray-100">
                {GOOGLE_MAPS_API_KEY ? (
                  <APIProvider apiKey={GOOGLE_MAPS_API_KEY}>
                    <Map
                      defaultCenter={mapCenter}
                      defaultZoom={15}
                      mapId="REPORT_MAP_ID"
                      onClick={handleMapClick}
                      disableDefaultUI={true}
                      gestureHandling={'greedy'}
                      className="w-full h-full"
                    >
                      {location && (
                        <AdvancedMarker position={location}>
                          <Pin background={'#ef4444'} glyphColor={'#fff'} borderColor={'#b91c1c'} />
                        </AdvancedMarker>
                      )}
                    </Map>
                  </APIProvider>
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center text-center p-6">
                    <MapPin className="w-8 h-8 text-gray-300 mb-2" />
                    <p className="text-sm text-gray-500">Map unavailable</p>
                    <p className="text-xs text-gray-400">Add API Key to enable location picking</p>
                  </div>
                )}

                {/* Address Display Overlay */}
                {location && (
                  <div className="absolute bottom-4 left-4 right-4 bg-white/90 backdrop-blur p-3 rounded-xl shadow-lg border border-gray-200/50">
                    <p className="text-xs text-gray-500 uppercase font-bold tracking-wider mb-1">Selected Coordinates</p>
                    <p className="text-sm font-mono text-gray-800 truncate">
                      {location.lat.toFixed(6)}, {location.lng.toFixed(6)}
                    </p>
                  </div>
                )}
              </div>
            </div>

            <div className="mt-6">
              <Button
                type="submit"
                variant="gradient" // Use your gradient variant
                className="w-full py-4 text-base font-semibold shadow-xl shadow-green-500/20 hover:shadow-green-500/30 transform hover:-translate-y-0.5 transition-all"
                isLoading={isSubmitting}
                disabled={!location}
              >
                {isSubmitting ? 'Submitting Report...' : 'Submit Report'}
              </Button>
              <p className="text-center text-xs text-gray-400 mt-3">
                By submitting, you agree to our community guidelines.
              </p>
            </div>
          </div>

        </form>
      </div >
    </div >
  );
};

export default Report;
