import React, { forwardRef, useImperativeHandle } from "react";
import {
  OtpInput as _OtpInput,
  type OtpInputRef,
} from "react-native-otp-entry";
import { Platform } from "react-native";
import { useColorScheme } from "@/lib/useColorScheme";
import { cn } from "@/lib/utils";
import * as Clipboard from "expo-clipboard";

interface OtpInputProps {
  length?: number;
  value: string;
  onTextChange: (text: string) => void;
  onFilled?: (text: string) => void;
  className?: string;
}

export interface OtpInputComponentRef {
  focus: () => void;
  clear: () => void;
}

const OtpInput = forwardRef<OtpInputComponentRef, OtpInputProps>(
  ({ length = 4, value, onTextChange, onFilled, className }, ref) => {
    const { isDarkColorScheme } = useColorScheme();
    const otpRef = React.useRef<OtpInputRef>(null);

    useImperativeHandle(ref, () => ({
      focus: () => {
        otpRef.current?.focus();
      },
      clear: () => {
        otpRef.current?.clear();
      },
    }));

    const handlePaste = async () => {
      const clipboardString = await Clipboard.getStringAsync();
      if (clipboardString && clipboardString.length === length) {
        onTextChange(clipboardString);
        if (onFilled) {
          onFilled(clipboardString);
        }
      }
    };

    return (
      <_OtpInput
        ref={otpRef}
        numberOfDigits={length}
        focusColor='green'
        hideStick={true}
        blurOnFilled={true}
        disabled={false}
        type='numeric'
        focusStickBlinkingDuration={500}
        textInputProps={{
          accessibilityLabel: "One-Time Password",
        }}
        textProps={{
          accessibilityRole: "text",
          accessibilityLabel: "OTP digit",
          allowFontScaling: false,
        }}
        onTextChange={onTextChange}
        onFilled={onFilled}
        autoFocus={true}
        secureTextEntry={true}
        theme={{
          containerStyle: {
            display: "flex",
            flexDirection: "row",
            justifyContent: "space-between",
            padding: 8,
          },
          inputsContainerStyle: {
            display: "flex",
            flexDirection: "row",
            justifyContent: "space-between",
            padding: 8,
          },
          pinCodeContainerStyle: {
            width: 56,
            height: 64,
            borderRadius: 8,
            borderWidth: 1,
            borderColor: isDarkColorScheme ? "#3F3F46" : "#E4E4E7", // border-zinc-700 / border-zinc-200
            backgroundColor: isDarkColorScheme ? "#27272A" : "#FAFAFA", // zinc-800 / zinc-50
          },
          pinCodeTextStyle: {
            fontSize: 32,
            color: isDarkColorScheme ? "#FAFAFA" : "#18181B", // zinc-50 / zinc-900
          },
          focusStickStyle: {
            backgroundColor: isDarkColorScheme ? "#FAFAFA" : "#18181B", // zinc-50 / zinc-900
          },
          focusedPinCodeContainerStyle: {
            borderColor: isDarkColorScheme ? "#FAFAFA" : "#18181B", // zinc-50 / zinc-900
          },
        }}
      />
    );
  }
);

export { OtpInput };
