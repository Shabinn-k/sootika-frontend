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
  const [mainImg, setMainImg] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const res = await api.get(`/products/${id}`);
        setProduct(res.data);
        setMainImg(res.data.main_image || res.data.image);
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
        <div style={{ padding: "40px", textAlign: "center" }}>
          <p>Loading product...</p>
        </div>
      </Layout>
    );
  }

  if (error || !product) {
    return (
      <Layout>
        <div style={{ padding: "40px", textAlign: "center" }}>
          <p>{error || "Product not found"}</p>
          <button 
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
        <div className="product-images">
          <div className="product-image">
            <img
              src={mainImg}
              alt={product.title}
              onError={(e) => {
                e.target.src = "https://via.placeholder.com/500";
              }}
            />
          </div>
          
          {(product.second_image || product.third_image) && (
            <div className="product-thumbnails" style={{ display: 'flex', gap: '10px', marginTop: '15px' }}>
              {(product.main_image || product.image) && (
                <img 
                  src={product.main_image || product.image}
                  alt="Main view"
                  style={{ width: '80px', height: '80px', objectFit: 'cover', borderRadius: '8px', cursor: 'pointer', border: mainImg === (product.main_image || product.image) ? '2px solid #c9a47a' : '1px solid #e6d5bd' }}
                  onClick={() => setMainImg(product.main_image || product.image)}
                />
              )}
              {product.second_image && (
                <img 
                  src={product.second_image}
                  alt="Second view"
                  style={{ width: '80px', height: '80px', objectFit: 'cover', borderRadius: '8px', cursor: 'pointer', border: mainImg === product.second_image ? '2px solid #c9a47a' : '1px solid #e6d5bd' }}
                  onClick={() => setMainImg(product.second_image)}
                />
              )}
              {product.third_image && (
                <img 
                  src={product.third_image}
                  alt="Third view"
                  style={{ width: '80px', height: '80px', objectFit: 'cover', borderRadius: '8px', cursor: 'pointer', border: mainImg === product.third_image ? '2px solid #c9a47a' : '1px solid #e6d5bd' }}
                  onClick={() => setMainImg(product.third_image)}
                />
              )}
            </div>
          )}
        </div>

        <h2>{product.title}</h2>
        {product.name && (
          <p style={{ color: '#7a6859', fontSize: '14px' }}>{product.name}</p>
        )}

        <p className="product-info">
          <span style={{ fontWeight: 600, color: '#5a4634' }}>Description:</span>{" "}
          {product.description || "No description provided"}
        </p>

        <p className="product-info">
          <span style={{ fontWeight: 600, color: '#5a4634' }}>Price:</span> ₹ {product.price}
        </p>

        <div className={`stock-badge ${isInStock ? "stock-in" : "stock-out"}`}>
          {isInStock ? "✓ In Stock" : "✗ Out of Stock"}
          {product.stock > 0 && <span> ({product.stock} available)</span>}
        </div>

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