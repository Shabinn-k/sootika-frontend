// components/TopSelling/TopSelling.jsx
import React, { useState, useEffect, useContext } from 'react';
import { productService } from '../../api/products';
import "./TopSelling.css";
import { FaShoppingCart, FaHeart } from "react-icons/fa";
import { CartContext } from '../../context/CartContext';
import { useAuth } from '../../Authentication/AuthContext';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';

const TopSelling = ({ setShowLogin }) => {
    const navigate = useNavigate();
    const { user, loading: authLoading } = useAuth();
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const { addToCart, addToWish } = useContext(CartContext);

    useEffect(() => {
        productService.getAllProducts()
            .then(res => {
                const allProducts = res.data || [];
                // ⚠️ ONLY SHOW FIRST 8 PRODUCTS
                setProducts(allProducts.slice(0, 8));
                setLoading(false);
            })
            .catch(err => {
                console.error("Failed to load products:", err);
                setLoading(false);
            });
    }, []);

    const handleAddToCart = async (item) => {
        if (!user) {
            setShowLogin(true);
            toast.warn("Please login to add items to Cart!");
            return;
        }

        const isOutOfStock = item.stock === false || item.stock === 0;
        if (isOutOfStock) {
            toast.error("Product is out of stock!");
            return;
        }

        try {
            await addToCart(item);
            toast.success("Added to cart");
        } catch {
            toast.error("Failed to add to cart");
        }
    };

    const handleAddToWish = async (item) => {
        if (!user) {
            setShowLogin(true);
            toast.warn("Please login to add items to Wishlist!");
            return;
        }

        const isOutOfStock = item.stock === false || item.stock === 0;
        if (isOutOfStock) {
            toast.error("Cannot add out of stock items to wishlist");
            return;
        }

        try {
            await addToWish(item);
            toast.success("Added to wishlist");
        } catch {
            toast.error("Failed to add to wishlist");
        }
    };

    if (loading || authLoading) {
        return <div className="loading">Loading products...</div>;
    }

    const isProductOutOfStock = (item) => item.stock === false || item.stock === 0;
    
    // ⚠️ Split first 4 and next 4
    const firstGroup = products.slice(0, 4);
    const secondGroup = products.slice(4, 8);

    return (
        <div>
            <br />
            <h1>Our New Collections :-</h1>

            <div className="group-1">
                {firstGroup.map((item) => {
                    const outOfStock = isProductOutOfStock(item);
                    
                    return (
                        <div key={item.id} className="card">
                            <div className="card-img-box">
                                <img 
                                    src={item.main_image || item.image} 
                                    alt={item.title} 
                                    onClick={() => navigate(`/detail/${item.id}`)} 
                                />
                            </div>
                            <h3>{item.title}</h3>
                            <div className="card-icons">
                                <FaHeart 
                                    className={`wish-icon ${outOfStock ? "disabled" : ""}`}
                                    onClick={() => !outOfStock && handleAddToWish(item)} 
                                />
                                <FaShoppingCart 
                                    className={`cart-icon ${outOfStock ? "disabled" : ""}`}
                                    onClick={() => !outOfStock && handleAddToCart(item)} 
                                />
                            </div>
                            <h2>{item.name}</h2>
                            <span>₹ {item.price}</span>
                            {outOfStock && <p className="stock-badge out">Out of Stock</p>}
                        </div>
                    );
                })}
            </div>

            <div className="group-2">
                {secondGroup.map((item) => {
                    const outOfStock = isProductOutOfStock(item);
                    
                    return (
                        <div key={item.id} className="card">
                            <div className="card-img-box">
                                <img 
                                    src={item.main_image || item.image} 
                                    alt={item.title} 
                                    onClick={() => navigate(`/detail/${item.id}`)} 
                                />
                            </div>
                            <h3>{item.title}</h3>
                            <div className="card-icons">
                                <FaHeart 
                                    className={`wish-icon ${outOfStock ? "disabled" : ""}`}
                                    onClick={() => !outOfStock && handleAddToWish(item)} 
                                />
                                <FaShoppingCart 
                                    className={`cart-icon ${outOfStock ? "disabled" : ""}`}
                                    onClick={() => !outOfStock && handleAddToCart(item)} 
                                />
                            </div>
                            <h2>{item.name}</h2>
                            <span>₹ {item.price}</span>
                            {outOfStock && <p className="stock-badge out">Out of Stock</p>}
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

export default TopSelling;