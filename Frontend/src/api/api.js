import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL, // Backend base URL
  withCredentials: true,                // IMPORTANT: allows session cookies
});

export default api;
