import { Button } from "@/components/ui/button";
import { KeyRoundIcon, ClipboardIcon, LucideEye } from "lucide-react-native";
import { Input } from "@/components/ui/input";
import { Text } from "@/components/ui/text";
import { useRouter } from "expo-router";
import { View, FlatList, SafeAreaView } from "react-native";
import { useState, useEffect, useCallback } from "react";
import Fuse from "fuse.js";
import { listSecrets, StoredSecret } from "../../lib/vault";
import { useAuth } from "@/store/auth-context";
import * as Clipboard from "expo-clipboard";

import { Pressable } from "react-native-gesture-handler";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { decrypt } from "@/lib/crypto";

export default function SecretsListingPage() {
  const router = useRouter();
  const [secrets, setSecrets] = useState<StoredSecret[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isDialogVisible, setIsDialogVisible] = useState(false);
  const [selectedSecret, setSelectedSecret] = useState<StoredSecret | null>(
    null
  );
  const [decryptedPassword, setDecryptedPassword] = useState<string | null>(
    null
  );

  const copyToClipboard = async (text: string) => {
    await Clipboard.setStringAsync(text);
    // Optionally, provide user feedback that text has been copied
    alert("Copied to clipboard!");
  };

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
      const fuse = new Fuse(secrets, {
        keys: ["name", "metadata"], // Search on name and metadata
        includeScore: true,
        threshold: 0.3, // Adjust as needed for fuzziness
      });
      const result = fuse.search(searchQuery);
      setFilteredSecrets(result.map((item) => item.item));
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
        {filteredSecrets.length === 0 ? (
          <View className='flex-1 items-center justify-center p-5'>
            <KeyRoundIcon size={60} className='text-muted-foreground mb-5' />
            <Text className='text-lg text-foreground mb-8 text-center font-medium'>
              No secrets found.
            </Text>
            <Text className='text-base text-muted-foreground text-center mb-5 italic'>
              Start by adding your first secret using the "New Secret" button
              below. Your secrets are securely stored on your device.
            </Text>
            <Text className='text-base text-muted-foreground text-center italic'>
              You can also import secrets from a backup or sync with a Git
              repository.
            </Text>
          </View>
        ) : (
          <FlatList
            data={filteredSecrets}
            keyExtractor={(item) => item.metadata + item.createdAt}
            renderItem={({ item }) => (
              <Pressable
                key={`${item.name}-${item.createdAt}`}
                onPress={async () => {
                  setSelectedSecret(item);
                  if (ageSecretKey) {
                    const decrypted = await decrypt(
                      item.encryptedData,
                      ageSecretKey
                    );
                    setDecryptedPassword(decrypted);
                  }
                  setIsDialogVisible(true);
                }}
              >
                <View className='p-4 border-b border-zinc-200 bg-card mb-2.5'>
                  <View className='flex-row items-center justify-between'>
                    <Text className='text-lg font-bold text-foreground'>
                      {item.name}
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
        )}
        <Button
          onPress={() => router.push("/NewPassAddPage")}
          className='my-5 rounded-full'
        >
          <Text>New Secret</Text>
        </Button>
      </View>
      <Dialog open={isDialogVisible} onOpenChange={setIsDialogVisible}>
        <DialogContent className='w-full'>
          <DialogHeader>
            <DialogTitle>
              <Text className='text-lg font-bold'>{selectedSecret?.name}</Text>
            </DialogTitle>
            <DialogDescription>
              <Text className='text-sm'>{selectedSecret?.metadata}</Text>
            </DialogDescription>
          </DialogHeader>
          <View className='py-4 w-full'>
            <Text className='text-lg font-bold'>Password:</Text>
            <View className='flex-row items-center justify-between'>
              <Text className='text-lg'>{decryptedPassword}</Text>
              <Button
                variant='ghost'
                onPress={() => copyToClipboard(decryptedPassword || "")}
              >
                <ClipboardIcon size={20} />
              </Button>
            </View>
          </View>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant='outline'>
                <Text className='text-sm'>Cancel</Text>
              </Button>
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </SafeAreaView>
  );
}
