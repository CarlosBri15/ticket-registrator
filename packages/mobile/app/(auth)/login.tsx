import React from 'react';
import {
  View,
  Text,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { loginSchema, type LoginSchema, useLoginMutation } from '@ticket-registrator/shared';
import { useRouter } from 'expo-router';
import { Button } from '../../src/components/Button';
import { Input } from '../../src/components/Input';
import { tokenProvider } from '../../src/api/client';
import { Sparkles, ShieldCheck } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';

export default function LoginScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const { mutate, isPending, isError, error } = useLoginMutation({
    onSuccess: async (data: any) => {
      await tokenProvider.setToken(data.access_token);
      router.replace('/(app)/home');
    }
  });

  const { control, handleSubmit, formState: { errors } } = useForm<LoginSchema>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: ''
    }
  });

  const onSubmit = (data: LoginSchema) => {
    mutate(data);
  };

  const serverErrorMessage = isError ? (error as any)?.response?.data?.message || t('common.error') : undefined;

  return (
    <SafeAreaView className="flex-1 bg-surface">
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1"
      >
        <ScrollView
          contentContainerStyle={{ flexGrow: 1 }}
          keyboardShouldPersistTaps="handled"
        >
          <View className="flex-1 justify-center p-8">
            {/* Logo / Icon */}
            <View className="items-center mb-8">
              <View className="w-16 h-16 bg-brand rounded-2xl items-center justify-center shadow-lg shadow-brand/30">
                <Sparkles size={32} color="white" />
              </View>
            </View>

            <View className="items-center mb-10">
              <Text className="text-3xl font-bold text-dark mb-2">TicketReg AI</Text>
              <Text className="text-gray-500 text-center">
                {t('auth.loginSubtitle')}
              </Text>
            </View>

            {/* Form */}
            <View className="space-y-4">
              <Controller
                control={control}
                name="email"
                render={({ field: { onChange, onBlur, value } }) => (
                  <Input
                    label={t('auth.emailLabel')}
                    placeholder={t('auth.emailPlaceholder')}
                    onBlur={onBlur}
                    onChangeText={onChange}
                    value={value}
                    error={errors.email?.message}
                    autoCapitalize="none"
                    keyboardType="email-address"
                  />
                )}
              />

              <Controller
                control={control}
                name="password"
                render={({ field: { onChange, onBlur, value } }) => (
                  <Input
                    label={t('auth.passwordLabel')}
                    placeholder="••••••••••"
                    secureTextEntry
                    onBlur={onBlur}
                    onChangeText={onChange}
                    value={value}
                    error={errors.password?.message}
                  />
                )}
              />

              {serverErrorMessage && (
                <View className="p-4 rounded-xl bg-red-50 border border-red-100 flex-row items-start mb-4">
                  <Text className="text-red-500 mr-2">⚠️</Text>
                  <Text className="text-sm font-medium text-red-700 flex-1">
                    {serverErrorMessage}
                  </Text>
                </View>
              )}

              <Button
                onPress={handleSubmit(onSubmit)}
                isLoading={isPending}
                className="mt-4"
                size="lg"
              >
                {t('auth.loginButton')}
              </Button>

              <TouchableOpacity className="mt-4 items-center">
                <Text className="text-sm font-semibold text-brand">
                  {t('auth.forgotPassword')}
                </Text>
              </TouchableOpacity>
            </View>

            {/* Footer */}
            <View className="mt-auto pt-8 items-center">
              <Text className="text-gray-500 mb-2">
                {t('auth.noAccount')}{' '}
                <Text className="font-bold text-brand">{t('auth.requestAccess')}</Text>
              </Text>
              <View className="flex-row items-center space-x-2 opacity-50">
                <ShieldCheck size={14} color="#64748b" />
                <Text className="text-xs font-medium text-gray-500">{t('auth.securityBadge')}</Text>
              </View>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}