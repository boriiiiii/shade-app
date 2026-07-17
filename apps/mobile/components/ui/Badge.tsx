import React from "react";
import { Text, View } from "react-native";

import { cn } from "./cn";

export type BadgeTone =
  | "neutral"
  | "primary"
  | "success"
  | "danger"
  | "warning"
  | "info";

const tones: Record<BadgeTone, { box: string; text: string; dot: string }> = {
  neutral: { box: "bg-surface-2 border-border", text: "text-content-secondary", dot: "bg-content-muted" },
  primary: { box: "bg-primary-soft border-primary/40", text: "text-primary", dot: "bg-primary" },
  success: { box: "bg-primary-soft border-primary/40", text: "text-primary", dot: "bg-primary" },
  danger: { box: "bg-danger-soft border-danger/40", text: "text-danger", dot: "bg-danger" },
  warning: { box: "bg-warning-soft border-warning/40", text: "text-warning", dot: "bg-warning" },
  info: { box: "bg-info-soft border-info/40", text: "text-info", dot: "bg-info" },
};

interface BadgeProps {
  label: string;
  tone?: BadgeTone;
  dot?: boolean;
  className?: string;
}

export function Badge({ label, tone = "neutral", dot = false, className }: BadgeProps) {
  const t = tones[tone];
  return (
    <View
      className={cn(
        "flex-row items-center self-start rounded-full border px-2.5 py-1",
        t.box,
        className,
      )}
    >
      {dot ? <View className={cn("w-1.5 h-1.5 rounded-full mr-1.5", t.dot)} /> : null}
      <Text className={cn("text-[11px] font-semibold uppercase tracking-wide", t.text)}>
        {label}
      </Text>
    </View>
  );
}

// ---- Status -> tone mappings shared across screens ----

export function orderStatusTone(status: string): BadgeTone {
  switch (status) {
    case "success":
      return "success";
    case "pending":
      return "info";
    case "ready_to_sign":
      return "warning";
    case "failed":
    case "rejected":
      return "danger";
    default:
      return "neutral"; // draft, cancelled
  }
}

export function delegationStatusTone(status: string): BadgeTone {
  switch (status) {
    case "active":
      return "success";
    case "pending":
      return "warning";
    case "revoked":
    case "expired":
      return "danger";
    default:
      return "neutral";
  }
}
