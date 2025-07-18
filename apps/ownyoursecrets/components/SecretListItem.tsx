import React, { useState, useCallback } from "react";
import { View, Pressable } from "react-native";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Text } from "@/components/ui/text";
import { Button } from "@/components/ui/button";
import { StoredSecret } from "@/lib/vault";
import { useAuth } from "@/store/auth-context";
import { decrypt } from "@/lib/crypto";
import * as Clipboard from "expo-clipboard";
import { useRouter } from "expo-router";
import { ClipboardIcon, Eye, EyeOff } from "lucide-react-native";

interface SecretListItemProps {
  item: StoredSecret;
  onDelete: (item: StoredSecret) => void;
}

const SecretListItem = React.memo(({ item, onDelete }: SecretListItemProps) => {
  const router = useRouter();
  const { ageSecretKey } = useAuth()!;
  const [decryptedPassword, setDecryptedPassword] = useState<string | null>(
    null,
  );
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleDecrypt = useCallback(async () => {
    if (!ageSecretKey || decryptedPassword) return;

    setIsLoading(true);
    try {
      const decrypted = await decrypt(item.encryptedData, ageSecretKey);
      setDecryptedPassword(decrypted);
    } catch (error) {
      console.error("Failed to decrypt secret:", error);
      // Handle decryption error (e.g., show a message)
    } finally {
      setIsLoading(false);
    }
  }, [ageSecretKey, item.encryptedData, decryptedPassword]);

  const copyToClipboard = async (text: string) => {
    await Clipboard.setStringAsync(text);
    alert("Copied to clipboard!");
  };

  return (
    <Accordion type="single" collapsible>
      <AccordionItem value={item.name || ""}>
        <AccordionTrigger onPress={handleDecrypt}>
          <View className="flex-row items-center justify-between w-full">
            <Text className="text-lg font-bold text-foreground">
              {item.name}
            </Text>
            <Text className="text-xs text-muted-foreground mt-1">
              {new Date(item.createdAt).toLocaleDateString()}
            </Text>
          </View>
        </AccordionTrigger>
        <AccordionContent>
          {isLoading ? (
            <Text>Loading...</Text>
          ) : (
            <View>
              <View className="py-4 w-full">
                <Text className="text-lg font-bold">Password:</Text>
                <View className="flex-row items-center justify-between">
                  <Text className="text-lg">
                    {showPassword
                      ? decryptedPassword
                      : "*".repeat(decryptedPassword?.length || 0)}
                  </Text>
                  <View className="flex-row items-center">
                    <Button
                      variant="ghost"
                      onPress={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                    </Button>
                    <Button
                      variant="ghost"
                      onPress={() => copyToClipboard(decryptedPassword || "")}
                    >
                      <ClipboardIcon size={20} />
                    </Button>
                  </View>
                </View>
              </View>
              <View className="flex-row justify-between space-x-2 gap-2 mt-2">
                <Button
                  variant="outline"
                  className="w-[50%]"
                  onPress={() =>
                    router.push({
                      pathname: "/EditPassPage",
                      params: { secretName: item.name },
                    })
                  }
                >
                  <Text>Edit</Text>
                </Button>
                <Button
                  className="w-[50%]"
                  variant="destructive"
                  onPress={() => onDelete(item)}
                >
                  <Text>Delete</Text>
                </Button>
              </View>
            </View>
          )}
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
});

export default SecretListItem;
