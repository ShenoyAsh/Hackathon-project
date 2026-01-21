import { analyzeImageWithGemini } from './gemini';

// API configuration
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://us-central1-greenpulse.cloudfunctions.net';

// Mock Data for Demo/Fallback - Mutable for session persistence
const getStoredData = () => {
  const stored = localStorage.getItem('greenpulse_mock_data');
  if (stored) {
    return JSON.parse(stored);
  }
  return {
    reports: [
      {
        id: 'mock-1',
        title: 'Heat Island in Downtown',
        description: 'Severe heat accumulation in this concrete area.',
        location: { lat: 12.9716, lng: 77.5946, address: 'MG Road, Bangalore' },
        reportType: 'heat_hotspot',
        status: 'pending',
        upvotes: 15,
        downvotes: 1,
        createdAt: new Date().toISOString(),
        aiAnalysis: {
          riskLevel: 'High',
          recommendation: 'Plant urban canopy',
          environmentalImpact: 'Significant reduction in local temp expected',
          estimated_carbon_offset: '120 kg/year'
        },
        imageUrl: 'https://images.unsplash.com/photo-1550989460-0adf9ea622e2?q=80&w=600&auto=format&fit=crop',
        userEmail: 'citizen@greenpulse.app'
      },
      {
        id: 'mock-2',
        title: 'Deforested Park Zone',
        description: 'Several trees cut down illegally.',
        location: { lat: 12.9352, lng: 77.6245, address: 'Koramangala, Bangalore' },
        reportType: 'tree_loss',
        status: 'approved',
        upvotes: 42,
        downvotes: 0,
        createdAt: new Date().toISOString(),
        aiAnalysis: {
          riskLevel: 'Critical',
          recommendation: 'Immediate reforestation',
          environmentalImpact: 'Loss of biodiversity',
          estimated_carbon_offset: '450 kg/year'
        },
        imageUrl: 'https://images.unsplash.com/photo-1623577772765-a89c773b063d?q=80&w=600&auto=format&fit=crop',
        userEmail: 'nature_lover@greenpulse.app'
      },
      {
        id: 'mock-3',
        title: 'Empty Plot for Garden',
        description: 'Unused space that could be a community garden.',
        location: { lat: 12.9250, lng: 77.5891, address: 'Jayanagar, Bangalore' },
        reportType: 'unused_space',
        status: 'under_review',
        upvotes: 8,
        downvotes: 0,
        createdAt: new Date().toISOString(),
        aiAnalysis: {
          riskLevel: 'Low',
          recommendation: 'Community gardening',
          environmentalImpact: 'Positive social and environmental impact',
          estimated_carbon_offset: '200 kg/year'
        },
        imageUrl: 'https://plus.unsplash.com/premium_photo-1664303499312-917c50e4047b?q=80&w=600&auto=format&fit=crop',
        userEmail: 'urban_farmer@greenpulse.app'
      }
    ],
    stats: {
      totalReports: 150,
      resolvedReports: 89,
      treesPlanted: 450,
      activeHotspots: 12
    }
  };
};

const MOCK_DATA = getStoredData();

const saveMockData = () => {
  localStorage.setItem('greenpulse_mock_data', JSON.stringify(MOCK_DATA));
};

// Generic API client
class ApiClient {
  constructor(baseURL) {
    this.baseURL = baseURL;
    this.token = null;
    this.useMock = true; // Enable fallback by default if connection fails
  }

  setToken(token) {
    this.token = token;
  }

  getHeaders() {
    const headers = {
      'Content-Type': 'application/json',
    };

    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    return headers;
  }

  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    const config = {
      headers: this.getHeaders(),
      ...options,
    };

    try {
      // console.log(`Fetching: ${url}`);
      const response = await fetch(url, config);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || `HTTP error! status: ${response.status}`);
      }

      return data;
    } catch (error) {
      // console.error('API request failed:', error); // Suppressed for Demo Mode

      // Fallback to Mock Data (Alternative)
      if (this.useMock) {
        console.log('Info: Using Offline Demo Data for:', endpoint);
        return await this.getMockResponse(endpoint, options);
      }

      throw error;
    }
  }

  async getMockResponse(endpoint, options) {
    // Simulate network delay for realism
    await new Promise(resolve => setTimeout(resolve, 600));

    // Return appropriate mock data based on endpoint
    if (endpoint.includes('reports-list')) {
      return { reports: MOCK_DATA.reports, pagination: { page: 1, limit: 10, total: MOCK_DATA.reports.length, pages: 1 } };
    }

    if (endpoint.includes('reports-create')) {
      const body = JSON.parse(options.body || '{}');
      const newReport = {
        id: 'mock-new-' + Date.now(),
        ...body,
        status: 'pending',
        upvotes: 0,
        createdAt: new Date().toISOString(),
        aiAnalysis: {
          riskLevel: 'Analyzing...',
          recommendation: 'AI analysis pending',
          environmentalImpact: 'Calculating impact...'
        }
      };

      // Simulate Async AI processing updating the report after a few seconds
      setTimeout(() => {
        newReport.aiAnalysis = {
          riskLevel: 'Medium',
          recommendation: 'Recommended for green cover expansion',
          environmentalImpact: 'Moderate cooling effect expected'
        };
      }, 2000);

      MOCK_DATA.reports.unshift(newReport); // Add to beginning
      console.log('MOCK: Created new report', newReport);
      saveMockData();
      return newReport;
    }

    // Duplicate ai-analyze block removed
    if (endpoint.includes('users-login') || endpoint.includes('users-register')) {
      return {
        token: 'mock-token',
        user: { uid: 'mock-user', email: 'user@example.com', role: 'citizen', fullName: 'Mock User' }
      };
    }


    if (endpoint.includes('users-getProfile')) {
      const userReports = MOCK_DATA.reports.filter(r => r.userEmail === 'citizen@greenpulse.app'); // Simulating current user
      const points = userReports.reduce((acc, r) => acc + (r.upvotes * 10) + 50, 0); // 50pts per report + 10 per upvote

      const storedUser = localStorage.getItem('greenpulse_user_profile');
      const userProfile = storedUser ? JSON.parse(storedUser) : {
        name: "Eco Guardian",
        email: "citizen@greenpulse.app",
        memberSince: "Dec 2025",
        location: "Downtown"
      };

      return {
        ...userProfile,
        reportsSubmitted: userReports.length,
        points: points
      };
    }

    if (endpoint.includes('users-updateProfile')) {
      const body = JSON.parse(options.body || '{}');
      const storedUser = localStorage.getItem('greenpulse_user_profile');
      const currentProfile = storedUser ? JSON.parse(storedUser) : {
        name: "Eco Guardian",
        email: "citizen@greenpulse.app",
        memberSince: "Dec 2025",
        location: "Downtown"
      };
      const newProfile = { ...currentProfile, ...body };
      localStorage.setItem('greenpulse_user_profile', JSON.stringify(newProfile));
      return newProfile;
    }
    if (endpoint.includes('ai-analyze')) {
      const body = JSON.parse(options.body || '{}');

      // Try Real Gemini Analysis if Base64 image is present
      if (body.imageBase64 || body.imageUrl?.startsWith('data:')) {
        try {
          const base64 = body.imageBase64 || body.imageUrl;
          const result = await analyzeImageWithGemini(base64, 'image/jpeg', body.reportType);
          // If real analysis returns specific failure (like strict rejection or error), we can respect it OR override for demo.
          // User requested: "use mock data but at least dont show error"
          // So if it failed (isRelevant: false with error reason), we override to Mock Success for the demo.
          if (result.isRelevant === false && result.spamReason && result.spamReason.includes('Error')) {
            throw new Error(result.spamReason); // Throw to hit the catch block below for mock fallback
          }
          return result;
        } catch (e) {
          console.warn("Gemini Real Analysis failed, switching to DEMO MOCK data:", e);
          return {
            isRelevant: true,
            typeConfirmed: true,
            riskLevel: 'Medium',
            recommendation: 'Mock: Native Oak & Ferns',
            environmentalImpact: 'High CO2 absorption and habitat for local birds.',
            nativeSpecies: ['Oak Tree', 'Silver Fern', 'Wild Berry'],
            plantingSeason: 'Spring - Autumn'
          };
        }
      }

      // Fallback Mock for calls without image data (Primary for Demo now)
      return {
        isRelevant: true, // Legacy mock behavior
        typeConfirmed: true,
        riskLevel: 'Medium',
        recommendation: 'Native Oak & Ferns (Demo Plan)',
        environmentalImpact: 'High CO2 absorption (~45kg/yr) and habitat for local birds.',
        nativeSpecies: ['Oak Tree', 'Silver Fern', 'Wild Berry'],
        plantingSeason: 'Spring - Autumn',
        benefits: 'Promotes biodiversity and cools the surrounding area.'
      };
    }

    if (endpoint.includes('ai-getAnalysis')) {
      return {
        riskLevel: 'Medium',
        recommendation: 'Based on the mock analysis, we recommend planting more trees.',
        environmentalImpact: 'Moderate positive impact.'
      };
    }


    if (endpoint.includes('reports-updateStatus')) {
      const reportId = new URLSearchParams(endpoint.split('?')[1]).get('reportId');
      const body = JSON.parse(options.body || '{}');
      const reportIndex = MOCK_DATA.reports.findIndex(r => r.id === reportId);

      if (reportIndex !== -1) {
        MOCK_DATA.reports[reportIndex] = { ...MOCK_DATA.reports[reportIndex], ...body };
        saveMockData();
        return MOCK_DATA.reports[reportIndex];
      }
      return {};
    }

    if (endpoint.includes('reports-vote')) {
      const body = JSON.parse(options.body || '{}');
      const { reportId, voteType } = body;
      const reportIndex = MOCK_DATA.reports.findIndex(r => r.id === reportId);

      if (reportIndex !== -1) {
        // Basic simulation: just increment upvotes for now
        if (voteType === 'upvote') {
          MOCK_DATA.reports[reportIndex].upvotes = (MOCK_DATA.reports[reportIndex].upvotes || 0) + 1;
        }
        saveMockData();
        return { success: true, upvotes: MOCK_DATA.reports[reportIndex].upvotes };
      }
      return { success: false };
    }

    if (endpoint.includes('partners-getAll')) {
      return {
        partners: [
          {
            id: 'p-1',
            name: 'Green Earth Foundation',
            type: 'NGO',
            contribution: 'Reforestation Expertise',
            projectsSupported: 12,
            totalContribution: '$50,000',
            contact: 'contact@greenearth.org'
          },
          {
            id: 'p-2',
            name: 'TechCorp CSR',
            type: 'CSR',
            contribution: 'Smart Sensors & Funding',
            projectsSupported: 5,
            totalContribution: '$120,000',
            contact: 'csr@techcorp.com'
          },
          {
            id: 'p-3',
            name: 'City Municipal Council',
            type: 'Government',
            contribution: 'Land Approval & Maintenance',
            projectsSupported: 25,
            totalContribution: 'Infrastructure',
            contact: 'admin@citycouncil.gov'
          },
          {
            id: 'p-4',
            name: 'EcoSolutions Ltd',
            type: 'Corporate',
            contribution: 'Sustainable Materials',
            projectsSupported: 8,
            totalContribution: '$35,000',
            contact: 'info@ecosolutions.com'
          }
        ]
      };
    }

    return {};
  }

  async get(endpoint, params = {}) {
    const queryString = new URLSearchParams(params).toString();
    const url = queryString ? `${endpoint}?${queryString}` : endpoint;
    return this.request(url, { method: 'GET' });
  }

  async post(endpoint, data = {}) {
    return this.request(endpoint, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async patch(endpoint, data = {}) {
    return this.request(endpoint, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  async delete(endpoint) {
    return this.request(endpoint, { method: 'DELETE' });
  }
}

// Create API client instance
const apiClient = new ApiClient(API_BASE_URL);

// Authentication API
export const authAPI = {
  // Register new user
  register: async (userData) => {
    const response = await apiClient.post('/users-register', userData);
    if (response.token) {
      apiClient.setToken(response.token);
      localStorage.setItem('authToken', response.token);
    }
    return response;
  },

  // Login user
  login: async (credentials) => {
    const response = await apiClient.post('/users-login', credentials);
    if (response.token) {
      apiClient.setToken(response.token);
      localStorage.setItem('authToken', response.token);
    }
    return response;
  },

  // Get current user profile
  getProfile: async () => {
    return apiClient.get('/users-getProfile');
  },

  // Update user profile
  updateProfile: async (profileData) => {
    return apiClient.patch('/users-updateProfile', profileData);
  },

  // Logout
  logout: () => {
    apiClient.setToken(null);
    localStorage.removeItem('authToken');
  },

  // Initialize with stored token
  initializeAuth: () => {
    const token = localStorage.getItem('authToken');
    if (token) {
      apiClient.setToken(token);
    }
    return !!token;
  }
};

// Reports API
export const reportsAPI = {
  // Create new report
  create: async (reportData) => {
    return apiClient.post('/reports-create', reportData);
  },

  // Get all reports with pagination and filters
  getAll: async (params = {}) => {
    return apiClient.get('/reports-list', params);
  },

  // Get single report by ID
  getById: async (reportId) => {
    // Pass reportId as query param for robustness with onRequest
    return apiClient.get(`/reports-get?reportId=${reportId}`);
  },

  // Update report status (expert/authority only)
  updateStatus: async (reportId, statusData) => {
    return apiClient.patch(`/reports-updateStatus?reportId=${reportId}`, statusData);
  },

  // Vote on a report
  vote: async (reportId, voteType) => {
    return apiClient.post('/reports-vote', { reportId, voteType });
  }
};

// AI Analysis API
export const aiAPI = {
  // Analyze report with AI
  analyze: async (analysisData) => {
    return apiClient.post('/ai-analyze', analysisData);
  },

  // Get analysis for a report
  getAnalysis: async (reportId) => {
    return apiClient.get(`/ai-getAnalysis?reportId=${reportId}`);
  },

  // Batch analyze multiple reports
  batchAnalyze: async (reportIds) => {
    return apiClient.post('/ai-batchAnalyze', { reportIds });
  }
};

// Voting API
export const votingAPI = {
  // Create new voting session
  createSession: async (sessionData) => {
    return apiClient.post('/voting-createSession', sessionData);
  },

  // Get all voting sessions
  getSessions: async (params = {}) => {
    return apiClient.get('/voting-getSessions', params);
  },

  // Vote on a session
  vote: async (sessionId, voteData) => {
    return apiClient.post('/voting-vote', { sessionId, ...voteData });
  },

  // Get voting results
  getResults: async (sessionId) => {
    return apiClient.get(`/voting-getResults?sessionId=${sessionId}`);
  },

  // Close voting session
  closeSession: async (sessionId, closeData) => {
    return apiClient.patch(`/voting-closeSession?sessionId=${sessionId}`, closeData);
  }
};

// Partners API
export const partnersAPI = {
  // Create new partner
  create: async (partnerData) => {
    return apiClient.post('/partners-create', partnerData);
  },

  // Get all partners
  getAll: async () => {
    return apiClient.get('/partners-getAll');
  }
};

// Users Management API (for experts/authorities)
export const usersAPI = {
  // Get all users
  getAll: async (params = {}) => {
    return apiClient.get('/users-getAll', params);
  },

  // Update user role
  updateRole: async (userId, roleData) => {
    return apiClient.patch('/users-updateRole', { userId, ...roleData });
  },

  // Delete user
  delete: async (userId) => {
    return apiClient.delete(`/users-delete/${userId}`);
  }
};

// Export the API client for direct access if needed
export default apiClient;
