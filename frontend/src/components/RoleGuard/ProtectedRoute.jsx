import { Navigate } from "react-router-dom";
import { useAuth } from "src/context/AuthContext";

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, user } = useAuth();

  if (!isAuthenticated) return <Navigate to="/beneficiary-login" replace />;

  if (user.is_rhu || user.is_superuser) {
    return <Navigate to="/AccountNotSupported" replace />; // No dedicated page for unauthorized access yet
  }

  return children;
  // return isAuthenticated ? children : <Navigate to="/beneficiary-login" replace />;
  // return (isAuthenticated && is_superuser) ? children : (isAuthenticated && (is_rhu || is_private)) ? children : isAuthenticated ? children : <Navigate to="/Login" replace />;
};

export default ProtectedRoute;
