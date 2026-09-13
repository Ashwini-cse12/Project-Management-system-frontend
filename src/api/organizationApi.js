import axiosInstance from "./axiosInstance";

export const getOrganizations = () => axiosInstance.get("/organizations");
export const createOrganization = (payload) => axiosInstance.post("/organizations", payload);
