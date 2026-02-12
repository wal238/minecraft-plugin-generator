import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

const axiosInstance = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Auth interceptor — attaches JWT if available
axiosInstance.interceptors.request.use(async (config) => {
  try {
    // Dynamic import to avoid circular dependency
    const { default: useAuthStore } = await import('../store/useAuthStore');
    const token = await useAuthStore.getState().getAccessToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  } catch {
    // Auth not available — proceed without token
  }
  return config;
});

export const apiService = {
  async generatePlugin(config) {
    const response = await axiosInstance.post('/generate-plugin', config);
    return response.data;
  },

  async previewCode(config) {
    const response = await axiosInstance.post('/preview-code', config);
    return response.data;
  },

  async getBlocks() {
    const response = await axiosInstance.get('/blocks');
    return response.data;
  },

  async getWorlds() {
    const response = await axiosInstance.get('/worlds');
    return response.data;
  },

  async getEntitlements(paperVersion) {
    const response = await axiosInstance.get('/entitlements', {
      params: paperVersion ? { paper_version: paperVersion } : undefined,
    });
    return response.data;
  },

  downloadPlugin(downloadId) {
    window.open(`${API_URL}/download/${downloadId}`, '_blank');
  },

  // Async build job methods
  async submitBuildJob(config) {
    const response = await axiosInstance.post('/build-jobs', config);
    return response.data;
  },

  async getBuildJobStatus(jobId) {
    const response = await axiosInstance.get(`/build-jobs/${jobId}`);
    return response.data;
  },

  async exchangeHandoffCode(code) {
    const landingUrl = import.meta.env.VITE_LANDING_URL || 'http://localhost:3000';
    const response = await fetch(`${landingUrl}/api/handoff/exchange`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code }),
    });
    if (!response.ok) {
      const text = await response.text();
      throw new Error(text || 'Failed to exchange handoff code');
    }
    return response.json();
  },
};
