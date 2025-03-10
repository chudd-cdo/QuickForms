import api from "../api";

export const fetchUserForms = async (token) => {
  await api.get("/sanctum/csrf-cookie");
  return api.get("/my-forms", { headers: { Authorization: `Bearer ${token}` } });
};
