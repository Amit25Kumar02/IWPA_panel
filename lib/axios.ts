import axios from "axios";



const api = axios.create({
  // baseURL:"http://13.200.174.224:83",
  baseURL: import.meta.env.VITE_API_BASE_URL || "http://localhost:5000",
  withCredentials: false,
});

export default api;
