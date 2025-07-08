import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Text } from "@/components/ui/text";
import { useRouter } from "expo-router";
import { useState } from "react";
import { Image } from "react-native";
import { Alert, ScrollView, View } from "react-native";
import { useAuth } from "@/store/auth-context";

export default function OnboardingPage() {
  const router = useRouter();
  const auth = useAuth();
  const [username, setUsername] = useState(auth?.username || "");

  const handleGetStarted = async () => {
    if (!username) {
      Alert.alert("Anonymous", "I will refer to you as Anonymous.");
      auth?.setUsername("Anonymous");
    } else {
      auth?.setUsername(username);
    }
    router.push("/SyncOptionSelectionPage");
  };

  return (
    <>
      <ScrollView
        contentContainerStyle={{ flexGrow: 1 }}
        keyboardShouldPersistTaps='handled'
      >
        <View className='bg-background p-8 justify-between h-full'>
          <View className='items-center'>
            <View className='w-48 h-48 bg-primary/20 rounded-full items-center justify-center mb-6'>
              <Image
                source={require("@/assets/icon.png")}
                className='w-24 h-24'
              />
            </View>
            <Text className='text-3xl font-bold text-center text-foreground mb-4'>
              Welcome to
            </Text>
            <Text className='text-3xl font-bold text-center text-foreground mb-4 italic'>
              Own Your Secrets
            </Text>
          </View>

          <View className='my-8'>
            <FeatureItem text='Your data is stored locally and encrypted.' />
            <FeatureItem text='You control where your data is stored.' />
            <FeatureItem text='No central servers, no accounts.' />
            <FeatureItem text='Open source and transparent.' />
          </View>
          <View className='flex-1'></View>

          <View className='w-full mb-4'>
            <Input
              placeholder='Enter your username'
              value={username}
              onChangeText={setUsername}
            />
          </View>

          <Button
            size='lg'
            className='w-full bg-primary p-4 rounded-lg'
            onPress={handleGetStarted}
          >
            <Text className='text-primary-foreground'>Get Started</Text>
          </Button>
        </View>
      </ScrollView>
    </>
  );
}

function FeatureItem({ text }: { text: string }) {
  return (
    <View className='flex-row items-center mb-4'>
      <View className='w-2 h-2 bg-primary rounded-full mr-4' />
      <Text className='text-lg text-muted-foreground flex-1'>{text}</Text>
    </View>
  );
}
