import React, { useEffect} from 'react'
import {useAuthContextProvider} from '../../hooks/useAuthContextProvider'
import { useNavigate, useLocation, Outlet } from 'react-router-dom';
import {Button} from "@/components/ui/button"
import { ROLE } from '@/types/authUser';

type ProtectedRouteProps = {
    allowedRoles: ROLE[];
    redirectPath?: string;
    loadingComponent?: React.ReactNode;
    unauthorizedComponent?: React.ReactNode;
};


const ProtectedRoute = ({
  allowedRoles,
  redirectPath = '/',
  loadingComponent = <div className="flex justify-center items-center h-screen">Loading...</div>,
  unauthorizedComponent 
}: ProtectedRouteProps) => {

  const { currentUser, isLoading, isAuthenticated } = useAuthContextProvider();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      navigate(redirectPath, {
        state: { from: location.pathname },
        replace: true
      });
    }
  }, [isAuthenticated, isLoading, navigate, redirectPath, location]);

  if (isLoading) {
    return <>{loadingComponent}</>;
  }

  // Check if user has permission based on their role
  // Assuming currentUser.role is an object with a name property as defined in your types
  const hasRequiredRole = currentUser && allowedRoles.includes(currentUser.role.name);

  const fallbackUnauthorizedComponent = 
      <div className="flex flex-col justify-center items-center h-screen">
        Permission Denied! You don't have permission to access this page
        <Button
          onClick={() => navigate(`/`)}
          className="bg-blue-500 hover:bg-blue-600 text-white"
        >
          Go to Login
        </Button>
      </div>
    
  // Return unauthorized component if user doesn't have required role
  if (!hasRequiredRole) {
    return <>{unauthorizedComponent || fallbackUnauthorizedComponent }</>;
  }

  return <Outlet />;
};

export default ProtectedRoute;
  


