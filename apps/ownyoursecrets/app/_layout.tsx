import "react-native-get-random-values";
import { Buffer } from "buffer";
global.Buffer = Buffer;
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
import { NAV_THEME } from "@/lib/constants";
import { useColorScheme } from "@/lib/useColorScheme";

import { AuthProvider, useAuth } from "@/store/auth-context";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { PortalHost } from "@rn-primitives/portal";

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
  const { setupComplete, passcodeEnabled, isLoggedIn } = useAuth()!;
  const segments = useSegments();
  const router = useRouter();

  React.useEffect(() => {
    const inGuestGroup = segments[0] === "(guest)";
    const inProtectedGroup = segments[0] === "(protected)";
    const inPasscodePage = inGuestGroup && segments.at(1) === "PassCodePage";

    if (!setupComplete) {
      // If setup is not complete, always redirect to the guest flow's root
      if (!inGuestGroup) {
        router.replace("/(guest)");
      }
    } else {
      // setupComplete is true
      if (passcodeEnabled && !isLoggedIn) {
        // If passcode is enabled, and we are not on the passcode page, redirect to it
        if (!inPasscodePage) {
          router.replace("/(guest)/PassCodePage");
        }
      } else {
        // passcodeEnabled is false
        // If passcode is disabled, and we are not in the protected group, redirect to it
        if (!inProtectedGroup) {
          router.replace("/(protected)");
        }
      }
    }
  }, [setupComplete, passcodeEnabled, segments, router]);

  return <Stack screenOptions={{ headerShown: false }} />;
}

export default function RootLayout() {
  const hasMounted = React.useRef(false);
  const { isDarkColorScheme } = useColorScheme();
  const [isColorSchemeLoaded, setIsColorSchemeLoaded] = React.useState(false);

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
    <AuthProvider>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <BottomSheetModalProvider>
          <SafeAreaProvider>
            <ThemeProvider value={isDarkColorScheme ? DARK_THEME : LIGHT_THEME}>
              <StatusBar style={isDarkColorScheme ? "light" : "dark"} />
              <Root />
              <PortalHost />
            </ThemeProvider>
          </SafeAreaProvider>
        </BottomSheetModalProvider>
      </GestureHandlerRootView>
    </AuthProvider>
  );
}

const useIsomorphicLayoutEffect =
  Platform.OS === "web" && typeof window === "undefined"
    ? React.useEffect
    : React.useLayoutEffect;
