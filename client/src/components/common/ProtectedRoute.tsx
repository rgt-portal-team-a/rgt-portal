import React, { useEffect } from "react";
import { useAuthContextProvider } from "../../hooks/useAuthContextProvider";
import { useNavigate, useLocation, Outlet } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ROLE } from "@/types/authUser";
import LoadingSpinner from "@/components/common/LoadingSpinner";

type ProtectedRouteProps = {
  allowedRoles: ROLE[];
  redirectPath?: string;
  loadingComponent?: React.ReactNode;
  unauthorizedComponent?: React.ReactNode;
};

const ProtectedRoute = ({
  allowedRoles,
  redirectPath = "/",
  loadingComponent = (
    <div className="flex items-center justify-center min-h-screen">
      {" "}
      <LoadingSpinner label="Verifying access..." size={40} />{" "}
    </div>
  ),
  unauthorizedComponent,
}: ProtectedRouteProps) => {
  const { currentUser, isLoading, isAuthenticated, isVerifying } =
    useAuthContextProvider();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (!isLoading && !isVerifying) {
      // Skip redirection if coming from verification
      if (location.state?.fromVerify) return;

      if (!isAuthenticated) {
        navigate(redirectPath, {
          state: { from: location.pathname },
          replace: true,
        });
      }
    }
  }, [
    isAuthenticated,
    isLoading,
    isVerifying,
    navigate,
    redirectPath,
    location,
  ]);

  if (isLoading || isVerifying) {
    return <>{loadingComponent}</>;
  }

  // Bypass checks if coming from verification
  if (location.state?.fromVerify && currentUser) {
    return <Outlet />;
  }

  const hasRequiredRole =
    currentUser && allowedRoles.includes(currentUser.role.name);

  const fallbackUnauthorizedComponent = (
    <div className="flex flex-col justify-center items-center h-screen gap-4">
      <h2 className="text-2xl font-bold">Permission Denied</h2>
      <p className="text-gray-600">
        You don't have permission to access this page
      </p>
      <Button
        onClick={() => navigate(redirectPath)}
        className="bg-blue-500 hover:bg-blue-600 text-white"
      >
        Go to Login
      </Button>
    </div>
  );

  if (!hasRequiredRole) {
    return <>{unauthorizedComponent || fallbackUnauthorizedComponent}</>;
  }

  return <Outlet />;
};

export default ProtectedRoute;
