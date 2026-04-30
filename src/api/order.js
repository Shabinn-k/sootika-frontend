import { api } from "./Axios";

export const orderService = {
    createOrder: (data) => api.post("/api/orders", data),
    getMyOrders: () => api.get("/api/orders"),
    getOrderById: (id) => api.get(`/api/orders/${id}`),
    cancelOrder: (id) => api.put(`/api/orders/${id}/cancel`),
};