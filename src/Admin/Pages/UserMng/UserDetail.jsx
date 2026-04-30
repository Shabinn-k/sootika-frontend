import React, { useEffect, useState } from "react";
import Layout from "../../Components/Layout";
import { adminService } from "../../../api/admin";
import { toast } from "react-toastify";
import { useAuth } from "../../../Authentication/AuthContext";
import LoadingSpinner from "../../Components/LoadingSpinner";
import "./UserDetail.css";

const UserDetail = () => {
  const { loading: authLoading } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true); // ✅ Add loading state
  const [search, setSearch] = useState("");
  const [showBlocked, setShowBlocked] = useState(false);
  const [updatingId, setUpdatingId] = useState(null);

  useEffect(() => {
    if (authLoading) return;

    const fetchUsers = async () => {
      try {
        setLoading(true);
        const res = await adminService.getAllUsers();
        const usersData = res?.data?.data || res?.data || [];
        setUsers(usersData);
      } catch (err) {
        console.error("Failed to fetch users", err);
        if (err.response?.status === 401) {
          toast.error("Unauthorized. Please login again.");
        } else {
          toast.error(err.response?.data?.error || "Failed to fetch users");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, [authLoading]);

  const handleBlock = async (user) => {
    const confirm = window.confirm(
      `Are you sure you want to ${user.is_blocked ? "unblock" : "block"} this user?`
    );
    if (!confirm) return;

    try {
      setUpdatingId(user.ID);
      const res = await adminService.toggleUserBlock(user.ID);
      const updatedStatus = res?.data?.is_blocked ?? !user.is_blocked;

      setUsers((prev) =>
        prev.map((u) =>
          u.ID === user.ID ? { ...u, is_blocked: updatedStatus } : u
        )
      );

      toast.success(res?.data?.message || "User updated");
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.error || "Failed to update user");
    } finally {
      setUpdatingId(null);
    }
  };

  const handleRoleUpdate = async (user, newRole) => {
    const confirm = window.confirm(`Change role to ${newRole}?`);
    if (!confirm) return;

    try {
      setUpdatingId(user.ID);
      await adminService.updateUserRole(user.ID, { role: newRole });

      setUsers((prev) =>
        prev.map((u) =>
          u.ID === user.ID ? { ...u, role: newRole } : u
        )
      );

      toast.success("Role updated successfully");
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.error || "Failed to update role");
    } finally {
      setUpdatingId(null);
    }
  };

  const displayUsers = users.filter((user) => {
    if (showBlocked && !user.is_blocked) return false;
    if (search && !user.name?.toLowerCase().includes(search.toLowerCase()))
      return false;
    return true;
  });

  const blockedCount = users.filter((u) => u.is_blocked).length;

  // ✅ Show loading state
  if (authLoading || loading) {
    return (
      <Layout>
        <LoadingSpinner message={authLoading ? "Verifying access..." : "Loading users..."} />
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="users-page">
        <h3>Total Users: {users.length}</h3>
        <h3>Blocked Users: {blockedCount}</h3>

        <input
          type="search"
          placeholder="Search by name"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        <button onClick={() => setShowBlocked(!showBlocked)}>
          {showBlocked ? "Show All" : "Show Blocked"}
        </button>

        <table className="users-table">
          <thead>
            <tr>
              <th>Profile</th>
              <th>Name</th>
              <th>Email</th>
              <th>Role</th>
              <th>Status</th>
              <th>Action</th>
            </tr>
          </thead>

          <tbody>
            {displayUsers.map((user) => (
              <tr key={user.ID}>
                <td>
                  <div className="avatar">
                    {user.name?.[0]?.toUpperCase() || "U"}
                  </div>
                </td>

                <td>{user.name}</td>
                <td>{user.email}</td>

                <td>
                  <select
                    value={user.role}
                    onChange={(e) => handleRoleUpdate(user, e.target.value)}
                    disabled={updatingId === user.ID}
                  >
                    <option value="user">User</option>
                    <option value="admin">Admin</option>
                  </select>
                </td>

                <td>{user.is_blocked ? "Blocked" : "Active"}</td>

                <td>
                  <button 
                    onClick={() => handleBlock(user)}
                    disabled={updatingId === user.ID}
                  >
                    {updatingId === user.ID ? "⏳" : (user.is_blocked ? "Unblock" : "Block")}
                  </button>
                </td>
              </tr>
            ))}

            {displayUsers.length === 0 && (
              <tr>
                <td colSpan="6" style={{ textAlign: "center" }}>
                  No users found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </Layout>
  );
};

export default UserDetail;