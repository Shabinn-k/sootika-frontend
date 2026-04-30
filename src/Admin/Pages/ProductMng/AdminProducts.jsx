import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../../../api/Axios";
import Layout from "../../Components/Layout";
import { toast } from "react-toastify";
import "./AdminProducts.css";

const AdminProducts = () => {
  const [products, setProducts] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState(null);
  const navigate = useNavigate();

  const getProducts = async () => {
    try {
      setLoading(true);
      const res = await api.get("/products");
      const productList = res.data?.data || res.data || [];
      setProducts(Array.isArray(productList) ? productList : []);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load products");
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  const deleteProduct = async (id) => {
    if (!window.confirm("Delete this product?")) return;

    try {
      setDeletingId(id);
      await api.delete(`/admin/products/${id}`);
      setProducts(prev => prev.filter(p => p.id !== id));
      toast.success("Product deleted successfully");
    } catch (err) {
      console.error(err);
      toast.error("Failed to delete product");
    } finally {
      setDeletingId(null);
    }
  };

  useEffect(() => {
    getProducts();
  }, []);

  const filteredProducts = (Array.isArray(products) ? products : []).filter(p =>
    p.title?.toLowerCase().includes(search.toLowerCase()) ||
    p.name?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <Layout>
      <div className="admin-products">
        <div className="admin-header">
          <h2>Products</h2>
          <button className="add-product-btn"
            onClick={() => navigate("/admin/products/add")}>
            + Add New Product
          </button>
        </div>

        <input className="admin-search" type="search" placeholder="Search products..."
          value={search} onChange={(e) => setSearch(e.target.value)} />

        {loading ? (
          <p className="loading-text">Loading products...</p>
        ) : (
          <table className="product-table">
            <thead>
              <tr>
                <th>Image</th>
                <th>Title</th>
                <th>Price</th>
                <th>Stock</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredProducts.length > 0 ? (
                filteredProducts.map(p => (
                  <tr key={p.id}>
                    <td>
                      <img
                        src={p.main_image || p.image}
                        alt={p.title}
                        style={{ width: "50px", height: "50px", objectFit: "cover", borderRadius: "8px" }}
                        onError={(e) => {
                          e.target.src = "https://via.placeholder.com/50";
                        }}
                      />
                    </td>
                    <td className="clickable" onClick={() => navigate(`/admin/products/${p.id}`)}>
                      {p.title}
                    </td>
                    <td className="clickable" onClick={() => navigate(`/admin/products/${p.id}`)}>
                      ₹ {p.price}
                    </td>
                    <td className={p.in_stock || p.stock ? "stock-in" : "stock-out"}>
                      {p.in_stock || p.stock ? "In Stock" : "Out of Stock"}
                    </td>
                    <td>
                      <div className="action-btns">
                        <button className="view-btn"
                          onClick={() => navigate(`/admin/products/${p.id}`)}>
                          View
                        </button>
                        <button className="edit-btn"
                          onClick={() => navigate(`/admin/products/edit/${p.id}`)} >
                          Edit
                        </button>
                        <button className="delete-btn" onClick={() => deleteProduct(p.id)}
                          disabled={deletingId === p.id}>
                          {deletingId === p.id ? "..." : "Delete"}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="no-data">
                    No products found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>
    </Layout>
  );
};

export default AdminProducts;