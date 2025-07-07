import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Text } from "@/components/ui/text";
import { useLocalSearchParams, useRouter } from "expo-router";
import { generatePassword } from "@/lib/crypto";
import * as Clipboard from "expo-clipboard";
import React, { useState, useEffect } from "react";
import { View, Alert, Pressable } from "react-native";
import { getSecret, editSecret } from "../../lib/vault";
import { useAuth } from "@/store/auth-context";
import { ClipboardIcon, DicesIcon, Eye, EyeOff } from "lucide-react-native";
import { commitAndPush } from "@/lib/git";

export default function EditPassPage() {
  const router = useRouter();
  const { secretName: secretNameParam } = useLocalSearchParams<{
    secretName: string;
  }>();
  const { ageSecretKey } = useAuth()!;

  const [secretName, setSecretName] = useState(secretNameParam);
  const [password, setPassword] = useState("");
  const [notes, setNotes] = useState("");
  const [metadata, setMetadata] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    const loadSecret = async () => {
      if (!ageSecretKey || !secretNameParam) {
        return;
      }
      try {
        const result = await getSecret(secretNameParam, ageSecretKey);
        if (result) {
          setPassword(result.secretData || "");
          setMetadata(result.storedSecret.metadata);
        } else {
          Alert.alert("Error", "Secret not found.");
          router.back();
        }
      } catch (error) {
        console.error("Failed to load secret:", error);
        Alert.alert("Error", "Failed to load secret.");
        router.back();
      }
    };
    loadSecret();
  }, [secretNameParam, ageSecretKey, router]);

  const handleSave = async () => {
    if (!ageSecretKey) {
      Alert.alert("Error", "Age secret key not found.");
      return;
    }
    if (!secretName.trim()) {
      Alert.alert("Error", "Secret name cannot be empty.");
      return;
    }

    try {
      await editSecret(
        secretName.trim(),
        password.trim(),
        metadata.trim(),
        ageSecretKey
      );
      commitAndPush(`Update secret: ${secretName}`);
      Alert.alert("Success", `Secret '${secretName}' updated successfully!`);
      router.back();
    } catch (error: any) {
      Alert.alert("Error", `Failed to update secret: ${error.message}`);
    }
  };

  return (
    <View className='flex-1 p-5 bg-background justify-between'>
      <View className='p-2'>
        <Text className='text-3xl font-bold text-foreground mb-8'>
          Edit Secret
        </Text>

        <View className='mb-5'>
          <Text className='text-base font-medium text-muted-foreground mb-2'>
            Secret Name
          </Text>
          <View className='flex-row items-center rounded-md bg-card'>
            <Input
              className='flex-1 text-base text-foreground'
              value={secretName}
              editable={false}
            />
            <Text className='text-base text-muted-foreground font-medium p-2'>
              .json
            </Text>
          </View>
        </View>

        <View className='mb-5 gap-4'>
          <Text className='text-base font-medium text-muted-foreground mb-2'>
            Password
          </Text>
          <View className='flex-row items-center rounded-md bg-card'>
            <View className='flex-row items-center'>
              <Input
                className='flex-1 text-base text-foreground'
                placeholder='Enter your password'
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
              />

              <Button
                variant='ghost'
                onPress={() => setShowPassword(!showPassword)}
                className='p-2'
              >
                {showPassword ? (
                  <EyeOff size={20} className='text-foreground' />
                ) : (
                  <Eye size={20} className='text-foreground' />
                )}
              </Button>
            </View>
          </View>
          <View className='flex-row items-center justify-between gap-4'>
            <Button
              variant='ghost'
              className='w-[50%]'
              onPress={() => setPassword(generatePassword())}
            >
              <DicesIcon size={32} className='text-foreground' />
            </Button>
            <Button
              variant='ghost'
              className='w-[50%]'
              onPress={() => Clipboard.setStringAsync(password)}
            >
              <ClipboardIcon size={32} color={"#111"} />
            </Button>
          </View>
        </View>

        <View className='mb-5'>
          <Text className='text-base font-medium text-muted-foreground mb-2'>
            Notes / Metadata
          </Text>
          <Input
            className='text-base text-foreground h-48'
            placeholder='Notes for searching (e.g., work, personal)'
            value={notes}
            onChangeText={setNotes}
            multiline
          />
          <Text className='text-sm text-muted-foreground mt-1 italic'>
            Used for searching your secrets.
          </Text>
        </View>
      </View>
      <View className='flex-col space-y-2 mt-4 gap-4'>
        <Button onPress={handleSave} className='rounded-full py-3'>
          <Text className='text-lg'>Save Changes</Text>
        </Button>
        <Button
          onPress={() => router.back()}
          variant='outline'
          className='rounded-full py-3'
        >
          <Text className='text-lg'>Cancel</Text>
        </Button>
      </View>
    </View>
  );
}
