import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { api } from "../../../api/Axios";
import Layout from "../../Components/Layout";
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
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id]);

  /* =====================
     STATES
  ===================== */
  if (loading) {
    return (
      <Layout>
        <p style={{ padding: "20px" }}>Loading product...</p>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout>
        <div style={{ padding: "20px" }}>
          <p>{error}</p>
          <button onClick={() => navigate("/admin/products")}>
            Back to Products
          </button>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="product-detail">

        {/* IMAGE */}
        <div className="product-image">
          <img
            src={product.image}
            alt={product.title}
          />
        </div>

        {/* TITLE */}
        <h2>{product.title}</h2>

        {/* NAME */}
        {product.name && (
          <p className="product-name">{product.name}</p>
        )}

        {/* DESCRIPTION */}
        <p className="product-info">
          <span>Description:</span>{" "}
          {product.description || "No description provided"}
        </p>

        {/* PRICE */}
        <p className="product-info">
          <span>Price:</span> ₹ {product.price}
        </p>

        {/* STOCK */}
        <div className={`stock-badge ${product.stock ? "stock-in" : "stock-out"}`}>
          {product.stock ? "In Stock" : "Out of Stock"}
        </div>

        {/* ACTIONS */}
        <div className="detail-actions">
          <button
            className="edit-btn"
            onClick={() => navigate(`/admin/products/edit/${id}`)}
          >
            Edit Product
          </button>

          <button
            className="back-btn"
            onClick={() => navigate("/admin/products")}
          >
            Back to List
          </button>
        </div>

      </div>
    </Layout>
  );
};

export default ProductDetail;
