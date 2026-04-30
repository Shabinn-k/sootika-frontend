import React, { useState, useEffect } from "react";
import "./GoShop.css";
import { useNavigate } from "react-router-dom";
import GoSh from "../../assets/GoShop.mp4";

const GoShop = () => {
  const navigate = useNavigate();
  const [videoError, setVideoError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 2000);
    return () => clearTimeout(timer);
  }, []);

  const handleVideoError = () => {
    console.error("Video failed to load");
    setVideoError(true);
  };

  if (videoError) {
    return (
      <div className="video-bg-container">
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
  }

  return (
    <div className="video-bg-container">
      <video
        className="video-bg"
        autoPlay
        muted
        loop
        playsInline
        preload="metadata"
        onError={handleVideoError}
        onCanPlay={() => setIsLoading(false)}
      >
        <source src={GoSh} type="video/mp4" />
        Your browser does not support the video tag.
      </video>

      {isLoading && (
        <div className="video-loading">
          <div className="spinner"></div>
        </div>
      )}

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