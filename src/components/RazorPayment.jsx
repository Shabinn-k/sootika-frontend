import React, { useState, useEffect, useRef } from "react";
import { paymentService } from "../api/payment";
import { toast } from "react-toastify";

const RazorpayPayment = ({ amount, currency = "INR", receipt, onSuccess, onFailure, user }) => {
    const [loading, setLoading] = useState(false);
    const [scriptLoaded, setScriptLoaded] = useState(false);
    const razorpayRef = useRef(null);
 
    useEffect(() => {
        if (amount <= 0) {
            console.error("Invalid amount:", amount);
        }
    }, [amount]);
 
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
            if (razorpayRef.current) {
                razorpayRef.current = null;
            }
        };
    }, []);

    const handlePayment = async () => { 
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
            const uniqueReceipt = receipt || `order_${Date.now()}_${Math.random().toString(36).substr(2, 8)}`;
            const amountInPaise = Math.round(amount * 100);  
 
            const response = await paymentService.createOrder(amountInPaise, currency, uniqueReceipt);

            if (!response.data || !response.data.order_id) {
                throw new Error("Invalid response from server");
            }

            const { order_id, amount: orderAmount, currency: orderCurrency } = response.data;
 
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
                    console.log("Razorpay response:", razorpayResponse);

                    try { 
                        await initAuth();
 
                        const verifyPayload = {
                            razorpay_order_id: razorpayResponse.razorpay_order_id,
                            razorpay_payment_id: razorpayResponse.razorpay_payment_id,
                            razorpay_signature: razorpayResponse.razorpay_signature
                        };

                        console.log("Sending to backend:", verifyPayload);

                        const verifyResponse = await api.post("/payment/verify", verifyPayload);

                        console.log("Verification response:", verifyResponse.data);

                        if (verifyResponse.status === 200) {
                            toast.success("Payment successful!");
 
                            const orderData = {
                                items: items.map(item => ({
                                    product_id: item.product_id || item.id,
                                    quantity: item.quantity || 1
                                })),
                                address_id: selectedAddress.id,
                                payment_method: "razorpay",
                                payment_id: razorpayResponse.razorpay_payment_id,
                                razorpay_order_id: razorpayResponse.razorpay_order_id
                            };

                            const orderResponse = await api.post("/orders", orderData);
                            console.log("Order created:", orderResponse.data);

                            if (clearCart) {
                                await clearCart();
                            }

                            toast.success("Order placed successfully!");
                            setTimeout(() => {
                                navigate("/myOrders", { replace: true });
                            }, 500);
                        }
                    } catch (error) {
                        console.error("Verification error:", error);
                        console.log("Error response:", error.response?.data);
                        toast.error(error.response?.data?.message || error.response?.data?.error || "Payment verification failed");
                        setProcessingPayment(false);
                    }
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