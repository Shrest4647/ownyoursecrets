import { Stack } from "expo-router";
import React from "react";
import { Keyboard, View } from "react-native";

export default function GuestLayout() {
  const [keyboardHeight, setKeyboardHeight] = React.useState(0);

  React.useEffect(() => {
    const keyboardDidShowListener = Keyboard.addListener(
      "keyboardDidShow",
      (e) => {
        setKeyboardHeight(e.endCoordinates.height);
      }
    );
    const keyboardDidHideListener = Keyboard.addListener(
      "keyboardDidHide",
      () => {
        setKeyboardHeight(0);
      }
    );
    return () => {
      keyboardDidShowListener.remove();
      keyboardDidHideListener.remove();
    };
  }, []);
  return (
    <View
      className='flex-1 bg-background'
      style={{ paddingBottom: keyboardHeight }}
    >
      <Stack
        screenOptions={{ headerShown: true, keyboardHandlingEnabled: true }}
      />
    </View>
  );
}
