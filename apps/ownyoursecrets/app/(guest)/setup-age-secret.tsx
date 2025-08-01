import { Button } from "@/components/ui/button";
import { Text } from "@/components/ui/text";
import { View, Alert, Platform, Keyboard } from "react-native";
import { Sheet, useSheetRef } from "@/components/ui/Sheet";
import { Key, Upload, Clipboard as ClipboardIcon } from "lucide-react-native";
import { useState } from "react";
import * as Clipboard from "expo-clipboard";
import { BottomSheetView, BottomSheetTextInput } from "@gorhom/bottom-sheet";
import { KeyboardAvoidingView } from "react-native";
import { useAuth } from "@/store/auth-context";
import { useRouter } from "expo-router";
import { generateIdentity } from "@/lib/crypto";

export default function AgeSecretKeySetupPage() {
  const auth = useAuth();
  const bottomSheetRef = useSheetRef();
  const router = useRouter();

  const [secretKeyInput, setSecretKeyInput] = useState(
    auth?.ageSecretKey || ""
  );
  const [isGenerating, setIsGenerating] = useState(false);
  const [keySaved, setKeySaved] = useState(false);
  const [displayObscuredKey, setDisplayObscuredKey] = useState(
    auth?.ageSecretKey !== ""
  );

  const generateNewKey = async () => {
    setIsGenerating(true);
    try {
      const generatedKey = await generateIdentity();
      setSecretKeyInput(generatedKey);
      bottomSheetRef.current?.expand();
      bottomSheetRef.current?.present();
    } catch (error) {
      console.error("Error generating key:", error);
      Alert.alert("Error", "Failed to generate key.");
    } finally {
      setIsGenerating(false);
    }
  };

  const importExistingKey = () => {
    setSecretKeyInput("");
    bottomSheetRef.current?.present();
  };

  const saveSecretKey = async () => {
    if (!secretKeyInput.trim()) {
      Alert.alert("Error", "Secret key cannot be empty.");
      return;
    }
    try {
      auth?.setAgeSecretKey(secretKeyInput);
      setKeySaved(true);
      setDisplayObscuredKey(true);
      Alert.alert("Success", "Secret key saved securely!");
      bottomSheetRef.current?.close();
      setTimeout(() => {
        router.replace("/PasscodeSetupPage");
      }, 1000);
    } catch (error) {
      console.error("Error saving key:", error);
      Alert.alert("Error", "Failed to save secret key.");
    }
  };

  const copyToClipboard = async () => {
    await Clipboard.setStringAsync(secretKeyInput);
    Alert.alert("Copied!", "Secret key copied to clipboard.");
  };

  const finishSetup = () => {
    if (keySaved) {
      router.replace("/PasscodeSetupPage");
    } else {
      Alert.alert("Warning", "Please generate or import a secret key first.");
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      style={{ flex: 1 }}
    >
      <View className='flex-1 p-8 pt-4 bg-background gap-4'>
        <View className='flex-1 p-2 bg-background gap-4'>
          <Text className='text-3xl font-bold mb-4 text-foreground text-center'>
            Set up Encryption Key
          </Text>
          <Text className='text-lg text-muted-foreground text-center mb-8'>
            This key encrypts and decrypts your secrets.
          </Text>

          <Text className='text-base text-muted-foreground text-center mb-8'>
            Losing this key means losing access to your secrets. Keep it safe
            and backed up!
          </Text>
          <View className='mb-8 mt-8 w-full items-center'>
            <Button
              className='w-full py-4 rounded-full flex-row items-center justify-center gap-4 bg-primary'
              onPress={generateNewKey}
              disabled={isGenerating}
            >
              <Key size={20} className='text-primary-foreground' />
              <Text className='text-lg text-primary-foreground'>
                {isGenerating ? "Generating..." : "Generate New Key"}
              </Text>
            </Button>
            <Text className='text-center text-sm text-muted-foreground mt-3'>
              Create a brand new, secure encryption key.
            </Text>
          </View>

          <View className='mb-8 items-center'>
            <Button
              className='w-full py-4 rounded-full flex-row items-center justify-center gap-4 bg-secondary'
              onPress={importExistingKey}
            >
              <Upload size={20} className='text-secondary-foreground' />
              <Text className='text-lg text-secondary-foreground'>
                Import Existing Key
              </Text>
            </Button>
            <Text className='text-center text-sm text-secondary-foreground mt-3'>
              Use a key you've already generated or backed up.
            </Text>
          </View>
          <View className='mb-8 items-center'>
            {displayObscuredKey && (
              <Text className='text-lg text-foreground mb-4'>
                Secret Key: {"*".repeat(secretKeyInput.length)}
              </Text>
            )}
            <Button
              className={`w-full py-4 rounded-full bg-accent ${!keySaved ? "opacity-50 pointer-events-none" : ""}`}
              onPress={finishSetup}
              disabled={!keySaved}
            >
              <Text className='text-lg text-accent-foreground'>Next</Text>
            </Button>

            {!keySaved && (
              <Text className='text-center text-sm text-secondary-foreground mt-3'>
                Please save your key to continue.
              </Text>
            )}
          </View>

          <Sheet
            ref={bottomSheetRef}
            snapPoints={["50%", "70%", "90%"]}
            keyboardBehavior='interactive'
          >
            <BottomSheetView className='flex-1 pb-8'>
              <View className='flex-1 p-4 mt-4'>
                <View className='flex gap-2 mb-8'>
                  <Text className='text-lg font-bold mt-8 text-foreground text-center mb-4'>
                    Your Age Secret Key
                  </Text>

                  <BottomSheetTextInput
                    className='w-full border border-gray-300 rounded-md p-4 mb-4 text-foreground'
                    multiline
                    placeholder='Enter your age secret key here...'
                    placeholderTextColor='#999'
                    value={secretKeyInput}
                    clearButtonMode='while-editing'
                    onChangeText={setSecretKeyInput}
                  />
                </View>
                <View className='flex justify-center gap-4'>
                  <Button
                    className='w-full py-4 rounded-full flex-row items-center justify-center bg-blue-400 gap-4'
                    onPress={copyToClipboard}
                  >
                    <ClipboardIcon
                      size={20}
                      className='text-muted-foreground'
                    />
                    <Text className='text-muted-foreground'>
                      Copy to Clipboard
                    </Text>
                  </Button>
                  <Button
                    className='w-full py-4 rounded-full flex-row items-center justify-center bg-green-400 gap-4'
                    onPress={() => {
                      Keyboard.dismiss();
                      saveSecretKey();
                    }}
                  >
                    <Text className='text-muted-foreground'>Save Key</Text>
                  </Button>
                  <Button
                    className='w-full py-4 rounded-full flex-row items-center justify-center bg-red-400 gap-4'
                    onPress={() => {
                      Keyboard.dismiss();
                      bottomSheetRef.current?.close();
                    }}
                  >
                    <Text className='text-muted-foreground'>Cancel</Text>
                  </Button>
                </View>
              </View>
            </BottomSheetView>
          </Sheet>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}
