import { useContext } from "react";
import { AuthContext } from "../contexts/AuthContextProvider";

export const useAuthContextProvider = () => {
  const context = useContext(AuthContext);

  if (!context) {
    throw Error(
      "useAuthContext should be used within the AuthContextProvider "
    );
  }

  return context;
};
