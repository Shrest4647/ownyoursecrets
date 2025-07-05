import "@/global.css";

import {
  Theme,
  ThemeProvider,
  DefaultTheme,
  DarkTheme,
} from "@react-navigation/native";
import { Stack, useRouter, useSegments } from "expo-router";
import { BottomSheetModalProvider } from "@gorhom/bottom-sheet";
import { StatusBar } from "expo-status-bar";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import * as React from "react";
import { Platform } from "react-native";
import { NAV_THEME } from "@repo/ui/lib/constants";
import { useColorScheme } from "@repo/ui/lib/useColorScheme";

import * as SecureStore from "expo-secure-store";
import { AuthContext } from "@/store/auth-context";

// Placeholder for authentication state
const useAuthLogic = () => {
  const [isSetupComplete, setSetupComplete] = React.useState(false);

  React.useEffect(() => {
    SecureStore.getItemAsync("hasSetupComplete").then((value) => {
      if (value === "true") {
        setSetupComplete(true);
      }
    });
  }, []);

  const setSetupCompleteValue = (value: boolean) => {
    SecureStore.setItemAsync("hasSetupComplete", value.toString());
    setSetupComplete(value);
  };

  return { isSetupComplete, setSetupComplete: setSetupCompleteValue };
};

const LIGHT_THEME: Theme = {
  ...DefaultTheme,
  colors: NAV_THEME.light,
};
const DARK_THEME: Theme = {
  ...DarkTheme,
  colors: NAV_THEME.dark,
};

export {
  // Catch any errors thrown by the Layout component.
  ErrorBoundary,
} from "expo-router";

function Root() {
  const { isSetupComplete } = useAuthLogic();
  const segments = useSegments();
  const router = useRouter();

  React.useEffect(() => {
    const inAuthGroup = segments[0] === "(protected)";

    if (isSetupComplete && !inAuthGroup) {
      router.replace("/(protected)");
    } else if (!isSetupComplete) {
      router.replace("/(guest)");
    }
  }, [isSetupComplete]);

  return <Stack screenOptions={{ headerShown: false }} />;
}

export default function RootLayout() {
  const hasMounted = React.useRef(false);
  const { colorScheme, isDarkColorScheme } = useColorScheme();
  const [isColorSchemeLoaded, setIsColorSchemeLoaded] = React.useState(false);
  const authLogic = useAuthLogic();

  useIsomorphicLayoutEffect(() => {
    if (hasMounted.current) {
      return;
    }

    if (Platform.OS === "web") {
      // Adds the background color to the html element to prevent white background on overscroll.
      document.documentElement.classList.add("bg-background");
    }
    setIsColorSchemeLoaded(true);
    hasMounted.current = true;
  }, []);

  if (!isColorSchemeLoaded) {
    return null;
  }

  return (
    <AuthContext.Provider value={authLogic}>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <BottomSheetModalProvider>
          <ThemeProvider value={isDarkColorScheme ? DARK_THEME : LIGHT_THEME}>
            <StatusBar style={isDarkColorScheme ? "light" : "dark"} />
            <Root />
          </ThemeProvider>
        </BottomSheetModalProvider>
      </GestureHandlerRootView>
    </AuthContext.Provider>
  );
}

const useIsomorphicLayoutEffect =
  Platform.OS === "web" && typeof window === "undefined"
    ? React.useEffect
    : React.useLayoutEffect;
