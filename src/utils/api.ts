import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
});

// Attach JWT on every request (skip dummy admin token)
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token && token !== "dummy-token") config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Auto-logout on 401 only for real member tokens (not admin dummy token)
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err?.response?.status === 401) {
      const userType = localStorage.getItem("userType");
      const isAuthenticated = localStorage.getItem("isAuthenticated");
      // Only auto-logout if already logged in as member/role (not during login flow)
      if (userType !== "admin" && isAuthenticated === "true") {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        localStorage.removeItem("userType");
        localStorage.removeItem("isAuthenticated");
        window.location.reload();
      }
    }
    return Promise.reject(err);
  }
);

export default api;