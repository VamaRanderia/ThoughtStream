import api from "./api";

const API_URL = "/api/posts";

export const getPosts = async () => {
  const response = await api.get(API_URL);
  return response.data;
};

export const createPost = async (postData) => {
  const response = await api.post(API_URL, postData);
  return response.data;
};
