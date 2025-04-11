import { createContext, PropsWithChildren, useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../state/store";
import { useCurrentUser } from "@/api/query-hooks/auth.hooks";
import { LOGOUT, SETCURRENTUSER } from "@/state/authState/authSlice";
import { User } from "@/types/authUser";
import { authService } from "@/api/services/auth.service";
import toastService from "@/api/services/toast.service";

interface AuthContextType {
  currentUser: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  isVerifying: boolean;
  error: Error | null;
  logout: () => Promise<void>;
  setIsVerifying: (isVerifying: boolean) => void;
}

export const AuthContext = createContext<AuthContextType | undefined>(
  undefined
);

type AuthProviderProps = PropsWithChildren;

const AuthContextProvider = ({ children }: AuthProviderProps) => {
  const dispatch = useDispatch();
  const { currentUser } = useSelector((state: RootState) => state.authState);
  const [isLoading, setIsLoading] = useState(true);
  const [isVerifying, setIsVerifying] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const { data: fetchedUser, status, error: fetchError } = useCurrentUser();

  const logout = async () => {
    try {
      await authService.logout();
      dispatch(SETCURRENTUSER({ currentUser: null }));
      dispatch(LOGOUT());
      localStorage.removeItem("token");
      setIsVerifying(false);
    } catch (error) {
      setError(error instanceof Error ? error : new Error("Failed to logout"));
      toastService.error("Failed to Log out of portal");
    }
  };

  useEffect(() => {
    if (status === "success" && fetchedUser?.id) {
      console.log(`${fetchedUser.username} is loggedIn🎉`);
      dispatch(
        SETCURRENTUSER({
          currentUser: {
            ...fetchedUser,
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

      toastService.error(
        "Failed to authenticate. Please try logging in again."
      );
      setIsLoading(false);
    } else if (status === "pending") {
      setIsLoading(true);
    } else {
      setIsLoading(false);
    }
  }, [status, fetchedUser, fetchError, dispatch]);

  const contextValue: AuthContextType = {
    currentUser: currentUser || null,
    isLoading,
    isAuthenticated: !!currentUser,
    isVerifying,
    error,
    logout,
    setIsVerifying,
  };

  return (
    <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>
  );
};

export default AuthContextProvider;
