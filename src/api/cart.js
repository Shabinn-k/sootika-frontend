import { api, initAuth } from "./Axios";

export const cartService = {
  getCart: async () => {
    await initAuth();
    const res = await api.get("/cart");
    return { data: res.data?.cart?.items || [], success: true };
  },

  getCartCount: async () => {
    await initAuth();
    const res = await api.get("/cart/count");
    return { data: res.data?.count ?? 0, success: true };
  },

  addToCart: async (data) => {
    await initAuth();
    const res = await api.post("/cart", data); 
    return { data: res.data, success: true };
  },

  updateCartItem: async (id, data) => {
    await initAuth();
    const res = await api.put(`/cart/${id}`, data); 
    return { data: res.data, success: true };
  },

  removeFromCart: async (id) => {
    await initAuth();
    const res = await api.delete(`/cart/${id}`); 
    return { data: res.data, success: true };
  },

  clearCart: async () => {
    await initAuth();
    const res = await api.delete("/cart");
    return { data: res.data, success: true };
  },
};