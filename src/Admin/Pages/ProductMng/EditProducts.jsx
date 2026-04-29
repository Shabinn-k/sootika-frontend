import React, { useEffect, useState } from "react";
import { api } from "../../../api/Axios";
import { useParams, useNavigate } from "react-router-dom";
import Layout from "../../Components/Layout";
import { toast } from "react-toastify";
import "./EditProducts.css";

const EditProduct = () => {
  const { id } = useParams();
  const navigate = useNavigate();

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

  /* =====================
     FETCH PRODUCT
  ===================== */
  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const res = await api.get(`/products/${id}`);
        setProduct(res.data);
        setInStock(res.data.stock > 0 || res.data.in_stock);
      } catch (err) {
        console.error(err);
        toast.error("Failed to load product");
        navigate("/admin/products");
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id, navigate]);

  /* =====================
     UPDATE PRODUCT INFO
  ===================== */
  const updateProduct = async () => {
    if (!product.title || !product.price) {
      toast.error("Title and price are required");
      return;
    }

    try {
      setSaving(true);
      await api.put(`/admin/products/${id}`, {
        title: product.title,
        name: product.name,
        description: product.description,
        price: Number(product.price),
        stock: inStock ? (product.stock || 10) : 0,
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
  const updateImage = async (e, type) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("image", file);

    try {
      setSaving(true);
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

  if (loading) {
    return (
      <Layout>
        <p style={{ padding: "30px" }}>Loading product...</p>
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
              <img src={product.main_image} alt="Main" style={{ width: '120px', height: '120px', objectFit: 'cover', borderRadius: '8px', border: '1px solid #e6d5bd' }} />
            </div>
          )}
          {product.second_image && (
            <div style={{ textAlign: 'center' }}>
              <p style={{ marginBottom: '5px', fontWeight: 'bold' }}>Second Image</p>
              <img src={product.second_image} alt="Second" style={{ width: '120px', height: '120px', objectFit: 'cover', borderRadius: '8px', border: '1px solid #e6d5bd' }} />
            </div>
          )}
          {product.third_image && (
            <div style={{ textAlign: 'center' }}>
              <p style={{ marginBottom: '5px', fontWeight: 'bold' }}>Third Image</p>
              <img src={product.third_image} alt="Third" style={{ width: '120px', height: '120px', objectFit: 'cover', borderRadius: '8px', border: '1px solid #e6d5bd' }} />
            </div>
          )}
        </div>

        {/* IMAGE UPLOADERS */}
        <div className="form-group" style={{ border: '1px solid #e6d5bd', padding: '20px', borderRadius: '12px', marginBottom: '25px', background: '#faf5ee' }}>
          <h4 style={{ marginBottom: '10px', color: '#5a4634' }}>Update Images</h4>
          <p style={{ fontSize: '12px', color: '#7a6859', marginBottom: '15px' }}>Select a file to replace the current image</p>
          
          <div style={{ marginTop: '10px' }}>
            <label style={{ display: 'inline-block', width: '100px', fontWeight: '600' }}>Main Image: </label>
            <input type="file" accept="image/*" onChange={(e) => updateImage(e, "main")} disabled={saving} />
          </div>
          <div style={{ marginTop: '10px' }}>
            <label style={{ display: 'inline-block', width: '100px', fontWeight: '600' }}>Second Image: </label>
            <input type="file" accept="image/*" onChange={(e) => updateImage(e, "second")} disabled={saving} />
          </div>
          <div style={{ marginTop: '10px' }}>
            <label style={{ display: 'inline-block', width: '100px', fontWeight: '600' }}>Third Image: </label>
            <input type="file" accept="image/*" onChange={(e) => updateImage(e, "third")} disabled={saving} />
          </div>
        </div>

        <div className="form-group">
          <label>Product Title *</label>
          <input
            value={product.title}
            onChange={(e) => setProduct({ ...product, title: e.target.value })}
          />
        </div>

        <div className="form-group">
          <label>Product Name</label>
          <input
            value={product.name || ""}
            onChange={(e) => setProduct({ ...product, name: e.target.value })}
          />
        </div>

        <div className="form-group">
          <label>Price *</label>
          <input
            type="number"
            value={product.price}
            onChange={(e) => setProduct({ ...product, price: e.target.value })}
          />
        </div>

        <div className="form-group">
          <label>Description</label>
          <textarea
            rows="4"
            value={product.description || ""}
            onChange={(e) => setProduct({ ...product, description: e.target.value })}
          />
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