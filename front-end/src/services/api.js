import axios from 'axios';

// Instance axios pour l'API
const api = axios.create({
  baseURL: 'http://localhost:3000/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Intercepteur pour ajouter le token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Services d'authentification
export const authAPI = {
  // Inscription
  register: (userData) => api.post('/auth/register', userData),
  
  // Connexion
  login: (credentials) => api.post('/auth/login', credentials),
  
  // Déconnexion
  logout: () => api.post('/auth/logout'),
  
  // OAuth Google
  googleLogin: () => {
    window.location.href = 'http://localhost:3000/api/auth/google';
  },
  
  // OAuth GitHub
  githubLogin: () => {
    window.location.href = 'http://localhost:3000/api/auth/github';
  },
};

export default api;