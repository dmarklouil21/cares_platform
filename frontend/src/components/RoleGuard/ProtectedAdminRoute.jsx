import { Navigate } from "react-router-dom";
import { useAuth } from "src/context/AuthContext";

const ProtectedAdminRoute = ({ children }) => {
  const { isAuthenticated, user } = useAuth();

  if (!isAuthenticated) return <Navigate to="/admin-login" replace />;

  if (!user.is_superuser) {
    return <Navigate to="/AccountNotSupported" replace />; // No dedicated page for unauthorized access yet
  }

  return children;
};

export default ProtectedAdminRoute;
