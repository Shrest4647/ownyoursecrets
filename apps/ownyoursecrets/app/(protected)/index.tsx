import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Text } from "@/components/ui/text";
import { useRouter } from "expo-router";
import { View, FlatList, SafeAreaView } from "react-native";
import { useState, useEffect } from "react";

import { Pressable } from "react-native-gesture-handler";

const dummySecrets = [
  { id: "1", name: "Google", meta: "Login details", updated: "2 days ago" },
  {
    id: "2",
    name: "Facebook",
    meta: "Login details and more and more and more and more",
    updated: "1 week ago",
  },
  { id: "3", name: "Twitter", meta: "Login details", updated: "3 weeks ago" },
  {
    id: "4",
    name: "Amazon",
    meta: "Shopping account \n and somthing else",
    updated: "1 day ago",
  },
  {
    id: "5",
    name: "Netflix",
    meta: "Streaming service",
    updated: "2 days ago",
  },
  {
    id: "6",
    name: "Bank of America",
    meta: "Banking login",
    updated: "3 days ago",
  },
];

export default function SecretsListingPage() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");

  // TODO: Replace with real data
  // TODO: Read all the secrets from the storage, decrypt them, and display them
  const [filteredSecrets, setFilteredSecrets] = useState(dummySecrets);

  useEffect(() => {
    if (searchQuery === "") {
      setFilteredSecrets(dummySecrets);
    } else {
      const filtered = dummySecrets.filter(
        (secret) =>
          secret.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          secret.meta.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredSecrets(filtered);
    }
  }, [searchQuery]);

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
          keyExtractor={(item) => item.id}
          renderItem={({ item, index }) => (
            <Pressable
              key={`${item.id}-${index}`}
              onPress={() =>
                router.push({
                  pathname: "/EditPassPage",
                  params: { id: item.id, name: item.name, meta: item.meta },
                })
              }
            >
              <View className='p-4 border-b border-zinc-200 bg-card mb-2.5'>
                <View className='flex-row items-center justify-between'>
                  <Text className='text-lg font-bold text-foreground'>
                    {item.name}
                  </Text>
                  <Text className='text-xs text-muted-foreground mt-1'>
                    {item.updated}
                  </Text>
                </View>
                <Text className='text-muted-foreground line-clamp-1 text-ellipsis'>
                  {item.meta}
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
