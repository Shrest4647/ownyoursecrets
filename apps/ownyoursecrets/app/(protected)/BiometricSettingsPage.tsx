import React, { useState, useEffect } from "react";
import { View, Switch, Alert } from "react-native";
import * as LocalAuthentication from "expo-local-authentication";
import { useAuth } from "../../store/auth-context";
import { Text } from "@/components/ui/text";
import { SafeAreaView } from "react-native-safe-area-context";

const BiometricSettingsPage = () => {
  const { biometricEnabled, setBiometricEnabled } = useAuth()!;
  const [isBiometricSupported, setIsBiometricSupported] = useState(false);

  useEffect(() => {
    (async () => {
      const compatible = await LocalAuthentication.hasHardwareAsync();
      setIsBiometricSupported(compatible);
    })();
  }, []);

  const toggleBiometric = async () => {
    if (isBiometricSupported) {
      const newState = !biometricEnabled;
      if (newState) {
        const result = await LocalAuthentication.authenticateAsync({
          promptMessage: "Authenticate to enable biometrics",
        });
        if (result.success) {
          setBiometricEnabled(true);
        } else {
          Alert.alert(
            "Authentication failed",
            "Could not enable biometric authentication."
          );
        }
      } else {
        setBiometricEnabled(false);
      }
    }
  };

  return (
    <SafeAreaView className='flex-1 p-8 bg-background'>
      <View className='flex-1'>
        <Text className='text-3xl font-bold text-foreground mb-5'>
          Biometric Settings
        </Text>
        {isBiometricSupported ? (
          <View className='flex-row items-center justify-between mt-4'>
            <Text className='text-lg text-foreground'>
              Enable Biometric Authentication
            </Text>
            <Switch value={biometricEnabled} onValueChange={toggleBiometric} />
          </View>
        ) : (
          <Text className='text-lg text-muted-foreground mt-4'>
            Biometric authentication is not supported on this device.
          </Text>
        )}
      </View>
    </SafeAreaView>
  );
};

export default BiometricSettingsPage;
