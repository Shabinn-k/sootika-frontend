import React from "react";
import "./GoShop.css";
import { useNavigate } from "react-router-dom";
import GoSh from "../../assets/GoShop.mp4";

const GoShop = () => {
  const navigate = useNavigate();

  return (
    <div className="video-bg-container">
      <video
        className="video-bg"
        autoPlay
        muted
        loop
        playsInline
        preload="metadata"
      >
        <source src={GoSh} type="video/mp4" />
        Your browser does not support the video tag.
      </video>

      <div className="video-content">
        <button
          className="shop-btn"
          aria-label="Go to shop page"
          onClick={() => navigate("/shop")}
        >
          Go Shopping ➜
        </button>
      </div>
    </div>
  );
};

export default GoShop;
