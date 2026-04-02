import React, { useState } from 'react';
import {
  View,
  Text,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator,
  StyleSheet,
  StatusBar,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { loginSchema, type LoginSchema, useLoginMutation } from '@ticket-registrator/shared';
import { useRouter } from 'expo-router';
import { 
  IconBolt, 
  IconEye, 
  IconEyeOff, 
  IconAlertCircle, 
  IconArrowRight 
} from '@tabler/icons-react-native';
import { useTranslation } from 'react-i18next';

import {
  PixelCard,
  DARK,
  CARD_BG,
  SCREEN_BG,
  colors,
} from '../../src/components/ui/PixelCard';
import { PixelField } from '../../src/components/ui/PixelField';
import { PixelInput } from '../../src/components/ui/PixelInput';
import { tokenProvider } from '../../src/api/client';

export default function LoginScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [passwordVisible, setPasswordVisible] = useState(false);

  const { mutate, isPending, isError, error } = useLoginMutation({
    onSuccess: async (data: any) => {
      await tokenProvider.setToken(data.access_token);
      router.replace('/(app)/home');
    },
  });

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginSchema>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  });

  const onSubmit = (data: LoginSchema) => mutate(data);

  const serverErrorMessage = isError
    ? (error as any)?.response?.data?.message || t('common.error')
    : undefined;

  return (
    <View style={s.screen}>
      <StatusBar barStyle="dark-content" backgroundColor={SCREEN_BG} />
      <View style={{ height: insets.top, backgroundColor: SCREEN_BG }} />

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={s.scroll}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={s.inner}>
          {/* ── Brand block ── */}
          <View style={s.brandBlock}>
            <PixelCard bg={colors.secondary} shadowOffset={4} radius={20}>
              <View style={s.logoInner}>
                <IconBolt size={36} color={DARK} />
              </View>
            </PixelCard>
            <Text style={s.brandName}>TicketReg AI</Text>
            <Text style={s.brandSub}>{t('auth.loginSubtitle')}</Text>
          </View>

          {/* ── Form ── */}
          <View style={s.form}>
            <PixelField label={t('auth.emailLabel')}>
              <Controller
                control={control}
                name="email"
                render={({ field: { onChange, onBlur, value } }) => (
                  <PixelInput
                    value={value}
                    onChangeText={onChange}
                    onBlur={onBlur}
                    placeholder={t('auth.emailPlaceholder')}
                    autoCapitalize="none"
                    keyboardType="email-address"
                    error={!!errors.email}
                  />
                )}
              />
              {errors.email && (
                <Text style={s.fieldError}>{errors.email.message}</Text>
              )}
            </PixelField>

            <PixelField label={t('auth.passwordLabel')}>
              <View style={s.passwordRow}>
                <View style={s.passwordInput}>
                  <Controller
                    control={control}
                    name="password"
                    render={({ field: { onChange, onBlur, value } }) => (
                      <PixelInput
                        value={value}
                        onChangeText={onChange}
                        onBlur={onBlur}
                        placeholder="••••••••••"
                        secureTextEntry={!passwordVisible}
                        error={!!errors.password}
                      />
                    )}
                  />
                </View>
                <PixelCard
                  bg={CARD_BG}
                  shadowOffset={3}
                  radius={8}
                  onPress={() => setPasswordVisible(v => !v)}
                >
                  <View style={s.eyeBtn}>
                    {passwordVisible ? (
                      <IconEyeOff size={18} color={`${DARK}60`} />
                    ) : (
                      <IconEye size={18} color={`${DARK}60`} />
                    )}
                  </View>
                </PixelCard>
              </View>
              {errors.password && (
                <Text style={s.fieldError}>{errors.password.message}</Text>
              )}
            </PixelField>

            {/* Server error */}
            {serverErrorMessage && (
              <PixelCard bg="#FEF2F2" shadowOffset={3} style={s.errorCard}>
                <View style={s.errorInner}>
                  <IconAlertCircle size={16} color={colors.danger} />
                  <Text style={s.errorText}>{serverErrorMessage}</Text>
                </View>
              </PixelCard>
            )}

            {/* Login button */}
            <PixelCard
              bg={isPending ? `${colors.brand}99` : colors.brand}
              shadowOffset={4}
              style={s.loginCard}
              onPress={isPending ? undefined : handleSubmit(onSubmit)}
            >
              <View style={s.loginBtnInner}>
                {isPending ? (
                  <ActivityIndicator size="small" color="white" />
                ) : (
                  <>
                    <Text style={s.loginBtnText}>{t('auth.loginButton')}</Text>
                    <IconArrowRight size={18} color="white" />
                  </>
                )}
              </View>
            </PixelCard>
          </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const s = StyleSheet.create({
  screen: { flex: 1, backgroundColor: SCREEN_BG },
  scroll: { flexGrow: 1 },
  inner: { flex: 1, justifyContent: 'center', paddingHorizontal: 24, paddingVertical: 40 },

  // ── Brand
  brandBlock: { alignItems: 'center', marginBottom: 40 },
  logoInner: { width: 80, height: 80, alignItems: 'center', justifyContent: 'center' },
  brandName: {
    fontFamily: 'SpaceGrotesk-Bold',
    fontSize: 32,
    color: DARK,
    letterSpacing: -0.5,
    marginTop: 20,
  },
  brandSub: {
    fontFamily: 'SpaceGrotesk-Medium',
    fontSize: 14,
    color: `${DARK}55`,
    marginTop: 6,
    textAlign: 'center',
  },

  // ── Form
  form: { width: '100%', marginBottom: 32 },
  fieldError: {
    fontFamily: 'SpaceGrotesk-Bold',
    fontSize: 11,
    color: colors.danger,
    marginTop: 6,
    marginLeft: 2,
  },
  passwordRow: { flexDirection: 'row', gap: 10 },
  passwordInput: { flex: 1, minWidth: 0 },
  eyeBtn: { width: 50, height: 50, alignItems: 'center', justifyContent: 'center' },

  // ── Error card
  errorCard: { marginBottom: 16 },
  errorInner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    padding: 14,
  },
  errorText: {
    flex: 1,
    fontFamily: 'SpaceGrotesk-Bold',
    fontSize: 12,
    color: colors.danger,
  },

  // ── Login button
  loginCard: { marginTop: 8 },
  loginBtnInner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    paddingVertical: 18,
  },
  loginBtnText: {
    fontFamily: 'SpaceGrotesk-Bold',
    fontSize: 16,
    color: 'white',
    letterSpacing: 0.3,
  },

});
