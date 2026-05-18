import { useEffect } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { tokenProvider, initApi } from '../src/api/client';
import { colors } from '../src/constants/theme';

export default function Index() {
  const router = useRouter();

  useEffect(() => {
    // Asegurar que la API esté inicializada
    initApi();
    
    const checkAuth = async () => {
      const token = await tokenProvider.getToken();
      if (token) {
        router.replace('/(app)/home');
      } else {
        router.replace('/(auth)/login');
      }
    };
    checkAuth();
  }, []);

  return (
    <View className="flex-1 justify-center items-center bg-surface">
      <ActivityIndicator size="large" color={colors.brand} />
    </View>
  );
}