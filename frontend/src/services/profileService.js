import api from "./api";

const API_URL = "/api/profile";

export const updateProfile = async (profileData) => {
    const response = await api.put(API_URL, profileData);

    return response.data;
};
