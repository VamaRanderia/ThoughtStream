import api from "./api";

const API_URL = "/api/posts";

export const getPosts = async () => {
  const response = await api.get(API_URL);
  return response.data;
};
