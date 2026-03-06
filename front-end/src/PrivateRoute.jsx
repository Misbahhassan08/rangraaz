// src/PrivateRoute.jsx
import { Navigate } from "react-router-dom";

export default function PrivateRoute({ children, adminOnly = false }) {
  const user = localStorage.getItem("user");
  
  if (!user) return <Navigate to="/login" />;

  try {
    const parsed = JSON.parse(user);
    const role = parsed.role ? parsed.role.toLowerCase() : "";

    if (adminOnly && role !== "admin") {
      return <Navigate to="/" />;
    }

  } catch (err) {
    console.error("Invalid user data:", err);
    localStorage.removeItem("user");
    return <Navigate to="/login" />;
  }

  return children;
}