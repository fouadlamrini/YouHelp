import { useContext } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";

const READ_ONLY_PATHS = ["/posts", "/knowledge"];

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useContext(AuthContext);
  const { pathname } = useLocation();

  if (loading) return null;

  if (!user) {
    return <Navigate to="/login" />;
  }

  const isReadOnlyPath = READ_ONLY_PATHS.some((p) => pathname.startsWith(p));
  if (isReadOnlyPath) {
    return children;
  }

  if (!user.completeProfile) {
    return <Navigate to="/complete-profile" />;
  }

  if (user.status !== "active") {
    return <Navigate to="/complete-profile" />;
  }

  return children;
};

export default ProtectedRoute;
