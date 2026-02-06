import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'https://tafilalet.onrender.com';

const api = axios.create({
  baseURL: API_URL,
});

// Intercepteur pour ajouter le token à chaque requête
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Intercepteur pour gérer les erreurs d'authentification
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const authService = {
  login: async (login, password) => {
    const response = await api.post('/login', { login, password });
    if (response.data.token) {
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
    }
    return response.data;
  },

  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  },

  getCurrentUser: () => {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  },

  isAuthenticated: () => {
    return !!localStorage.getItem('token');
  },
};

export const missionService = {
  getAll: (filters = {}) => {
    const params = new URLSearchParams();
    if (filters.chauffeur) params.append('chauffeur', filters.chauffeur);
    if (filters.date_debut) params.append('date_debut', filters.date_debut);
    if (filters.date_fin) params.append('date_fin', filters.date_fin);
    if (filters.employe) params.append('employe', filters.employe);
    
    const queryString = params.toString();
    return api.get(`/missions${queryString ? '?' + queryString : ''}`);
  },
  create: (data) => api.post('/missions', data),
  update: (id, data) => api.put(`/missions/${id}`, data),
  delete: (id) => api.delete(`/missions/${id}`),
};

export const chauffeurService = {
  getAll: () => api.get('/chauffeurs'),
  create: (data) => api.post('/chauffeurs', data),
  update: (id, data) => api.put(`/chauffeurs/${id}`, data),
  delete: (id) => api.delete(`/chauffeurs/${id}`),
};

export const employeService = {
  getAll: () => api.get('/employes'),
  create: (data) => api.post('/employes', data),
  delete: (id) => api.delete(`/employes/${id}`),
};

export const statsService = {
  getDaily: () => api.get('/stats/daily'),
  getGeneral: () => api.get('/stats/general'),
};

export default api;
