/* eslint-disable @typescript-eslint/no-explicit-any */
import { useQuery, UseQueryOptions, QueryKey } from "@tanstack/react-query";
import { usePermission } from "../../hooks/use-permission";
import { QueryClient } from "@tanstack/react-query";
import { PermissionResource } from "@/types/permissions";

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      staleTime: 5 * 60 * 1000,
      retry: 3,
    },
  },
});

export function useRbacQuery<TData, TError = unknown>(
  resource: keyof PermissionResource,
  action: string,
  queryKey: QueryKey,
  queryFn: () => Promise<TData>,
  options?: Omit<
    UseQueryOptions<TData, TError, TData, QueryKey>,
    "queryKey" | "queryFn"
  >,
  dataForPermissionCheck?: any
) {
  
  const { hasAccess } = usePermission();

  const hasPermission = hasAccess(
    resource as any,
    action as any,
    dataForPermissionCheck
  );

  return useQuery<TData, TError>({
    queryKey,
    queryFn,
    ...options,
    enabled: hasPermission && options?.enabled !== false,
    meta: {
      ...options?.meta,
      permissionChecked: true,
      resource,
      action,
      hasPermission,
    },
  });
}

export function usePrefetchWithPermission() {
  const { hasAccess } = usePermission();

  return {
    prefetchIfAllowed: <TData>(
      resource: keyof PermissionResource,
      action: string,
      queryKey: QueryKey,
      queryFn: () => Promise<TData>,
      dataForPermissionCheck?: any
    ) => {
      if (hasAccess(resource as any, action as any, dataForPermissionCheck)) {
        return queryClient.prefetchQuery({
          queryKey,
          queryFn,
        });
      }
      return Promise.resolve();
    },
  };
}
