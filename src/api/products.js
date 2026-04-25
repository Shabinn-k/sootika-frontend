import { api } from "./Axios";

export const productService = {
  getAllProducts: async () => {
    const res = await api.get("/products");
    return { data: res.data?.data || [] };
  },

  getProductById: async (id) => {
    const res = await api.get(`/products/${id}`);
    return { data: res.data };
  },
  searchProducts: async (query) => {
    const res = await api.get("/products/search", { params: { q: query } });
    return { data: res.data?.data || [] };
  },

  getInStockProducts: async () => {
    const res = await api.get("/products/in-stock");
    return { data: res.data?.data || [] };
  }
};