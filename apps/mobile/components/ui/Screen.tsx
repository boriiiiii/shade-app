import React from "react";
import {
  RefreshControl,
  ScrollView,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { colors } from "../../lib/theme";
import { cn } from "./cn";

interface ScreenProps {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
  rightElement?: React.ReactNode;
  scroll?: boolean;
  refreshing?: boolean;
  onRefresh?: () => void;
  contentClassName?: string;
}

export function Screen({
  children,
  title,
  subtitle,
  rightElement,
  scroll = true,
  refreshing = false,
  onRefresh,
  contentClassName,
}: ScreenProps) {
  const insets = useSafeAreaInsets();

  const header =
    title || rightElement ? (
      <View className="flex-row items-start justify-between mb-5">
        <View className="flex-1 pr-3">
          {title ? (
            <Text className="text-content text-[26px] font-bold tracking-tight">
              {title}
            </Text>
          ) : null}
          {subtitle ? (
            <Text className="text-content-secondary text-[14px] mt-1 leading-5">
              {subtitle}
            </Text>
          ) : null}
        </View>
        {rightElement ? <View>{rightElement}</View> : null}
      </View>
    ) : null;

  const body = (
    <View className={cn("px-5", contentClassName)}>
      {header}
      {children}
    </View>
  );

  if (!scroll) {
    return (
      <View
        className="flex-1 bg-background"
        style={{ paddingTop: insets.top + 8 }}
      >
        {body}
      </View>
    );
  }

  return (
    <ScrollView
      className="flex-1 bg-background"
      contentContainerStyle={{
        paddingTop: insets.top + 8,
        paddingBottom: insets.bottom + 32,
      }}
      keyboardShouldPersistTaps="handled"
      refreshControl={
        onRefresh ? (
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors.textSecondary}
            colors={[colors.primary]}
          />
        ) : undefined
      }
    >
      {body}
    </ScrollView>
  );
}
