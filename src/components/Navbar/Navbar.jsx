import { useContext, useEffect, useRef, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { toast } from "react-toastify";
import "./Navbar.css";
import image from "../../assets/Image";
import { CartContext } from "../../context/CartContext";
import { useAuth } from "../../Authentication/AuthContext";

const Navbar = ({ setShowLogin }) => {
  const navigate = useNavigate();
  const { user, logoutUser } = useAuth();
  const { cartItems = [], wishItems = [] } = useContext(CartContext);

  const [openMenu, setOpenMenu] = useState(false);
  const [openProfile, setOpenProfile] = useState(false);

  const profileRef = useRef(null);

  // 🔹 Close profile dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (profileRef.current && !profileRef.current.contains(e.target)) {
        setOpenProfile(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleCart = () => {
    if (!user) {
      setShowLogin(true);
      toast.warn("Please login to view Cart!");
      return;
    }
    navigate("/cart");
  };

  const handleWish = () => {
    if (!user) {
      setShowLogin(true);
      toast.warn("Please login to view Wishlist!");
      return;
    }
    navigate("/wishlist");
  };

  const handleLogout = () => {
    logoutUser();
    setOpenMenu(false);
    setOpenProfile(false);
  };

  return (
    <>
      <div className="navbar">
        {/* LOGO */}
        <img
          src={image.logo}
          className="title"
          alt="logo"
          onClick={() => navigate("/")}
          style={{ cursor: "pointer" }}
        />

        {/* DESKTOP LINKS */}
        <div className="links">
          <Link to="/" className="link-items">Home</Link>
          <Link to="/shop" className="link-items">Shop</Link>
          <Link to="/about" className="link-items">About Us</Link>
        </div>

        {/* RIGHT ACTIONS */}
        <div className="fnction">
          {/* WISHLIST */}
          <div onClick={handleWish} className="navbar-search-icon">
            <img src={image.hrt} alt="wishlist" width={25} />
            {wishItems.length > 0 && (
              <div className="dot">{wishItems.length}</div>
            )}
          </div>

          {/* CART */}
          <div onClick={handleCart} className="navbar-search-icon">
            <img src={image.cart} alt="cart" width={25} />
            {cartItems.length > 0 && (
              <div className="dot">{cartItems.length}</div>
            )}
          </div>

          {/* PROFILE / LOGIN */}
          {user ? (
            <div className="profile-wrapper" ref={profileRef}>
              <div
                className="profile-circle"
                onClick={() => {
                  setOpenProfile((prev) => !prev);
                  setOpenMenu(false);
                }}
              >
                {user.name?.charAt(0)?.toUpperCase()}
              </div>

              {openProfile && (
                <div className="profile-dropdown">
                  <div
                    className="dropdown-itemA"
                    onClick={() => {
                      navigate("/myOrders");
                      setOpenProfile(false);
                    }}
                  >
                    View Orders
                  </div>
                  <div
                    className="dropdown-itemB"
                    onClick={handleLogout}
                  >
                    Logout
                  </div>
                </div>
              )}
            </div>
          ) : (
            <button
              className="rounded-2xl p-3 w-17 h-7 hover:bg-amber-200"
              onClick={() => setShowLogin(true)}
            >
              Sign In
            </button>
          )}
        </div>

        {/* MOBILE MENU BUTTON */}
        <div
          className="mobile-menu-btn"
          onClick={() => {
            setOpenMenu((prev) => !prev);
            setOpenProfile(false);
          }}
        >
          ☰
        </div>
      </div>

      {/* MOBILE MENU */}
      {openMenu && (
        <div className="mobile-links">
          <Link to="/" onClick={() => setOpenMenu(false)}>Home</Link>
          <Link to="/shop" onClick={() => setOpenMenu(false)}>Shop</Link>
          <Link to="/about" onClick={() => setOpenMenu(false)}>About Us</Link>

          <hr />

          <div onClick={() => { handleWish(); setOpenMenu(false); }}>
            Wishlist
          </div>

          <div onClick={() => { handleCart(); setOpenMenu(false); }}>
            Cart
          </div>

          {user && (
            <div
              onClick={() => {
                navigate("/myOrders");
                setOpenMenu(false);
              }}
            >
              My Orders
            </div>
          )}

          {user ? (
            <button className="logout-btn" onClick={handleLogout}>
              Logout
            </button>
          ) : (
            <button
              className="login-btn"
              onClick={() => {
                setShowLogin(true);
                setOpenMenu(false);
              }}
            >
              Sign In
            </button>
          )}
        </div>
      )}
    </>
  );
};

export default Navbar;
