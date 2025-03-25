/* eslint-disable @typescript-eslint/no-explicit-any */
import React from "react";
import { usePermission } from "@/hooks/use-permission";
import { PermissionResource } from "@/types/permissions";

export const usePermissionData = <T,>(
  resource: keyof PermissionResource,
  action: string,
  dataFn: () => Promise<T>,
  options?: {
    enabled?: boolean;
    onSuccess?: (data: T) => void;
    onError?: (error: unknown) => void;
  },
  permissionData?: any
) => {
  const { hasAccess } = usePermission();
  const hasPermission = hasAccess(
    resource as any,
    action as any,
    permissionData
  );

  const [data, setData] = React.useState<T | null>(null);
  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState<unknown>(null);

  React.useEffect(() => {
    if (!hasPermission || options?.enabled === false) return;

    const fetchData = async () => {
      setIsLoading(true);
      try {
        const result = await dataFn();
        setData(result);
        options?.onSuccess?.(result);
      } catch (err) {
        setError(err);
        options?.onError?.(err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [hasPermission, JSON.stringify(permissionData), options?.enabled]);

  return { data, isLoading, error, hasPermission };
};
