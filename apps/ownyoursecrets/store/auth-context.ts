import * as React from "react";

export const AuthContext = React.createContext<{
  setSetupComplete: (value: boolean) => void;
} | null>(null);

export function useAuth() {
  return React.useContext(AuthContext);
}
