import React, { useEffect, useState } from "react";
import Layout from "../../Components/Layout";
import { adminService } from "../../../api/admin";
import { toast } from "react-toastify";
import "./UserDetail.css";

const UserDetail = () => {
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState("");
  const [showBlocked, setShowBlocked] = useState(false);

  /* =====================
     FETCH USERS
  ===================== */
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await adminService.getAllUsers();
        setUsers(res.data.data || []);
      } catch (err) {
        console.error("Failed to fetch users", err);
      }
    };
    fetchUsers();
  }, []);

  /* =====================
     BLOCK / UNBLOCK USER
  ===================== */
  const handleBlock = async (user) => {
    if (!window.confirm(`Are you sure you want to ${user.is_blocked ? "unblock" : "block"} this user?`)) return;

    try {
      const res = await adminService.toggleUserBlock(user.ID);
      
      setUsers((prev) =>
        prev.map((u) =>
          u.ID === user.ID ? { ...u, is_blocked: res.data.is_blocked } : u
        )
      );
      toast.success(res.data.message);
    } catch (err) {
      console.error(err);
      toast.error("Failed to update user status");
    }
  };

  /* =====================
     UPDATE ROLE
  ===================== */
  const handleRoleUpdate = async (user, newRole) => {
    if (!window.confirm(`Change role to ${newRole}?`)) return;

    try {
      await adminService.updateUserRole(user.ID, { role: newRole });
      setUsers((prev) =>
        prev.map((u) =>
          u.ID === user.ID ? { ...u, role: newRole } : u
        )
      );
      toast.success("Role updated successfully");
    } catch (err) {
      console.error(err);
      toast.error("Failed to update role");
    }
  };

  /* =====================
     FILTER USERS
  ===================== */
  const displayUsers = users.filter((user) => {
    if (showBlocked && !user.is_blocked) return false;
    if (
      search &&
      !user.name?.toLowerCase().includes(search.toLowerCase())
    )
      return false;
    return true;
  });

  const blockedCount = users.filter((u) => u.is_blocked).length;

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
                  >
                    <option value="user">User</option>
                    <option value="admin">Admin</option>
                  </select>
                </td>

                <td>{user.is_blocked ? "Blocked" : "Active"}</td>

                <td>
                  <button onClick={() => handleBlock(user)}>
                    {user.is_blocked ? "Unblock" : "Block"}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Layout>
  );
};

export default UserDetail;
