import React, { useState } from "react";
import { api } from "../../../api/Axios";
import { useNavigate } from "react-router-dom";
import Layout from "../../Components/Layout";
import "./AddProducts.css";

const initialProduct = {
  title: "",
  name: "",
  description: "",
  image: "",
  sImage: "",
  tImage: "",
  price: 0,
  stock: true,
};

const AddProduct = () => {
  const navigate = useNavigate();
  const [product, setProduct] = useState(initialProduct);
  const [loading, setLoading] = useState(false);

  /* =====================
     ADD PRODUCT
  ===================== */
  const addProduct = async () => {
    // Basic validation
    if (
      !product.title ||
      !product.name ||
      !product.image ||
      product.price <= 0
    ) {
      alert("Please fill all required fields");
      return;
    }

    try {
      setLoading(true);
      await api.post("/products", product);
      alert("Product added successfully");
      navigate("/admin/products");
    } catch (err) {
      console.error(err);
      alert("Failed to add product");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <div className="add-product">
        <h2>Add Product</h2>

        <div className="form-group">
          <label>Product Title *</label>
          <input
            value={product.title}
            onChange={(e) =>
              setProduct({ ...product, title: e.target.value })
            }
          />
        </div>

        <div className="form-group">
          <label>Product Name *</label>
          <input
            value={product.name}
            onChange={(e) =>
              setProduct({ ...product, name: e.target.value })
            }
          />
        </div>

        <div className="form-group">
          <label>Description</label>
          <textarea
            rows="3"
            value={product.description}
            onChange={(e) =>
              setProduct({ ...product, description: e.target.value })
            }
          />
        </div>

        <div className="form-group">
          <label>Price *</label>
          <input
            type="number"
            value={product.price}
            onChange={(e) =>
              setProduct({ ...product, price: Number(e.target.value) })
            }
          />
        </div>

        <div className="form-group">
          <label>Main Image URL *</label>
          <input
            value={product.image}
            onChange={(e) =>
              setProduct({ ...product, image: e.target.value })
            }
          />
        </div>

        <div className="form-group">
          <label>Second Image URL</label>
          <input
            value={product.sImage}
            onChange={(e) =>
              setProduct({ ...product, sImage: e.target.value })
            }
          />
        </div>

        <div className="form-group">
          <label>Third Image URL</label>
          <input
            value={product.tImage}
            onChange={(e) =>
              setProduct({ ...product, tImage: e.target.value })
            }
          />
        </div>

        <div className="stock-toggle">
          <label>
            <input
              className="st"
              type="checkbox"
              checked={product.stock}
              onChange={(e) =>
                setProduct({ ...product, stock: e.target.checked })
              }
            />
            In Stock
          </label>
        </div>

        <div className="form-actions">
          <button
            type="button"
            className="save-btn"
            disabled={loading}
            onClick={addProduct}
          >
            {loading ? "Saving..." : "Save Product"}
          </button>

          <button
            type="button"
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

export default AddProduct;
