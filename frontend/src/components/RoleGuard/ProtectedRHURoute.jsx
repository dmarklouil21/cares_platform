import { Navigate } from "react-router-dom";
import { useAuth } from "src/context/AuthContext";

const ProtectedRHURoute = ({ children }) => {
  const { isAuthenticated, user } = useAuth();

  if (!isAuthenticated) return <Navigate to="/rhu-login" replace />;

  if (!user.is_rhu) {
    return <Navigate to="/AccountNotSupported" replace />; // No dedicated page for unauthorized access yet
  }

  return children;
};

export default ProtectedRHURoute;
