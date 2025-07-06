import { Button } from "@/components/ui/button";
import { Text } from "@/components/ui/text";
import { useRouter } from "expo-router";
import { View } from "react-native";
import { Lock } from "lucide-react-native";

export default function OnboardingPage() {
  const router = useRouter();

  return (
    <View className="flex-1 bg-background p-8 justify-between">
      <View className="items-center">
        <View className="w-24 h-24 bg-primary/20 rounded-full items-center justify-center mb-6">
          <Lock size={48} className="text-primary" />
        </View>
        <Text className="text-3xl font-bold text-center text-foreground mb-4">
          Welcome to
        </Text>
        <Text className="text-3xl font-bold text-center text-foreground mb-4 italic">
          Own Your Secrets
        </Text>
      </View>

      <View className="my-8">
        <FeatureItem text="Your data is stored locally and encrypted." />
        <FeatureItem text="You control where your data is stored." />
        <FeatureItem text="No central servers, no accounts." />
        <FeatureItem text="Open source and transparent." />
      </View>

      <Button
        size="lg"
        className="w-full bg-primary p-4 rounded-lg"
        onPress={() => router.push("/SyncOptionSelectionPage")}
      >
        <Text className="text-primary-foreground">Get Started</Text>
      </Button>
    </View>
  );
}

function FeatureItem({ text }: { text: string }) {
  return (
    <View className="flex-row items-center mb-4">
      <View className="w-2 h-2 bg-primary rounded-full mr-4" />
      <Text className="text-lg text-muted-foreground flex-1">{text}</Text>
    </View>
  );
}
