import api from "./api";

const API_URL = "/api/auth";

export const signup = async (userData) => {
  const response = await api.post(`${API_URL}/signup`, userData);
  return response.data;
};

export const login = async (userData) => {
  const response = await api.post(`${API_URL}/login`, userData);
  return response.data;
};

export const logout = async () => {
  const response = await api.post(`${API_URL}/logout`);
  return response.data;
};

export const getCurrentUser = async () => {
  const response = await api.get(`${API_URL}/me`);
  return response.data;
};

export const checkEmail = async (email) => {
  const response = await api.get(`${API_URL}/check-email`, {
    params: { email }
  });
  return response.data;
};

export const checkUsername = async (username) => {
  const response = await api.get(`${API_URL}/check-username`, {
    params: { username }
  });
  return response.data;
};
