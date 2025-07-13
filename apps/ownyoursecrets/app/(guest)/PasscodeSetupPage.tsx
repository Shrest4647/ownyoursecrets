import { Button } from "@/components/ui/button";
import { Text } from "@/components/ui/text";
import { View, Alert, Platform, Keyboard } from "react-native";
import { useState } from "react";
import * as SecureStore from "expo-secure-store";
import { KeyboardAvoidingView } from "react-native";
import { useRouter } from "expo-router";
import { useAuth } from "@/store/auth-context";
import { OtpInput } from "@/components/ui/otp";
import * as LocalAuthentication from "expo-local-authentication";

const PASSCODE_STORAGE_KEY = "userPasscode";
const PASSCODE_ENABLED_KEY = "passcodeEnabled";

export default function PasscodeSetupPage() {
  const router = useRouter();
  const auth = useAuth()!;

  const [passcode, setPasscode] = useState<string>("");
  const [confirmPasscode, setConfirmPasscode] = useState<string>("");
  const [isSettingUp, setIsSettingUp] = useState(false);

  const handleSetPasscode = async () => {
    if (passcode.length < 4) {
      Alert.alert("Error", "Passcode must be 4 digits.");
      return;
    }
    if (passcode !== confirmPasscode) {
      Alert.alert("Error", "Passcodes do not match.");
      return;
    }

    setIsSettingUp(true);
    try {
      await SecureStore.setItemAsync(PASSCODE_STORAGE_KEY, passcode);
      await SecureStore.setItemAsync(PASSCODE_ENABLED_KEY, "true");
      auth.setPasscodeEnabled(true);
      auth.setSetupComplete(true);

      const isBiometricSupported = await LocalAuthentication.hasHardwareAsync();
      if (isBiometricSupported) {
        Alert.alert(
          "Enable Biometric Authentication",
          "Would you like to enable biometric authentication for faster login?",
          [
            {
              text: "Yes",
              onPress: async () => {
                const result = await LocalAuthentication.authenticateAsync({
                  promptMessage: "Authenticate to enable biometrics",
                });
                if (result.success) {
                  auth.setBiometricEnabled(true);
                  Alert.alert(
                    "Success",
                    "Biometric authentication enabled."
                  );
                } else {
                  Alert.alert(
                    "Info",
                    "Biometric authentication not enabled. You can enable it later in settings."
                  );
                }
                router.replace("/");
              },
            },
            {
              text: "No",
              onPress: () => router.replace("/"),
              style: "cancel",
            },
          ]
        );
      } else {
        router.replace("/"); // Navigate to home after setting passcode
      }
    } catch (error) {
      console.error("Error setting passcode:", error);
      Alert.alert("Error", "Failed to set passcode.");
    } finally {
      setIsSettingUp(false);
    }
  };

  const handleSkipPasscode = async () => {
    try {
      await SecureStore.setItemAsync(PASSCODE_ENABLED_KEY, "false");
      auth.setPasscodeEnabled(false);
      Alert.alert(
        "Passcode Skipped",
        "You can set up a passcode later in settings."
      );
      router.replace("/"); // Navigate to home after skipping passcode
    } catch (error) {
      console.error("Error skipping passcode:", error);
      Alert.alert("Error", "Failed to skip passcode.");
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      style={{ flex: 1 }}
    >
      <View className='flex-1 bg-background'>
        <View className='flex-1 px-8 py-4 bg-background gap-4'>
          <Text className='text-3xl font-bold mb-8 text-foreground text-center'>
            Set up Passcode
          </Text>

          <View className='flex-1 items-center justify-start gap-6 mb-4'>
            <Text className='text-lg text-muted-foreground text-center'>
              Enter your 4-digit passcode
            </Text>
            <View className='w-full items-center px-4'>
              <OtpInput
                value={passcode}
                onTextChange={setPasscode}
                length={4}
                className='mb-4'
              />
            </View>
            <Text className='text-lg text-muted-foreground text-center'>
              Confirm your 4-digit passcode
            </Text>
            <View className='w-full items-center px-4'>
              <OtpInput
                value={confirmPasscode}
                onTextChange={setConfirmPasscode}
                length={4}
                className='mb-8'
              />
            </View>
            <View className='flex-1 items-center justify-end w-full gap-6 mb-8'>
              <Button
                className='w-full py-4 rounded-full bg-primary'
                onPress={handleSetPasscode}
              >
                <Text className='text-lg text-primary-foreground'>
                  Save Passcode
                </Text>
              </Button>
              <Button
                className='w-full py-4 rounded-full bg-secondary'
                onPress={handleSkipPasscode}
              >
                <Text className='text-lg text-secondary-foreground'>
                  Skip for now
                </Text>
              </Button>
            </View>
          </View>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}
