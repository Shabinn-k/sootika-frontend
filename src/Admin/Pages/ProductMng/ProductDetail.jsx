import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { api } from "../../../api/Axios";
import Layout from "../../Components/Layout";
import { toast } from "react-toastify";
import "./ProductDetail.css";

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  /* =====================
     FETCH PRODUCT
  ===================== */
  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const res = await api.get(`/products/${id}`);
        setProduct(res.data);
      } catch (err) {
        console.error(err);
        setError("Product not found");
        toast.error("Failed to load product");
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id]);

  const isInStock = product?.in_stock || product?.stock > 0;

  if (loading) {
    return (
      <Layout>
        <div className="loading-container" style={{ padding: "40px", textAlign: "center" }}>
          <p>Loading product...</p>
        </div>
      </Layout>
    );
  }

  if (error || !product) {
    return (
      <Layout>
        <div className="error-container" style={{ padding: "40px", textAlign: "center" }}>
          <p>{error || "Product not found"}</p>
          <button 
            className="back-btn" 
            onClick={() => navigate("/admin/products")}
            style={{ marginTop: "20px", padding: "10px 20px", cursor: "pointer" }}
          >
            Back to Products
          </button>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="product-detail">

        {/* IMAGES - Show all available images */}
        <div className="product-images">
          {product.main_image || product.image ? (
            <div className="product-image">
              <img
                src={product.main_image || product.image}
                alt={product.title}
              />
            </div>
          ) : null}
          
          {(product.second_image || product.third_image) && (
            <div className="product-thumbnails" style={{ display: 'flex', gap: '10px', marginTop: '15px' }}>
              {product.second_image && (
                <img 
                  src={product.second_image} 
                  alt="Second view" 
                  style={{ width: '80px', height: '80px', objectFit: 'cover', borderRadius: '8px', cursor: 'pointer' }}
                  onClick={() => window.open(product.second_image, '_blank')}
                />
              )}
              {product.third_image && (
                <img 
                  src={product.third_image} 
                  alt="Third view" 
                  style={{ width: '80px', height: '80px', objectFit: 'cover', borderRadius: '8px', cursor: 'pointer' }}
                  onClick={() => window.open(product.third_image, '_blank')}
                />
              )}
            </div>
          )}
        </div>

        {/* TITLE */}
        <h2>{product.title}</h2>

        {/* NAME */}
        {product.name && (
          <p className="product-name" style={{ color: '#7a6859', fontSize: '14px' }}>{product.name}</p>
        )}

        {/* DESCRIPTION */}
        <p className="product-info">
          <span style={{ fontWeight: 600, color: '#5a4634' }}>Description:</span>{" "}
          {product.description || "No description provided"}
        </p>

        {/* PRICE */}
        <p className="product-info">
          <span style={{ fontWeight: 600, color: '#5a4634' }}>Price:</span> ₹ {product.price}
        </p>

        {/* STOCK */}
        <div className={`stock-badge ${isInStock ? "stock-in" : "stock-out"}`}>
          {isInStock ? "✓ In Stock" : "✗ Out of Stock"}
          {product.stock > 0 && <span className="stock-quantity"> ({product.stock} available)</span>}
        </div>

        {/* ACTIONS */}
        <div className="detail-actions" style={{ display: 'flex', gap: '15px', marginTop: '30px' }}>
          <button
            className="edit-btn"
            onClick={() => navigate(`/admin/products/edit/${id}`)}
            style={{ flex: 1, padding: '12px', background: '#c9a47a', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer' }}
          >
            ✏️ Edit Product
          </button>

          <button
            className="back-btn"
            onClick={() => navigate("/admin/products")}
            style={{ flex: 1, padding: '12px', background: '#e6d5bd', color: '#5a4634', border: 'none', borderRadius: '8px', cursor: 'pointer' }}
          >
            ← Back to List
          </button>
        </div>

      </div>
    </Layout>
  );
};

export default ProductDetail;