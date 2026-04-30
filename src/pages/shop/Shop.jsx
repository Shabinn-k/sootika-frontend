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
  
  const { user, loading: authLoading } = useAuth(); // ⚠️ ADD authLoading
  const { addToCart, addToWish, loading: cartLoading } = useContext(CartContext); // ⚠️ ADD cartLoading

  // Fetch products from API
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const response = await productService.getAllProducts();
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

  const handleAddToCart = async (product) => { // ⚠️ Make async
    if (!user) {
      toast.warn("Please login to add items to Cart!");
      return;
    }

    const isOutOfStock = product.stock === false || product.stock === 0 || product.in_stock === false;
    if (isOutOfStock) {
      toast.error("Product is out of stock!");
      return;
    }

    try {
      await addToCart(product);
      toast.success("Added to cart");
    } catch {
      toast.error("Failed to add to cart");
    }
  };

  const handleAddToWish = async (product) => { // ⚠️ Make async
    if (!user) {
      toast.warn("Please login to add items to Wishlist!");
      return;
    }

    const isOutOfStock = product.stock === false || product.stock === 0 || product.in_stock === false;
    if (isOutOfStock) {
      toast.error("Cannot add out of stock items to wishlist");
      return;
    }

    try {
      await addToWish(product);
      toast.success("Added to wishlist");
    } catch {
      toast.error("Failed to add to wishlist");
    }
  };

  // ⚠️ FIX: Show loading state
  if (loading || authLoading) {
    return (
      <div className="shop-page">
        <div className="back-home" onClick={() => navigate("/")}>
          ← Back to Home
        </div>
        <div className="loading-spinner">Loading products...</div>
      </div>
    );
  }

  const isAddingToCart = cartLoading; // For button disable feedback

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
          filteredProducts.map((item) => {
            const isOutOfStock = item.stock === false || item.stock === 0 || item.in_stock === false;
            
            return (
              <div className="product-card" key={item.id}>
                <div className="image-box">
                  <FaHeart
                    className={`wishlist-icon ${(!user || isOutOfStock) ? "disabled" : ""}`}
                    onClick={() => user && !isOutOfStock && handleAddToWish(item)} // ⚠️ FIX: Check stock
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

                <p className={`stock ${isOutOfStock ? "out" : ""}`}>
                  {isOutOfStock ? "Out of Stock" : "In Stock"}
                </p>

                <span className="price">₹ {item.price}</span>

                <button
                  className="addCart"
                  disabled={isOutOfStock || isAddingToCart}
                  onClick={() => handleAddToCart(item)}
                >
                  {isAddingToCart ? "Adding..." : (isOutOfStock ? "Out of Stock" : "Add to Cart")}
                </button>
              </div>
            );
          })
        ) : (
          <p className="noProduct">No products found</p>
        )}
      </div>
    </div>
  );
};

export default Shop;