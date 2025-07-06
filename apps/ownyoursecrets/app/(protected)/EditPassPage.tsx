import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Text } from "@/components/ui/text";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useState, useEffect } from "react";
import { View, Alert, Pressable } from "react-native";
import { getSecret, editSecret, SecretData } from "../../lib/vault";
import { useAuth } from "@/store/auth-context";
import { Eye, EyeOff } from "lucide-react-native";

export default function EditPassPage() {
  const router = useRouter();
  const { secretName: secretNameParam } =
    useLocalSearchParams<{ secretName: string }>();
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
          setPassword(result.secretData.password || "");
          setNotes(result.secretData.notes || "");
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
      const newSecretData: SecretData = { password, notes };
      await editSecret(secretName, newSecretData, metadata, ageSecretKey);
      Alert.alert("Success", `Secret '${secretName}' updated successfully!`);
      router.back();
    } catch (error: any) {
      Alert.alert("Error", `Failed to update secret: ${error.message}`);
    }
  };

  return (
    <View className="flex-1 p-5 bg-background justify-between">
      <View className="p-2">
        <Text className="text-3xl font-bold text-foreground mb-8">
          Edit Secret
        </Text>

        <View className="mb-5">
          <Text className="text-base font-medium text-muted-foreground mb-2">
            Secret Name
          </Text>
          <View className="flex-row items-center rounded-md bg-card">
            <Input
              className="flex-1 text-base text-foreground"
              value={secretName}
              editable={false}
            />
            <Text className="text-base text-muted-foreground font-medium p-2">
              .jsop
            </Text>
          </View>
        </View>

        <View className="mb-5">
          <Text className="text-base font-medium text-muted-foreground mb-2">
            Password
          </Text>
          <View className="flex-row items-center rounded-md bg-card">
            <Input
              className="flex-1 text-base text-foreground"
              placeholder="Your secret password"
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPassword}
            />
            <Pressable
              onPress={() => setShowPassword(!showPassword)}
              className="p-2"
            >
              {showPassword ? (
                <EyeOff size={20} className="text-foreground" />
              ) : (
                <Eye size={20} className="text-foreground" />
              )}
            </Pressable>
          </View>
        </View>

        <View className="mb-5">
          <Text className="text-base font-medium text-muted-foreground mb-2">
            Notes / Metadata
          </Text>
          <Input
            className="text-base text-foreground h-48"
            placeholder="Notes for searching (e.g., work, personal)"
            value={notes}
            onChangeText={setNotes}
            multiline
          />
          <Text className="text-sm text-muted-foreground mt-1 italic">
            Used for searching your secrets.
          </Text>
        </View>
      </View>
      <View className="flex-col space-y-2 mt-4">
        <Button onPress={handleSave} className="rounded-full py-3">
          <Text className="text-lg">Save Changes</Text>
        </Button>
        <Button
          onPress={() => router.back()}
          variant="outline"
          className="rounded-full py-3"
        >
          <Text className="text-lg">Cancel</Text>
        </Button>
      </View>
    </View>
  );
}
