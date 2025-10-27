import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function RequireRole({ role = "admin", children }) {
  const { currentUser } = useAuth();
  if (!currentUser) return <Navigate to="/login" replace />;
  if (currentUser.role !== role) return <Navigate to="/" replace />;
  return children;
}
