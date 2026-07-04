import { useEffect, useState } from "react";
import { Navigate, Outlet } from "react-router-dom";
import { getCurrentUser } from "../services/authService";

function PublicRoute() {
  const [isValidSession, setIsValidSession] = useState(null);

  useEffect(() => {
    let isMounted = true;

    const validateSession = async () => {
      try {
        await getCurrentUser();

        if (isMounted) {
          setIsValidSession(true);
        }
      } catch (error) {
        if (isMounted) {
          setIsValidSession(false);
        }
      }
    };

    validateSession();

    return () => {isMounted = false;};
  }, []);

  if (isValidSession === null) {
    return null;
  }

  if (isValidSession) {
    return <Navigate to="/dashboard" replace />;
  }

  return <Outlet />;
}

export default PublicRoute;
