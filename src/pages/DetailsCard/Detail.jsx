import React, { useContext, useEffect, useState } from "react";
import "./Detail.css";
import { useNavigate, useParams } from "react-router-dom";
import { api } from "../../api/Axios";
import { CartContext } from "../../context/CartContext";
import { useAuth } from "../../Authentication/AuthContext";
import { toast } from "react-toastify";

const Detail = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const { addToCart } = useContext(CartContext);
  const { user } = useAuth();

  const [product, setProduct] = useState(null);
  const [quant, setQuant] = useState(1);
  const [mainImg, setMainImg] = useState("");

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const res = await api.get(`/products/${id}`);
        setProduct(res.data);
        setMainImg(res.data.main_image || res.data.image);
      } catch (err) {
        console.error("Failed to load product:", err);
        toast.error("Failed to load product");
        navigate("/shop");
      }
    };

    fetchProduct();
  }, [id, navigate]);

  const handlePay = () => {
    if (!user) {
      toast.warn("Please login to continue!");
      return;
    }
    if (product.stock === false) {
      toast.error("Product is out of stock");
      return;
    }
    navigate("/payment", { state: { product, quant } });
  };

  const handleAddToCart = () => {
    if (!user) {
      toast.warn("Please login to continue!");
      return;
    }
    if (product.stock === false) {
      toast.error("Product is out of stock");
      return;
    }
    addToCart({ ...product, quantity: quant });
    toast.success("Added to cart!");
  };

  if (!product) {
    return (
      <div className="detail-page">
        <p style={{ padding: "40px", textAlign: "center" }}>
          Loading product...
        </p>
      </div>
    );
  }

  return (
    <div className="detail-page">
      <button className="shop-btn" onClick={() => navigate("/shop")}>
        Go to Shop
      </button>

      <div className="left">
        <img 
          src={mainImg} 
          alt={product.title} 
          className="main-img"
          onError={(e) => {
            e.target.src = "https://via.placeholder.com/500";
          }}
        />

        <div className="down-main">
          {(product.main_image || product.image) && (
            <img
              src={product.main_image || product.image}
              alt="preview-1"
              className="down"
              onClick={() => setMainImg(product.main_image || product.image)}
            />
          )}
          {product.second_image && (
            <img
              src={product.second_image}
              alt="preview-2"
              className="down"
              onClick={() => setMainImg(product.second_image)}
            />
          )}
          {product.third_image && (
            <img
              src={product.third_image}
              alt="preview-3"
              className="down"
              onClick={() => setMainImg(product.third_image)}
            />
          )}
        </div>
      </div>

      <div className="right">
        <h2>{product.title}</h2>
        <p className="small">{product.name}</p>
        <p className="info">{product.description}</p>
        <div className="pp">₹ {product.price}</div>
        <p className={`stock ${product.stock === false ? "out" : ""}`}>
          {product.stock ? "In Stock" : "Out of Stock"}
        </p>
        <div className="qntity">
          <button onClick={() => setQuant((q) => Math.max(1, q - 1))}>
            −
          </button>
          <span>{quant}</span>
          <button onClick={() => setQuant((q) => q + 1)}>+</button>
        </div>
        <div className="btn-row">
          <button
            className="add-btn"
            disabled={product.stock === false}
            onClick={handleAddToCart}
          >
            Add to Cart
          </button>
          <button
            className="pay"
            disabled={product.stock === false}
            onClick={handlePay}
          >
            Buy Now
          </button>
        </div>
      </div>
    </div>
  );
};

export default Detail;