import { Navigate, Outlet } from "react-router-dom";
import { isAuthenticated } from "../services/api";

function PublicRoute() {
  if (isAuthenticated()) {
    return <Navigate to="/dashboard" replace />;
  }

  return <Outlet />;
}

export default PublicRoute;
