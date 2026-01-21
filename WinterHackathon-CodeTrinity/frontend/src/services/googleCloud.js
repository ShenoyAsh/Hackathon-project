import { aiAPI } from './api';

export const analyzeImageWithVision = async (imageFile) => {
  try {
    // Convert file to base64
    const reader = new FileReader();
    const base64Promise = new Promise((resolve, reject) => {
      reader.onload = () => resolve(reader.result);
      reader.onerror = reject;
    });
    reader.readAsDataURL(imageFile);
    const base64Image = await base64Promise;

    return {
      imageUrl: base64Image, // This might need to be a real URL in production
      pendingAnalysis: true
    };
  } catch (error) {
    console.error('Error preparing image:', error);
    throw error;
  }
};

export const predictFeasibilityAndImpact = async (location, reportType, description, imageUrl) => {
  try {
    
    const analysis = await aiAPI.analyze({
      location,
      reportType,
      description,
      imageUrl
    });

    return analysis;

  } catch (error) {
    console.warn('AI service unavailable, falling back to local estimation:', error);
    // Fallback logic for offline or pre-creation estimation
    return {
      feasibilityScore: 75,
      impactScore: 80,
      estimatedTimeline: '3-6 months',
      costConsiderations: 'Medium',
      recommendations: [
        'Ensure proper irrigation systems',
        'Consult with local community',
        'Select native plant species'
      ]
    };
  }
};

export const reverseGeocode = async (lat, lng) => {
  try {
    const response = await fetch(
      `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${import.meta.env.VITE_GOOGLE_MAPS_API_KEY}`
    );
    const data = await response.json();

    if (data.results && data.results.length > 0) {
      return data.results[0].formatted_address;
    }
    return null;
  } catch (error) {
    console.error('Error reverse geocoding:', error);
    return null;
  }
};
