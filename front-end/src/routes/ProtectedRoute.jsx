import { useContext } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";

const READ_ONLY_PATHS = ["/posts", "/knowledge"];
const STAFF_ONLY_PATHS = ["/users", "/admin/campus", "/admin/level", "/admin/class"];

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

  const roleName = user?.role?.name ?? user?.role;
  const isEtudiant = roleName === "etudiant";
  const isFormateur = roleName === "formateur";

  // Pages réservées au staff (super_admin, admin, formateur) : interdite aux étudiants
  const isStaffOnlyPath = STAFF_ONLY_PATHS.some((p) => pathname.startsWith(p));
  if (isStaffOnlyPath && isEtudiant) {
    return <Navigate to="/posts" />;
  }

  // Page /Shedule réservée uniquement au formateur
  if (pathname.startsWith("/Shedule") && !isFormateur) {
    return <Navigate to="/posts" />;
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
