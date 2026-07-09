import api from "./api";

export const getUsers = async () => {
    const response = await api.get("/api/users");

    return response.data;
};

export const searchUsers = async (query) => {
    const response = await api.get(`/api/users/search?q=${query}`);
    return response.data;
};

export const getUserById = async (id) => {
    const response = await api.get(`/api/users/${id}`);
    return response.data;
};
