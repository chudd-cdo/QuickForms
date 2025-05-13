import axios from "axios";
import LocalStorage from "./components/LocalStorage";

const api = axios.create({
<<<<<<< HEAD
  baseURL: "https://192.168.2.2:82/chuddapp-backend/api", 
=======
  baseURL: "http://localhost:8000/api", 
>>>>>>> 0b5de35eb0b2472b262551f1b1355857859458c7
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
