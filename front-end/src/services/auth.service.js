import api from "../lib/axios";

const registerUser = (data) => {
    return api.post("/auth/register", data);
};

const loginUser = (data) => {
    return api.post("/auth/login", data);
};
const getCurrentUser = () => {
    return api.get("/auth/me");
};

const logout = () => {
  return api.post("/auth/logout");
};

const updateProfile = (data) => {
  return api.patch("/auth/profile", data);
};

const changePassword = (data) => {
  return api.patch("/auth/change-password", data);
};

export { registerUser, loginUser, getCurrentUser, logout, updateProfile, changePassword };
