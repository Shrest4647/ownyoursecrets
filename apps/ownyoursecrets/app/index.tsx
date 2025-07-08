import { useRouter } from "expo-router";
import { useEffect } from "react";
import { Text, View, Image } from "react-native";

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
    }, 1000); // 2 second splash screen
  }, []);

  return (
    <View className='flex-1 items-center justify-center bg-background'>
      <Image source={require("@/assets/icon.png")} className='w-32 h-32 mb-4' />
      <Text className='text-4xl font-bold italic'>Own Your Secrets</Text>
    </View>
  );
}
