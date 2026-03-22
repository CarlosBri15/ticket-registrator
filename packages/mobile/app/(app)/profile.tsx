import { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { useUserQuery, useUpdateUserMutation } from '@ticket-registrator/shared';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { tokenProvider } from '../../src/api/client';
import { mt, colors } from '../../src/styles/theme';

const LANGUAGES = [
  { code: 'es', label: 'Español', flag: '🇪🇸' },
  { code: 'en', label: 'English', flag: '🇬🇧' },
];

export default function ProfileScreen() {
  const { t, i18n } = useTranslation();
  const router = useRouter();

  const { data: user } = useUserQuery();
  const { mutate: updateUser, isPending: isSaving } = useUpdateUserMutation({
    onSuccess: () => {
      setIsEditing(false);
      setSaveOk(true);
      setTimeout(() => setSaveOk(false), 3000);
    },
  });

  const [isEditing, setIsEditing] = useState(false);
  const [saveOk, setSaveOk] = useState(false);
  const [form, setForm] = useState({ name: '', surname: '', email: '' });

  const startEdit = () => {
    setForm({
      name: user?.name ?? '',
      surname: (user as any)?.surname ?? '',
      email: user?.email ?? '',
    });
    setIsEditing(true);
    setSaveOk(false);
  };

  const handleSave = () => {
    if (!user?.id || !form.name.trim()) return;
    const payload: Record<string, string> = {};
    if (form.name.trim()) payload.name = form.name.trim();
    if (form.surname.trim()) payload.surname = form.surname.trim();
    if (form.email.trim()) payload.email = form.email.trim();
    updateUser({ id: user.id, data: payload });
  };

  const handleLogout = async () => {
    await tokenProvider.removeToken();
    router.replace('/(auth)/login');
  };

  const userInitials = user?.name
    ? user.name.split(' ').map((n: string) => n[0]).join('').toUpperCase().substring(0, 2)
    : '?';

  return (
    <SafeAreaView className={mt.screen}>
      <View className={`${mt.pageHeader} flex-row justify-between items-center`}>
        <Text className={mt.pageHeaderTitle}>{t('settings.profile')}</Text>
        {!isEditing && (
          <TouchableOpacity onPress={startEdit} className="flex-row items-center gap-1.5">
            <Feather name="edit-2" size={16} color={colors.brand} />
            <Text className="text-brand font-semibold text-sm">{t('settings.editProfile')}</Text>
          </TouchableOpacity>
        )}
      </View>

      <ScrollView className="flex-1 px-6 pt-6" contentContainerStyle={{ paddingBottom: 40 }}>

        {/* Profile Card */}
        <View className={`${mt.listSection} mb-6`}>
          <View className="p-5 border-b border-gray-50 flex-row items-center gap-4">
            <View className="w-14 h-14 bg-brand rounded-2xl items-center justify-center">
              <Text className="text-white font-black text-xl">{userInitials}</Text>
            </View>
            <View className="flex-1">
              <Text className="font-bold text-dark text-base">
                {user?.name ?? '—'} {(user as any)?.surname ?? ''}
              </Text>
              <Text className="text-sm text-gray-400">{user?.email ?? '—'}</Text>
            </View>
            {saveOk && (
              <View className={`${mt.badgeSuccess}`}>
                <Feather name="check" size={12} color="#16a34a" />
                <Text className="text-green-700 text-xs font-bold">{t('settings.updateSuccess')}</Text>
              </View>
            )}
          </View>

          {/* Role & permissions info */}
          {!isEditing && ((user as any)?.roleName || (user as any)?.permissions?.length > 0) && (
            <View className="p-5 space-y-3">
              {(user as any)?.roleName && (
                <View className="flex-row justify-between items-center">
                  <View className="flex-row items-center gap-2">
                    <Feather name="shield" size={14} color="#94a3b8" />
                    <Text className={mt.sectionLabel}>{t('settings.myRole')}</Text>
                  </View>
                  <View className={mt.badgeBrand}>
                    <Text className="text-brand font-bold text-xs">{(user as any).roleName}</Text>
                  </View>
                </View>
              )}
              {(user as any)?.permissions?.length > 0 && (
                <View className="flex-row justify-between items-center">
                  <View className="flex-row items-center gap-2">
                    <Feather name="key" size={14} color="#94a3b8" />
                    <Text className={mt.sectionLabel}>{t('settings.myPermissions')}</Text>
                  </View>
                  <Text className="text-xs font-semibold text-gray-500">
                    {t('settings.permissionsCount', { count: (user as any).permissions.length })}
                  </Text>
                </View>
              )}
            </View>
          )}

          {/* Edit form */}
          {isEditing && (
            <View className="p-5 space-y-4">
              <View className="flex-row gap-3">
                <View className="flex-1">
                  <Text className={mt.inputLabel}>{t('settings.nameLabel')}</Text>
                  <TextInput
                    className={mt.input}
                    value={form.name}
                    onChangeText={v => setForm(p => ({ ...p, name: v }))}
                    placeholder="Carlos"
                  />
                </View>
                <View className="flex-1">
                  <Text className={mt.inputLabel}>{t('settings.surnameLabel')}</Text>
                  <TextInput
                    className={mt.input}
                    value={form.surname}
                    onChangeText={v => setForm(p => ({ ...p, surname: v }))}
                    placeholder="García"
                  />
                </View>
              </View>
              <View>
                <Text className={mt.inputLabel}>{t('settings.email')}</Text>
                <TextInput
                  className={mt.input}
                  value={form.email}
                  onChangeText={v => setForm(p => ({ ...p, email: v }))}
                  placeholder="usuario@empresa.com"
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
              </View>
              <View className="flex-row gap-3 pt-2">
                <TouchableOpacity
                  onPress={() => setIsEditing(false)}
                  className={`flex-1 ${mt.btnGhost} justify-center`}
                >
                  <Text className="text-gray-600 font-bold">{t('settings.cancelEdit')}</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={handleSave}
                  disabled={isSaving || !form.name.trim()}
                  className={`flex-[2] ${mt.btnPrimary} ${isSaving || !form.name.trim() ? 'opacity-60' : ''}`}
                >
                  {isSaving
                    ? <ActivityIndicator color="white" size="small" />
                    : <Text className="text-white font-bold">{t('settings.saveChanges')}</Text>
                  }
                </TouchableOpacity>
              </View>
            </View>
          )}
        </View>

        {/* Language */}
        <View className={`${mt.listSection} mb-6`}>
          <View className="p-5 border-b border-gray-50 flex-row items-center gap-3">
            <View className={`${mt.iconBox} bg-blue-50`}>
              <Feather name="globe" size={20} color="#3b82f6" />
            </View>
            <View>
              <Text className="font-bold text-dark">{t('settings.language')}</Text>
              <Text className="text-xs text-gray-400 mt-0.5">{t('settings.languageDesc')}</Text>
            </View>
          </View>
          <View className="p-2">
            {LANGUAGES.map(lang => {
              const isActive = i18n.language.startsWith(lang.code);
              return (
                <TouchableOpacity
                  key={lang.code}
                  onPress={() => i18n.changeLanguage(lang.code)}
                  className={`flex-row items-center justify-between p-4 rounded-2xl ${isActive ? 'bg-brand/5' : ''}`}
                >
                  <View className="flex-row items-center gap-3">
                    <Text className="text-2xl">{lang.flag}</Text>
                    <Text className={`font-semibold ${isActive ? 'text-brand' : 'text-gray-600'}`}>{lang.label}</Text>
                  </View>
                  {isActive && <Feather name="check" size={20} color={colors.brand} />}
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Logout */}
        <TouchableOpacity
          onPress={handleLogout}
          className={`${mt.card} p-5 border-red-100 flex-row items-center gap-3`}
        >
          <View className={`${mt.iconBox} bg-red-50`}>
            <Feather name="log-out" size={20} color="#ef4444" />
          </View>
          <View>
            <Text className="font-bold text-red-500">{t('settings.logout')}</Text>
            <Text className="text-xs text-red-400 mt-0.5">{t('settings.closeSessionDesc')}</Text>
          </View>
        </TouchableOpacity>

      </ScrollView>
    </SafeAreaView>
  );
}
