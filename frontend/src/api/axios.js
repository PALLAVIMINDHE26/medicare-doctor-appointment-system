import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  headers: { 'Content-Type': 'application/json' },
});

// Attach the JWT (if present) to every outgoing request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Centralized handling for expired/invalid sessions: clear storage and
// bounce to login, but only once (avoid redirect loops from a login page
// itself receiving a 401).
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;
    const isAuthRoute = error.config?.url?.includes('/auth/login');

    if (status === 401 && !isAuthRoute) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      if (!window.location.pathname.startsWith('/login')) {
        window.location.href = '/login';
      }
    }

    return Promise.reject(error);
  }
);

/** Pulls a human-readable message out of any API error shape. */
export const getErrorMessage = (error) => {
  if (error.response?.data?.errors?.length) {
    return error.response.data.errors[0];
  }
  return error.response?.data?.message || error.message || 'Something went wrong. Please try again.';
};

export default api;
