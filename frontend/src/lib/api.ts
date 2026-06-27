import axios from "axios";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

if (!API_URL) {
  throw new Error("NEXT_PUBLIC_API_URL is not defined");
}

export const api = axios.create({
  baseURL: `${API_URL}/api`,
  withCredentials: true,
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const original = error.config;

    if (error.response?.status === 401 && !original._retry) {
      original._retry = true;

      await api.post("/auth/refreshToken");

      return api(original);
    }

    return Promise.reject(error);
  },
);
