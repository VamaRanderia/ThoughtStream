import api from "./api";

const API = "/api/requests";

export const getReceivedRequests = async () => {
    const response = await api.get(`${API}/received`);
    return response.data;
};

export const sendRequest = async (receiverId) => {
    const response = await api.post(
        `${API}/send/${receiverId}`,
        {}
    );
    return response.data;
};

export const acceptRequest = async (id) => {
    const response = await api.patch(`${API}/${id}/accept`);
    return response.data;
};

export const rejectRequest = async (id) => {
    const response = await api.delete(`${API}/${id}/reject`);
    return response.data;
};
