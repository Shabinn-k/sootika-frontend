import { useEffect, useState } from "react";
import { adminService } from "../../../api/admin";
import { toast } from "react-toastify";
import Layout from "../../Components/Layout";
import { useAuth } from "../../../Authentication/AuthContext";
import { useNavigate } from "react-router-dom";
import "./AdminFeedback.css";

const AdminFeedback = () => {
  const navigate = useNavigate();
  const { admin, loading: authLoading } = useAuth();
  const [feedbacks, setFeedbacks] = useState([]);
  const [loading, setLoading] = useState(true);

  // ⚠️ FIX: Check admin access
  useEffect(() => {
    if (!authLoading && !admin) {
      toast.error("Access denied. Admin only.");
      navigate("/");
    }
  }, [admin, authLoading, navigate]);

  const fetchFeedbacks = async () => {
    try {
      const res = await adminService.getFeedbacks();
      // ⚠️ FIX: Handle both ID and id field names
      const data = res.data?.data || res.data || [];
      setFeedbacks(data);
    } catch (error) {
      console.error("Failed to fetch feedbacks", error);
      if (error.response?.status === 401) {
        toast.error("Session expired. Please login again.");
        navigate("/login");
      } else {
        toast.error("Failed to load feedbacks");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!authLoading && admin) {
      fetchFeedbacks();
    }
  }, [authLoading, admin]);

  const approve = async (id) => {
    try {
      await adminService.approveFeedback(id);
      
      // ⚠️ FIX: Support both ID and id field names
      setFeedbacks((prev) =>
        prev.map((item) => {
          const itemId = item.ID || item.id;
          return itemId === id ? { ...item, feed: "approved" } : item;
        })
      );
      toast.success("Feedback approved");
    } catch (error) {
      console.error("Approve failed", error);
      toast.error(error.response?.data?.message || "Failed to approve feedback");
    }
  };

  const deleteFeed = async (id) => {
    const sure = window.confirm("Are you sure you want to delete this feedback?");
    if (!sure) return;

    try {
      await adminService.deleteFeedback(id);
      // ⚠️ FIX: Support both ID and id field names
      setFeedbacks((prev) => prev.filter((item) => {
        const itemId = item.ID || item.id;
        return itemId !== id;
      }));
      toast.success("Feedback deleted");
    } catch (error) {
      console.error("Delete failed", error);
      toast.error(error.response?.data?.message || "Failed to delete feedback");
    }
  };

  // ⚠️ FIX: Loading states
  if (authLoading) {
    return (
      <Layout>
        <div className="admin-feed-pg">
          <div className="loading-spinner">Verifying access...</div>
        </div>
      </Layout>
    );
  }

  if (!admin) {
    return null;
  }

  return (
    <Layout>
      <div className="admin-feed-pg">
        <h2>User Feedbacks</h2>

        {loading ? (
          <div className="loading-spinner">Loading feedbacks...</div>
        ) : feedbacks.length === 0 ? (
          <p>No feedbacks given</p>
        ) : (
          <table className="feed-table">
            <thead>
              <tr>
                <th>User</th>
                <th>Feedback</th>
                <th>Rating</th>
                <th>Actions</th>
              </tr>
            </thead>

            <tbody>
              {feedbacks.map((item) => {
                const itemId = item.ID || item.id;
                const isApproved = item.feed === "approved";
                
                return (
                  <tr key={itemId}>
                    <td>{item.name || item.user_name || "Anonymous"}</td>
                    <td>{item.review || item.feedback || item.message}</td>
                    <td>
                      {"★".repeat(item.rating || 0)}
                      {"☆".repeat(5 - (item.rating || 0))}
                    </td>
                    <td>
                      <button 
                        className="ys-btn" 
                        onClick={() => approve(itemId)}
                        disabled={isApproved}
                      >
                        {isApproved ? "Approved" : "Approve"}
                      </button>

                      <button 
                        className="dlt-btn" 
                        onClick={() => deleteFeed(itemId)}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </Layout>
  );
};

export default AdminFeedback;