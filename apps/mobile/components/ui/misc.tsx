import React from "react";
import { Pressable, Text, View } from "react-native";

import { cn } from "./cn";

/** Small uppercase section label above a group of cards. */
export function SectionLabel({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <Text
      className={cn(
        "text-content-muted text-[12px] font-semibold uppercase tracking-wide mb-2.5",
        className,
      )}
    >
      {children}
    </Text>
  );
}

/** Label/value row inside a card. `mono` renders the value in a monospace-ish tone. */
export function KeyValueRow({
  label,
  value,
  mono = false,
  onPressValue,
}: {
  label: string;
  value: string;
  mono?: boolean;
  onPressValue?: () => void;
}) {
  const valueNode = (
    <Text
      className={cn(
        "text-[14px] text-content max-w-[62%] text-right",
        onPressValue && "text-info underline",
      )}
      numberOfLines={1}
    >
      {value}
    </Text>
  );
  return (
    <View className="flex-row items-center justify-between py-2">
      <Text className="text-content-secondary text-[14px]">{label}</Text>
      {onPressValue ? (
        <Pressable onPress={onPressValue}>{valueNode}</Pressable>
      ) : (
        valueNode
      )}
    </View>
  );
}

/** Inline error note (red) with an optional machine code. */
export function ErrorNote({
  message,
  code,
  className,
}: {
  message: string;
  code?: string;
  className?: string;
}) {
  if (!message) return null;
  return (
    <View
      className={cn(
        "rounded-xl border border-danger/40 bg-danger-soft px-3.5 py-3",
        className,
      )}
    >
      <Text className="text-danger text-[13px] leading-5">{message}</Text>
      {code ? (
        <Text className="text-danger/70 text-[11px] mt-1 uppercase tracking-wide">
          {code}
        </Text>
      ) : null}
    </View>
  );
}

/** Inline success note (emerald). */
export function SuccessNote({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <View
      className={cn(
        "rounded-xl border border-primary/40 bg-primary-soft px-3.5 py-3",
        className,
      )}
    >
      {children}
    </View>
  );
}

/** Centered empty-state text inside a dashed card. */
export function EmptyState({
  title,
  hint,
}: {
  title: string;
  hint?: string;
}) {
  return (
    <View className="items-center py-8">
      <Text className="text-content-secondary text-[14px] font-medium">{title}</Text>
      {hint ? (
        <Text className="text-content-muted text-[12px] mt-1 text-center px-6 leading-4">
          {hint}
        </Text>
      ) : null}
    </View>
  );
}

/** Selectable chip (for choosing a delegation, mode, trader, etc.). */
export function SelectChip({
  label,
  selected,
  onPress,
  disabled = false,
}: {
  label: string;
  selected: boolean;
  onPress: () => void;
  disabled?: boolean;
}) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      className={cn(
        "rounded-xl border px-3.5 py-2.5 mr-2 mb-2",
        selected
          ? "border-primary bg-primary-soft"
          : "border-border-strong bg-surface-2",
        disabled && "opacity-40",
      )}
    >
      <Text
        className={cn(
          "text-[13px] font-medium",
          selected ? "text-primary" : "text-content-secondary",
        )}
      >
        {label}
      </Text>
    </Pressable>
  );
}
