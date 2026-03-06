import React, { useEffect, useState } from "react";
import URLS from "../urls";
import { Trash2, Users as UsersIcon, ChevronDown, Shield, User } from "lucide-react";

const Users = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  const rolesOptions = [
    { id: "admin", name: "Admin" },
    { id: "customer", name: "Customer" },
  ];

  useEffect(() => {
    fetch(URLS.getAllUsers)
      .then((res) => res.json())
      .then((data) => { setUsers(data.data); setLoading(false); })
      .catch((err) => { console.error("Error fetching users:", err); setLoading(false); });
  }, []);

  const handleRoleChange = async (userId, newRole) => {
    try {
      const res = await fetch(URLS.updateUserRole(userId), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role: newRole }),
      });
      const data = await res.json();
      if (data.success) {
        setUsers((prev) => prev.map((user) => user.id === userId ? { ...user, role: newRole } : user));
      } else { alert("Update failed: " + data.message); }
    } catch (err) { console.error("Error updating role:", err); }
  };

  const handleDelete = async (userId) => {
    if (!window.confirm("Are you sure you want to delete this user?")) return;
    try {
      const res = await fetch(URLS.deleteUser(userId), { method: "DELETE" });
      const data = await res.json();
      if (data.success) setUsers((prev) => prev.filter((user) => user.id !== userId));
      else alert("Delete failed: " + data.message);
    } catch (err) { console.error("Error deleting user:", err); }
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
        <div className="flex gap-2">
          <span className="text-xs bg-purple-50 text-purple-600 font-semibold px-3 py-1.5 rounded-lg border border-purple-100">
            {users.filter((u) => u.role === "admin").length} Admins
          </span>
          <span className="text-xs bg-gray-100 text-gray-600 font-semibold px-3 py-1.5 rounded-lg border border-gray-200">
            {users.filter((u) => u.role === "customer").length} Customers
          </span>
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

                {/* Role Dropdown */}
                <td className="px-4 py-3">
                  <div className="relative w-fit">
                    <select
                      value={user.role}
                      onChange={(e) => handleRoleChange(user.id, e.target.value)}
                      className={`appearance-none text-xs font-semibold px-3 py-1.5 pr-7 rounded-lg border-0 cursor-pointer focus:outline-none focus:ring-2 focus:ring-purple-300 transition ${user.role === "admin"
                          ? "bg-purple-50 text-purple-700"
                          : "bg-gray-100 text-gray-600"
                        }`}
                    >
                      {rolesOptions.map((opt) => (
                        <option key={opt.id} value={opt.id}>{opt.name}</option>
                      ))}
                    </select>
                    <ChevronDown size={10} className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none opacity-40" />
                  </div>
                </td>

                {/* Delete */}
                <td className="px-4 py-3 text-center">
                  <button
                    onClick={() => handleDelete(user.id)}
                    className="p-1.5 rounded-lg text-gray-300 hover:text-red-500 hover:bg-red-50 transition"
                    title="Delete User"
                  >
                    <Trash2 size={15} />
                  </button>
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
    </div>
  );
};

export default Users;
