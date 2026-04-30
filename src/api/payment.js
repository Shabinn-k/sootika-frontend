import { api, initAuth } from "./Axios";

export const paymentService = {
    // ⚠️ CRITICAL FIX: Remove duplicate /api prefix and add auth wait
    createOrder: async (amount, currency = "INR", receipt = null) => {
        // Validate amount
        if (!amount || amount <= 0) {
            return { 
                success: false, 
                error: "Invalid amount" 
            };
        }

        try {
            await initAuth();
            const response = await api.post("/payment/create-order", { 
                amount: Math.round(amount), // Ensure integer
                currency, 
                receipt: receipt || `receipt_${Date.now()}`
            });
            
            return { 
                success: true, 
                data: response.data,
                order_id: response.data.order_id || response.data.id
            };
        } catch (error) {
            console.error("Create Razorpay order error:", error);
            return { 
                success: false, 
                error: error.response?.data?.message || "Failed to create payment order" 
            };
        }
    },
    
    // ⚠️ CRITICAL FIX: Standardize parameter naming
    verifyPayment: async (paymentData) => {
        // Support both naming conventions
        const orderId = paymentData.order_id || paymentData.orderId;
        const paymentId = paymentData.payment_id || paymentData.paymentId;
        const signature = paymentData.signature || paymentData.razorpay_signature;
        
        if (!orderId || !paymentId || !signature) {
            return { 
                success: false, 
                error: "Missing payment verification data" 
            };
        }

        try {
            await initAuth();
            const response = await api.post("/payment/verify", {
                order_id: orderId,
                payment_id: paymentId,
                signature: signature
            });
            
            return { 
                success: true, 
                data: response.data 
            };
        } catch (error) {
            console.error("Payment verification error:", error);
            return { 
                success: false, 
                error: error.response?.data?.message || "Payment verification failed" 
            };
        }
    },

    // ⚠️ CRITICAL ADD: Get payment status
    getPaymentStatus: async (paymentId) => {
        try {
            await initAuth();
            const response = await api.get(`/payment/status/${paymentId}`);
            return { 
                success: true, 
                data: response.data 
            };
        } catch (error) {
            console.error("Get payment status error:", error);
            return { 
                success: false, 
                error: error.response?.data?.message || "Failed to get payment status" 
            };
        }
    },

    // ⚠️ CRITICAL ADD: Refund payment
    refundPayment: async (paymentId, amount = null, reason = "") => {
        try {
            await initAuth();
            const response = await api.post("/payment/refund", {
                payment_id: paymentId,
                amount: amount,
                reason: reason
            });
            return { 
                success: true, 
                data: response.data 
            };
        } catch (error) {
            console.error("Refund payment error:", error);
            return { 
                success: false, 
                error: error.response?.data?.message || "Refund failed" 
            };
        }
    },

    // Verify webhook signature (for backend, not frontend)
    verifyWebhookSignature: () => {
        // This should be done on backend only
        // Frontend should never verify webhooks
        console.warn("Webhook verification should only happen on backend");
        return false;
    }
};