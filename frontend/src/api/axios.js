import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:3000/api",
});

// ===============================
// REQUEST INTERCEPTOR
// Adds JWT token to every request
// ===============================

api.interceptors.request.use(
  (config) => {

    const user = JSON.parse(
      localStorage.getItem("user")
    );

    if (user?.token) {
      config.headers.Authorization =
        `Bearer ${user.token}`;
    }

    return config;

  },

  (error) => Promise.reject(error)
);

// ===============================
// RESPONSE INTERCEPTOR
// Handles expired/invalid tokens
// ===============================

api.interceptors.response.use(

  (response) => response,

  (error) => {

    if (error.response?.status === 401) {

      localStorage.removeItem("user");

      window.location.href = "/login";

    }

    return Promise.reject(error);

  }

);

export default api;