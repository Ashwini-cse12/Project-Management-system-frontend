import axiosInstance from "./axiosInstance";

export const getTasks = (params) => axiosInstance.get("/tasks", { params });

export const getTask = (id) => axiosInstance.get(`/tasks/${id}`);

export const createTask = (payload) => axiosInstance.post("/tasks", payload);

export const updateTask = (id, payload) => axiosInstance.put(`/tasks/${id}`, payload);

export const completeTask = (id) => axiosInstance.patch(`/tasks/${id}/complete`);

export const deleteTask = (id) => axiosInstance.delete(`/tasks/${id}`);