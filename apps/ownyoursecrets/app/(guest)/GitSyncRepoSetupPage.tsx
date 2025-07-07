import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Text } from "@/components/ui/text";
import { Textarea } from "@/components/ui/textarea";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { View } from "react-native";
import { cloneGitRepo } from "../../lib/git";
import * as SecureStore from "expo-secure-store";
import { GIT_SYNC_ENABLED_KEY } from "@/store/constants";

export default function GitSyncRepoSetupPage() {
  const [repoUrl, setRepoUrl] = useState("");
  const [pat, setPat] = useState("");
  const [isConnecting, setIsConnecting] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<
    "idle" | "success" | "error"
  >("idle");
  const [errorMessage, setErrorMessage] = useState("");
  const router = useRouter();

  useEffect(() => {
    const loadSavedData = async () => {
      const savedPat = await SecureStore.getItemAsync("github_pat");
      if (savedPat) {
        setPat(savedPat);
      }
      const savedRepoUrl = await SecureStore.getItemAsync("git_repo_url");
      if (savedRepoUrl) {
        setRepoUrl(savedRepoUrl);
      }
    };
    loadSavedData();
  }, []);

  const testGitConnection = async () => {
    setIsConnecting(true);
    setConnectionStatus("idle");
    setErrorMessage("");

    try {
      if (pat) {
        await SecureStore.setItemAsync("github_pat", pat);
      }
      if (repoUrl) {
        await SecureStore.setItemAsync("git_repo_url", repoUrl);
      }
      await cloneGitRepo(repoUrl);
      setConnectionStatus("success");
      await SecureStore.setItemAsync(GIT_SYNC_ENABLED_KEY, "true");
      router.push("/GitRepoAccessedPage"); // Navigate on success
    } catch (error: any) {
      setConnectionStatus("error");
      setErrorMessage(error.message || "An unexpected error occurred.");
    } finally {
      setIsConnecting(false);
    }
  };

  return (
    <View className='flex-1 p-5 bg-background gap-4'>
      <Text className='text-2xl font-bold mb-5 text-foreground'>
        Setup Git Sync Repository
      </Text>
      <Textarea
        placeholder='Repository URL'
        value={repoUrl}
        onChangeText={setRepoUrl}
        className='mb-5 h-24'
        multiline
        textAlignVertical='top'
      />

      <Input
        placeholder='Personal Access Token (PAT)'
        secureTextEntry
        value={pat}
        onChangeText={setPat}
        className='mb-5'
      />
      <Button
        className='rounded-full'
        onPress={testGitConnection}
        disabled={isConnecting || !repoUrl}
      >
        <Text>{isConnecting ? "Connecting..." : "Test Connection"}</Text>
      </Button>

      {connectionStatus === "success" && (
        <Text className='text-green-500 mt-2'>Connection successful!</Text>
      )}
      {connectionStatus === "error" && (
        <Text className='text-red-500 mt-2'>Error: {errorMessage}</Text>
      )}
    </View>
  );
}
