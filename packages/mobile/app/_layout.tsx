import { Slot, Stack } from "expo-router";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { initApi } from "../src/api/client";
import { useEffect } from "react";
import { View, Text } from "react-native";
import { StatusBar } from "expo-status-bar";
import "../global.css";
import "../src/i18n"; // Initialize i18n

// Inicializar API Client
initApi();

const queryClient = new QueryClient();

export default function RootLayout() {
  return (
    <QueryClientProvider client={queryClient}>
      <StatusBar style="auto" />
      <Stack screenOptions={{ headerShown: false }}>
         <Stack.Screen name="index" />
         <Stack.Screen name="(auth)/login" />
         <Stack.Screen name="(app)" />
      </Stack>
    </QueryClientProvider>
  );
}
