// Centralised API base URLs — reads from Vite env vars in production, falls back to localhost for dev
export const BACKEND_URL  = import.meta.env.VITE_BACKEND_URL  || 'http://127.0.0.1:5000';
export const ML_URL       = import.meta.env.VITE_ML_URL       || 'http://127.0.0.1:8001';
