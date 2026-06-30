import axios from "axios";

const API_URL = "http://localhost:5000/api/profile";

export const updateProfile = async (profileData) => {
    const token = localStorage.getItem("token");

    const response = await axios.put(API_URL, profileData, {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });

    return response.data;
};