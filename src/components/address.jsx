import React, { useState } from "react";
import { addressService } from "../api/address";
import { toast } from "react-toastify";
import "./address.css";

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
  const [errors, setErrors] = useState({});

  // ⚠️ ADD: Validation function
  const validateForm = () => {
    const newErrors = {};
    
    if (!form.address.trim()) {
      newErrors.address = "Address is required";
    } else if (form.address.length < 10) {
      newErrors.address = "Address must be at least 10 characters";
    }
    
    if (!form.city.trim()) {
      newErrors.city = "City is required";
    }
    
    if (!form.state.trim()) {
      newErrors.state = "State is required";
    }
    
    if (!form.pincode) {
      newErrors.pincode = "Pincode is required";
    } else if (!/^\d{6}$/.test(form.pincode)) {
      newErrors.pincode = "Pincode must be 6 digits";
    }
    
    if (form.phone && !/^\d{10}$/.test(form.phone)) {
      newErrors.phone = "Phone number must be 10 digits";
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // ⚠️ FIX: Validate before submission
    if (!validateForm()) {
      toast.error("Please fix the errors in the form");
      return;
    }

    setLoading(true);
    try {
      const res = await addressService.addAddress(form);
      toast.success("Address added successfully");
      onAdd(res.data.address || res.data);
      onClose();
    } catch (err) {
      console.error("Add address error:", err);
      toast.error(err.response?.data?.message || err.response?.data?.error || "Failed to add address");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="address-modal-overlay" onClick={(e) => {
      if (e.target === e.currentTarget) onClose();
    }}>
      <div className="address-modal">
        <button className="modal-close-btn" onClick={onClose}>×</button>
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
            className={errors.address ? "error" : ""}
          />
          {errors.address && <small className="error-text">{errors.address}</small>}
          
          <input
            type="text"
            placeholder="City *"
            value={form.city}
            onChange={(e) => setForm({ ...form, city: e.target.value })}
            className={errors.city ? "error" : ""}
          />
          {errors.city && <small className="error-text">{errors.city}</small>}
          
          <input
            type="text"
            placeholder="State *"
            value={form.state}
            onChange={(e) => setForm({ ...form, state: e.target.value })}
            className={errors.state ? "error" : ""}
          />
          {errors.state && <small className="error-text">{errors.state}</small>}
          
          <input
            type="text"
            placeholder="Pincode * (6 digits)"
            value={form.pincode}
            onChange={(e) => setForm({ ...form, pincode: e.target.value.replace(/\D/g, '').slice(0, 6) })}
            className={errors.pincode ? "error" : ""}
            maxLength={6}
          />
          {errors.pincode && <small className="error-text">{errors.pincode}</small>}
          
          <input
            type="tel"
            placeholder="Phone (10 digits)"
            value={form.phone}
            onChange={(e) => setForm({ ...form, phone: e.target.value.replace(/\D/g, '').slice(0, 10) })}
            className={errors.phone ? "error" : ""}
            maxLength={10}
          />
          {errors.phone && <small className="error-text">{errors.phone}</small>}
          
          <label className="checkbox-label">
            <input
              type="checkbox"
              checked={form.is_default}
              onChange={(e) => setForm({ ...form, is_default: e.target.checked })}
            />
            Set as default address
          </label>
          
          <div className="modal-buttons">
            <button type="button" onClick={onClose} className="cancel-btn">Cancel</button>
            <button type="submit" disabled={loading} className="save-btn">
              {loading ? "Saving..." : "Save Address"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddressModal;