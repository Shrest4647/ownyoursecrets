import { View, Image } from "react-native";
import { useEffect } from "react";
import { useRouter } from "expo-router";
import { useAuth } from "@/store/auth-context";
import { Text } from "@/components/ui/text";

export default function SplashScreen() {
  const router = useRouter();
  const { passcodeEnabled } = useAuth()!;

  useEffect(() => {
    const timer = setTimeout(() => {
      if (passcodeEnabled) {
        router.replace("/PassCodePage");
      } else {
        router.replace("/OnboardingPage");
      }
    }, 1000); // 3 seconds splash screen

    return () => clearTimeout(timer);
  }, [passcodeEnabled]);

  return (
    <View className='flex-1 items-center justify-center bg-background'>
      <Image
        source={require("../../assets/icon.png")}
        className='w-32 h-32 mb-4'
      />
      <Text className='text-4xl font-bold text-primary italic'>
        Own Your Secrets
      </Text>
    </View>
  );
}
