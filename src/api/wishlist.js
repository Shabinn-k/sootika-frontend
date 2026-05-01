import { api, initAuth } from "./Axios";

export const wishlistService = {
  getWishlist: async () => {
    await initAuth();
    const res = await api.get("/wishlist");
    return { data: res.data?.wishlist?.items || [], success: true };
  },

  getWishlistCount: async () => {
    await initAuth();
    const res = await api.get("/wishlist/count");
    return { data: res.data?.count ?? 0, success: true };
  },

  addToWishlist: async (data) => {
    await initAuth();
    const res = await api.post("/wishlist", data); 
    return { data: res.data, success: true };
  },

  removeFromWishlist: async (id) => {
    await initAuth();
    const res = await api.delete(`/wishlist/${id}`);
    return { data: res.data, success: true };
  },

  clearWishlist: async () => {
    await initAuth();
    const res = await api.delete("/wishlist");
    return { data: res.data, success: true };
  },
};