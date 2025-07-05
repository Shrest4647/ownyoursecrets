import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Text } from "@/components/ui/text";
import { useRouter } from "expo-router";
import { View, FlatList, SafeAreaView } from "react-native";
import { useState, useEffect, useCallback } from "react";
import { listSecrets, StoredSecret } from "../../lib/vault";
import { useAuth } from "@/store/auth-context";

import { Pressable } from "react-native-gesture-handler";

const [secrets, setSecrets] = useState<StoredSecret[]>([]);

export default function SecretsListingPage() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");

  // TODO: Replace with real data
  // TODO: Read all the secrets from the storage, decrypt them, and display them
  const [filteredSecrets, setFilteredSecrets] = useState<StoredSecret[]>([]);
  const { ageSecretKey } = useAuth()!;

  const loadSecrets = useCallback(async () => {
    if (!ageSecretKey) {
      setSecrets([]);
      return;
    }
    try {
      const loadedSecrets = await listSecrets();
      setSecrets(loadedSecrets);
    } catch (error) {
      console.error("Failed to load secrets:", error);
      setSecrets([]);
    }
  }, [ageSecretKey]);

  useEffect(() => {
    loadSecrets();
  }, [loadSecrets]);

  useEffect(() => {
    if (searchQuery === "") {
      setFilteredSecrets(secrets);
    } else {
      const filtered = secrets.filter(
        (secret) =>
          secret.metadata.toLowerCase().includes(searchQuery.toLowerCase()) ||
          secret.createdAt.toLowerCase().includes(searchQuery.toLowerCase()) // You might want to search other fields too
      );
      setFilteredSecrets(filtered);
    }
  }, [searchQuery, secrets]);

  return (
    <SafeAreaView className='flex-1 p-5 bg-background'>
      <View className='flex mb-12 h-full'>
        <View className='flex-row justify-between items-center mb-5'>
          <Text className='text-2xl font-bold text-foreground'>
            Your Secrets
          </Text>
          <Button
            onPress={() => router.push("/SyncPassPage")}
            variant='outline'
            className='rounded-full'
          >
            <Text>Sync</Text>
          </Button>
        </View>
        <Input
          placeholder='Search...'
          className='mb-5 h-12 border-2 focus:border-primary bg-card shadow-sm'
          placeholderTextColor='#A1A1AA' // zinc-400
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        <FlatList
          data={filteredSecrets}
          keyExtractor={(item) => item.metadata + item.createdAt}
          renderItem={({ item }) => (
            <Pressable
              onPress={() =>
                router.push({
                  pathname: "/EditPassPage",
                  params: { name: item.metadata, createdAt: item.createdAt },
                })
              }
            >
              <View className='p-4 border-b border-zinc-200 bg-card mb-2.5'>
                <View className='flex-row items-center justify-between'>
                  <Text className='text-lg font-bold text-foreground'>
                    {item.metadata}
                  </Text>
                  <Text className='text-xs text-muted-foreground mt-1'>
                    {new Date(item.createdAt).toLocaleDateString()}
                  </Text>
                </View>
                <Text className='text-muted-foreground line-clamp-1 text-ellipsis'>
                  {item.metadata}
                </Text>
              </View>
            </Pressable>
          )}
        />
        <Button
          onPress={() => router.push("/NewPassAddPage")}
          className='my-5 rounded-full'
        >
          <Text>New Secret</Text>
        </Button>
      </View>
    </SafeAreaView>
  );
}
