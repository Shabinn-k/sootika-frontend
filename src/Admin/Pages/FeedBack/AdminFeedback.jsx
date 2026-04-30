import { useEffect, useState } from "react";
import { adminService } from "../../../api/admin";
import { toast } from "react-toastify";
import Layout from "../../Components/Layout";
import "./AdminFeedback.css";

const AdminFeedback = () => {
  const [feedbacks, setFeedbacks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFeedbacks = async () => {
      try {
        const res = await adminService.getFeedbacks();
        setFeedbacks(res.data.data || res.data || []);
      } catch (error) {
        console.error("Failed to fetch feedbacks", error);
      } finally {
        setLoading(false);
      }
    };

    fetchFeedbacks();
  }, []);

  const approve = async (id) => {
    try {
      await adminService.approveFeedback(id);

      setFeedbacks((prev) =>
        prev.map((item) =>
          item.ID === id ? { ...item, feed: "approved" } : item
        )
      );
      toast.success("Feedback approved");
    } catch (error) {
      console.error("Approve failed", error);
      toast.error("Failed to approve feedback");
    }
  };

  const deleteFeed = async (id) => {
    const sure = window.confirm("Are you sure you want to delete this feedback?");
    if (!sure) return;

    try {
      await adminService.deleteFeedback(id);
      setFeedbacks((prev) => prev.filter((item) => item.ID !== id));
      toast.success("Feedback deleted");
    } catch (error) {
      console.error("Delete failed", error);
      toast.error("Failed to delete feedback");
    }
  };

  return (
    <Layout>
      <div className="admin-feed-pg">
        <h2>User Feedbacks</h2>

        {loading ? (
          <p>Loading feedbacks...</p>
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
              {feedbacks.map((item) => (
                <tr key={item.ID}>
                  <td>{item.name}</td>
                  <td>{item.review}</td>
                  <td>{"★".repeat(item.rating)}{"☆".repeat(5 - item.rating)}</td>
                  <td>
                    <button className="ys-btn" onClick={() => approve(item.ID)}
                      disabled={item.feed === "approved"}>
                      {item.feed === "approved" ? "Approved" : "Approve"}
                    </button>

                    <button className="dlt-btn" onClick={() => deleteFeed(item.ID)}>
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </Layout>
  );
};

export default AdminFeedback;