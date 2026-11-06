import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:3000/api",
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");

  console.log("AXIOS TOKEN:", token);
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  console.log("Auth Header:",
    config.headers.Authorization
  )

  return config;
});

export default api;