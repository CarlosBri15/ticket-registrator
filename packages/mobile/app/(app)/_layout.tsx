import React from "react";
import { Tabs } from "expo-router";
import { useTranslation } from "react-i18next";
import { CustomTabBar } from "../../src/components/ui/CustomTabBar";

export default function AppLayout() {
  const { t } = useTranslation();

  return (
    <Tabs
      screenOptions={{ headerShown: false }}
      tabBar={(props) => <CustomTabBar {...props} />}
    >
      <Tabs.Screen
        name="home"
        options={{ title: t('layout.home') }}
      />
      <Tabs.Screen
        name="reports"
        options={{ title: t('trips.title') }}
      />
      <Tabs.Screen
        name="tickets"
        options={{ title: t('layout.allTickets') }}
      />
      <Tabs.Screen
        name="profile"
        options={{ title: t('settings.profile') }}
      />
    </Tabs>
  );
}
