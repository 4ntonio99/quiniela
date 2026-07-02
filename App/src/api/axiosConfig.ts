import axios from 'axios';

// Función que detecta el entorno según el dominio actual
const getBaseUrl = () => {
  const host = window.location.hostname;
  
  // Si estamos en el dominio de producción
  if (host === 'quiniela.abarretov.com') {
    return 'https://quiniela-api.abarretov.com';
  }
  
  // Por defecto (Desarrollo local o app.abarretov.com)
  return 'https://api.abarretov.com';
};

const api = axios.create({
  baseURL: getBaseUrl(),
});

// Tus interceptores (que ya tienes)
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;