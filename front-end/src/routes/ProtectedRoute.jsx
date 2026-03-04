import { useContext } from "react";
import { Navigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useContext(AuthContext);

  if (loading) return null;

  if (!user) {
    return <Navigate to="/login" />;
  }

  if (!user.completeProfile) {
    return <Navigate to="/complete-profile" />;
  }

  if (user.status !== "active") {
    return <Navigate to="/pending" />;
  }

  return children;
};

export default ProtectedRoute;
