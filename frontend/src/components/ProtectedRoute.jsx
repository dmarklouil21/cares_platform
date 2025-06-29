import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated } = useAuth();

  return isAuthenticated ? children : <Navigate to="/Login" replace />;
  // return (isAuthenticated && is_superuser) ? children : (isAuthenticated && (is_rhu || is_private)) ? children : isAuthenticated ? children : <Navigate to="/Login" replace />;
};

export default ProtectedRoute;
