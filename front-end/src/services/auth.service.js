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

export { registerUser, loginUser,getCurrentUser  };
