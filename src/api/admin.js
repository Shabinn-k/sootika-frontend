import { api, initAuth } from "./Axios";

export const adminService = {
  getDashboard: async () => {
    try {
      await initAuth(); 
      const response = await api.get("/admin/dashboard");
      return { success: true, data: response.data };
    } catch (error) {
      console.error("Get dashboard error:", error);
      return { 
        success: false, 
        error: error.response?.data?.message || "Failed to load dashboard" 
      };
    }
  },

  getAllUsers: async () => {
    try {
      await initAuth();
      const response = await api.get("/admin/users");
      return { success: true, data: response.data?.data || response.data || [] };
    } catch (error) {
      console.error("Get users error:", error);
      return { success: false, data: [], error: error.response?.data?.message };
    }
  },

  getUserById: async (id) => {
    try {
      await initAuth();
      const response = await api.get(`/admin/users/${id}`);
      return { success: true, data: response.data?.data || response.data };
    } catch (error) {
      console.error("Get user error:", error);
      return { success: false, error: error.response?.data?.message };
    }
  },

  updateUserRole: async (id, roleData) => {
    try {
      await initAuth();
      const response = await api.put(`/admin/users/${id}/role`, roleData);
      return { success: true, data: response.data };
    } catch (error) {
      console.error("Update role error:", error);
      return { success: false, error: error.response?.data?.message };
    }
  },
toggleUserBlock: async (id) => {
  try {
    await initAuth(); 
    const response = await api.put(`/admin/users/${id}/block`)
    return { success: true, data: response.data };
  } catch (error) {
    console.error("Toggle block error:", error);
    return { success: false, error: error.response?.data?.message || "Failed to toggle block" };
  }
},

  deleteUser: async (id) => {
    try {
      await initAuth();
      const response = await api.delete(`/admin/users/${id}`);
      return { success: true, data: response.data };
    } catch (error) {
      console.error("Delete user error:", error);
      return { success: false, error: error.response?.data?.message };
    }
  },

  getProductStats: async () => {
    try {
      await initAuth();
      const response = await api.get("/admin/stats/products");
      return { success: true, data: response.data };
    } catch (error) {
      console.error("Get product stats error:", error);
      return { success: false, error: error.response?.data?.message };
    }
  },

  createProduct: async (productData) => {
    try {
      await initAuth();
      const response = await api.post("/admin/products", productData);
      return { success: true, data: response.data };
    } catch (error) {
      console.error("Create product error:", error);
      return { success: false, error: error.response?.data?.message };
    }
  },

  updateProduct: async (id, productData) => {
    try {
      await initAuth();
      const response = await api.put(`/admin/products/${id}`, productData);
      return { success: true, data: response.data };
    } catch (error) {
      console.error("Update product error:", error);
      return { success: false, error: error.response?.data?.message };
    }
  },

  updateProductImage: async (id, type, imageData) => {
    try {
      await initAuth();
      const response = await api.put(`/admin/products/${id}/image/${type}`, imageData, {
        headers: { 
          "Content-Type": "multipart/form-data" 
        }
      });
      return { success: true, data: response.data };
    } catch (error) {
      console.error("Update product image error:", error);
      return { success: false, error: error.response?.data?.message };
    }
  },

  deleteProduct: async (id) => {
    try {
      await initAuth();
      const response = await api.delete(`/admin/products/${id}`);
      return { success: true, data: response.data };
    } catch (error) {
      console.error("Delete product error:", error);
      return { success: false, error: error.response?.data?.message };
    }
  }
};