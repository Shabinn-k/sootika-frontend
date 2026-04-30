import { api, initAuth } from "./Axios";

export const orderService = {
    // ⚠️ CRITICAL FIX: Remove duplicate /api prefix and add auth wait
    createOrder: async (data) => {
        try {
            await initAuth();
            const response = await api.post("/orders", data);
            return { success: true, data: response.data };
        } catch (error) {
            console.error("Create order error:", error);
            return { 
                success: false, 
                error: error.response?.data?.message || "Failed to create order" 
            };
        }
    },

    getMyOrders: async () => {
        try {
            await initAuth();
            const response = await api.get("/orders");
            return { 
                success: true, 
                data: response.data?.data || response.data?.orders || [] 
            };
        } catch (error) {
            console.error("Get orders error:", error);
            return { 
                success: false, 
                data: [], 
                error: error.response?.data?.message || "Failed to fetch orders" 
            };
        }
    },

    getOrderById: async (id) => {
        try {
            await initAuth();
            const response = await api.get(`/orders/${id}`);
            return { success: true, data: response.data };
        } catch (error) {
            console.error("Get order by ID error:", error);
            return { 
                success: false, 
                error: error.response?.data?.message || "Failed to fetch order details" 
            };
        }
    },

    cancelOrder: async (id) => {
        try {
            await initAuth();
            const response = await api.put(`/orders/${id}/cancel`);
            return { success: true, data: response.data };
        } catch (error) {
            console.error("Cancel order error:", error);
            return { 
                success: false, 
                error: error.response?.data?.message || "Failed to cancel order" 
            };
        }
    },

    // ⚠️ CRITICAL ADD: Razorpay payment methods
    createRazorpayOrder: async (amount, currency = "INR") => {
        try {
            await initAuth();
            const response = await api.post("/payments/create-order", {
                amount,
                currency
            });
            return { success: true, data: response.data };
        } catch (error) {
            console.error("Create Razorpay order error:", error);
            return { 
                success: false, 
                error: error.response?.data?.message || "Failed to create payment order" 
            };
        }
    },

    verifyPayment: async (paymentData) => {
        try {
            await initAuth();
            // ⚠️ CRITICAL: Send payment_id, order_id, signature to backend for verification
            const response = await api.post("/payments/verify", paymentData);
            return { success: true, data: response.data };
        } catch (error) {
            console.error("Payment verification error:", error);
            return { 
                success: false, 
                error: error.response?.data?.message || "Payment verification failed" 
            };
        }
    },

    // Get order payment status
    getPaymentStatus: async (orderId) => {
        try {
            await initAuth();
            const response = await api.get(`/orders/${orderId}/payment-status`);
            return { success: true, data: response.data };
        } catch (error) {
            console.error("Get payment status error:", error);
            return { 
                success: false, 
                error: error.response?.data?.message || "Failed to fetch payment status" 
            };
        }
    }
};