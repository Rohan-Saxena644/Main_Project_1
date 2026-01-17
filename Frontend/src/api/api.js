import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:8080/api", // Backend base URL
  withCredentials: true,                // IMPORTANT: allows session cookies
});

export default api;
