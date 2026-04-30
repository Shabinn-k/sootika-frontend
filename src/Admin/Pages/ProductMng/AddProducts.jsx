import React, { useState } from "react";
import { api } from "../../../api/Axios";
import { useNavigate } from "react-router-dom";
import Layout from "../../Components/Layout";
import { toast } from "react-toastify";
import "./AddProducts.css";

const AddProduct = () => {
  const navigate = useNavigate();
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

  const handleImageChange = (e, setImage, setPreview) => {
    const file = e.target.files[0];
    if (file) {
      setImage(file);
      setPreview(URL.createObjectURL(file));
    }
  };

  const addProduct = async () => {
    if (!title || !name || !mainImage || !price || Number(price) <= 0) {
      toast.error("Please fill all required fields (Title, Name, Price, Main Image)");
      return;
    }

    try {
      setLoading(true);

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

  return (
    <Layout>
      <div className="add-product">
        <h2>Add Product</h2>

        <div className="form-group">
          <label>Product Title *</label>
          <input value={title}
            onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Beautiful Saree"/>
        </div>

        <div className="form-group">
          <label>Product Name *</label>
          <input value={name}
            onChange={(e) => setName(e.target.value)} placeholder="e.g. Silk Saree"/>
        </div>

        <div className="form-group">
          <label>Description</label>
          <textarea rows="3" value={description}
            onChange={(e) => setDescription(e.target.value)} placeholder="Product details..." />
        </div>

        <div className="form-group">
          <label>Price *</label>
          <input type="number" value={price}
            onChange={(e) => setPrice(e.target.value)} placeholder="e.g. 500" />
        </div>

        <div className="form-group">
          <label>Stock Quantity</label>
          <input type="number" value={stockQuantity}
            onChange={(e) => setStockQuantity(Number(e.target.value))}
            placeholder="e.g. 10" min="0"/>
        </div>

        <div className="form-group">
          <label>Main Image *</label>
          <input type="file" accept="image/*"
            onChange={(e) => handleImageChange(e, setMainImage, setMainPreview)}/>
          {mainPreview && <img src={mainPreview} alt="Main Preview" className="image-preview" />}
        </div>

        <div className="form-group">
          <label>Second Image</label>
          <input type="file" accept="image/*"
            onChange={(e) => handleImageChange(e, setSecondImage, setSecondPreview)}/>
          {secondPreview && <img src={secondPreview} alt="Second Preview" className="image-preview" />}
        </div>

        <div className="form-group">
          <label>Third Image</label>
          <input type="file" accept="image/*"
            onChange={(e) => handleImageChange(e, setThirdImage, setThirdPreview)} />
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