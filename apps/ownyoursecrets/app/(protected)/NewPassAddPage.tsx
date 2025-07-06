import "react-native-get-random-values";
import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Text } from "@/components/ui/text";
import { View, Alert } from "react-native";

import { Stack, useRouter } from "expo-router";
import { saveSecret } from "../../lib/vault";
import { useAuth } from "@/store/auth-context";

const NewPassAddPage = () => {
  const [secretName, setSecretName] = useState("");
  const [password, setPassword] = useState("");
  const [metadata, setMetadata] = useState("");

  const { ageSecretKey } = useAuth()!;
  const router = useRouter();

  const handleSaveSecret = async () => {
    if (!ageSecretKey) {
      Alert.alert("Error", "Age secret key not found. Please set it up first.");
      return;
    }
    if (!secretName.trim()) {
      Alert.alert("Error", "Secret name cannot be empty.");
      return;
    }

    try {
      await saveSecret(secretName, { password }, metadata, ageSecretKey);
      Alert.alert("Success", `Secret '${secretName}' saved successfully!`);
      setTimeout(() => {
        setSecretName("");
        setPassword("");
        setMetadata("");
        router.back();
      }, 1000);
    } catch (error: any) {}
  };

  return (
    <View className='flex-1 p-5 bg-background justify-between'>
      <Stack.Screen options={{ title: "Add New Secret" }} />
      <View className='p-2'>
        <Text className='text-3xl font-bold text-foreground mb-8'>
          Add New Secret
        </Text>

        <View className='mb-5'>
          <Text className='text-base font-medium text-muted-foreground mb-2'>
            Secret Name <Text className='text-red-500'>*</Text>
          </Text>
          <View className='flex-row items-center rounded-md bg-card'>
            <Input
              className='flex-1 text-base text-foreground'
              placeholder='e.g., google/my-account'
              value={secretName}
              onChangeText={setSecretName}
            />
            <Text className='text-base text-muted-foreground font-medium p-2'>
              .jsop
            </Text>
          </View>
          <Text className='text-sm text-muted-foreground mt-1 italic'>
            *Only A-z, 0-9, -, _ and / are allowed.
          </Text>
        </View>

        <View className='mb-5'>
          <Text className='text-base font-medium text-muted-foreground mb-2'>
            Password <Text className='text-red-500'>*</Text>
          </Text>
          <Input
            className='text-base text-foreground'
            placeholder='Your secret password'
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />
        </View>

        <View className='mb-5'>
          <Text className='text-base font-medium text-muted-foreground mb-2'>
            Notes / Metadata
          </Text>
          <Input
            className='text-base text-foreground h-48'
            placeholder='Notes for searching (e.g., work, personal)'
            value={metadata}
            onChangeText={setMetadata}
            multiline
          />
          <Text className='text-sm text-muted-foreground mt-1 italic'>
            Used for searching your secrets.
          </Text>
        </View>
      </View>
      <Button onPress={handleSaveSecret} className='rounded-full py-3 mb-8'>
        <Text className='text-lg'>Save Secret</Text>
      </Button>
    </View>
  );
};
export default NewPassAddPage;
