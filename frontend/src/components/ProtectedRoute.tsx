import { Navigate } from "react-router-dom";
import { ACCESS_TOKEN_KEY, isTokenExpired } from "../utils/auth";

interface ProtectedRouteProps {
  children: React.ReactNode;
}

function ProtectedRoute({ children }: ProtectedRouteProps) {
  const token = localStorage.getItem(ACCESS_TOKEN_KEY);

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  if (isTokenExpired(token)) {
    return <Navigate to="/login?session=expired" replace />;
  }

  return children;
}

export default ProtectedRoute;