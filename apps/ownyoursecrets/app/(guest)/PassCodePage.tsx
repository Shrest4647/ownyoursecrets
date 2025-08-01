import { Button } from "@/components/ui/button";
import { Text } from "@/components/ui/text";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { View, Alert } from "react-native";
import * as SecureStore from "expo-secure-store";
import { OtpInput } from "@/components/ui/otp";
import { useAuth } from "@/store/auth-context";
import * as LocalAuthentication from "expo-local-authentication";

const PASSCODE_STORAGE_KEY = "userPasscode";

export default function PassCodePage() {
  const [passcode, setPasscode] = useState("");
  const { setIsLoggedIn, biometricEnabled } = useAuth()!;
  const router = useRouter();

  useEffect(() => {
    if (biometricEnabled) {
      handleBiometricLogin();
    }
  }, [biometricEnabled]);

  const handleBiometricLogin = async () => {
    const result = await LocalAuthentication.authenticateAsync({
      promptMessage: "Authenticate to login",
    });
    if (result.success) {
      setIsLoggedIn(true);
      router.replace("/(protected)");
    }
  };

  const handleLogin = async () => {
    try {
      const storedPasscode =
        await SecureStore.getItemAsync(PASSCODE_STORAGE_KEY);
      if (storedPasscode === passcode) {
        setIsLoggedIn(true);
        router.replace("/(protected)");
      } else {
        Alert.alert("Error", "Incorrect passcode");
      }
    } catch (error) {
      console.error("Error reading passcode:", error);
      Alert.alert("Error", "Failed to read passcode.");
    }
  };

  return (
    <View className='flex-1 items-center justify-center p-8 bg-background gap-8'>
      <Text className='text-2xl font-bold mb-5 text-foreground'>
        Enter Passcode
      </Text>
      <View className='w-full items-center'>
        <OtpInput
          value={passcode}
          onTextChange={setPasscode}
          length={4}
          className='mb-5'
        />
      </View>
      <Button
        className='w-full py-4 rounded-xl bg-primary'
        onPress={handleLogin}
      >
        <Text>Login</Text>
      </Button>
      {biometricEnabled && (
        <Button
          variant='secondary'
          className='w-full py-4 rounded-xl mt-4'
          onPress={handleBiometricLogin}
        >
          <Text>Use Biometrics</Text>
        </Button>
      )}
    </View>
  );
}
