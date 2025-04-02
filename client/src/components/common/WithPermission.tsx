/* eslint-disable @typescript-eslint/no-explicit-any */
import React from "react";
import { usePermission } from "@/hooks/use-permission";
import { Navigate } from "react-router-dom";
import { PermissionResource } from "@/types/permissions";
import { toast } from "@/hooks/use-toast";


type WithPermissionProps = {
  resource: keyof PermissionResource;
  action: string;
  fallback?: React.ReactNode;
  redirectTo?: string;
  data?: any;
  children: React.ReactNode;
};

export const WithPermission: React.FC<WithPermissionProps> = ({
  resource,
  action,
  fallback,
  redirectTo,
  data,
  children,
}) => {
  const { hasAccess } = usePermission();
  const hasPermission = hasAccess(resource as any, action as any, data);

  if (!hasPermission) {
    if (redirectTo) {
      toast({
        title: "You don't have permission to access this resource.",
        description: "You will be redirected to the home page.",
        variant: "destructive",
     })
      return <Navigate to={redirectTo} replace />;
    }

    if (fallback) {
      toast({
        title: "You don't have permission to access this resource.",
        description: "You will be redirected to the home page.",
        variant: "destructive",
      })
      return <>{fallback}</>;
    }

  toast({
    title: "You don't have permission to access this resource.",
    description: "You will be redirected to the home page.",
    variant: "destructive",
  })
    return (
      <div className="p-6 text-center">
        <p className="text-red-500">
          You don't have permission to access this resource.
        </p>
      </div>
    );
  }

  return <>{children}</>;
};
