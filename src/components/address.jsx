import React, { useState } from "react";
import { addressService } from "../api/address";
import { toast } from "react-toastify";
import "./AddressModal.css";

const AddressModal = ({ onClose, onAdd, user }) => {
  const [form, setForm] = useState({
    name: user?.name || "",
    address: "",
    city: "",
    state: "",
    pincode: "",
    phone: user?.phone || "",
    is_default: false
  });

  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!form.address || !form.city || !form.state || !form.pincode) {
      toast.error("Please fill all required fields");
      return;
    }

    setLoading(true);
    try {
      const res = await addressService.addAddress(form);
      toast.success("Address added successfully");
      onAdd(res.data.address);
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.error || "Failed to add address");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="address-modal-overlay">
      <div className="address-modal">
        <h2>Add New Address</h2>
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            placeholder="Full Name"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
          />
          <textarea
            placeholder="Address *"
            value={form.address}
            onChange={(e) => setForm({ ...form, address: e.target.value })}
            required
          />
          <input
            type="text"
            placeholder="City *"
            value={form.city}
            onChange={(e) => setForm({ ...form, city: e.target.value })}
            required
          />
          <input
            type="text"
            placeholder="State *"
            value={form.state}
            onChange={(e) => setForm({ ...form, state: e.target.value })}
            required
          />
          <input
            type="text"
            placeholder="Pincode *"
            value={form.pincode}
            onChange={(e) => setForm({ ...form, pincode: e.target.value })}
            required
          />
          <input
            type="tel"
            placeholder="Phone"
            value={form.phone}
            onChange={(e) => setForm({ ...form, phone: e.target.value })}
          />
          <label>
            <input
              type="checkbox"
              checked={form.is_default}
              onChange={(e) => setForm({ ...form, is_default: e.target.checked })}
            />
            Set as default address
          </label>
          
          <div className="modal-buttons">
            <button type="button" onClick={onClose}>Cancel</button>
            <button type="submit" disabled={loading}>
              {loading ? "Saving..." : "Save Address"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddressModal;