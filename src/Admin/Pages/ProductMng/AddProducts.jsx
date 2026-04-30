import React, { useState, useEffect } from "react";
import { api, initAuth } from "../../../api/Axios";
import { useNavigate } from "react-router-dom";
import Layout from "../../Components/Layout";
import { useAuth } from "../../../Authentication/AuthContext";
import { toast } from "react-toastify";
import "./AddProducts.css";

const AddProduct = () => {
  const navigate = useNavigate();
  const { admin, loading: authLoading } = useAuth();
  const [loading, setLoading] = useState(false);

  const [title, setTitle] = useState("");
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [stockQuantity, setStockQuantity] = useState(10);

  const [mainImage, setMainImage] = useState(null);
  const [secondImage, setSecondImage] = useState(null);
  const [thirdImage, setThirdImage] = useState(null);

  const [mainPreview, setMainPreview] = useState(null);
  const [secondPreview, setSecondPreview] = useState(null);
  const [thirdPreview, setThirdPreview] = useState(null);

  // ⚠️ FIX: Check admin access
  useEffect(() => {
    if (!authLoading && !admin) {
      toast.error("Access denied. Admin only.");
      navigate("/");
    }
  }, [admin, authLoading, navigate]);

  // ⚠️ FIX: Cleanup image previews on unmount
  useEffect(() => {
    return () => {
      if (mainPreview) URL.revokeObjectURL(mainPreview);
      if (secondPreview) URL.revokeObjectURL(secondPreview);
      if (thirdPreview) URL.revokeObjectURL(thirdPreview);
    };
  }, [mainPreview, secondPreview, thirdPreview]);

  // ⚠️ FIX: Validate image file
  const validateImage = (file) => {
    const allowedTypes = ["image/jpeg", "image/png", "image/webp", "image/jpg"];
    const maxSize = 2 * 1024 * 1024; // 2MB

    if (!allowedTypes.includes(file.type)) {
      toast.error("Only JPEG, PNG, and WEBP images are allowed");
      return false;
    }
    if (file.size > maxSize) {
      toast.error("Image size must be less than 2MB");
      return false;
    }
    return true;
  };

  const handleImageChange = (e, setImage, setPreview, currentPreview) => {
    const file = e.target.files[0];
    if (!file) return;
    
    if (!validateImage(file)) {
      e.target.value = "";
      return;
    }
    
    // Cleanup old preview
    if (currentPreview) {
      URL.revokeObjectURL(currentPreview);
    }
    
    setImage(file);
    setPreview(URL.createObjectURL(file));
  };

  const addProduct = async () => {
    // ⚠️ FIX: Check admin again before action
    if (!admin) {
      toast.error("Access denied. Admin only.");
      return;
    }

    if (!title || !name || !mainImage || !price || Number(price) <= 0) {
      toast.error("Please fill all required fields (Title, Name, Price, Main Image)");
      return;
    }

    try {
      setLoading(true);
      await initAuth(); // ⚠️ FIX: Wait for auth

      const formData = new FormData();
      formData.append("title", title);
      formData.append("name", name);
      formData.append("description", description);
      formData.append("price", price);
      formData.append("stock", stockQuantity);
      formData.append("main_image", mainImage);
      if (secondImage) formData.append("second_image", secondImage);
      if (thirdImage) formData.append("third_image", thirdImage);

      await api.post("/admin/products", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      toast.success("Product added successfully");
      navigate("/admin/products");
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.error || "Failed to add product");
    } finally {
      setLoading(false);
    }
  };

  // ⚠️ FIX: Show loading state
  if (authLoading) {
    return (
      <Layout>
        <div className="add-product">
          <div className="loading-spinner">Verifying access...</div>
        </div>
      </Layout>
    );
  }

  if (!admin) return null;

  return (
    <Layout>
      <div className="add-product">
        <h2>Add Product</h2>

        <div className="form-group">
          <label>Product Title *</label>
          <input value={title}
            onChange={(e) => setTitle(e.target.value)} 
            placeholder="e.g. Beautiful Saree"
            maxLength={100}
          />
        </div>

        <div className="form-group">
          <label>Product Name *</label>
          <input value={name}
            onChange={(e) => setName(e.target.value)} 
            placeholder="e.g. Silk Saree"
            maxLength={100}
          />
        </div>

        <div className="form-group">
          <label>Description</label>
          <textarea rows="3" value={description}
            onChange={(e) => setDescription(e.target.value)} 
            placeholder="Product details..."
            maxLength={1000}
          />
        </div>

        <div className="form-group">
          <label>Price *</label>
          <input type="number" value={price}
            onChange={(e) => setPrice(e.target.value)} 
            placeholder="e.g. 500"
            min="1"
            step="1"
          />
        </div>

        <div className="form-group">
          <label>Stock Quantity</label>
          <input type="number" value={stockQuantity}
            onChange={(e) => setStockQuantity(Number(e.target.value))}
            placeholder="e.g. 10" 
            min="0"
          />
        </div>

        <div className="form-group">
          <label>Main Image * (JPEG, PNG, WEBP, max 2MB)</label>
          <input type="file" accept="image/jpeg,image/png,image/webp"
            onChange={(e) => handleImageChange(e, setMainImage, setMainPreview, mainPreview)}
          />
          {mainPreview && <img src={mainPreview} alt="Main Preview" className="image-preview" />}
        </div>

        <div className="form-group">
          <label>Second Image (Optional)</label>
          <input type="file" accept="image/jpeg,image/png,image/webp"
            onChange={(e) => handleImageChange(e, setSecondImage, setSecondPreview, secondPreview)}
          />
          {secondPreview && <img src={secondPreview} alt="Second Preview" className="image-preview" />}
        </div>

        <div className="form-group">
          <label>Third Image (Optional)</label>
          <input type="file" accept="image/jpeg,image/png,image/webp"
            onChange={(e) => handleImageChange(e, setThirdImage, setThirdPreview, thirdPreview)} 
          />
          {thirdPreview && <img src={thirdPreview} alt="Third Preview" className="image-preview" />}
        </div>

        <div className="form-actions">
          <button type="button" className="save-btn"
            disabled={loading} onClick={addProduct}>
            {loading ? "Uploading..." : "Save Product"}
          </button>

          <button type="button" className="cancel-btn"
            onClick={() => navigate("/admin/products")}>
            Cancel
          </button>
        </div>
      </div>
    </Layout>
  );
};

export default AddProduct;