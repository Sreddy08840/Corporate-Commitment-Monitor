/**
 * Axios instance for the Corporate Commitment Monitor API.
 * In dev, leave VITE_API_URL empty to use the Vite proxy (see vite.config.js).
 * For production, set VITE_API_URL to your backend origin (e.g. https://api.example.com).
 */
import axios from 'axios';

const baseURL = import.meta.env.VITE_API_URL ?? '';

export const api = axios.create({
  baseURL,
  headers: { 'Content-Type': 'application/json' },
  timeout: 60_000, // classification can take a few seconds
});

export default api;
