import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { api, initAuth } from "../../../api/Axios";
import Layout from "../../Components/Layout";
import { useAuth } from "../../../Authentication/AuthContext";
import { toast } from "react-toastify";
import "./ProductDetail.css";

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { admin, loading: authLoading } = useAuth();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [mainImg, setMainImg] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchProduct = async () => {
      if (!admin) return;

      try {
        setLoading(true);
        await initAuth();

        const res = await api.get(`/products/${id}`);
        setProduct(res.data);

        const main = res.data.main_image || res.data.image || "";
        setMainImg(main);
      } catch (err) {
        console.error(err);

        if (err.response?.status === 401) {
          toast.error("Session expired. Please login again.");
          navigate("/login");
        } else {
          setError("Product not found");
          toast.error("Failed to load product");
        }
      } finally {
        setLoading(false);
      }
    };

    if (!authLoading && admin) {
      fetchProduct();
    }
  }, [id, admin, authLoading, navigate]);

  const isInStock = (p) => p?.in_stock || p?.stock > 0;

  if (authLoading) {
    return (
      <Layout>
        <div className="product-detail">
          <div className="loading-spinner">Verifying access...</div>
        </div>
      </Layout>
    );
  }

  if (!admin) return null;

  if (loading) {
    return (
      <Layout>
        <div className="product-detail">
          <div className="loading-spinner">Loading product...</div>
        </div>
      </Layout>
    );
  }

  if (error || !product) {
    return (
      <Layout>
        <div className="product-detail">
          <div className="error-container">
            <p>{error || "Product not found"}</p>
            <button
              className="back-btn"
              onClick={() => navigate("/admin/products")}
            >
              ← Back to Products
            </button>
          </div>
        </div>
      </Layout>
    );
  }

  const mainImage = product.main_image || product.image;

  return (
    <Layout>
      <div className="product-detail">
        {/* MAIN IMAGE */}
        <div className="product-image">
          {mainImg ? (
            <img
              src={mainImg}
              alt={product.title}
              onError={(e) => {
                e.target.style.display = "none";
              }}
            />
          ) : (
            <div style={{ textAlign: "center", padding: "40px" }}>
              No Image
            </div>
          )}
        </div>

        {(product.second_image || product.third_image) && (
          <div className="product-thumbnails">
            {mainImage && (
              <img
                src={mainImage}
                alt="Main"
                className={`thumbnail ${
                  mainImg === mainImage ? "active" : ""
                }`}
                onClick={() => setMainImg(mainImage)}
              />
            )}

            {product.second_image && (
              <img
                src={product.second_image}
                alt="Second"
                className={`thumbnail ${
                  mainImg === product.second_image ? "active" : ""
                }`}
                onClick={() => setMainImg(product.second_image)}
              />
            )}

            {product.third_image && (
              <img
                src={product.third_image}
                alt="Third"
                className={`thumbnail ${
                  mainImg === product.third_image ? "active" : ""
                }`}
                onClick={() => setMainImg(product.third_image)}
              />
            )}
          </div>
        )}

        <h2>{product.title}</h2>

        {product.name && (
          <p className="product-subtitle">{product.name}</p>
        )}

        <p className="product-info">
          <span>Description:</span>{" "}
          {product.description || "No description provided"}
        </p>

        <p className="product-info">
          <span>Price:</span> ₹{" "}
          {Number(product.price || 0).toLocaleString()}
        </p>

        <div
          className={`stock-badge ${
            isInStock(product) ? "stock-in" : "stock-out"
          }`}
        >
          {isInStock(product) ? "✓ In Stock" : "✗ Out of Stock"}
          {product.stock > 0 && (
            <span> ({product.stock} available)</span>
          )}
        </div>

        <div className="detail-actions">
          <button
            className="edit-btn"
            onClick={() => navigate(`/admin/products/edit/${id}`)}
          >
            ✏️ Edit Product
          </button>

          <button
            className="back-btn"
            onClick={() => navigate("/admin/products")}
          >
            ← Back to List
          </button>
        </div>
      </div>
    </Layout>
  );
};

export default ProductDetail;