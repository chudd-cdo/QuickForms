import axios from "axios";
import LocalStorage from "./components/LocalStorage";

const api = axios.create({
  baseURL: "https://192.168.2.2:82/chuddapp-backend/api", // ✅ Update with your API URL
  withCredentials: true, // ✅ Required for Sanctum
}); 

// ✅ Attach token automatically to every request
api.interceptors.request.use((config) => {
  const token = LocalStorage.getToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
    config.headers["Accept"] = "application/json";  // ✅ Ensure JSON responses
  }
  return config;
});

export default api;
