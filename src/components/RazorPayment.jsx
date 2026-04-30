import React, { useState, useEffect, useRef } from "react";
import { paymentService } from "../api/payment";
import { toast } from "react-toastify";

const RazorpayPayment = ({ amount, currency = "INR", receipt, onSuccess, onFailure, user }) => {
    const [loading, setLoading] = useState(false);
    const [scriptLoaded, setScriptLoaded] = useState(false);
    const razorpayRef = useRef(null);

    // ⚠️ FIX: Validate amount
    useEffect(() => {
        if (amount <= 0) {
            console.error("Invalid amount:", amount);
        }
    }, [amount]);

    // ⚠️ FIX: Load Razorpay script once
    useEffect(() => {
        if (document.getElementById("razorpay-script")) {
            setScriptLoaded(true);
            return;
        }

        const script = document.createElement("script");
        script.id = "razorpay-script";
        script.src = "https://checkout.razorpay.com/v1/checkout.js";
        script.onload = () => {
            setScriptLoaded(true);
            console.log("Razorpay script loaded");
        };
        script.onerror = () => {
            console.error("Failed to load Razorpay script");
            toast.error("Failed to load payment gateway");
        };
        document.body.appendChild(script);

        return () => {
            // Cleanup
            if (razorpayRef.current) {
                razorpayRef.current = null;
            }
        };
    }, []);

    const handlePayment = async () => {
        // ⚠️ FIX: Add validations
        if (amount <= 0) {
            toast.error("Invalid payment amount");
            return;
        }

        if (!scriptLoaded) {
            toast.error("Payment gateway not loaded yet. Please try again.");
            return;
        }

        setLoading(true);

        try {
            // ⚠️ FIX: Create unique receipt if not provided
            const uniqueReceipt = receipt || `order_${Date.now()}_${Math.random().toString(36).substr(2, 8)}`;
            const amountInPaise = Math.round(amount * 100); // Convert to paise, ensure integer
            
            // Create order from backend
            const response = await paymentService.createOrder(amountInPaise, currency, uniqueReceipt);
            
            if (!response.data || !response.data.order_id) {
                throw new Error("Invalid response from server");
            }
            
            const { order_id, amount: orderAmount, currency: orderCurrency } = response.data;
            
            // ⚠️ FIX: Get user details from props or localStorage
            const userName = user?.name || localStorage.getItem("userName") || "";
            const userEmail = user?.email || localStorage.getItem("userEmail") || "";
            const userPhone = user?.phone || localStorage.getItem("userPhone") || "";
            
            const options = {
                key: import.meta.env.VITE_RAZORPAY_KEY_ID,
                amount: orderAmount,
                currency: orderCurrency,
                name: "Sootika",
                description: `Payment for ${uniqueReceipt}`,
                image: "/logo.png",
                order_id: order_id,
                handler: async (razorpayResponse) => {
                    // ⚠️ FIX: Verify payment with backend
                    try {
                        const verifyResponse = await paymentService.verifyPayment({
                            order_id: razorpayResponse.razorpay_order_id,
                            payment_id: razorpayResponse.razorpay_payment_id,
                            signature: razorpayResponse.razorpay_signature
                        });
                        
                        if (verifyResponse.success) {
                            toast.success("Payment successful!");
                            if (onSuccess) {
                                onSuccess({
                                    ...verifyResponse.data,
                                    paymentId: razorpayResponse.razorpay_payment_id,
                                    orderId: razorpayResponse.razorpay_order_id
                                });
                            }
                        } else {
                            throw new Error(verifyResponse.error || "Verification failed");
                        }
                    } catch (error) {
                        console.error("Verification error:", error);
                        toast.error(error.response?.data?.error || error.message || "Payment verification failed");
                        if (onFailure) {
                            onFailure(error);
                        }
                    }
                    setLoading(false);
                },
                prefill: {
                    name: userName,
                    email: userEmail,
                    contact: userPhone,
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
            
            razorpayRef.current = new window.Razorpay(options);
            
            // ⚠️ FIX: Handle Razorpay errors
            razorpayRef.current.on('payment.failed', (response) => {
                console.error("Payment failed:", response.error);
                toast.error(response.error?.description || "Payment failed");
                setLoading(false);
                if (onFailure) {
                    onFailure(response.error);
                }
            });
            
            razorpayRef.current.open();
            
        } catch (error) {
            console.error("Payment error:", error);
            toast.error(error.response?.data?.error || error.message || "Failed to initiate payment");
            setLoading(false);
            if (onFailure) {
                onFailure(error);
            }
        }
    };

    return (
        <button 
            onClick={handlePayment} 
            disabled={loading || !scriptLoaded || amount <= 0}
            className="pay-btn"
            style={{
                background: (loading || !scriptLoaded || amount <= 0) ? "#ccc" : "#c9a47a",
                padding: "12px 24px",
                border: "none",
                borderRadius: "8px",
                color: "white",
                fontSize: "16px",
                fontWeight: "600",
                cursor: (loading || !scriptLoaded || amount <= 0) ? "not-allowed" : "pointer",
                transition: "all 0.3s ease",
            }}
        >
            {loading ? "Processing..." : !scriptLoaded ? "Loading..." : amount <= 0 ? "Invalid Amount" : "Pay Now"}
        </button>
    );
};

export default RazorpayPayment;