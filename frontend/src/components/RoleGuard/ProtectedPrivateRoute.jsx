import { Navigate } from "react-router-dom";
import { useAuth } from "src/context/AuthContext";

const ProtectedPrivateRoute = ({ children }) => {
  const { isAuthenticated, user } = useAuth();

  if (!isAuthenticated) return <Navigate to="/private-login" replace />;

  if (!user.is_private) {
    return <Navigate to="/AccountNotSupported" replace />; // No dedicated page for unauthorized access yet
  }

  return children;
};

export default ProtectedPrivateRoute;
