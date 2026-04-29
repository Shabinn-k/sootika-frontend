// api/wishlist.js
import { api } from "./Axios";

export const wishlistService = {
  getWishlist: async () => {
    const res = await api.get("/wishlist/");
    // Backend returns: { message, wishlist: { items } }
    return { data: res.data.wishlist?.items || [] };
  },

  getWishlistCount: async () => {
    const res = await api.get("/wishlist/count");
    return { data: res.data.count };
  },

  addToWishlist: (data) => api.post("/wishlist/add", data),

  checkWishlist: (productId) => api.get(`/wishlist/check/${productId}`),

  removeFromWishlist: (productId) => api.delete(`/wishlist/remove/${productId}`),

  clearWishlist: () => api.delete("/wishlist/clear"),
};