import React, { useEffect, useState } from "react";
import URLS from "../urls";
import { Trash2, Users as UsersIcon, Plus, X } from "lucide-react";

const ROLE_BADGE_STYLES = {
  superadmin: "bg-amber-50 text-amber-700",
  admin: "bg-purple-50 text-purple-700",
  customer: "bg-gray-100 text-gray-600",
};

const ROLE_LABELS = {
  superadmin: "Superadmin",
  admin: "Admin",
  customer: "Customer",
};

const EMPTY_ADMIN_FORM = {
  name: "",
  phone: "",
  password: "",
  address: "",
};

const Users = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  const [currentUserRole] = useState(() => {
    try {
      const stored = JSON.parse(localStorage.getItem("user") || "{}");
      return (stored.role || "").toLowerCase();
    } catch {
      return "";
    }
  });
  const isSuperadmin = currentUserRole === "superadmin";

  const [showAddAdmin, setShowAddAdmin] = useState(false);
  const [adminForm, setAdminForm] = useState(EMPTY_ADMIN_FORM);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState("");

  useEffect(() => {
    fetch(URLS.getAllUsers)
      .then((res) => res.json())
      .then((data) => { setUsers(data.data); setLoading(false); })
      .catch((err) => { console.error("Error fetching users:", err); setLoading(false); });
  }, []);

  const handleDelete = async (userId) => {
    if (!isSuperadmin) {
      alert("Only a superadmin can delete users.");
      return;
    }
    if (!window.confirm("Are you sure you want to delete this user?")) return;
    try {
      const res = await fetch(URLS.deleteUser(userId), { method: "DELETE" });
      const data = await res.json();
      if (data.success) setUsers((prev) => prev.filter((user) => user.id !== userId));
      else alert("Delete failed: " + data.message);
    } catch (err) { console.error("Error deleting user:", err); }
  };

  const openAddAdmin = () => {
    setAdminForm(EMPTY_ADMIN_FORM);
    setFormError("");
    setShowAddAdmin(true);
  };

  const closeAddAdmin = () => {
    if (submitting) return;
    setShowAddAdmin(false);
  };

  const handleFormChange = (field) => (e) => {
    setAdminForm((prev) => ({ ...prev, [field]: e.target.value }));
  };

  const handleCreateAdmin = async (e) => {
    e.preventDefault();
    if (!adminForm.name || !adminForm.phone || !adminForm.password) {
      setFormError("Name, phone and password are required.");
      return;
    }
    setSubmitting(true);
    setFormError("");
    try {
      const res = await fetch(URLS.addAdmin, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(adminForm),
      });
      const data = await res.json();
      if (res.ok && data.status === "success") {
        setUsers((prev) => [...prev, data.user]);
        setShowAddAdmin(false);
      } else {
        setFormError(data.message || "Failed to create admin.");
      }
    } catch (err) {
      console.error("Error creating admin:", err);
      setFormError("Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const getInitials = (name) => name?.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2) || "?";

  const avatarColors = [
    "bg-purple-100 text-purple-600",
    "bg-pink-100 text-pink-600",
    "bg-indigo-100 text-indigo-600",
    "bg-violet-100 text-violet-600",
  ];

  if (loading)
    return (
      <div className="p-5 flex items-center justify-center min-h-64">
        <div className="flex flex-col items-center gap-3 text-gray-400">
          <div className="w-8 h-8 border-2 border-purple-300 border-t-purple-600 rounded-full animate-spin" />
          <p className="text-sm">Loading users...</p>
        </div>
      </div>
    );

  return (
    <div className="p-5 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div>
          <h2 className="text-xl font-bold text-gray-900 tracking-tight flex items-center gap-2">
            <UsersIcon size={20} className="text-purple-600" />
            User Management
          </h2>
          <p className="text-xs text-gray-400 mt-0.5">{users.length} registered users</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs bg-purple-50 text-purple-600 font-semibold px-3 py-1.5 rounded-lg border border-purple-100">
            {users.filter((u) => u.role === "admin").length} Admins
          </span>
          <span className="text-xs bg-gray-100 text-gray-600 font-semibold px-3 py-1.5 rounded-lg border border-gray-200">
            {users.filter((u) => u.role === "customer").length} Customers
          </span>
          {isSuperadmin && (
            <button
              onClick={openAddAdmin}
              className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg bg-purple-600 text-white hover:bg-purple-700 transition ml-1"
            >
              <Plus size={14} strokeWidth={2.5} />
              Add New Admin
            </button>
          )}
        </div>
      </div>

      {/* Table Card */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200">
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide w-16">ID</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">User</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Address</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Role</th>
              <th className="px-4 py-3 text-center text-xs font-semibold text-gray-500 uppercase tracking-wide w-20">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {users.map((user, idx) => (
              <tr key={user.id} className="hover:bg-purple-50/30 transition-colors group">
                {/* ID */}
                <td className="px-4 py-3">
                  <span className="font-mono text-xs font-semibold text-gray-400 bg-gray-100 px-2 py-0.5 rounded">
                    #{user.id}
                  </span>
                </td>

                {/* User with Avatar */}
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center text-xs font-bold flex-shrink-0 ${avatarColors[idx % avatarColors.length]}`}>
                      {getInitials(user.name)}
                    </div>
                    <span className="font-medium text-gray-800">{user.name}</span>
                  </div>
                </td>

                {/* Address */}
                <td className="px-4 py-3 text-gray-500 text-sm">{user.address || <span className="text-gray-300">—</span>}</td>

                {/* Role — plain badge, no dropdown */}
                <td className="px-4 py-3">
                  <span className={`text-xs font-semibold px-3 py-1.5 rounded-lg ${ROLE_BADGE_STYLES[user.role] || "bg-gray-100 text-gray-600"}`}>
                    {ROLE_LABELS[user.role] || user.role}
                  </span>
                </td>

                {/* Delete — superadmin only */}
                <td className="px-4 py-3 text-center">
                  {isSuperadmin ? (
                    <button
                      onClick={() => handleDelete(user.id)}
                      className="p-1.5 rounded-lg text-gray-300 hover:text-red-500 hover:bg-red-50 transition"
                      title="Delete User"
                    >
                      <Trash2 size={15} />
                    </button>
                  ) : (
                    <span className="text-gray-200" title="Only a superadmin can delete users">
                      <Trash2 size={15} />
                    </span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {users.length === 0 && (
          <div className="py-16 flex flex-col items-center gap-2 text-gray-300">
            <UsersIcon size={40} strokeWidth={1} />
            <p className="text-sm font-medium">No users found</p>
          </div>
        )}
      </div>

      {/* Add New Admin Dialog */}
      {showAddAdmin && (
        <div
          className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4"
          onClick={closeAddAdmin}
        >
          <div
            className="bg-white rounded-xl shadow-lg w-full max-w-md overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
              <h3 className="text-base font-bold text-gray-900">Add New Admin</h3>
              <button
                onClick={closeAddAdmin}
                className="p-1 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCreateAdmin} className="px-5 py-4 space-y-3">
              {formError && (
                <div className="text-xs text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2">
                  {formError}
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1">Name</label>
                <input
                  type="text"
                  value={adminForm.name}
                  onChange={handleFormChange("name")}
                  required
                  className="w-full text-sm px-3 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-purple-300"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1">Phone</label>
                <input
                  type="tel"
                  value={adminForm.phone}
                  onChange={handleFormChange("phone")}
                  required
                  className="w-full text-sm px-3 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-purple-300"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1">Password</label>
                <input
                  type="password"
                  value={adminForm.password}
                  onChange={handleFormChange("password")}
                  required
                  className="w-full text-sm px-3 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-purple-300"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1">Address</label>
                <input
                  type="text"
                  value={adminForm.address}
                  onChange={handleFormChange("address")}
                  className="w-full text-sm px-3 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-purple-300"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={closeAddAdmin}
                  disabled={submitting}
                  className="text-xs font-semibold px-3 py-2 rounded-lg text-gray-500 hover:bg-gray-100 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="text-xs font-semibold px-4 py-2 rounded-lg bg-purple-600 text-white hover:bg-purple-700 transition disabled:opacity-60"
                >
                  {submitting ? "Creating..." : "Create Admin"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Users;
