import { createContext, PropsWithChildren, useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../state/store";
import { useCurrentUser } from "@/api/query-hooks/auth.hooks";
import { LOGOUT, SETCURRENTUSER } from "@/state/authState/authSlice";
import LoadingSpinner from "@/components/common/LoadingSpinner";
import { User } from "@/types/authUser";
import { authService } from "@/api/services/auth.service";
import { toast } from "@/hooks/use-toast";

// Define proper types for the context
interface AuthContextType {
  currentUser: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  error: Error | null;
  logout: () => Promise<void>;
}

// Create context with a default value matching the type
export const AuthContext = createContext<AuthContextType | undefined>(
  undefined
);

type AuthProviderProps = PropsWithChildren;

const AuthContextProvider = ({ children }: AuthProviderProps) => {
  const dispatch = useDispatch();
  const { currentUser } = useSelector((state: RootState) => state.authState);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  // Use React Query for fetching user data
  const { data: fetchedUser, status, error: fetchError } = useCurrentUser();

  // Handle logout
  const logout = async () => {
    try {
      // Call your logout API here if needed
      await authService.logout();

      // Update Redux state
      dispatch(SETCURRENTUSER({ currentUser: null }));
      dispatch(LOGOUT());

      // Optionally clear any tokens from localStorage
      localStorage.removeItem("token");
    } catch (error) {
      setError(error instanceof Error ? error : new Error("Failed to logout"));
      toast({
        title: "Error",
        description: "Failed to Log out of portal",
        variant: "destructive",
      });
    }
  };

  // Effect to sync React Query data with Redux
  useEffect(() => {
    if (status === "success" && fetchedUser?.id) {
      console.log(`${fetchedUser.username} is loggedIn🎉`);
      console.log(`Fetched User is loggedIn🎉`, fetchedUser);
      dispatch(
        SETCURRENTUSER({
          currentUser: {
            ...fetchedUser,
            role: {
              ...fetchedUser.role,
              name: fetchedUser.role.name.toUpperCase(),
            },
          },
        })
      );
      setIsLoading(false);
    } else if (status === "error") {
      console.error("Error fetching user:", fetchError);
      setError(
        fetchError instanceof Error
          ? fetchError
          : new Error("Failed to fetch user")
      );
      setIsLoading(false);
    } else if (status === "pending") {
      setIsLoading(true);
    } else {
      setIsLoading(false);
      logout();
    }
  }, [status, fetchedUser, fetchError, dispatch]);

  // Construct the context value
  const contextValue: AuthContextType = {
    currentUser: currentUser || null,
    isLoading,
    isAuthenticated: !!currentUser,
    error,
    logout,
  };

  // Show loading state only during initial load
  if (isLoading && !currentUser) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner label="Fetching User data..." size={32} />
      </div>
    );
  }

  return (
    <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>
  );
};

export default AuthContextProvider;
