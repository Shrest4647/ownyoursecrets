import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Text } from "@/components/ui/text";
import { View, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { useState } from "react";
import * as SecureStore from "expo-secure-store";
import * as FileSystem from "expo-file-system";
import * as Sharing from "expo-sharing";
import { useAuth } from "@/store/auth-context";
import { ClipboardIcon } from "lucide-react-native";
import * as Clipboard from "expo-clipboard";

export default function SettingsPage() {
  const router = useRouter();

  const {
    ageSecretKey,
    resetApp,
    username: authUsername,
    setUsername: authSetUsername,
  } = useAuth()!;
  const [username, setUsername] = useState(authUsername || "");

  const handleUsernameChange = async () => {
    authSetUsername(username);

    Alert.alert("Success", "Username updated successfully!");
  };

  const handleShareAgeKey = async () => {
    if (!(await Sharing.isAvailableAsync())) {
      Alert.alert("Error", "Sharing is not available on your device.");
      return;
    }
    if (ageSecretKey) {
      const fileUri = FileSystem.cacheDirectory + "age-secret-key.txt";
      try {
        await FileSystem.writeAsStringAsync(fileUri, ageSecretKey, {
          encoding: FileSystem.EncodingType.UTF8,
        });
        await Sharing.shareAsync(fileUri, {
          mimeType: "text/plain",
          dialogTitle: "Share Age Secret Key",
        });
      } catch (error) {
        console.error("Failed to share age key:", error);
        Alert.alert("Error", "Failed to share age key.");
      }
    } else {
      Alert.alert("Error", "Age secret key not found.");
    }
  };

  const handleCopyAgeKey = async () => {
    if (ageSecretKey) {
      await Clipboard.setStringAsync(ageSecretKey);
      Alert.alert("Success", "Age secret key copied to clipboard.");
    } else {
      Alert.alert("Error", "Age secret key not found.");
    }
  };

  const handleResetApp = async () => {
    Alert.alert(
      "Reset App",
      "Are you sure you want to reset the app? All your secrets and settings will be deleted.",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Reset",
          onPress: async () => {
            try {
              // Clear SecureStore
              await SecureStore.deleteItemAsync("passcode");
              await SecureStore.deleteItemAsync("ageSecretKey");

              // Delete vault directory
              const vaultDirectory = `${FileSystem.documentDirectory}vault/`;
              const dirInfo = await FileSystem.getInfoAsync(vaultDirectory);
              if (dirInfo.exists) {
                await FileSystem.deleteAsync(vaultDirectory, {
                  idempotent: true,
                });
              }

              resetApp(); // Clear auth context
              router.replace("/"); // Go back to the initial onboarding page
            } catch (error) {
              console.error("Failed to reset app:", error);
              Alert.alert("Error", "Failed to reset app.");
            }
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView className='flex-1 p-8 bg-background'>
      <View className='flex-1'>
        <Text className='text-3xl font-bold text-foreground mb-5'>
          Settings
        </Text>

        <View className='mb-8 gap-4'>
          <Text className='text-lg font-semibold text-foreground mb-2'>
            Username
          </Text>
          <Input
            placeholder='Enter your username'
            value={username}
            onChangeText={setUsername}
            className='mb-2'
          />
          <Button
            variant='secondary'
            className='rounded-full'
            onPress={handleUsernameChange}
          >
            <Text>Update Username</Text>
          </Button>
        </View>

        <View className='mb-8 gap-4'>
          <Text className='text-lg font-semibold text-foreground mb-2'>
            Age Secret Key
          </Text>
          <Text className='text-muted-foreground mb-2 break-all border border-muted-foreground rounded-md p-2'>
            {ageSecretKey || "Not set"}
          </Text>
          <View className='flex-row items-center justify-between gap-4'>
            <Button
              variant='secondary'
              className='rounded-full w-[50%]'
              onPress={handleShareAgeKey}
              disabled={!ageSecretKey}
            >
              <Text>Share Age Key</Text>
            </Button>
            <Button
              className='rounded-full w-[50%] flex-row gap-2 items-center justify-center'
              onPress={handleCopyAgeKey}
              disabled={!ageSecretKey}
            >
              <ClipboardIcon size={20} color='white' />
              <Text>Copy Key</Text>
            </Button>
          </View>
        </View>

        <View className='mb-8 gap-4'>
          <Text className='text-lg font-semibold text-foreground mb-2'>
            Danger Zone
          </Text>
          <Button
            className='rounded-full'
            variant='destructive'
            onPress={handleResetApp}
          >
            <Text>Reset App</Text>
          </Button>
        </View>
      </View>
    </SafeAreaView>
  );
}
