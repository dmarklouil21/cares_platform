import { Navigate } from "react-router-dom";
import { useAuth } from "src/context/AuthContext";

const ProtectedAuthenticatedRoute = ({ children }) => {
  const { isAuthenticated } = useAuth();
  
  if (!isAuthenticated) return <Navigate to="/beneficiary-login" replace />;
  return children;
};

export default ProtectedAuthenticatedRoute;
