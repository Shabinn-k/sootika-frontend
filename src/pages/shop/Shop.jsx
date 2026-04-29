// pages/shop/Shop.jsx
import { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { productService } from "../../api/products";
import { toast } from "react-toastify";
import { useAuth } from "../../Authentication/AuthContext";
import { CartContext } from "../../context/CartContext";
import { FaHeart } from "react-icons/fa";
import "./Shop.css";

const Shop = () => {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const { user } = useAuth();
  const { addToCart, addToWish } = useContext(CartContext);

  // Fetch products from API
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const response = await productService.getAllProducts();
        // Handle the response structure from your backend
        // Backend returns: { data: products, count }
        setProducts(response.data || []);
      } catch (error) {
        console.error("Failed to fetch products:", error);
        toast.error("Failed to load products");
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  // Filter products based on search
  const filteredProducts = products.filter((item) =>
    item.title?.toLowerCase().includes(search.toLowerCase()) ||
    item.name?.toLowerCase().includes(search.toLowerCase())
  );

  const handleAddToCart = (product) => {
    if (!user) {
      toast.warn("Please login to add items to Cart!");
      return;
    }

    if (product.stock === false || product.in_stock === false) {
      toast.error("Product is out of stock!");
      return;
    }

    addToCart(product);
    toast.success("Added to cart");
  };

  const handleAddToWish = (product) => {
    if (!user) {
      toast.warn("Please login to add items to Wishlist!");
      return;
    }
    addToWish(product);
  };

  if (loading) {
    return (
      <div className="shop-page">
        <div className="back-home" onClick={() => navigate("/")}>
          ← Back to Home
        </div>
        <div className="loading-spinner">Loading products...</div>
      </div>
    );
  }

  return (
    <div className="shop-page">
      <div className="back-home" onClick={() => navigate("/")}>
        ← Back to Home
      </div>

      <input
        type="search"
        placeholder="Search products..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="search-input"
      />

      <div className="product-grid">
        {filteredProducts.length > 0 ? (
          filteredProducts.map((item) => (
            <div className="product-card" key={item.id}>
              <div className="image-box">
                <FaHeart
                  className={`wishlist-icon ${!user ? "disabled" : ""}`}
                  onClick={() => user && handleAddToWish(item)}
                />
                <img
                  src={item.main_image || item.image}
                  alt={item.title}
                  onClick={() => navigate(`/detail/${item.id}`)}
                />
              </div>

              <h3 onClick={() => navigate(`/detail/${item.id}`)}>
                {item.title}
              </h3>

              <h2 className="name">{item.name}</h2>

              <p className={`stock ${(item.stock === false || item.in_stock === false) ? "out" : ""}`}>
                {(item.stock > 0 || item.in_stock === true) ? "In Stock" : "Out of Stock"}
              </p>

              <span className="price">₹ {item.price}</span>

              <button
                className="addCart"
                disabled={item.stock === 0 || item.in_stock === false}
                onClick={() => handleAddToCart(item)}
              >
                {item.stock > 0 ? "Add to Cart" : "Out of Stock"}
              </button>
            </div>
          ))
        ) : (
          <p className="noProduct">No products found</p>
        )}
      </div>
    </div>
  );
};

export default Shop;