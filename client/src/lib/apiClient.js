import axios from 'axios';

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
});

apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = 'Bearer ' + token;
  }
  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    // FALLBACK MOCK FOR DEMO PURPOSES
    if (error.config && error.config.url.includes('/dashboard/stats')) {
      let state = { v7Tasks: [], applications: [], v7Kyc: {} };
      try {
        const saved = localStorage.getItem('namdev-demo-full-state');
        if (saved) state = JSON.parse(saved);
      } catch(e) {}
      
      const totalTasks = state.v7Tasks ? state.v7Tasks.length : 120;
      const pendingTasks = state.v7Tasks ? state.v7Tasks.filter(t => t.status !== 'Completed').length : 22;
      const completedTasks = state.v7Tasks ? state.v7Tasks.filter(t => t.status === 'Completed').length : 98;
      const totalKyc = state.applications ? state.applications.length : 350;

      return Promise.resolve({
        data: {
          success: true,
          data: { totalUsers: 14, totalEmployees: 48, totalTasks, totalKyc, pendingTasks, completedTasks }
        }
      });
    }
    if (error.config && error.config.url.includes('/kyc/ocr')) {
      return Promise.resolve({
        data: {
          success: true,
          data: {
            appliedBy: "Demo User",
            description: "Simulated OCR",
            confidence: 0.95,
            requiresReview: false
          }
        }
      });
    }
    return Promise.reject(error);
  }
);

export default apiClient;
