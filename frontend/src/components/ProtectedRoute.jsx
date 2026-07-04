import { useEffect, useState } from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { getCurrentUser } from "../services/authService";

function ProtectedRoute() {
  const location = useLocation();
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

  if (!isValidSession) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  return <Outlet />;
}

export default ProtectedRoute;
