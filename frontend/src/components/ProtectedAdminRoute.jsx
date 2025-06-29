import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const ProtectedAdminRoute = ({ children }) => {
  const { isAuthenticated, user } = useAuth();

  if (!isAuthenticated) return <Navigate to="/Login" replace />;

  if (!user.is_superuser) {
    return <Navigate to="/Unauthorized" replace />; // No dedicated page for unauthorized access yet
  }

  return children;
};

export default ProtectedAdminRoute;
