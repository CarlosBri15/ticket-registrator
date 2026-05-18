import React, { useState } from 'react';
import {
  View,
  Text,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { loginSchema, type LoginSchema, useLoginMutation } from '@ticket-registrator/shared';
import { useRouter } from 'expo-router';
import {
  Zap,
  Eye,
  EyeOff,
  AlertCircle,
  ArrowRight,
} from 'lucide-react-native';
import { useTranslation } from 'react-i18next';

import { Card } from '../../src/components/ui/Card';
import { Input } from '../../src/components/ui/Input';
import { colors } from '../../src/constants/theme';
import { tokenProvider } from '../../src/api/client';

export default function LoginScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [passwordVisible, setPasswordVisible] = useState(false);

  const { mutate, isPending, isError, error } = useLoginMutation({
    onSuccess: async (data: { access_token: string }) => {
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
    ? (error as { response?: { data?: { message?: string } } })?.response?.data?.message
      || t('common.error')
    : undefined;

  return (
    <View style={s.screen}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.surface} />
      <View style={{ height: insets.top, backgroundColor: colors.surface }} />

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
              <View style={s.logoCard}>
                <Zap size={28} color={colors.dark} strokeWidth={2} />
              </View>
              <Text style={s.brandName}>TicketReg AI</Text>
              <Text style={s.brandSub}>{t('auth.loginSubtitle')}</Text>
            </View>

            {/* ── Form ── */}
            <View style={s.form}>
              <Controller
                control={control}
                name="email"
                render={({ field: { onChange, onBlur, value } }) => (
                  <Input
                    label={t('auth.emailLabel')}
                    value={value}
                    onChangeText={onChange}
                    onBlur={onBlur}
                    placeholder={t('auth.emailPlaceholder')}
                    autoCapitalize="none"
                    keyboardType="email-address"
                    error={errors.email?.message}
                  />
                )}
              />

              <View>
                <Text style={s.passwordLabel}>{t('auth.passwordLabel')}</Text>
                <View style={s.passwordRow}>
                  <View style={s.passwordInput}>
                    <Controller
                      control={control}
                      name="password"
                      render={({ field: { onChange, onBlur, value } }) => (
                        <Input
                          containerClassName="mb-0"
                          value={value}
                          onChangeText={onChange}
                          onBlur={onBlur}
                          placeholder="••••••••••"
                          secureTextEntry={!passwordVisible}
                          error={errors.password?.message}
                        />
                      )}
                    />
                  </View>
                  <TouchableOpacity
                    onPress={() => setPasswordVisible((v) => !v)}
                    style={s.eyeBtn}
                    activeOpacity={0.7}
                    accessibilityRole="button"
                    accessibilityLabel="toggle password visibility"
                  >
                    {passwordVisible ? (
                      <EyeOff size={18} color={colors.fgSecondary} strokeWidth={2} />
                    ) : (
                      <Eye size={18} color={colors.fgSecondary} strokeWidth={2} />
                    )}
                  </TouchableOpacity>
                </View>
              </View>

              {/* Server error */}
              {serverErrorMessage ? (
                <Card style={s.errorCard} bg={colors.dangerBg} borderColor={colors.dangerBorder}>
                  <View style={s.errorInner}>
                    <AlertCircle size={16} color={colors.danger} strokeWidth={2} />
                    <Text style={s.errorText}>{serverErrorMessage}</Text>
                  </View>
                </Card>
              ) : null}

              {/* Login button */}
              <TouchableOpacity
                style={[s.loginBtn, isPending && s.loginBtnDisabled]}
                onPress={isPending ? undefined : handleSubmit(onSubmit)}
                activeOpacity={0.85}
                disabled={isPending}
              >
                {isPending ? (
                  <ActivityIndicator size="small" color={colors.fgOnBrand} />
                ) : (
                  <>
                    <Text style={s.loginBtnText}>{t('auth.loginButton')}</Text>
                    <ArrowRight size={16} color={colors.fgOnBrand} strokeWidth={2} />
                  </>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const s = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.surface },
  scroll: { flexGrow: 1 },
  inner: { flex: 1, justifyContent: 'center', paddingHorizontal: 24, paddingVertical: 40 },

  brandBlock: { alignItems: 'center', marginBottom: 40 },
  logoCard: {
    width: 64,
    height: 64,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.accent,
    borderRadius: 16,
  },
  brandName: {
    fontFamily: 'Manrope-Bold',
    fontSize: 32,
    color: colors.dark,
    letterSpacing: -0.6,
    marginTop: 20,
  },
  brandSub: {
    fontFamily: 'Manrope-Medium',
    fontSize: 14,
    color: colors.fgSecondary,
    marginTop: 6,
    textAlign: 'center',
  },

  form: { width: '100%', marginBottom: 24, gap: 4 },
  passwordLabel: {
    fontFamily: 'Manrope-SemiBold',
    fontSize: 11,
    color: colors.fgSecondary,
    marginBottom: 6,
  },
  passwordRow: { flexDirection: 'row', gap: 10, alignItems: 'flex-start' },
  passwordInput: { flex: 1, minWidth: 0 },
  eyeBtn: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surfaceCard,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 6,
  },

  errorCard: { marginBottom: 12 },
  errorInner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    padding: 14,
  },
  errorText: {
    flex: 1,
    fontFamily: 'Manrope-Medium',
    fontSize: 13,
    color: colors.dangerText,
  },

  loginBtn: {
    marginTop: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: colors.brand,
    paddingVertical: 14,
    borderRadius: 9999,
  },
  loginBtnDisabled: {
    opacity: 0.65,
  },
  loginBtnText: {
    fontFamily: 'Manrope-SemiBold',
    fontSize: 14,
    color: colors.fgOnBrand,
  },
});
