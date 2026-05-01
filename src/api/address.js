import { api, initAuth } from "./Axios";

export const addressService = {
    getMyAddresses: async () => {
        try {
            await initAuth(); 
            const response = await api.get("/addresses");
            return { 
                success: true, 
                data: response.data?.addresses ??  [] 
            };
        } catch (error) {
            console.error("Get addresses error:", error);
            return { 
                success: false, 
                data: [], 
                error: error.response?.data?.message || "Failed to fetch addresses" 
            };
        }
    },

    addAddress: async (data) => {
        try {
            await initAuth();
            const response = await api.post("/addresses", data);
            return { 
                success: true, 
                data: response.data?.address || response.data?.data 
            };
        } catch (error) {
            console.error("Add address error:", error);
            return { 
                success: false, 
                error: error.response?.data?.message || "Failed to add address" 
            };
        }
    },

    updateAddress: async (id, data) => {
        try {
            await initAuth();
            const response = await api.put(`/addresses/${id}`, data);
            return { 
                success: true, 
                data: response.data?.address || response.data?.data 
            };
        } catch (error) {
            console.error("Update address error:", error);
            return { 
                success: false, 
                error: error.response?.data?.message || "Failed to update address" 
            };
        }
    },

    deleteAddress: async (id) => {
        try {
            await initAuth();
            const response = await api.delete(`/addresses/${id}`);
            return { 
                success: true, 
                data: response.data 
            };
        } catch (error) {
            console.error("Delete address error:", error);
            return { 
                success: false, 
                error: error.response?.data?.message || "Failed to delete address" 
            };
        }
    },
};