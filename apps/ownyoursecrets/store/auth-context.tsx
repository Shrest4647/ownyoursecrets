import * as React from "react";
import * as SecureStore from "expo-secure-store";

import {
  SETUP_COMPLETE_KEY,
  PASSCODE_ENABLED_KEY,
  AGE_SECRET_KEY_STORAGE_KEY,
  GIT_SYNC_ENABLED_KEY,
  BIOMETRIC_ENABLED_KEY,
} from "./constants";

export const AuthContext = React.createContext<{
  setupComplete: boolean;
  setSetupComplete: (value: boolean) => void;
  passcodeEnabled: boolean;
  setPasscodeEnabled: (value: boolean) => void;
  isLoggedIn: boolean;
  setIsLoggedIn: (value: boolean) => void;
  ageSecretKey: string;
  setAgeSecretKey: (value: string) => void;
  resetApp: () => void;
  username: string;
  setUsername: (value: string) => void;
  gitSyncEnabled: boolean;
  setGitSyncEnabled: (value: boolean) => void;
  biometricEnabled: boolean;
  setBiometricEnabled: (value: boolean) => void;
} | null>(null);

export function useAuth() {
  return React.useContext(AuthContext);
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [setupComplete, setSetupCompleteInternal] = React.useState(false);
  const [passcodeEnabled, setPasscodeEnabledInternal] = React.useState(false);
  const [isLoggedIn, setIsLoggedIn] = React.useState(false);
  const [ageSecretKey, setAgeSecretKeyInternal] = React.useState("");
  const [username, setUsernameInternal] = React.useState("");
  const [gitSyncEnabled, setGitSyncEnabledInternal] = React.useState(false);
  const [biometricEnabled, setBiometricEnabledInternal] = React.useState(false);

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
        const ageSecretKeyValue = await SecureStore.getItemAsync(
          AGE_SECRET_KEY_STORAGE_KEY
        );
        if (ageSecretKeyValue) {
          setAgeSecretKey(ageSecretKeyValue);
        }
        const gitSyncValue =
          await SecureStore.getItemAsync(GIT_SYNC_ENABLED_KEY);
        if (gitSyncValue === "true") {
          setGitSyncEnabledInternal(true);
        }
        const biometricValue = await SecureStore.getItemAsync(
          BIOMETRIC_ENABLED_KEY
        );
        if (biometricValue === "true") {
          setBiometricEnabledInternal(true);
        }
        const isLoggedInValue = await SecureStore.getItemAsync("isLoggedIn");
        if (isLoggedInValue === "true") {
          setIsLoggedIn(true);
        }

        const usernameValue = await SecureStore.getItemAsync("username");
        if (usernameValue) {
          setUsernameInternal(usernameValue);
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

  const setGitSyncEnabled = async (value: boolean) => {
    try {
      await SecureStore.setItemAsync(GIT_SYNC_ENABLED_KEY, String(value));
      setGitSyncEnabledInternal(value);
    } catch (error) {
      console.error("Failed to save Git sync enabled state:", error);
    }
  };

  const setBiometricEnabled = async (value: boolean) => {
    try {
      await SecureStore.setItemAsync(BIOMETRIC_ENABLED_KEY, String(value));
      setBiometricEnabledInternal(value);
    } catch (error) {
      console.error("Failed to save biometric enabled state:", error);
    }
  };

  const setAgeSecretKey = async (value: string) => {
    try {
      await SecureStore.setItemAsync(AGE_SECRET_KEY_STORAGE_KEY, value);
      setAgeSecretKeyInternal(value);
    } catch (error) {
      console.error("Failed to save age secret key:", error);
    }
  };
  const setUsername = async (value: string) => {
    try {
      await SecureStore.setItemAsync("username", value);
      setUsernameInternal(value);
    } catch (error) {
      console.error("Failed to save username:", error);
    }
  };

  const resetApp = () => {
    setSetupComplete(false);
    setPasscodeEnabled(false);
    setIsLoggedIn(false);
    setAgeSecretKey("");
    setUsername("");
    setGitSyncEnabled(false);
    setBiometricEnabled(false);
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
        ageSecretKey,
        setAgeSecretKey,
        username,
        setUsername,
        gitSyncEnabled,
        setGitSyncEnabled,
        biometricEnabled,
        setBiometricEnabled,
        resetApp,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
