import { useAuth } from "./context/authContext";
import { Navigate, useLocation } from "react-router-dom";
import Loading from "./components/ui/loading";

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) return <Loading />; // wait until AuthProvider finishes

  if (!user) return <Navigate to="/login" state={{ from: location }} replace />;

  return children;
};

export default ProtectedRoute;
