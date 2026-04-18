import axios from "axios";

// Create Axios instance
const api = axios.create({
  baseURL: "http://localhost:9090/api",
  headers: {
    "Content-Type": "application/json",
  },
});

// 🔐 Request Interceptor (Attach JWT automatically)
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// 🚫 Response Interceptor (Handle global errors)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Token invalid or expired
      console.error("Unauthorized - logging out");

      localStorage.removeItem("token");

      // Optional: force redirect
      window.location.href = "/login";
    }

    return Promise.reject(error);
  }
);

export default api;