import React from 'react';
import {
  Image,
  View,
  Text,
  ScrollView,
  ActivityIndicator,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  LogOut,
  Shield,
  User,
  Pencil,
  X,
  Check,
  CircleCheck,
  Globe,
} from 'lucide-react-native';
import { useTranslation } from 'react-i18next';

import { Card } from '../../src/components/ui/Card';
import { Input } from '../../src/components/ui/Input';
import { colors } from '../../src/constants/theme';
import { useProfileScreen } from '../../src/hooks/useProfileScreen';
import { userIcon } from '@ticket-registrator/shared/assets';

const LANGUAGES = [
  { code: 'es', label: 'Español', flag: '🇪🇸' },
  { code: 'en', label: 'English', flag: '🇬🇧' },
];

export default function ProfileScreen() {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();

  const {
    user,
    isEditing,
    setIsEditing,
    saveOk,
    form,
    setForm,
    startEdit,
    handleSave,
    handleLogout,
    isSaving,
    language,
    changeLanguage,
  } = useProfileScreen();

  const roleName: string = (user as { roleName?: string } | null)?.roleName ?? '';

  return (
    <View style={s.screen}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.surfaceCard} />
      <View style={{ height: insets.top, backgroundColor: colors.surfaceCard }} />

      {/* ── Page header ── */}
      <View style={s.pageHead}>
        <View style={s.pageHeadText}>
          <Text style={s.pageTitle}>{t('settings.profile') ?? 'Perfil'}</Text>
          <Text style={s.pageSubtitle}>Cuenta y preferencias</Text>
        </View>
        <TouchableOpacity
          accessibilityRole="button"
          accessibilityLabel="logout"
          onPress={handleLogout}
          activeOpacity={0.85}
          style={s.logoutBtn}
        >
          <LogOut size={16} color={colors.danger} strokeWidth={2} />
        </TouchableOpacity>
      </View>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={s.scroll}
        showsVerticalScrollIndicator={false}
      >
        {/* ── Avatar card ── */}
        <Card style={s.profileCardWrap}>
          <View style={s.profileCardInner}>
            <View style={s.avatarBubble}>
              <Image source={userIcon} style={s.avatarImage} />
            </View>
            <View style={s.profileMeta}>
              <Text style={s.userName}>{user?.name ?? '...'}</Text>
              <Text style={s.userEmail}>{user?.email}</Text>
              {roleName ? (
                <View style={s.rolePill}>
                  <Shield size={10} color={colors.fgOnBrand} strokeWidth={2} />
                  <Text style={s.rolePillText}>{roleName}</Text>
                </View>
              ) : null}
            </View>
          </View>
        </Card>

        {/* ── Personal data ── */}
        <View style={s.section}>
          <View style={s.sectionHeader}>
            <User size={12} color={colors.fgSecondary} strokeWidth={2} />
            <Text style={s.sectionTitle}>{t('settings.personalData')}</Text>
            {isEditing ? (
              <TouchableOpacity
                accessibilityRole="button"
                onPress={() => setIsEditing(false)}
                activeOpacity={0.85}
                style={s.sectionBtnSecondary}
              >
                <X size={13} color={colors.dark} strokeWidth={2} />
                <Text style={s.sectionBtnText}>{t('common.cancel')}</Text>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity
                accessibilityRole="button"
                onPress={startEdit}
                activeOpacity={0.85}
                style={s.sectionBtnPrimary}
              >
                <Pencil size={13} color={colors.fgOnBrand} strokeWidth={2} />
                <Text style={[s.sectionBtnText, { color: colors.fgOnBrand }]}>{t('common.edit')}</Text>
              </TouchableOpacity>
            )}
          </View>

          <View style={s.formContainer}>
            <Input
              label={t('common.name')}
              value={form.name}
              onChangeText={(v) => setForm({ ...form, name: v })}
              placeholder="Tu nombre"
              editable={isEditing}
            />

            <Input
              label={t('common.email')}
              value={form.email}
              onChangeText={(v) => setForm({ ...form, email: v })}
              placeholder="email@ejemplo.com"
              editable={isEditing}
              keyboardType="email-address"
            />

            {isEditing ? (
              <TouchableOpacity
                accessibilityRole="button"
                onPress={isSaving ? undefined : handleSave}
                disabled={isSaving}
                activeOpacity={0.85}
                style={[s.saveBtn, isSaving && s.savingOpacity]}
              >
                {isSaving ? (
                  <ActivityIndicator size="small" color={colors.fgOnBrand} />
                ) : (
                  <>
                    <Check size={16} color={colors.fgOnBrand} strokeWidth={2} />
                    <Text style={s.saveBtnText}>{t('common.save')}</Text>
                  </>
                )}
              </TouchableOpacity>
            ) : null}

            {saveOk && !isEditing ? (
              <View style={s.successMsg}>
                <CircleCheck size={14} color={colors.success} strokeWidth={2} />
                <Text style={s.successText}>{t('common.success')}</Text>
              </View>
            ) : null}
          </View>
        </View>

        {/* ── Language ── */}
        <View style={s.section}>
          <View style={s.sectionHeader}>
            <Globe size={12} color={colors.fgSecondary} strokeWidth={2} />
            <Text style={s.sectionTitle}>{t('settings.language')}</Text>
          </View>

          <View style={s.langRow}>
            {LANGUAGES.map((lang) => {
              const active = language === lang.code;
              return (
                <TouchableOpacity
                  key={lang.code}
                  onPress={() => changeLanguage(lang.code)}
                  activeOpacity={0.85}
                  style={[s.langCard, active && s.langCardActive]}
                >
                  <Text style={s.langFlag}>{lang.flag}</Text>
                  <Text style={[s.langText, active && s.langTextActive]}>
                    {lang.label}
                  </Text>
                  {active ? <Check size={14} color={colors.fgOnBrand} strokeWidth={2} /> : null}
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* ── Version ── */}
        <View style={s.versionBox}>
          <Text style={s.versionText}>Ticket Registrator Mobile</Text>
          <Text style={s.versionNumber}>v1.2.0 · Build 245</Text>
        </View>
      </ScrollView>
    </View>
  );
}

const s = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.surface },
  scroll: { padding: 20, paddingBottom: 60 },

  pageHead: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    paddingHorizontal: 22,
    paddingTop: 14,
    paddingBottom: 18,
    backgroundColor: colors.surface,
    gap: 12,
  },
  pageHeadText: { flex: 1, minWidth: 0 },
  pageTitle: {
    fontFamily: 'Manrope-Bold',
    fontSize: 34,
    color: colors.dark,
    letterSpacing: -1,
    lineHeight: 36,
  },
  pageSubtitle: {
    fontFamily: 'Manrope-Medium',
    fontSize: 13,
    color: colors.fgSecondary,
    marginTop: 6,
  },
  logoutBtn: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 9999,
    backgroundColor: colors.surfaceSunken,
  },

  profileCardWrap: { marginBottom: 24 },
  profileCardInner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    padding: 18,
  },
  avatarBubble: {
    width: 64,
    height: 64,
    borderRadius: 9999,
    backgroundColor: colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  avatarImage: { width: 56, height: 56 },
  profileMeta: { flex: 1 },
  userName: {
    fontFamily: 'Manrope-Bold',
    fontSize: 18,
    color: colors.dark,
    letterSpacing: -0.3,
  },
  userEmail: {
    fontFamily: 'Manrope-Medium',
    fontSize: 13,
    color: colors.fgSecondary,
    marginTop: 2,
  },
  rolePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    alignSelf: 'flex-start',
    marginTop: 8,
    backgroundColor: colors.brand,
    borderRadius: 9999,
    paddingHorizontal: 10,
    paddingVertical: 3,
  },
  rolePillText: {
    fontFamily: 'Manrope-SemiBold',
    fontSize: 10,
    color: colors.fgOnBrand,
  },

  section: { marginBottom: 28 },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 14,
  },
  sectionTitle: {
    flex: 1,
    fontFamily: 'Manrope-SemiBold',
    fontSize: 13,
    color: colors.dark,
    letterSpacing: -0.1,
  },
  sectionBtnPrimary: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: colors.brand,
    borderRadius: 9999,
  },
  sectionBtnSecondary: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: colors.surfaceCard,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 9999,
  },
  sectionBtnText: {
    fontFamily: 'Manrope-SemiBold',
    fontSize: 11,
    color: colors.dark,
  },

  formContainer: { gap: 0 },
  saveBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
    borderRadius: 9999,
    backgroundColor: colors.brand,
    marginTop: 4,
  },
  savingOpacity: { opacity: 0.65 },
  saveBtnText: { fontFamily: 'Manrope-SemiBold', fontSize: 14, color: colors.fgOnBrand },
  successMsg: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    marginTop: 12,
  },
  successText: { fontFamily: 'Manrope-SemiBold', fontSize: 12, color: colors.success },

  langRow: { flexDirection: 'row', gap: 10 },
  langCard: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    padding: 14,
    backgroundColor: colors.surfaceCard,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 14,
  },
  langCardActive: {
    backgroundColor: colors.brand,
    borderColor: colors.brand,
  },
  langFlag: { fontSize: 18 },
  langText: {
    flex: 1,
    fontFamily: 'Manrope-SemiBold',
    fontSize: 13,
    color: colors.dark,
  },
  langTextActive: { color: colors.fgOnBrand },

  versionBox: { alignItems: 'center', marginTop: 8 },
  versionText: {
    fontFamily: 'Manrope-SemiBold',
    fontSize: 11,
    color: colors.fgQuaternary,
  },
  versionNumber: {
    fontFamily: 'Manrope-Medium',
    fontSize: 11,
    color: colors.fgQuaternary,
    marginTop: 3,
  },
});
