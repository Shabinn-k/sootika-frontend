import { useState } from "react";
import { api } from "../../api/Axios";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import "./WriteFeed.css";
import { useAuth } from "../../Authentication/AuthContext";

const WriteFeed = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [rating, setRating] = useState(0);
  const [review, setReview] = useState("");
  const [loading, setLoading] = useState(false);

  // 🔒 Safety check
  if (!user) {
    toast.warn("Please login to write a review");
    navigate("/");
    return null;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (rating === 0 || !review.trim()) {
      toast.error("Please give a rating and write a review");
      return;
    }

    const feedbackData = {
      name: user.name,
      rating,
      review: review.trim(),
      feed: "pending",
    };

    try {
      setLoading(true);
      await api.post("/feedbacks", feedbackData);
      toast.success("Thank you for your feedback!");
      navigate("/");
    } catch (err) {
      toast.error("Failed to submit feedback");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="writefeed-container">
      <form className="writefeed-form" onSubmit={handleSubmit}>
        <h2>Write a Review</h2>

        {/* ⭐ Rating */}
        <div className="rating-stars">
          {[1, 2, 3, 4, 5].map((star) => (
            <span
              key={star}
              role="button"
              tabIndex={0}
              className={star <= rating ? "star filled" : "star"}
              onClick={() => setRating(star)}
              onKeyDown={(e) => e.key === "Enter" && setRating(star)}
            >
              ★
            </span>
          ))}
        </div>

        {/* 📝 Review */}
        <textarea
          placeholder="Write your feedback..."
          value={review}
          onChange={(e) => setReview(e.target.value)}
          maxLength={500}
        />

        <button type="submit" disabled={loading}>
          {loading ? "Submitting..." : "Submit"}
        </button>
      </form>
    </div>
  );
};

export default WriteFeed;
