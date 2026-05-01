import React, { useEffect, useState } from "react";
import { api, initAuth } from "../../../api/Axios";
import { useParams, useNavigate } from "react-router-dom";
import Layout from "../../Components/Layout";
import { useAuth } from "../../../Authentication/AuthContext";
import { toast } from "react-toastify";
import "./EditProducts.css";

const EditProduct = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { admin, loading: authLoading } = useAuth();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [inStock, setInStock] = useState(true);

  const [product, setProduct] = useState({
    title: "",
    name: "",
    price: "",
    description: "",
    stock: 0,
    main_image: "",
    second_image: "",
    third_image: "",
  });
 
  useEffect(() => {
    if (!authLoading && !admin) {
      toast.error("Access denied. Admin only.");
      navigate("/");
    }
  }, [admin, authLoading, navigate]);
 
  useEffect(() => {
    const fetchProduct = async () => {
      if (!admin) return;
      
      try {
        setLoading(true);
        await initAuth();  
        const res = await api.get(`/products/${id}`);
        setProduct(res.data);
        setInStock((res.data.stock > 0) || res.data.in_stock);
      } catch (err) {
        console.error(err);
        if (err.response?.status === 401) {
          toast.error("Session expired. Please login again.");
          navigate("/login");
        } else {
          toast.error("Failed to load product");
          navigate("/admin/products");
        }
      } finally {
        setLoading(false);
      }
    };

    if (!authLoading && admin) {
      fetchProduct();
    }
  }, [id, navigate, admin, authLoading]);

  const updateProduct = async () => {
    if (!product.title || !product.price) {
      toast.error("Title and price are required");
      return;
    }

    const priceNum = parseFloat(product.price);
    if (isNaN(priceNum) || priceNum <= 0) {
      toast.error("Please enter a valid price greater than 0");
      return;
    }

    const stockNum = inStock ? parseInt(product.stock, 10) : 0;
    if (inStock && (isNaN(stockNum) || stockNum < 0)) {
      toast.error("Please enter a valid stock quantity");
      return;
    }

    try {
      setSaving(true);
      await initAuth(); 
      await api.put(`/admin/products/${id}`, {
        title: product.title.trim(),
        name: product.name?.trim() || "",
        description: product.description?.trim() || "",
        price: priceNum,
        stock: stockNum,
        in_stock: inStock
      });

      toast.success("Product updated successfully");
      navigate("/admin/products");
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.error || "Failed to update product");
    } finally {
      setSaving(false);
    }
  };

  /* =====================
     UPDATE IMAGE
  ===================== */
  // ⚠️ FIX: Validate image
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

  const updateImage = async (e, type) => {
    const file = e.target.files[0];
    if (!file) return;
    
    if (!validateImage(file)) {
      e.target.value = "";
      return;
    }

    const formData = new FormData();
    formData.append("image", file);

    try {
      setSaving(true);
      await initAuth(); // ⚠️ FIX: Wait for auth
      await api.put(`/admin/products/${id}/image/${type}`, formData, {
        headers: { "Content-Type": "multipart/form-data" }
      });
      toast.success(`${type} image updated successfully!`);
      // Refresh product data
      const res = await api.get(`/products/${id}`);
      setProduct(res.data);
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.error || "Failed to update image");
    } finally {
      setSaving(false);
    }
  };

  // ⚠️ FIX: Loading states
  if (authLoading) {
    return (
      <Layout>
        <div className="edit-product">
          <div className="loading-spinner">Verifying access...</div>
        </div>
      </Layout>
    );
  }

  if (!admin) return null;

  if (loading) {
    return (
      <Layout>
        <div className="edit-product">
          <div className="loading-spinner">Loading product...</div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="edit-product">
        <h2>Edit Product</h2>

        {/* IMAGE PREVIEWS */}
        <div className="image-previews" style={{ display: 'flex', gap: '20px', marginBottom: '30px', flexWrap: 'wrap' }}>
          {product.main_image && (
            <div style={{ textAlign: 'center' }}>
              <p style={{ marginBottom: '5px', fontWeight: 'bold' }}>Main Image</p>
              <img src={product.main_image} alt="Main" className="image-preview-thumb" />
            </div>
          )}
          {product.second_image && (
            <div style={{ textAlign: 'center' }}>
              <p style={{ marginBottom: '5px', fontWeight: 'bold' }}>Second Image</p>
              <img src={product.second_image} alt="Second" className="image-preview-thumb" />
            </div>
          )}
          {product.third_image && (
            <div style={{ textAlign: 'center' }}>
              <p style={{ marginBottom: '5px', fontWeight: 'bold' }}>Third Image</p>
              <img src={product.third_image} alt="Third" className="image-preview-thumb" />
            </div>
          )}
        </div>

        {/* IMAGE UPLOADERS */}
        <div className="image-upload-section">
          <h4>Update Images</h4>
          <p className="image-upload-note">Select a file to replace the current image (JPEG, PNG, WEBP, max 2MB)</p>
          
          <div className="image-upload-row">
            <label>Main Image:</label>
            <input type="file" accept="image/jpeg,image/png,image/webp" onChange={(e) => updateImage(e, "main")} disabled={saving} />
          </div>
          <div className="image-upload-row">
            <label>Second Image:</label>
            <input type="file" accept="image/jpeg,image/png,image/webp" onChange={(e) => updateImage(e, "second")} disabled={saving} />
          </div>
          <div className="image-upload-row">
            <label>Third Image:</label>
            <input type="file" accept="image/jpeg,image/png,image/webp" onChange={(e) => updateImage(e, "third")} disabled={saving} />
          </div>
        </div>

        <div className="form-group">
          <label>Product Title *</label>
          <input
            value={product.title}
            onChange={(e) => setProduct({ ...product, title: e.target.value })}
            maxLength={100}
          />
          <small>{product.title?.length || 0}/100</small>
        </div>

        <div className="form-group">
          <label>Product Name</label>
          <input
            value={product.name || ""}
            onChange={(e) => setProduct({ ...product, name: e.target.value })}
            maxLength={100}
          />
        </div>

        <div className="form-group">
          <label>Price * (₹)</label>
          <input
            type="number"
            value={product.price}
            onChange={(e) => setProduct({ ...product, price: e.target.value })}
            min="1"
            step="1"
          />
        </div>

        <div className="form-group">
          <label>Description</label>
          <textarea
            rows="4"
            value={product.description || ""}
            onChange={(e) => setProduct({ ...product, description: e.target.value })}
            maxLength={1000}
          />
          <small>{product.description?.length || 0}/1000</small>
        </div>

        <div className="form-group">
          <label>Stock Quantity</label>
          <input
            type="number"
            value={product.stock || 0}
            onChange={(e) => setProduct({ ...product, stock: parseInt(e.target.value) || 0 })}
            min="0"
            disabled={!inStock}
          />
          {!inStock && <small className="info">Product will be marked as Out of Stock</small>}
        </div>

        <div className="stock-toggle">
          <label>
            <input
              type="checkbox"
              checked={inStock}
              onChange={(e) => setInStock(e.target.checked)}
            />
            In Stock
          </label>
        </div>

        <div className="form-actions">
          <button
            className="update-btn"
            onClick={updateProduct}
            disabled={saving}
          >
            {saving ? "Updating..." : "Update Product Info"}
          </button>

          <button
            className="cancel-btn"
            onClick={() => navigate("/admin/products")}
          >
            Cancel
          </button>
        </div>
      </div>
    </Layout>
  );
};

export default EditProduct;