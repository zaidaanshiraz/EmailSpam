import axios from "axios";

const BASE_URL = "http://localhost:3001";

export async function register(payload) {
    const res = await axios.post(`${BASE_URL}/auth/register`, payload);
    return res.data;
}

export async function login(payload) {
    const res = await axios.post(`${BASE_URL}/auth/login`, payload);
    return res.data;
}

export async function me() {
    const token = localStorage.getItem("token");
    const res = await axios.get(`${BASE_URL}/auth/me`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
    return res.data;
}



