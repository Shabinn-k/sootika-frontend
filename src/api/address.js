import { api } from "./Axios";

export const addressService = {
    getMyAddresses: () => api.get("/api/addresses"),
    addAddress: (data) => api.post("/api/addresses", data),
    updateAddress: (id, data) => api.put(`/api/addresses/${id}`, data),
    deleteAddress: (id) => api.delete(`/api/addresses/${id}`),
};