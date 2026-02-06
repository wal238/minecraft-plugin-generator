import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

const axiosInstance = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
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

  downloadPlugin(downloadId) {
    window.open(`${API_URL}/download/${downloadId}`, '_blank');
  }
};
