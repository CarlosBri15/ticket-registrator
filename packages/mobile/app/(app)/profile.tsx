import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { Feather } from '@expo/vector-icons';
import { tokenProvider } from '../../src/api/client';
import { useRouter } from 'expo-router';

export default function ProfileScreen() {
  const { t, i18n } = useTranslation();
  const router = useRouter();

  const changeLanguage = (lng: string) => {
    i18n.changeLanguage(lng);
    // Force re-render/update if needed, though i18next usually handles it
  };

  const handleLogout = async () => {
    await tokenProvider.removeToken();
    router.replace('/(auth)/login');
  };

  return (
    <SafeAreaView className="flex-1 bg-surface">
      <View className="px-6 py-4 bg-white border-b border-gray-50">
        <Text className="text-2xl font-bold text-dark">{t('settings.profile')}</Text>
      </View>

      <ScrollView className="flex-1 px-6 pt-8">
        
        <Text className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4 ml-2">
            {t('settings.title')}
        </Text>

        <View className="bg-white rounded-3xl border border-gray-100 overflow-hidden mb-8">
            <View className="p-5 border-b border-gray-50 flex-row justify-between items-center">
                <View className="flex-row items-center gap-3">
                    <View className="w-10 h-10 bg-blue-50 rounded-xl items-center justify-center">
                        <Feather name="globe" size={20} color="#3b82f6" />
                    </View>
                    <Text className="font-bold text-dark">{t('settings.language')}</Text>
                </View>
            </View>
            
            <View className="p-2">
                <TouchableOpacity 
                    onPress={() => changeLanguage('es')}
                    className={`flex-row items-center justify-between p-4 rounded-2xl ${i18n.language.startsWith('es') ? 'bg-brand/5' : 'active:bg-gray-50'}`}
                >
                    <Text className={`font-medium ${i18n.language.startsWith('es') ? 'text-brand' : 'text-gray-600'}`}>Español</Text>
                    {i18n.language.startsWith('es') && <Feather name="check" size={20} color="#336b87" />}
                </TouchableOpacity>

                <TouchableOpacity 
                    onPress={() => changeLanguage('en')}
                    className={`flex-row items-center justify-between p-4 rounded-2xl ${i18n.language.startsWith('en') ? 'bg-brand/5' : 'active:bg-gray-50'}`}
                >
                    <Text className={`font-medium ${i18n.language.startsWith('en') ? 'text-brand' : 'text-gray-600'}`}>English</Text>
                    {i18n.language.startsWith('en') && <Feather name="check" size={20} color="#336b87" />}
                </TouchableOpacity>
            </View>
        </View>

        <TouchableOpacity 
            onPress={handleLogout}
            className="bg-white p-5 rounded-3xl border border-red-100 flex-row items-center gap-3 active:bg-red-50"
        >
            <View className="w-10 h-10 bg-red-50 rounded-xl items-center justify-center">
                <Feather name="log-out" size={20} color="#ef4444" />
            </View>
            <Text className="font-bold text-red-500">{t('settings.logout')}</Text>
        </TouchableOpacity>

      </ScrollView>
    </SafeAreaView>
  );
}
