import axiosInstance from "./axiosInstance";

export const getProjects = (params) => axiosInstance.get("/projects", { params });

export const getProjectSummary = () => axiosInstance.get("/projects/summary");

export const getProject = (id) => axiosInstance.get(`/projects/${id}`);

export const createProject = (payload) => axiosInstance.post("/projects", payload);

export const updateProject = (id, payload) => axiosInstance.put(`/projects/${id}`, payload);

export const deleteProject = (id) => axiosInstance.delete(`/projects/${id}`);
