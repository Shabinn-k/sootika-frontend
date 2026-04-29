import React, { useContext, useEffect, useState } from "react";
import "./Payment.css";
import { CartContext } from "../../context/CartContext";
import { useAuth } from "../../Authentication/AuthContext";
import { useLocation, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { api } from "../../api/Axios";
import { FaHome, FaCreditCard, FaGooglePay } from "react-icons/fa";

const Payment = () => {
  const navigate = useNavigate();
  const { state } = useLocation();
  const { cartItems, clearCart } = useContext(CartContext);
  const { user, setUser } = useAuth();

  /* =====================
     ITEMS
  ===================== */
  const items = state?.product
    ? [{ ...state.product, quantity: state.quant || 1 }]
    : cartItems;

  /* =====================
     STATES
  ===================== */
  const [addresses, setAddresses] = useState([]);
  const [selectedAddress, setSelectedAddress] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState("");
  const [loading, setLoading] = useState(false);

  const [addressForm, setAddressForm] = useState({
    address: "",
    city: "",
    state: "",
    pincode: "",
    isDefault: false
  });

  /* =====================
     LOAD ADDRESSES
  ===================== */
  useEffect(() => {
    if (!user) return;
    const list = user.addresses || [];
    setAddresses(list);
    setSelectedAddress(list.find(a => a.isDefault) || list[0] || null);
  }, [user]);

  /* =====================
     TOTALS
  ===================== */
  const subTotal = items.reduce((a, i) => a + i.price * i.quantity, 0);
  const shipping = 80;
  const codFee = paymentMethod === "cod" ? 20 : 0;
  const total = subTotal + shipping + codFee;

  /* =====================
     SAVE USER
  ===================== */
  const saveUser = async (data) => {
    await api.patch(`/users/${user.id}`, data);
    const updated = { ...user, ...data };
    setUser(updated);
    localStorage.setItem("user", JSON.stringify(updated));
  };

  /* =====================
     ADD ADDRESS
  ===================== */
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

  /* =====================
     SET DEFAULT ADDRESS
  ===================== */
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

  /* =====================
     COMPLETE PAYMENT
  ===================== */
  const handlePayment = async () => {
    if (!paymentMethod) return toast.error("Select payment method");
    if (!selectedAddress) return toast.error("Select delivery address");

    setLoading(true);

    setTimeout(async () => {
      const newOrder = {
        orderId: Math.floor(100 + Math.random() * 900),
        date: new Date().toLocaleDateString(),
        items,
        total,
        paymentMethod,
        track: "Pending",
        shippingAddress: selectedAddress
      };

      try {
        await saveUser({ orders: [...(user.orders || []), newOrder] });
        if (!state?.product) clearCart();
        toast.success("Order placed successfully");
        navigate("/myOrders");
      } catch {
        toast.error("Order failed");
        setLoading(false);
      }
    }, 800);
  };

  return (
    <div className="payment-page">
      <div className="payment-box">

        {/* LEFT */}
        <div className="left-column">
          <h2><FaHome /> Delivery Address</h2>

          {addresses.map(addr => (
            <div
              key={addr.id}
              className={`address-card ${selectedAddress?.id === addr.id ? "selected" : ""}`}
              onClick={() => setSelectedAddress(addr)}
            >
              <h4>
                {user.name}
                {addr.isDefault && <span className="default-badge">Default</span>}
              </h4>

              <p className="address-text">
                {addr.address}, {addr.city}, {addr.state} - {addr.pincode}
              </p>

              <p className="address-phone">📞 {user.phone}</p>

              {!addr.isDefault && (
                <button
                  className="set-default-btn"
                  onClick={(e) => {
                    e.stopPropagation();
                    setDefault(addr.id);
                  }}
                >
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
              <textarea
                placeholder="Address"
                onChange={e => setAddressForm({ ...addressForm, address: e.target.value })}
              />
              <input
                placeholder="City"
                onChange={e => setAddressForm({ ...addressForm, city: e.target.value })}
              />
              <input
                placeholder="State"
                onChange={e => setAddressForm({ ...addressForm, state: e.target.value })}
              />
              <input
                placeholder="Pincode"
                onChange={e => setAddressForm({ ...addressForm, pincode: e.target.value })}
              />
              <label>
                <input
                  type="checkbox"
                  onChange={e => setAddressForm({ ...addressForm, isDefault: e.target.checked })}
                /> Set as default
              </label>
              <button onClick={addAddress}>Save Address</button>
            </div>
          )}

          <h2>Order Summary</h2>
          {items.map(item => (
            <div key={item.id} className="summary-item">
              <img src={item.image} alt={item.title} />
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
            {codFee > 0 && <p>COD: ₹{codFee}</p>}
            <h3>Total: ₹{total}</h3>
          </div>
        </div>

        {/* RIGHT */}
        <div className="right-column">
          <h2>Select Payment</h2>

          <div className="payment-options">
            <div
              className={paymentMethod === "upi" ? "active" : ""}
              onClick={() => setPaymentMethod("upi")}
            >
              <FaGooglePay /> UPI
            </div>
            <div
              className={paymentMethod === "card" ? "active" : ""}
              onClick={() => setPaymentMethod("card")}
            >
              <FaCreditCard /> Card
            </div>
            <div  
              className={paymentMethod === "cod" ? "active" : ""}
              onClick={() => setPaymentMethod("cod")}
            >
              💵 COD
            </div>
          </div>

          {paymentMethod === "upi" && (
            <div className="payment-details">
              <input type="text" placeholder="example@upi" />
            </div>
          )}

          {paymentMethod === "card" && (
            <div className="payment-details">
              <input type="text" placeholder="Card Number" />
              <input type="text" placeholder="Card Holder Name" />
              <div className="card-row">
                <input type="text" placeholder="MM/YY" />
                <input type="password" placeholder="CVV" />
              </div>
            </div>
          )}

          <button className="pay-btn" disabled={loading} onClick={handlePayment}>
            {loading ? "Processing..." : `Pay ₹${total}`}
          </button>
        </div>

      </div>
    </div>
  );
};

export default Payment;
