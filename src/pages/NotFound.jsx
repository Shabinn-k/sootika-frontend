import { useNavigate } from "react-router-dom";
import "./NotFound.css";

const NotFound = () => {
  const navigate = useNavigate();

  return (
    <div className="notfound-container">
      <h1 className="error-code">404</h1>
      <p className="error-text">Sorry, the page you’re looking for doesn’t exist.</p>

      <button className="hoome-btn" onClick={() => navigate("/")}>
        Go to Home
      </button>
    </div>
  );
};

export default NotFound;
