import { Stack } from "expo-router";

export default function TripsLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="[id]" options={{ presentation: 'card' }} />
      <Stack.Screen name="create" options={{ presentation: 'modal' }} />
      <Stack.Screen name="ticket/[ticketId]" options={{ presentation: 'card' }} />
    </Stack>
  );
}
