// api/products.js
import { api } from "./Axios";

export const productService = {
  getAllProducts: async () => {
    const res = await api.get("/products/");
    // Backend returns: { data: products, count }
    return { data: res.data.data || [] };
  },

  getProductById: (id) => api.get(`/products/${id}`),

  searchProducts: (query) => api.get("/products/search", { params: { q: query } }),

  getInStockProducts: () => api.get("/products/in-stock"),
};