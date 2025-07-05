import { Button } from "@/components/ui/button";
import { Text } from "@/components/ui/text";
import { useRouter } from "expo-router";
import { View } from "react-native";
import { GitBranch, Cloud, Smartphone } from "lucide-react-native";

export default function SyncOptionSelectionPage() {
  const router = useRouter();

  return (
    <View className='flex-1 p-6 bg-background'>
      <Text className='text-3xl font-bold mb-8 text-foreground text-center mt-8'>
        Choose Your Sync Adventure
      </Text>
      <Text className='text-lg text-center text-muted-foreground mb-12 px-4'>
        How would you like to keep your secrets safe and accessible?
      </Text>
      <View className='py-8'>
        <View className='mb-2 p-4 rounded-lg'>
          <Button
            className='w-full py-4 rounded-full flex-row items-center justify-center bg-primary gap-4'
            onPress={() => router.push("/GitSyncRepoSetupPage")}
          >
            <GitBranch size={20} className='text-primary-foreground mr-3' />
            <Text className='text-lg text-primary-foreground'>
              Git (Advanced)
            </Text>
          </Button>
          <Text className='text-center text-sm text-card-foreground mt-3'>
            Full control using your own Git repositories.
          </Text>
        </View>

        <View className='mb-2 p-4 rounded-lg'>
          <Button
            className='w-full py-4 rounded-full flex-row items-center justify-center bg-secondary gap-4'
            onPress={() => alert("Coming Soon: Google Drive integration!")}
          >
            <Cloud size={20} className='text-secondary-foreground mr-3' />
            <Text className='text-lg text-secondary-foreground'>
              Cloud Drive (Easy)
            </Text>
          </Button>
          <Text className='text-center text-sm text-secondary-foreground mt-3'>
            Simple sync with your personal cloud storage.
          </Text>
        </View>

        <View className='p-4 rounded-lg'>
          <Button
            className='w-full py-4 rounded-full flex-row items-center justify-center bg-accent gap-4'
            onPress={() => router.push("/setup-age-secret")}
          >
            <Smartphone size={20} className='text-accent-foreground mr-3' />
            <Text className='text-lg text-accent-foreground'>
              Local Only (Most Private)
            </Text>
          </Button>
          <Text className='text-center text-sm text-foreground mt-3'>
            Keep everything on your device. Maximum privacy.
          </Text>
        </View>
      </View>
    </View>
  );
}
