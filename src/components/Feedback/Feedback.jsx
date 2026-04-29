import { useEffect, useState } from "react";
import { api } from "../../api/Axios";
import { useAuth } from "../../Authentication/AuthContext";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import "./Feedback.css";

const Feedback = ({ setShowLogin }) => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [feedbacks, setFeedbacks] = useState([]);
  const [loading, setLoading] = useState(true);

  // 🔹 Fetch approved feedbacks
  useEffect(() => {
    const getFeedback = async () => {
      try {
        const res = await api.get("/feedbacks");
        const approved = res.data.filter(
          (item) => item.feed === "approved"
        );
        setFeedbacks(approved);
      } catch (err) {
        toast.error("Failed to load reviews");
      } finally {
        setLoading(false);
      }
    };

    getFeedback();
  }, []);

  // 🔹 Write feedback handler
  const handleFeed = () => {
    if (!user) {
      toast.dismiss();
      setShowLogin(true);
      toast.warn("Please login to give feedback!");
      return;
    }
    navigate("/write-feedback");
  };

  // 🔹 Average rating
  const averageRating =
    feedbacks.length > 0
      ? (
          feedbacks.reduce(
            (total, item) => total + Number(item.rating || 0),
            0
          ) / feedbacks.length
        ).toFixed(1)
      : "0.0";

  if (loading) return <p>Loading reviews...</p>;

  return (
    <div className="feedback-container">
      <h2>Customer Reviews</h2>
      <p>What our customers say about our products</p>

      <div className="feedback-cards">
        {feedbacks.map((item) => (
          <div key={item.id} className="feedback-card">
            <div className="user-info">
              <div className="user-dp">
                {item.name ? item.name.charAt(0).toUpperCase() : "U"}
              </div>
              <h4>{item.name || "Anonymous"}</h4>
            </div>

            <div className="stars">
              {[1, 2, 3, 4, 5].map((star) => (
                <span
                  key={star}
                  className={
                    star <= item.rating ? "star filled" : "star"
                  }
                >
                  ★
                </span>
              ))}
              <span className="rating-text">{item.rating}</span>
            </div>

            <p className="feedback-review">
              “{item.review || "No review provided"}”
            </p>
          </div>
        ))}
      </div>

      <div className="average-rate">
        <div className="rating-circle">
          <span className="rating-number">{averageRating}</span>
          <span className="rating-outOf">/5</span>
        </div>
        <div className="rating-info">
          <h3>Overall Rating</h3>
          <p>Based on {feedbacks.length} reviews</p>
        </div>
      </div>

      <button className="write-review" onClick={handleFeed}>
        Write a Review
      </button>
    </div>
  );
};

export default Feedback;
