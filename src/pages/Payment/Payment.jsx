import React, { useContext, useEffect, useState } from "react";
import "./Payment.css";
import { CartContext } from "../../context/CartContext";
import { useAuth } from "../../Authentication/AuthContext";
import { useLocation, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { api } from "../../api/Axios";
import { FaHome, FaCreditCard, FaGooglePay } from "react-icons/fa";

// Razorpay Payment Component
const RazorpayPayment = ({ amount, onSuccess, onFailure }) => {
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
    
    const isScriptLoaded = await loadRazorpayScript();
    if (!isScriptLoaded) {
      toast.error("Failed to load payment gateway");
      setLoading(false);
      return;
    }

    try {
      // Create order from backend
      const amountInPaise = amount * 100;
      const response = await api.post("/api/payment/create-order", {
        amount: amountInPaise,
        currency: "INR",
        receipt: `order_${Date.now()}`
      });

      const { order_id, amount: orderAmount, currency: orderCurrency } = response.data;

      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID || "rzp_test_YourKeyHere",
        amount: orderAmount,
        currency: orderCurrency,
        name: "Sootika",
        description: "Payment for your order",
        image: "/logo.png",
        order_id: order_id,
        handler: async (razorpayResponse) => {
          try {
            const verifyResponse = await api.post("/api/payment/verify", {
              order_id: razorpayResponse.razorpay_order_id,
              payment_id: razorpayResponse.razorpay_payment_id,
              signature: razorpayResponse.razorpay_signature
            });
            
            toast.success("Payment successful!");
            onSuccess({
              payment_id: razorpayResponse.razorpay_payment_id,
              order_id: razorpayResponse.razorpay_order_id
            });
          } catch (error) {
            toast.error("Payment verification failed");
            onFailure(error);
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
        width: "100%",
        padding: "14px",
        border: "none",
        borderRadius: "8px",
        color: "white",
        fontSize: "16px",
        cursor: loading ? "not-allowed" : "pointer",
        marginTop: "20px"
      }}
    >
      {loading ? "Processing..." : `Pay ₹${amount}`}
    </button>
  );
};

const Payment = () => {
  const navigate = useNavigate();
  const { state } = useLocation();
  const { cartItems, clearCart } = useContext(CartContext);
  const { user, setUser } = useAuth();

  const items = state?.product
    ? [{ ...state.product, quantity: state.quant || 1 }]
    : cartItems;

  const [addresses, setAddresses] = useState([]);
  const [selectedAddress, setSelectedAddress] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState("");
  const [loading, setLoading] = useState(false);
  const [showRazorpay, setShowRazorpay] = useState(false);

  const [addressForm, setAddressForm] = useState({
    address: "",
    city: "",
    state: "",
    pincode: "",
    isDefault: false
  });

  useEffect(() => {
    if (!user) return;
    const list = user.addresses || [];
    setAddresses(list);
    setSelectedAddress(list.find(a => a.isDefault) || list[0] || null);
  }, [user]);

  const subTotal = items.reduce((a, i) => a + i.price * i.quantity, 0);
  const shipping = 80;
  const total = subTotal + shipping;

  const saveUser = async (data) => {
    await api.patch(`/users/${user.id}`, data);
    const updated = { ...user, ...data };
    setUser(updated);
    localStorage.setItem("user", JSON.stringify(updated));
  };

  const addAddress = async () => {
    const required = ["address", "city", "state", "pincode"];
    if (required.some(f => !addressForm[f])) {
      toast.error("Fill all address fields");
      return;
    }

    const newAddress = {
      id: Date.now(),
      ...addressForm,
      isDefault: addresses.length === 0 || addressForm.isDefault
    };

    const updated = newAddress.isDefault
      ? addresses.map(a => ({ ...a, isDefault: false })).concat(newAddress)
      : [...addresses, newAddress];

    setAddresses(updated);
    setSelectedAddress(newAddress);
    await saveUser({ addresses: updated });

    toast.success("Address saved");
    setShowForm(false);
    setAddressForm({
      address: "",
      city: "",
      state: "",
      pincode: "",
      isDefault: false
    });
  };

  const setDefault = async (id) => {
    const updated = addresses.map(a => ({
      ...a,
      isDefault: a.id === id
    }));

    setAddresses(updated);
    setSelectedAddress(updated.find(a => a.id === id));
    await saveUser({ addresses: updated });
    toast.success("Default address updated");
  };

  const handlePaymentSuccess = async (paymentData) => {
    setLoading(true);
    
    const newOrder = {
      orderId: Math.floor(10000 + Math.random() * 90000),
      date: new Date().toLocaleDateString(),
      items,
      total,
      paymentMethod: "razorpay",
      paymentId: paymentData.payment_id,
      razorpayOrderId: paymentData.order_id,
      track: "Confirmed",
      shippingAddress: selectedAddress
    };

    try {
      await saveUser({ orders: [...(user.orders || []), newOrder] });
      if (!state?.product) clearCart();
      toast.success("Order placed successfully!");
      navigate("/myOrders");
    } catch {
      toast.error("Failed to save order");
    } finally {
      setLoading(false);
    }
  };

  const handlePaymentFailure = (error) => {
    console.error("Payment failed:", error);
    toast.error("Payment failed. Please try again.");
    setShowRazorpay(false);
  };

  const handleProceedToPayment = () => {
    if (!paymentMethod) {
      toast.error("Select payment method");
      return;
    }
    if (!selectedAddress) {
      toast.error("Select delivery address");
      return;
    }
    
    if (paymentMethod === "cod") {
      handleCODOrder();
    } else {
      setShowRazorpay(true);
    }
  };

  const handleCODOrder = async () => {
    setLoading(true);
    
    const newOrder = {
      orderId: Math.floor(10000 + Math.random() * 90000),
      date: new Date().toLocaleDateString(),
      items,
      total,
      paymentMethod: "cod",
      track: "Pending",
      shippingAddress: selectedAddress
    };

    try {
      await saveUser({ orders: [...(user.orders || []), newOrder] });
      if (!state?.product) clearCart();
      toast.success("Order placed successfully! Cash on delivery");
      navigate("/myOrders");
    } catch {
      toast.error("Failed to place order");
    } finally {
      setLoading(false);
    }
  };

  if (showRazorpay) {
    return (
      <div className="payment-container" style={{ maxWidth: "500px", margin: "auto", padding: "40px", textAlign: "center" }}>
        <h2>Complete Payment</h2>
        <p>Amount: ₹{total}</p>
        <RazorpayPayment 
          amount={total}
          onSuccess={handlePaymentSuccess}
          onFailure={handlePaymentFailure}
        />
        <button 
          onClick={() => setShowRazorpay(false)}
          style={{ marginTop: "20px", background: "none", border: "none", color: "#c9a47a", cursor: "pointer" }}
        >
          ← Back
        </button>
      </div>
    );
  }

  return (
    <div className="payment-page">
      <div className="payment-box">

        {/* LEFT COLUMN */}
        <div className="left-column">
          <h2><FaHome /> Delivery Address</h2>

          {addresses.map(addr => (
            <div
              key={addr.id}
              className={`address-card ${selectedAddress?.id === addr.id ? "selected" : ""}`}
              onClick={() => setSelectedAddress(addr)}
            >
              <h4>
                {user?.name}
                {addr.isDefault && <span className="default-badge">Default</span>}
              </h4>
              <p className="address-text">
                {addr.address}, {addr.city}, {addr.state} - {addr.pincode}
              </p>
              <p className="address-phone">📞 {user?.phone}</p>
              {!addr.isDefault && (
                <button className="set-default-btn" onClick={(e) => { e.stopPropagation(); setDefault(addr.id); }}>
                  Set Default
                </button>
              )}
            </div>
          ))}

          <button className="add-address-btn" onClick={() => setShowForm(true)}>
            + Add New Address
          </button>

          {showForm && (
            <div className="address-form">
              <textarea placeholder="Address" onChange={e => setAddressForm({ ...addressForm, address: e.target.value })} />
              <input placeholder="City" onChange={e => setAddressForm({ ...addressForm, city: e.target.value })} />
              <input placeholder="State" onChange={e => setAddressForm({ ...addressForm, state: e.target.value })} />
              <input placeholder="Pincode" onChange={e => setAddressForm({ ...addressForm, pincode: e.target.value })} />
              <label>
                <input type="checkbox" onChange={e => setAddressForm({ ...addressForm, isDefault: e.target.checked })} />
                Set as default
              </label>
              <button onClick={addAddress}>Save Address</button>
            </div>
          )}

          <h2>Order Summary</h2>
          {items.map(item => (
            <div key={item.id} className="summary-item">
              <img src={item.main_image || item.image} alt={item.title} width="60" />
              <div>
                <h4>{item.title}</h4>
                <p>Qty: {item.quantity}</p>
              </div>
              <span>₹{item.price * item.quantity}</span>
            </div>
          ))}

          <div className="summary-total">
            <p>Subtotal: ₹{subTotal}</p>
            <p>Shipping: ₹{shipping}</p>
            <h3>Total: ₹{total}</h3>
          </div>
        </div>

        {/* RIGHT COLUMN */}
        <div className="right-column">
          <h2>Select Payment</h2>

          <div className="payment-options">
            <div className={paymentMethod === "razorpay" ? "active" : ""} onClick={() => setPaymentMethod("razorpay")}>
              <FaCreditCard /> Card / UPI / NetBanking
            </div>
            <div className={paymentMethod === "cod" ? "active" : ""} onClick={() => setPaymentMethod("cod")}>
              💵 Cash on Delivery
            </div>
          </div>

          <button className="pay-btn" disabled={loading} onClick={handleProceedToPayment}>
            {loading ? "Processing..." : `Proceed to Pay ₹${total}`}
          </button>
        </div>

      </div>
    </div>
  );
};

export default Payment;