import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api, initAuth } from "../../../api/Axios";
import Layout from "../../Components/Layout";
import { useAuth } from "../../../Authentication/AuthContext";
import { toast } from "react-toastify";
import LoadingSpinner from "../../Components/LoadingSpinner";
import "./AdminProducts.css";

const AdminProducts = () => {
  const navigate = useNavigate();
  const { admin, loading: authLoading } = useAuth();
  const [products, setProducts] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState(null);

  useEffect(() => {
    if (!authLoading && !admin) {
      toast.error("Access denied. Admin only.");
      navigate("/");
    }
  }, [admin, authLoading, navigate]);

  const getProducts = async () => {
    try {
      setLoading(true);
      await initAuth();
      const res = await api.get("/products");
      const productList = res.data?.data || res.data || [];
      setProducts(Array.isArray(productList) ? productList : []);
    } catch (err) {
      console.error(err);
      if (err.response?.status === 401) {
        toast.error("Session expired. Please login again.");
        navigate("/login");
      } else {
        toast.error("Failed to load products");
      }
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  const deleteProduct = async (id) => {
    if (!window.confirm("Delete this product? This action cannot be undone.")) return;

    try {
      setDeletingId(id);
      await initAuth();
      await api.delete(`/admin/products/${id}`);
      setProducts(prev => prev.filter(p => p.id !== id));
      toast.success("Product deleted successfully");
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.error || "Failed to delete product");
    } finally {
      setDeletingId(null);
    }
  };

  useEffect(() => {
    if (!authLoading && admin) {
      getProducts();
    }
  }, [authLoading, admin]);

  const filteredProducts = (Array.isArray(products) ? products : []).filter(p =>
    p.title?.toLowerCase().includes(search.toLowerCase()) ||
    p.name?.toLowerCase().includes(search.toLowerCase())
  );

  const isProductInStock = (product) => {
    return (product.stock > 0) || (product.in_stock === true);
  };

  if (authLoading) {
    return <Layout isLoading={true}><LoadingSpinner message="Verifying access..." /></Layout>;
  }

  if (!admin) return null;

  return (
    <Layout>
      <div className="admin-products">
        <div className="admin-header">
          <h2>Products ({filteredProducts.length})</h2>
          <button 
            className="add-product-btn"
            onClick={() => navigate("/admin/products/add")}
          >
            + Add New Product
          </button>
        </div>

        <input 
          className="admin-search" 
          type="search" 
          placeholder="Search products..." 
          value={search} 
          onChange={(e) => setSearch(e.target.value)} 
        />

        {loading ? (
          <LoadingSpinner message="Loading products..." size="medium" />
        ) : filteredProducts.length === 0 ? (
          <div className="no-products">
            <p>No products found</p>
            <button onClick={() => navigate("/admin/products/add")} className="add-product-btn">
              + Add Your First Product
            </button>
          </div>
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
              {filteredProducts.map(p => {
                const inStock = isProductInStock(p);
                return (
                  <tr key={p.id}>
                    <td>
                      <img
                        src={p.main_image || p.image}
                        alt={p.title}
                        className="product-image"
                        onError={(e) => {
                          e.target.src = "https://via.placeholder.com/50";
                        }}
                      />
                    </td>
                    <td className="clickable" onClick={() => navigate(`/admin/products/${p.id}`)}>
                      {p.title}
                    </td>
                    <td className="clickable" onClick={() => navigate(`/admin/products/${p.id}`)}>
                      ₹ {p.price?.toLocaleString()}
                    </td>
                    <td className={inStock ? "stock-in" : "stock-out"}>
                      {inStock ? `In Stock (${p.stock || 0})` : "Out of Stock"}
                    </td>
                    <td>
                      <div className="action-btns">
                        <button 
                          className="view-btn"
                          onClick={() => navigate(`/admin/products/${p.id}`)}
                        >
                          View
                        </button>
                        <button 
                          className="edit-btn"
                          onClick={() => navigate(`/admin/products/edit/${p.id}`)}
                        >
                          Edit
                        </button>
                        <button 
                          className="delete-btn" 
                          onClick={() => deleteProduct(p.id)}
                          disabled={deletingId === p.id}
                        >
                          {deletingId === p.id ? "⌛" : "Delete"}
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </Layout>
  );
};

export default AdminProducts;