import React, { useEffect, useMemo, useState } from "react";
import ban1 from "./../assets/ban1.webp";
import ban2 from "./../assets/ban2.webp";
import ban3 from "./../assets/ban3.webp";
import ban4 from "./../assets/ban4.webp";
import "./Banner.css";

const Banner = () => {
  const [currentSlide, setCurrentSlide] = useState(0);

  // 🔹 Memoized banner images (prevents recreation on each render)
  const bannerImages = useMemo(() => {
    return [ban4, ban1, ban2, ban3];
  }, []);

  // 🔹 Auto slide
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % bannerImages.length);
    }, 2500);

    return () => clearInterval(interval);
  }, [bannerImages.length]);

  return (
    <div className="banner">
      <div className="bannerContainer">
        {bannerImages.map((item, index) => (
          <div
            key={index}
            className={`banner-slide ${
              index === currentSlide ? "active" : ""
            }`}
          >
            <img src={item} alt={`Banner ${index + 1}`} />
          </div>
        ))}
      </div>
    </div>
  );
};

export default Banner;
