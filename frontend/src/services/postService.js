import api from "./api";

const API_URL = "/api/posts";

export const getPosts = async (page = 1, limit = 10, author = "") => {
  let url = `${API_URL}?page=${page}&limit=${limit}`;
  if (author) {
    url += `&author=${author}`;
  }
  const response = await api.get(url);
  return response.data;
};

export const searchPostsApi = async (query, page = 1, limit = 10) => {
  const response = await api.get(`${API_URL}/search?q=${query}&page=${page}&limit=${limit}`);
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
