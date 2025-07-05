import * as React from "react";
import * as SecureStore from "expo-secure-store";

import { SETUP_COMPLETE_KEY, PASSCODE_ENABLED_KEY } from "./constants";

export const AuthContext = React.createContext<{
  setupComplete: boolean;
  setSetupComplete: (value: boolean) => void;
  passcodeEnabled: boolean;
  setPasscodeEnabled: (value: boolean) => void;
  isLoggedIn: boolean;
  setIsLoggedIn: (value: boolean) => void;
} | null>(null);

export function useAuth() {
  return React.useContext(AuthContext);
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [setupComplete, setSetupCompleteInternal] = React.useState(false);
  const [passcodeEnabled, setPasscodeEnabledInternal] = React.useState(false);
  const [isLoggedIn, setIsLoggedIn] = React.useState(false);

  React.useEffect(() => {
    const loadAuthStates = async () => {
      try {
        const setupValue = await SecureStore.getItemAsync(SETUP_COMPLETE_KEY);
        if (setupValue === "true") {
          setSetupCompleteInternal(true);
        }
        const passcodeValue =
          await SecureStore.getItemAsync(PASSCODE_ENABLED_KEY);
        if (passcodeValue === "true") {
          setPasscodeEnabledInternal(true);
        }
      } catch (error) {
        console.error("Failed to load auth states:", error);
      }
    };
    loadAuthStates();
  }, []);

  const setSetupComplete = async (value: boolean) => {
    try {
      await SecureStore.setItemAsync(SETUP_COMPLETE_KEY, String(value));
      setSetupCompleteInternal(value);
    } catch (error) {
      console.error("Failed to save setup complete state:", error);
    }
  };

  const setPasscodeEnabled = async (value: boolean) => {
    try {
      await SecureStore.setItemAsync(PASSCODE_ENABLED_KEY, String(value));
      setPasscodeEnabledInternal(value);
    } catch (error) {
      console.error("Failed to save passcode enabled state:", error);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        setupComplete,
        setSetupComplete,
        passcodeEnabled,
        setPasscodeEnabled,
        isLoggedIn,
        setIsLoggedIn,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
