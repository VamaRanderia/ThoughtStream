import api from "./api";

export const getUsers = async (page = 1, limit = 10) => {
    const response = await api.get(`/api/users?page=${page}&limit=${limit}`);
    return response.data;
};

export const searchUsers = async (query, page = 1, limit = 10) => {
    const response = await api.get(`/api/users/search?q=${query}&page=${page}&limit=${limit}`);
    return response.data;
};

export const getFriends = async (page = 1, limit = 10) => {
    const response = await api.get(`/api/users/friends?page=${page}&limit=${limit}`);
    return response.data;
};

export const getUserById = async (id) => {
    const response = await api.get(`/api/users/${id}`);
    return response.data;
};
