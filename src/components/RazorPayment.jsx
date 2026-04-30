import React, { useState } from "react";
import { paymentService } from "../api/payment";
import { toast } from "react-toastify";

const RazorpayPayment = ({ amount, currency = "INR", receipt, onSuccess, onFailure }) => {
    const [loading, setLoading] = useState(false);

    const loadRazorpayScript = () => {
        return new Promise((resolve) => {
            const script = document.createElement("script");
            script.src = "https://checkout.razorpay.com/v1/checkout.js";
            script.onload = () => resolve(true);
            script.onerror = () => resolve(false);
            document.body.appendChild(script);
        });
    };

    const handlePayment = async () => {
        setLoading(true);

        // Load Razorpay script if not loaded
        const isScriptLoaded = await loadRazorpayScript();
        if (!isScriptLoaded) {
            toast.error("Failed to load payment gateway");
            setLoading(false);
            return;
        }

        try {
            // Create order from backend
            const amountInPaise = amount * 100; // Convert to paise
            const response = await paymentService.createOrder(amountInPaise, currency, receipt);
            
            const { order_id, amount: orderAmount, currency: orderCurrency } = response.data;
            
            const options = {
                key: import.meta.env.VITE_RAZORPAY_KEY_ID,
                amount: orderAmount,
                currency: orderCurrency,
                name: "Sootika",
                description: `Payment for ${receipt}`,
                image: "/logo.png",
                order_id: order_id,
                handler: async (razorpayResponse) => {
                    // Verify payment with backend
                    try {
                        const verifyResponse = await paymentService.verifyPayment(
                            razorpayResponse.razorpay_order_id,
                            razorpayResponse.razorpay_payment_id,
                            razorpayResponse.razorpay_signature
                        );
                        
                        toast.success("Payment successful!");
                        if (onSuccess) {
                            onSuccess(verifyResponse.data);
                        }
                    } catch (error) {
                        toast.error(error.response?.data?.error || "Payment verification failed");
                        if (onFailure) {
                            onFailure(error);
                        }
                    }
                },
                prefill: {
                    name: localStorage.getItem("userName") || "",
                    email: localStorage.getItem("userEmail") || "",
                },
                theme: {
                    color: "#c9a47a",
                },
                modal: {
                    ondismiss: () => {
                        toast.info("Payment cancelled");
                        setLoading(false);
                    },
                },
            };
            
            const razorpay = new window.Razorpay(options);
            razorpay.open();
            
        } catch (error) {
            console.error("Payment error:", error);
            toast.error(error.response?.data?.error || "Failed to initiate payment");
        } finally {
            setLoading(false);
        }
    };

    return (
        <button 
            onClick={handlePayment} 
            disabled={loading}
            className="pay-btn"
            style={{
                background: loading ? "#ccc" : "#c9a47a",
                padding: "12px 24px",
                border: "none",
                borderRadius: "8px",
                color: "white",
                fontSize: "16px",
                cursor: loading ? "not-allowed" : "pointer",
            }}
        >
            {loading ? "Processing..." : "Pay Now"}
        </button>
    );
};

export default RazorpayPayment;