// src/pages/Payment/Payment.jsx - FIXED
import React, { useContext, useEffect, useState } from "react";
import "./Payment.css";
import { CartContext } from "../../context/CartContext";
import { useAuth } from "../../Authentication/AuthContext";
import { useLocation, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { api, initAuth } from "../../api/Axios";
import { FaHome, FaCreditCard } from "react-icons/fa";
import { paymentService } from "../../api/payment";

const Payment = () => {
  const navigate = useNavigate();
  const { state } = useLocation();
  const { cartItems, clearCart, loading: cartLoading } = useContext(CartContext);
  const { user, loading: authLoading } = useAuth();

  const items = state?.product
    ? [{ ...state.product, quantity: state.quant || 1 }]
    : (cartItems && cartItems.length > 0 ? cartItems : []);

  const [addresses, setAddresses] = useState([]);
  const [selectedAddress, setSelectedAddress] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState("");
  const [loading, setLoading] = useState(false);
  const [addressLoading, setAddressLoading] = useState(true);
  const [processingPayment, setProcessingPayment] = useState(false);

  const [addressForm, setAddressForm] = useState({
    name: user?.name || "",
    address: "",
    city: "",
    state: "",
    pincode: "",
    phone: user?.phone || user?.number || "",
    is_default: false
  });

  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/");
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (!authLoading && !cartLoading && items.length === 0) {
      toast.error("No items to checkout");
      navigate("/cart");
    }
  }, [items, authLoading, cartLoading, navigate]);

  useEffect(() => {
    if (user) {
      setAddressForm(prev => ({
        ...prev,
        name: user.name || prev.name,
        phone: user.phone || user.number || prev.phone
      }));
    }
  }, [user]);

  const fetchAddresses = async () => {
    try {
      setAddressLoading(true);
      await initAuth();
      const response = await api.get("/addresses");
      const data = response.data?.addresses || response.data?.data || [];
      setAddresses(data);
      const defaultAddr = data.find(a => a.is_default);
      if (defaultAddr) setSelectedAddress(defaultAddr);
      else if (data.length > 0) setSelectedAddress(data[0]);
    } catch (error) {
      console.error("Failed to fetch addresses:", error);
      if (error.response?.status === 401) {
        toast.error("Please login again");
        navigate("/login");
      }
    } finally {
      setAddressLoading(false);
    }
  };

  useEffect(() => {
    if (user && !authLoading) {
      fetchAddresses();
    }
  }, [user, authLoading]);

  const subTotal = items.reduce(
    (a, i) => a + (Number(i.price) * (i.quantity || 1)),
    0
  );
  const shipping = 80;
  const total = subTotal + shipping;

  const addAddress = async () => {
    const required = ["address", "city", "state", "pincode"];
    if (required.some(f => !addressForm[f])) {
      toast.error("Fill all address fields");
      return;
    }

    if (addressForm.pincode && !/^\d{6}$/.test(addressForm.pincode)) {
      toast.error("Pincode must be 6 digits");
      return;
    }

    setLoading(true);
    try {
      await initAuth();
      await api.post("/addresses", addressForm);
      toast.success("Address saved");
      setShowForm(false);
      setAddressForm({
        name: user?.name || "",
        address: "",
        city: "",
        state: "",
        pincode: "",
        phone: user?.phone || user?.number || "",
        is_default: false
      });
      fetchAddresses();
    } catch (error) {
      toast.error(error.response?.data?.error || "Failed to add address");
    } finally {
      setLoading(false);
    }
  };

  const setDefault = async (id) => {
    try {
      await initAuth();
      await api.put(`/addresses/${id}`, { is_default: true });
      toast.success("Default address updated");
      fetchAddresses();
    } catch {
      toast.error("Failed to update default address");
    }
  };
  const createOrder = async (paymentData = null) => {
    if (!selectedAddress) {
      throw new Error("Please select a delivery address");
    }

    if (!items || items.length === 0) {
      throw new Error("No items in cart");
    }

    const orderData = {
      items: items.map(item => ({
        product_id: item.product_id || item.id,
        quantity: item.quantity || 1
      })),
      address_id: selectedAddress.id,
      payment_method: paymentMethod === "razorpay" ? "razorpay" : "cod"
    };

    if (paymentData) {
      orderData.payment_id = paymentData.payment_id;
      orderData.razorpay_order_id = paymentData.razorpay_order_id;
      orderData.razorpay_signature = paymentData.razorpay_signature;
    }

    const response = await api.post("/orders", orderData);
    return response.data;
  };

  const handlePaymentSuccess = async (paymentData) => {
    setProcessingPayment(true);
    try {
      const orderResult = await createOrder(paymentData?.payment_id, paymentData?.order_id);
      console.log("Order created:", orderResult);

      toast.success("Order placed successfully!");

      if (clearCart) {
        await clearCart();
      }

      setTimeout(() => {
        navigate("/myOrders", { replace: true });
      }, 500);

    } catch (error) {
      console.error("Order creation error:", error);
      toast.error(error.response?.data?.message || error.message || "Payment successful but order creation failed");
      setProcessingPayment(false);
    }
  };

  const handleCODOrder = async () => {
    if (!selectedAddress) {
      toast.error("Select delivery address");
      return;
    }
    setProcessingPayment(true);
    try {
      await createOrder();
      toast.success("Order placed successfully! Cash on delivery");
      if (clearCart) await clearCart();
      navigate("/myOrders", { replace: true });
    } catch (error) {
      console.error("COD order error:", error);
      toast.error(error.response?.data?.error || error.message || "Failed to place order");
      setProcessingPayment(false);
    }
  };

  const handleProceedToPayment = () => {
    if (processingPayment) return;

    if (!paymentMethod) {
      toast.error("Select payment method");
      return;
    }
    if (!selectedAddress) {
      toast.error("Select delivery address");
      return;
    }
    if (!items || items.length === 0) {
      toast.error("No items to checkout");
      navigate("/cart");
      return;
    }

    if (paymentMethod === "cod") {
      handleCODOrder();
    } else {
      handleRazorpayPayment();
    }
  };

  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      if (document.getElementById("razorpay-script")) {
        resolve(true);
        return;
      }
      const script = document.createElement("script");
      script.id = "razorpay-script";
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const handleRazorpayPayment = async () => {
    setProcessingPayment(true);

    const token = localStorage.getItem("token");
    if (!token) {
      toast.error("Please login again to complete payment");
      navigate("/login");
      return;
    }

    try {
      const scriptLoaded = await loadRazorpayScript();
      if (!scriptLoaded) {
        toast.error("Payment gateway failed to load");
        setProcessingPayment(false);
        return;
      }

      await initAuth();

      const amountInPaise = Math.round(total * 100);
      const response = await api.post("/payment/create-order", {
        amount: amountInPaise,
        currency: "INR",
        receipt: `order_${Date.now()}`
      });

      console.log("Create order response:", response.data);

      const { order_id, amount: orderAmount, currency: orderCurrency } = response.data;

      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID,
        amount: orderAmount,
        currency: orderCurrency,
        name: "Sootika",
        description: "Payment for your order",
        order_id: order_id,
        handler: async (razorpayResponse) => {
          console.log("Razorpay response:", razorpayResponse);

          try {
            await initAuth();

            const orderData = {
              items: items.map(item => ({
                product_id: item.product_id || item.id,
                quantity: item.quantity || 1,
                price: item.price
              })),
              address_id: selectedAddress.id,
              payment_method: "razorpay",
              payment_id: razorpayResponse.razorpay_payment_id,
              razorpay_order_id: razorpayResponse.razorpay_order_id,
              razorpay_signature: razorpayResponse.razorpay_signature
            };

            console.log("Creating order with data:", orderData);

            const orderResponse = await api.post("/orders", orderData);

            console.log("Order created response:", orderResponse.data);

            if (orderResponse.status === 200 || orderResponse.status === 201) {
              toast.success("Payment successful! Order placed successfully.");

              if (clearCart) {
                await clearCart();
              }

              setTimeout(() => {
                navigate("/myOrders", { replace: true });
              }, 500);
            } else {
              throw new Error(orderResponse.data?.message || "Order creation failed");
            }
          } catch (error) {
            console.error("Payment/Order error:", error);
            console.log("Error response data:", error.response?.data);
            toast.error(error.response?.data?.message || error.response?.data?.error || "Payment verification failed");
            setProcessingPayment(false);
          }
        },
        theme: { color: "#c9a47a" },
        modal: {
          ondismiss: () => {
            toast.info("Payment cancelled");
            setProcessingPayment(false);
          }
        }
      };

      const razorpay = new window.Razorpay(options);
      razorpay.open();
    } catch (error) {
      console.error("Payment error:", error);
      toast.error(error.response?.data?.message || "Failed to initiate payment");
      setProcessingPayment(false);
    }
  };

  if (authLoading || cartLoading) {
    return <div className="payment-page"><div className="loading-spinner">Loading...</div></div>;
  }

  if (!user) return null;

  if (items.length === 0) {
    return (
      <div className="payment-page">
        <div className="empty-msg-container">
          <h2>No items to checkout</h2>
          <button className="home-btn" onClick={() => navigate("/cart")}>Go to Cart</button>
        </div>
      </div>
    );
  }

  return (
    <div className="payment-page">
      <div className="payment-box">
        <div className="left-column">
          <h2><FaHome /> Delivery Address</h2>

          {addressLoading ? (
            <div className="loading-spinner">Loading addresses...</div>
          ) : addresses.length === 0 ? (
            <p>No addresses saved. Please add an address.</p>
          ) : (
            addresses.map(addr => (
              <div key={addr.id} className={`address-card ${selectedAddress?.id === addr.id ? "selected" : ""}`} onClick={() => setSelectedAddress(addr)}>
                <h4>{addr.name || user?.name} {addr.is_default && <span className="default-badge">Default</span>}</h4>
                <p>{addr.address}, {addr.city}, {addr.state} - {addr.pincode}</p>
                <p>📞 {addr.phone || user?.phone || user?.number}</p>
                {!addr.is_default && <button className="set-default-btn" onClick={(e) => { e.stopPropagation(); setDefault(addr.id); }}>Set Default</button>}
              </div>
            ))
          )}

          <button className="add-address-btn" onClick={() => setShowForm(true)}>+ Add New Address</button>

          {showForm && (
            <div className="address-form">
              <input
                placeholder="Full Name"
                value={addressForm.name}
                onChange={e => setAddressForm({ ...addressForm, name: e.target.value })}
              />
              <textarea
                placeholder="Address *"
                value={addressForm.address}
                onChange={e => setAddressForm({ ...addressForm, address: e.target.value })}
              />
              <input
                placeholder="City *"
                onChange={e => setAddressForm({ ...addressForm, city: e.target.value })}
              />
              <input
                placeholder="State *"
                onChange={e => setAddressForm({ ...addressForm, state: e.target.value })}
              />
              <input
                placeholder="Pincode *"
                value={addressForm.pincode}
                onChange={e => setAddressForm({ ...addressForm, pincode: e.target.value })}
                maxLength={6}
              />
              <input
                placeholder="Phone"
                value={addressForm.phone}
                onChange={e => setAddressForm({ ...addressForm, phone: e.target.value })}
                maxLength={10}
              />
              <label>
                <input type="checkbox" onChange={e => setAddressForm({ ...addressForm, is_default: e.target.checked })} />
                Set as default
              </label>
              <button onClick={addAddress} disabled={loading}>Save Address</button>
              <button onClick={() => setShowForm(false)}>Cancel</button>
            </div>
          )}

          <h2>Order Summary</h2>
          {items.map(item => (
            <div key={item.product_id || item.id} className="summary-item">
              <img src={item.main_image || item.image} alt={item.title} width="60" />
              <div><h4>{item.title}</h4><p>Qty: {item.quantity}</p><p>₹{item.price}</p></div>
              <span>₹{(item.price * (item.quantity || 1))}</span>
            </div>
          ))}
          <div className="summary-total"><p>Subtotal: ₹{subTotal}</p><p>Shipping: ₹{shipping}</p><h3>Total: ₹{total}</h3></div>
        </div>

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
          <button
            className="pay-btn"
            disabled={processingPayment}
            onClick={handleProceedToPayment}
          >
            {processingPayment ? "Processing..." : `Proceed to Pay ₹${total}`}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Payment;