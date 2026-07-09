import api from "./api";

const API_URL = "/api/profile";

export const updateProfile = async (profileData) => {
    const formData = new FormData();
    
    if (profileData.bio !== undefined) {
        formData.append("bio", profileData.bio);
    }
    if (profileData.location !== undefined) {
        formData.append("location", profileData.location);
    }
    if (profileData.portfolioUrl !== undefined) {
        formData.append("portfolioUrl", profileData.portfolioUrl);
    }
    if (profileData.removePicture !== undefined) {
        formData.append("removePicture", String(profileData.removePicture));
    }
    if (profileData.profilePictureFile) {
        formData.append("profilePicture", profileData.profilePictureFile);
    }

    const response = await api.put(API_URL, formData, {
        headers: {
            "Content-Type": "multipart/form-data"
        }
    });

    return response.data;
};

export const getProfilePosts = async () => {
    const response = await api.get(`${API_URL}/posts`);
    return response.data;
};
