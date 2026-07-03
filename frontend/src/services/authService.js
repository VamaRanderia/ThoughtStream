import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "/api/auth";

export const signup = async (userData) => {
  const response = await axios.post(`${API_URL}/signup`, userData);
  return response.data;
};

export const login = async (userData) => {
  const response = await axios.post(`${API_URL}/login`, userData);
  return response.data;
};

export const checkEmail = async (email) => {
  const response = await axios.get(`${API_URL}/check-email`, {
    params: { email }
  });
  return response.data;
};

export const checkUsername = async (username) => {
  const response = await axios.get(`${API_URL}/check-username`, {
    params: { username }
  });
  return response.data;
};