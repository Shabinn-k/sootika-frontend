import { api, initAuth } from "./Axios";

export const paymentService = {
  createOrder: async (amount, currency = "INR", receipt = null) => {
    if (!amount || amount <= 0) {
      return { success: false, error: "Invalid amount" };
    }

    try {
      await initAuth();
      const response = await api.post("/payment/create-order", {
        amount: Math.round(amount),
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
  
  verifyPayment: async (paymentData) => {
    const orderId = paymentData.order_id || paymentData.razorpay_order_id;
    const paymentId = paymentData.payment_id || paymentData.razorpay_payment_id;
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
        razorpay_signature: signature
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
};