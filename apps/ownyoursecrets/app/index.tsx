import { useRouter } from "expo-router";
import { useEffect } from "react";
import { Text, View } from "react-native";

export default function SplashScreen() {
  const router = useRouter();

  useEffect(() => {
    // Simulate checking for setup completion
    setTimeout(() => {
      const hasSetupComplete = false; // Placeholder
      if (hasSetupComplete) {
        router.replace("/PassCodePage");
      } else {
        router.replace("/OnboardingPage");
      }
    }, 2000); // 2 second splash screen
  }, []);

  return (
    <View className='flex-1 items-center justify-center bg-background'>
      <Text className='text-4xl font-bold text-foreground'>
        Own Your Secrets
      </Text>
    </View>
  );
}
