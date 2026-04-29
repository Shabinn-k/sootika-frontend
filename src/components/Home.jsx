import { useState } from "react";
import Navbar from "./Navbar/Navbar";
import Banner from "./Banner";
import TopSelling from "./TopSelling/TopSelling";
import Login from "../Authentication/Login";
import Feedback from "./Feedback/Feedback";
import GoShop from "./GoShop/GoShop";
import BrandShowcase from "./Brand/BrandShowcase";

const Home = () => {
  const [showLogin, setShowLogin] = useState(false);

  return (
    <>
      <Navbar setShowLogin={setShowLogin} />

      <main>
        <Banner />
        <TopSelling setShowLogin={setShowLogin} />
        <BrandShowcase />
        <GoShop />
        <Feedback setShowLogin={setShowLogin} />
      </main>

      {/* Login Modal */}
      {showLogin && <Login setShowLogin={setShowLogin} />}
    </>
  );
};

export default Home;