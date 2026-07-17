import React from "react";
import { Text, View } from "react-native";

import { cn } from "./cn";

interface StatTileProps {
  label: string;
  value: string;
  sub?: string;
  tone?: "default" | "primary" | "danger";
  className?: string;
}

const valueTone: Record<NonNullable<StatTileProps["tone"]>, string> = {
  default: "text-content",
  primary: "text-primary",
  danger: "text-danger",
};

export function StatTile({
  label,
  value,
  sub,
  tone = "default",
  className,
}: StatTileProps) {
  return (
    <View
      className={cn(
        "flex-1 rounded-2xl border border-border bg-surface p-3.5",
        className,
      )}
    >
      <Text className="text-content-muted text-[11px] font-medium uppercase tracking-wide">
        {label}
      </Text>
      <Text
        className={cn(
          "mt-1.5 text-[19px] font-semibold tracking-tight",
          valueTone[tone],
        )}
        numberOfLines={1}
      >
        {value}
      </Text>
      {sub ? (
        <Text className="text-content-secondary text-[12px] mt-0.5" numberOfLines={1}>
          {sub}
        </Text>
      ) : null}
    </View>
  );
}
