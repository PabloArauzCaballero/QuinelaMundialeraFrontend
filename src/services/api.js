import axios from 'axios';

// Cliente de Axios conectado al backend NestJS modular
const api = axios.create({
  baseURL: 'http://localhost:3000/api/v1',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para inyectar automáticamente el JWT de localStorage
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

// Interceptor para manejar respuestas y capturar errores técnicos (requestId / correlation ID)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Buscar el identificador de correlación/rastreo en la respuesta de error del backend
    const requestId = error.response?.data?.requestId || error.response?.headers?.['x-request-id'] || 'N/A';
    
    // Adjuntar el requestId al objeto de error para que la UI pueda renderizarlo
    if (error.response?.data) {
      error.response.data.requestId = requestId;
    } else {
      error.response = { data: { message: error.message, requestId } };
    }

    console.error(`[API Error] RequestID: ${requestId} |`, error.response?.data?.message || error.message);
    
    return Promise.reject(error);
  }
);

export default api;
