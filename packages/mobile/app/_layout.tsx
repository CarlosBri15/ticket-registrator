import { Stack } from "expo-router";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { initApi } from "../src/api/client";
import { useEffect, useState } from "react";
import { View, ActivityIndicator } from "react-native";
import { StatusBar } from "expo-status-bar";
import { 
  useFonts,
  SpaceGrotesk_400Regular,
  SpaceGrotesk_500Medium,
  SpaceGrotesk_600SemiBold,
  SpaceGrotesk_700Bold 
} from "@expo-google-fonts/space-grotesk";
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
    'SpaceGrotesk-Regular': SpaceGrotesk_400Regular,
    'SpaceGrotesk-Medium': SpaceGrotesk_500Medium,
    'SpaceGrotesk-SemiBold': SpaceGrotesk_600SemiBold,
    'SpaceGrotesk-Bold': SpaceGrotesk_700Bold,
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
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#F5F5F5' }}>
        <ActivityIndicator size="large" color="#4D4DFF" />
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
