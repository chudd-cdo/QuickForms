import axios from "axios";
import LocalStorage from "./components/localStorage"; 

const api = axios.create({
  baseURL: "http://192.168.5.41:8000/api",
  withCredentials: true, // ✅ Required for Sanctum auth
});

// ✅ Attach token automatically to every request
api.interceptors.request.use((config) => {
  const token = LocalStorage.getToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
