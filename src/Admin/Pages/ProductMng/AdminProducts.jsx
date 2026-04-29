import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../../../api/Axios";
import Layout from "../../Components/Layout";
import "./AdminProducts.css";

const AdminProducts = () => {
  const [products, setProducts] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  /* =====================
     FETCH PRODUCTS
  ===================== */
  const getProducts = async () => {
    try {
      setLoading(true);
      const res = await api.get("/products");
      setProducts(res.data);
    } catch (err) {
      console.error(err);
      alert("Failed to load products");
    } finally {
      setLoading(false);
    }
  };

  /* =====================
     DELETE PRODUCT
  ===================== */
  const deleteProduct = async (id) => {
    if (!window.confirm("Delete this product?")) return;

    try {
      await api.delete(`/products/${id}`);
      setProducts(prev => prev.filter(p => p.id !== id));
      alert("Product deleted");
    } catch (err) {
      console.error(err);
      alert("Failed to delete product");
    }
  };

  useEffect(() => {
    getProducts();
  }, []);

  /* =====================
     SEARCH FILTER
  ===================== */
  const filteredProducts = products.filter(p =>
    p.title.toLowerCase().includes(search.toLowerCase()) ||
    p.name?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <Layout>
      <div className="admin-products">

        <div className="admin-header">
          <h2>Products</h2>

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
          <p className="loading-text">Loading products...</p>
        ) : (
          <table className="product-table">
            <thead>
              <tr>
                <th>Title</th>
                <th>Price</th>
                <th>Stock</th>
                <th>Update</th>
              </tr>
            </thead>

            <tbody>
              {filteredProducts.length > 0 ? (
                filteredProducts.map(p => (
                  <tr key={p.id}>
                    <td
                      className="clickable"
                      onClick={() => navigate(`/admin/products/${p.id}`)}
                    >
                      {p.title}
                    </td>

                    <td
                      className="clickable"
                      onClick={() => navigate(`/admin/products/${p.id}`)}
                    >
                      ₹ {p.price}
                    </td>

                    <td className={p.stock ? "stock-in" : "stock-out"}>
                      {p.stock ? "In Stock" : "Out of Stock"}
                    </td>

                    <td>
                      <div className="action-btns">
                        <button
                          className="view-btn"
                          onClick={() =>
                            navigate(`/admin/products/${p.id}`)
                          }
                        >
                          View
                        </button>

                        <button
                          className="edit-btn"
                          onClick={() =>
                            navigate(`/admin/products/edit/${p.id}`)
                          }
                        >
                          Edit
                        </button>

                        <button
                          className="delete-btn"
                          onClick={() => deleteProduct(p.id)}
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="4" className="no-data">
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
