import React from "react";
import { Text, TextInput, View } from "react-native";

import { colors } from "../../lib/theme";
import { cn } from "./cn";

interface InputProps {
  label?: string;
  value: string;
  onChangeText: (v: string) => void;
  placeholder?: string;
  keyboardType?: "default" | "numeric" | "decimal-pad" | "email-address";
  autoCapitalize?: "none" | "sentences" | "words" | "characters";
  helper?: string;
  error?: string;
  suffix?: string;
  multiline?: boolean;
  editable?: boolean;
  className?: string;
}

export function Input({
  label,
  value,
  onChangeText,
  placeholder,
  keyboardType = "default",
  autoCapitalize = "none",
  helper,
  error,
  suffix,
  multiline = false,
  editable = true,
  className,
}: InputProps) {
  return (
    <View className={cn("w-full", className)}>
      {label ? (
        <Text className="text-content-secondary text-[13px] font-medium mb-1.5">
          {label}
        </Text>
      ) : null}
      <View
        className={cn(
          "flex-row items-center rounded-xl border bg-surface-2 px-3.5",
          error ? "border-danger" : "border-border-strong",
          multiline ? "py-2" : "h-12",
          !editable && "opacity-50",
        )}
      >
        <TextInput
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={colors.textMuted}
          keyboardType={keyboardType}
          autoCapitalize={autoCapitalize}
          autoCorrect={false}
          multiline={multiline}
          editable={editable}
          className="flex-1 text-content text-[15px]"
          style={multiline ? { minHeight: 64, textAlignVertical: "top" } : undefined}
        />
        {suffix ? (
          <Text className="text-content-muted text-[13px] ml-2">{suffix}</Text>
        ) : null}
      </View>
      {error ? (
        <Text className="text-danger text-[12px] mt-1.5">{error}</Text>
      ) : helper ? (
        <Text className="text-content-muted text-[12px] mt-1.5">{helper}</Text>
      ) : null}
    </View>
  );
}
