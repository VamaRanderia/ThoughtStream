import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "";
const API = `${API_URL}/api/requests`;

export const getReceivedRequests = async () => {
    const token = localStorage.getItem("token");
    const response = await axios.get(
        `${API}/received`,
        {
            headers: {
                Authorization: `Bearer ${token}`
            }
        }
    );
    return response.data;
};

export const sendRequest = async (receiverId) => {
    const token = localStorage.getItem("token");
    const response = await axios.post(
        `${API}/send/${receiverId}`,
        {},
        {
            headers: {
                Authorization: `Bearer ${token}`
            }
        }
    );
    return response.data;
};

export const rejectRequest = async (id) => {
    const token = localStorage.getItem("token");
    const response = await axios.delete(
        `${API}/${id}/reject`,
        {
            headers: {
                Authorization: `Bearer ${token}`
            }
        }
    );
    return response.data;
};