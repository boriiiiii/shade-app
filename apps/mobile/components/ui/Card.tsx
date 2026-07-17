import React from "react";
import { View } from "react-native";

import { cn } from "./cn";

interface CardProps {
  children: React.ReactNode;
  className?: string;
  /** Slightly lifted surface for nested emphasis. */
  elevated?: boolean;
}

export function Card({ children, className, elevated = false }: CardProps) {
  return (
    <View
      className={cn(
        "rounded-2xl border border-border p-4",
        elevated ? "bg-surface-2" : "bg-surface",
        className,
      )}
    >
      {children}
    </View>
  );
}
