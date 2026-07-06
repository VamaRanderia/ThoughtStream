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

export const deletePost = async (postId) => {
  const response = await api.delete(`${API_URL}/${postId}`);
  return response.data;
};

export const toggleLikePost = async (postId) => {
  const response = await api.post(`${API_URL}/${postId}/like`);
  return response.data;
};
