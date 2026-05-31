import { Stack } from "expo-router";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { initApi } from "../src/api/client";
import { useEffect, useState } from "react";
import { View, ActivityIndicator } from "react-native";
import { StatusBar } from "expo-status-bar";
import {
  useFonts,
  Manrope_400Regular,
  Manrope_500Medium,
  Manrope_600SemiBold,
  Manrope_700Bold,
} from "@expo-google-fonts/manrope";
import { colors } from "../src/constants/theme";
import * as SplashScreen from 'expo-splash-screen';
import { Asset } from 'expo-asset';
import { 
  reportIcon, 
  ticketIcon, 
  commerceIcon, 
  locationIcon, 
  paymentMethodIcon,
  dashboardIcon,
  organizationIcon,
  settingsIcon,
  userIcon
} from '@ticket-registrator/shared/assets';
import "../global.css";
import "../src/i18n";

SplashScreen.preventAutoHideAsync();
initApi();

const queryClient = new QueryClient();

export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts({
    'Manrope-Regular':  Manrope_400Regular,
    'Manrope-Medium':   Manrope_500Medium,
    'Manrope-SemiBold': Manrope_600SemiBold,
    'Manrope-Bold':     Manrope_700Bold,
  });

  const [assetsLoaded, setAssetsLoaded] = useState(false);

  useEffect(() => {
    async function prepare() {
      try {
        await Asset.loadAsync([
          reportIcon,
          ticketIcon,
          commerceIcon,
          locationIcon,
          paymentMethodIcon,
          dashboardIcon,
          organizationIcon,
          settingsIcon,
          userIcon
        ]);
      } catch (e) {
        console.warn('Error loading assets:', e);
      } finally {
        setAssetsLoaded(true);
      }
    }
    prepare();
  }, []);

  useEffect(() => {
    if ((fontsLoaded || fontError) && assetsLoaded) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded, fontError, assetsLoaded]);

  if ((!fontsLoaded && !fontError) || !assetsLoaded) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.surface }}>
        <ActivityIndicator size="large" color={colors.brand} />
      </View>
    );
  }

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
