import axios from "axios";
import { getAccessToken, clearSession } from "../utils/tokenStorage";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_ADDRESS,
  headers: {
    Accept: "application/json",
    "Content-Type": "application/json",
    "x-api-key": import.meta.env.VITE_X_API_KEY,
  },
});

api.interceptors.request.use((config) => {
  const token = getAccessToken();

  config.headers = config.headers ?? {};
  config.headers["x-api-key"] = import.meta.env.VITE_X_API_KEY;

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error?.response?.status === 401) {
      clearSession();
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

export default api;