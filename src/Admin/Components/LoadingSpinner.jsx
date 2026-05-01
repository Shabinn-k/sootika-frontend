import React from 'react';

const LoadingSpinner = ({ message = "Loading...", size = "medium" }) => {
  const sizes = {
    small: { width: "30px", height: "30px", fontSize: "12px" },
    medium: { width: "50px", height: "50px", fontSize: "14px" },
    large: { width: "70px", height: "70px", fontSize: "16px" }
  };

  const currentSize = sizes[size] || sizes.medium;

  return (
    <div style={{
      display: "flex",
      flexDirection: "column",
      justifyContent: "center",
      alignItems: "center",
      padding: "40px",
      minHeight: "200px"
    }}>
      <div style={{
        width: currentSize.width,
        height: currentSize.height,
        border: `4px solid #e6d5bd`,
        borderTop: `4px solid #c9a47a`,
        borderRadius: "50%",
        animation: "spin 1s linear infinite"
      }} />
      <p style={{
        marginTop: "15px",
        color: "#5a4634",
        fontSize: currentSize.fontSize,
        fontWeight: 500
      }}>{message}</p>
      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default LoadingSpinner;