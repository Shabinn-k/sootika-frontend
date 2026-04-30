import { api } from "./Axios";

export const adminService = {
  // Admin dashboard
  getDashboard: () => api.get("/admin/dashboard"),

  // Users
  getAllUsers: () => api.get("/admin/users"),
  getUserById: (id) => api.get(`/admin/users/${id}`),
  updateUserRole: (id, roleData) => api.put(`/admin/users/${id}/role`, roleData),
  toggleUserBlock: (id) => api.put(`/admin/users/${id}/toggle-block`),
  deleteUser: (id) => api.delete(`/admin/users/${id}`),

  // Stats
  getProductStats: () => api.get("/admin/stats/products"),

  // Products Management
  createProduct: (productData) => api.post("/admin/products", productData),
  updateProduct: (id, productData) => api.put(`/admin/products/${id}`, productData),
  updateProductImage: (id, type, imageData) => 
    api.put(`/admin/products/${id}/image/${type}`, imageData, {
      headers: { "Content-Type": "multipart/form-data" }
    }),
  deleteProduct: (id) => api.delete(`/admin/products/${id}`),

  // Feedbacks
  getFeedbacks: () => api.get('/admin/feedbacks'),
  approveFeedback: (id) => api.put(`/admin/feedbacks/${id}/approve`),
  deleteFeedback: (id) => api.delete(`/admin/feedbacks/${id}`),
};
