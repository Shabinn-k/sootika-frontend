import { api } from "./Axios";

export const paymentService = {
    // Create Razorpay order
    createOrder: (amount, currency, receipt) => 
        api.post("/api/payment/create-order", { amount, currency, receipt }),
    
    // Verify payment
    verifyPayment: (orderId, paymentId, signature) => 
        api.post("/api/payment/verify", { 
            order_id: orderId, 
            payment_id: paymentId, 
            signature 
        }),
};