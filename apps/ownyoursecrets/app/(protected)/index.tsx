import { Button } from "@/components/ui/button";
import { KeyRoundIcon } from "lucide-react-native";
import { Input } from "@/components/ui/input";
import { Text } from "@/components/ui/text";
import { useRouter } from "expo-router";
import { View, FlatList, SafeAreaView } from "react-native";
import { useState, useEffect, useCallback } from "react";
import Fuse from "fuse.js";
import { listSecrets, StoredSecret, deleteSecret } from "../../lib/vault";
import { useAuth } from "@/store/auth-context";
import SecretListItem from "@/components/SecretListItem";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";

export default function SecretsListingPage() {
  const router = useRouter();
  const [secrets, setSecrets] = useState<StoredSecret[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredSecrets, setFilteredSecrets] = useState<StoredSecret[]>([]);
  const { ageSecretKey } = useAuth()!;
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedSecret, setSelectedSecret] = useState<StoredSecret | null>(
    null,
  );

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
        keys: ["name", "metadata"],
        includeScore: true,
        threshold: 0.3,
      });
      const result = fuse.search(searchQuery);
      setFilteredSecrets(result.map((item) => item.item));
    }
  }, [searchQuery, secrets]);

  const handleDeletePress = (item: StoredSecret) => {
    setSelectedSecret(item);
    setIsDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (selectedSecret) {
      try {
        await deleteSecret(selectedSecret.name!);
        loadSecrets(); // Refresh the list
      } catch (error) {
        console.error("Failed to delete secret:", error);
      } finally {
        setIsDeleteDialogOpen(false);
        setSelectedSecret(null);
      }
    }
  };

  return (
    <SafeAreaView className="flex-1 p-5 bg-background">
      <View className="flex mb-12 h-full">
        <View className="flex-row justify-between items-center mb-5">
          <Text className="text-2xl font-bold text-foreground">
            Your Secrets
          </Text>
          <Button
            onPress={() => router.push("/SyncPassPage")}
            variant="outline"
            className="rounded-full"
          >
            <Text>Sync</Text>
          </Button>
        </View>
        <Input
          placeholder="Search..."
          className="mb-5 h-12 border-2 focus:border-primary bg-card shadow-sm"
          placeholderTextColor="#A1A1AA" // zinc-400
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        {filteredSecrets.length === 0 ? (
          <View className="flex-1 items-center justify-center p-5">
            <KeyRoundIcon size={60} className="text-muted-foreground mb-5" />
            <Text className="text-lg text-foreground mb-8 text-center font-medium">
              No secrets found.
            </Text>
            <Text className="text-base text-muted-foreground text-center mb-5 italic">
              Start by adding your first secret using the "New Secret" button
              below. Your secrets are securely stored on your device.
            </Text>
            <Text className="text-base text-muted-foreground text-center italic">
              You can also import secrets from a backup or sync with a Git
              repository.
            </Text>
          </View>
        ) : (
          <FlatList
            data={filteredSecrets}
            keyExtractor={(item) => item.name + item.createdAt}
            renderItem={({ item }) => (
              <SecretListItem item={item} onDelete={handleDeletePress} />
            )}
          />
        )}
        <Button
          onPress={() => router.push("/NewPassAddPage")}
          className="my-5 rounded-full"
        >
          <Text>New Secret</Text>
        </Button>
      </View>
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Secret</DialogTitle>
            <DialogDescription className="flex-row items-center gap-2 mt-4 pb-2">
              Are you sure you want to delete the secret "{selectedSecret?.name}
              "? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex-row justify-between gap-4">
            <DialogClose asChild>
              <Button variant="outline" className="w-[50%]">
                <Text>Cancel</Text>
              </Button>
            </DialogClose>
            <Button
              variant="destructive"
              className="w-[50%]"
              onPress={handleDeleteConfirm}
            >
              <Text>Delete</Text>
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </SafeAreaView>
  );
}
