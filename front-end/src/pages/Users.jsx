import React, { useEffect, useState } from "react";
import URLS from "../urls";

const Users = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [roles, setRoles] = useState([]);

  // Fetch all users once
  useEffect(() => {
   fetch(URLS.getAllUsers)
      .then((res) => res.json())
      .then((data) => {
        setUsers(data.data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching users:", err);
        setLoading(false);
      });
  }, []); 

  // Fetch all roles once
  useEffect(() => {
  fetch(URLS.getRoles)
      .then((res) => res.json())
      .then((data) => setRoles(data))
      .catch((err) => console.error("Error fetching roles:", err));
  }, []); 

  // Change role handler
  const handleRoleChange = async (userId, roleId) => {
    console.log("userId", userId);
    console.log("roleId", roleId);

    try {
     fetch(URLS.updateUserRole(userId), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role_id: roleId }),
      });

      const data = await res.json();
      if (data.success) {
        setUsers((prev) =>
          prev.map((user) =>
            user.id === userId
              ? { ...user, role_id: roleId } 
              : user
          )
        );
      } else {
        console.error("Failed to update role:", data.message);
      }
    } catch (err) {
      console.error("Error updating role:", err);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <p className="text-gray-600 text-xl">Loading users...</p>
      </div>
    );
  }

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4 text-center">Users List</h2>
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white border border-gray-300 shadow-md rounded-lg">
          <thead>
            <tr className="bg-gray-100 text-gray-700">
              <th className="py-3 px-4 border-b text-center">ID</th>
              <th className="py-3 px-4 border-b text-left">Name</th>
              <th className="py-3 px-4 border-b text-left">Address</th>
              <th className="py-3 px-4 border-b text-center">Role</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.id} className="hover:bg-gray-50 transition">
                <td className="py-2 px-4 border-b text-center">{user.id}</td>
                <td className="py-2 px-4 border-b text-left">{user.name}</td>
                <td className="py-2 px-4 border-b text-left">{user.address}</td>
                <td className="py-2 px-4 border-b text-center">
                  <select
                    value={user.role_id}
                    onChange={(e) =>
                      handleRoleChange(user.id, parseInt(e.target.value))
                    }
                    className="border border-gray-300 rounded px-2 py-1 focus:outline-none focus:ring focus:ring-blue-200"
                  >
                    {roles.map((role) => (
                      <option key={role.id} value={role.id}>
                        {role.role}
                      </option>
                    ))}
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Users;
