import { Suspense, lazy } from "react";
import { Routes, Route, useLocation, Navigate } from "react-router-dom";

import Home from "./components/Home";
import NotFound from "./pages/NotFound";
import Registration from "./pages/Registration.jsx";
import Footer from "./components/Footer";
import Shop from "./pages/shop/Shop";
import About from "./pages/About.jsx";

import AdminProtected from "./Admin/AdminProtected.jsx";
const Dashboard = lazy(() => import("./Admin/Pages/Dashboard/Dashboard.jsx"));
const AdminProducts = lazy(() => import("./Admin/Pages/ProductMng/AdminProducts.jsx"));
const ProductDetail = lazy(() => import("./Admin/Pages/ProductMng/ProductDetail.jsx"));
const AddProduct = lazy(() => import("./Admin/Pages/ProductMng/AddProducts.jsx"));
const EditProduct = lazy(() => import("./Admin/Pages/ProductMng/EditProducts.jsx"));
const UserDetail = lazy(() => import("./Admin/Pages/UserMng/UserDetail.jsx"));
const AdminFeedback = lazy(() => import("./Admin/Pages/FeedBack/AdminFeedback.jsx"));
const OrderDet = lazy(() => import("./Admin/Pages/OrderMng/AdminOrders.jsx"));

// Lazy pages
const Cart = lazy(() => import("./pages/Cart/Cart.jsx"));
const Wishlist = lazy(() => import("./pages/Wishlist/Wishlist.jsx"));
const Detail = lazy(() => import("./pages/DetailsCard/Detail.jsx"));
const Payment = lazy(() => import("./pages/Payment/Payment.jsx"));
const WriteFeed = lazy(() => import("./pages/WriteFeed/WriteFeed.jsx"));
const Orders = lazy(() => import("./pages/Orders/Orders.jsx"));

const MainRouter = () => {
  const location = useLocation();

  // ⚠️ Footer hide logic
  const hideFooterPaths = [
    "/admin",
    "/detail",
    "/payment",
    "/cart",
    "/wishlist",
    "/myOrders",
    "/shop",
    "/about",
    "/404",
    "/registration"
  ];
  
  const hideFoot = hideFooterPaths.some(path => 
    location.pathname === path || location.pathname.startsWith(path + "/")
  ) || location.pathname.startsWith("/admin");

  return (
    <Suspense fallback={<div className="loader">Loading...</div>}>
      <Routes>
        {/* USER ROUTES */}
        <Route path="/" element={<Home />} />
        <Route path="/registration" element={<Registration />} />
        <Route path="/shop" element={<Shop />} />
        <Route path="/cart" element={<Cart />} />
        <Route path="/wishlist" element={<Wishlist />} />
        <Route path="/about" element={<About />} />
        <Route path="/detail/:id" element={<Detail />} />
        <Route path="/payment" element={<Payment />} />
        <Route path="/write-feedback" element={<WriteFeed />} />
        <Route path="/myOrders" element={<Orders />} />

        {/* ADMIN ROUTES */}
        <Route path="/admin/dashboard" element={
          <AdminProtected>
            <Dashboard />
          </AdminProtected>
        } />

        <Route path="/admin/products" element={
          <AdminProtected>
            <AdminProducts />
          </AdminProtected>
        } />

        <Route path="/admin/products/add" element={
          <AdminProtected>
            <AddProduct />
          </AdminProtected>
        } />

        <Route path="/admin/products/edit/:id" element={
          <AdminProtected>
            <EditProduct />
          </AdminProtected>
        } />

        <Route path="/admin/products/:id" element={
          <AdminProtected>
            <ProductDetail />
          </AdminProtected>
        } />

        <Route path="/admin/users" element={
          <AdminProtected>
            <UserDetail />
          </AdminProtected>
        } />

        <Route path="/admin/feedback" element={
          <AdminProtected>
            <AdminFeedback />
          </AdminProtected>
        } />

        <Route path="/admin/orders" element={
          <AdminProtected>
            <OrderDet />
          </AdminProtected>
        } />

        {/* 404 */}
        <Route path="/404" element={<NotFound />} />
        <Route path="*" element={<Navigate to="/404" replace />} />
      </Routes>

      {!hideFoot && <Footer />}
    </Suspense>
  );
};

export default MainRouter;