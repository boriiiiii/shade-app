import { Tabs } from "expo-router";
import React from "react";
import Feather from "@expo/vector-icons/Feather";

/**
 * Tab bar de l'app : six onglets (Portfolio, Snipe, Copy, Learn, News,
 * Explore). Couleurs alignées sur la palette `bg-primary`.
 */
export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: "#121418",
          borderTopColor: "#2A2A2A",
          borderTopWidth: 1,
        },
        tabBarActiveTintColor: "#6283FA",
        tabBarInactiveTintColor: "#6B6B6B",
        tabBarLabelStyle: {
          fontFamily: "Satoshi",
          fontSize: 12,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Portfolio",
          tabBarIcon: ({ color, size }) => (
            <Feather name="pie-chart" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="snipe"
        options={{
          title: "Snipe",
          tabBarIcon: ({ color, size }) => (
            <Feather name="zap" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="copytrading"
        options={{
          title: "Copy",
          tabBarIcon: ({ color, size }) => (
            <Feather name="copy" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="learn"
        options={{
          title: "Learn",
          tabBarIcon: ({ color, size }) => (
            <Feather name="book-open" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="news"
        options={{
          title: "News",
          tabBarIcon: ({ color, size }) => (
            <Feather name="rss" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="explore"
        options={{
          title: "Explore",
          tabBarIcon: ({ color, size }) => (
            <Feather name="compass" size={size} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
