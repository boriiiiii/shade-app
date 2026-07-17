import React from "react";
import { ActivityIndicator, Pressable, Text, View } from "react-native";

import { colors } from "../../lib/theme";
import { cn } from "./cn";

type Variant = "primary" | "secondary" | "outline" | "ghost" | "danger";
type Size = "md" | "sm";

interface ButtonProps {
  title: string;
  onPress?: () => void;
  variant?: Variant;
  size?: Size;
  loading?: boolean;
  disabled?: boolean;
  fullWidth?: boolean;
  iconLeft?: React.ReactNode;
  className?: string;
}

const container: Record<Variant, string> = {
  primary: "bg-primary active:bg-primary-pressed",
  secondary: "bg-surface-2 border border-border-strong active:bg-border",
  outline: "border border-border-strong active:bg-surface-2",
  ghost: "active:bg-surface-2",
  danger: "bg-danger-soft border border-danger active:bg-danger/20",
};

const label: Record<Variant, string> = {
  primary: "text-background",
  secondary: "text-content",
  outline: "text-content",
  ghost: "text-content-secondary",
  danger: "text-danger",
};

const spinnerColor: Record<Variant, string> = {
  primary: colors.background,
  secondary: colors.textPrimary,
  outline: colors.textPrimary,
  ghost: colors.textSecondary,
  danger: colors.danger,
};

export function Button({
  title,
  onPress,
  variant = "primary",
  size = "md",
  loading = false,
  disabled = false,
  fullWidth = false,
  iconLeft,
  className,
}: ButtonProps) {
  const isDisabled = disabled || loading;
  return (
    <Pressable
      onPress={onPress}
      disabled={isDisabled}
      className={cn(
        "flex-row items-center justify-center rounded-2xl",
        size === "md" ? "px-5 h-12" : "px-3.5 h-9",
        container[variant],
        fullWidth && "w-full",
        isDisabled && "opacity-40",
        className,
      )}
    >
      {loading ? (
        <ActivityIndicator size="small" color={spinnerColor[variant]} />
      ) : (
        <View className="flex-row items-center">
          {iconLeft ? <View className="mr-2">{iconLeft}</View> : null}
          <Text
            className={cn(
              "font-semibold tracking-tight",
              size === "md" ? "text-[15px]" : "text-[13px]",
              label[variant],
            )}
          >
            {title}
          </Text>
        </View>
      )}
    </Pressable>
  );
}
