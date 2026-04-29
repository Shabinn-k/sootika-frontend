import React, { useEffect, useState } from "react";
import { api } from "../../../api/Axios";
import { useParams, useNavigate } from "react-router-dom";
import Layout from "../../Components/Layout";
import "./EditProducts.css";

const EditProduct = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [product, setProduct] = useState({
    title: "",
    name: "",
    price: "",
    image: "",
    sImage: "",
    tImage: "",
    description: "",
    stock: true,
  });

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
        alert("Failed to load product");
        navigate("/admin/products");
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id, navigate]);

  /* =====================
     UPDATE PRODUCT
  ===================== */
  const updateProduct = async () => {
    if (!product.title || !product.price) {
      alert("Title and price are required");
      return;
    }

    try {
      setSaving(true);
      await api.put(`/products/${id}`, {
        ...product,
        price: Number(product.price),
      });

      alert("Product updated successfully");
      navigate("/admin/products");
    } catch (err) {
      console.error(err);
      alert("Failed to update product");
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

        {/* IMAGE PREVIEW */}
        {product.image && (
          <div className="image-preview">
            <img src={product.image} alt="Product preview" />
          </div>
        )}

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
          <label>Product Name</label>
          <input
            value={product.name || ""}
            onChange={(e) =>
              setProduct({ ...product, name: e.target.value })
            }
          />
        </div>

        <div className="form-group">
          <label>Price *</label>
          <input
            type="number"
            value={product.price}
            onChange={(e) =>
              setProduct({ ...product, price: e.target.value })
            }
          />
        </div>

        <div className="form-group">
          <label>Main Image URL</label>
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
            value={product.sImage || ""}
            onChange={(e) =>
              setProduct({ ...product, sImage: e.target.value })
            }
          />
        </div>

        <div className="form-group">
          <label>Third Image URL</label>
          <input
            value={product.tImage || ""}
            onChange={(e) =>
              setProduct({ ...product, tImage: e.target.value })
            }
          />
        </div>

        <div className="form-group">
          <label>Description</label>
          <textarea
            rows="4"
            value={product.description || ""}
            onChange={(e) =>
              setProduct({ ...product, description: e.target.value })
            }
          />
        </div>

        <div className="stock-toggle">
          <label>
            <input
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
            className="update-btn"
            onClick={updateProduct}
            disabled={saving}
          >
            {saving ? "Updating..." : "Update Product"}
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
