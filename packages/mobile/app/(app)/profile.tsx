import React from 'react';
import {
  Image,
  View,
  Text,
  ScrollView,
  ActivityIndicator,
  StyleSheet,
  StatusBar,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { 
  IconLogout, 
  IconShield, 
  IconUser, 
  IconEdit, 
  IconX, 
  IconCheck, 
  IconCircleCheck, 
  IconGlobe 
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

  const roleName: string = (user as any)?.roleName ?? '';

  return (
    <View style={s.screen}>
      <StatusBar barStyle="dark-content" backgroundColor={CARD_BG} />
      <View style={{ height: insets.top, backgroundColor: CARD_BG }} />

      {/* ── Header ── */}
      <View style={s.header}>
        <Text style={s.headerTitle}>{t('settings.profile') ?? 'Perfil'}</Text>
        <PixelCard
          bg={colors.danger}
          shadowOffset={3}
          radius={8}
          onPress={handleLogout}
        >
          <View style={s.headerBtn}>
            <IconLogout size={16} color="white" />
          </View>
        </PixelCard>
      </View>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={s.scroll}
        showsVerticalScrollIndicator={false}
      >
        {/* ── Avatar card ── */}
        <PixelCard bg={CARD_BG} shadowOffset={4} style={s.profileCardWrap}>
          <View style={s.profileCardInner}>
            <PixelCard bg={colors.secondary} shadowOffset={3} radius={14}>
              <View style={s.avatarBubbleInner}>
                <Image source={userIcon} style={s.avatarImage} />
              </View>
            </PixelCard>
            <View style={s.profileMeta}>
              <Text style={s.userName}>{user?.name ?? '...'}</Text>
              <Text style={s.userEmail}>{user?.email}</Text>
              {roleName ? (
                <View style={s.rolePill}>
                  <IconShield size={9} color={CARD_BG} />
                  <Text style={s.rolePillText}>{roleName}</Text>
                </View>
              ) : null}
            </View>
          </View>
        </PixelCard>

        {/* ── Personal data ── */}
        <View style={s.section}>
          <View style={s.sectionHeader}>
            <IconUser size={11} color={DARK} />
            <Text style={s.sectionTitle}>{t('settings.personalData')}</Text>
            {isEditing ? (
              <PixelCard
                bg={CARD_BG}
                shadowOffset={3}
                radius={8}
                onPress={() => setIsEditing(false)}
              >
                <View style={s.sectionBtnInner}>
                  <IconX size={13} color={DARK} />
                  <Text style={s.sectionBtnText}>{t('common.cancel')}</Text>
                </View>
              </PixelCard>
            ) : (
              <PixelCard
                bg={colors.brand}
                shadowOffset={3}
                radius={8}
                onPress={startEdit}
              >
                <View style={s.sectionBtnInner}>
                  <IconEdit size={13} color="white" />
                  <Text style={[s.sectionBtnText, { color: 'white' }]}>{t('common.edit')}</Text>
                </View>
              </PixelCard>
            )}
          </View>

          <View style={s.formContainer}>
            <PixelField label={t('common.name')}>
              <PixelInput
                value={form.name}
                onChangeText={(v) => setForm({ ...form, name: v })}
                placeholder="Tu nombre"
                editable={isEditing}
              />
            </PixelField>

            <PixelField label={t('common.email')}>
              <PixelInput
                value={form.email}
                onChangeText={(v) => setForm({ ...form, email: v })}
                placeholder="email@ejemplo.com"
                editable={isEditing}
                keyboardType="email-address"
              />
            </PixelField>

            {isEditing && (
              <PixelCard
                bg={colors.brand}
                shadowOffset={4}
                style={isSaving ? s.savingOpacity : undefined}
                onPress={isSaving ? undefined : handleSave}
              >
                <View style={s.saveBtnInner}>
                  {isSaving ? (
                    <ActivityIndicator size="small" color="white" />
                  ) : (
                    <>
                      <IconCheck size={16} color="white" />
                      <Text style={s.saveBtnText}>{t('common.save')}</Text>
                    </>
                  )}
                </View>
              </PixelCard>
            )}

            {saveOk && !isEditing && (
              <View style={s.successMsg}>
                <IconCircleCheck size={14} color={colors.success} />
                <Text style={s.successText}>{t('common.success')}</Text>
              </View>
            )}
          </View>
        </View>

        {/* ── Language ── */}
        <View style={s.section}>
          <View style={s.sectionHeader}>
            <IconGlobe size={11} color={DARK} />
            <Text style={s.sectionTitle}>{t('settings.language')}</Text>
          </View>

          <View style={s.langRow}>
            {LANGUAGES.map((lang) => {
              const active = language === lang.code;
              return (
                <PixelCard
                  key={lang.code}
                  bg={active ? colors.brand : CARD_BG}
                  shadowOffset={active ? 4 : 3}
                  active={active}
                  style={s.langCard}
                  onPress={() => changeLanguage(lang.code)}
                >
                  <View style={s.langBox}>
                    <Text style={s.langFlag}>{lang.flag}</Text>
                    <Text style={[s.langText, active && s.langTextActive]}>
                      {lang.label}
                    </Text>
                    {active && <IconCheck size={14} color="white" />}
                  </View>
                </PixelCard>
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
  screen: { flex: 1, backgroundColor: SCREEN_BG },
  scroll: { padding: 20, paddingBottom: 60 },

  // ── Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingTop: 10,
    paddingBottom: 12,
    backgroundColor: CARD_BG,
    borderBottomWidth: 4,
    borderBottomColor: DARK,
  },
  headerTitle: {
    fontFamily: 'SpaceGrotesk-Bold',
    fontSize: 24,
    color: DARK,
    letterSpacing: 0.5,
  },
  headerBtn: {
    width: 34,
    height: 34,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // ── Profile card
  profileCardWrap: { marginBottom: 28 },
  profileCardInner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    padding: 16,
  },
  avatarBubbleInner: { width: 68, height: 68, alignItems: 'center', justifyContent: 'center', overflow: 'hidden' },
  avatarImage: { width: '100%', height: '100%' },
  avatarText: { fontFamily: 'SpaceGrotesk-Bold', fontSize: 26, color: DARK },
  profileMeta: { flex: 1 },
  userName: {
    fontFamily: 'SpaceGrotesk-Bold',
    fontSize: 18,
    color: DARK,
    letterSpacing: -0.3,
  },
  userEmail: {
    fontFamily: 'SpaceGrotesk-Medium',
    fontSize: 12,
    color: `${DARK}50`,
    marginTop: 2,
  },
  rolePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    alignSelf: 'flex-start',
    marginTop: 8,
    backgroundColor: DARK,
    borderRadius: 4,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  rolePillText: {
    fontFamily: 'SpaceGrotesk-Bold',
    fontSize: 9,
    color: CARD_BG,
    letterSpacing: 0.5,
  },

  // ── Sections
  section: { marginBottom: 28 },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 14,
  },
  sectionTitle: {
    flex: 1,
    fontFamily: 'SpaceGrotesk-Bold',
    fontSize: 12,
    color: DARK,
    letterSpacing: 0.3,
  },
  sectionBtnInner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  sectionBtnText: {
    fontFamily: 'SpaceGrotesk-Bold',
    fontSize: 11,
    color: DARK,
    letterSpacing: 0.2,
  },

  // ── Form
  formContainer: { gap: 0 },
  saveBtnInner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 16,
  },
  savingOpacity: { opacity: 0.6 },
  saveBtnText: { fontFamily: 'SpaceGrotesk-Bold', fontSize: 14, color: 'white', letterSpacing: 0.3 },
  successMsg: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, marginTop: 12 },
  successText: { fontFamily: 'SpaceGrotesk-Bold', fontSize: 12, color: colors.success },

  // ── Language
  langRow: { flexDirection: 'row', gap: 12 },
  langCard: { flex: 1 },
  langBox: { flexDirection: 'row', alignItems: 'center', gap: 10, padding: 16 },
  langFlag: { fontSize: 18 },
  langText: { flex: 1, fontFamily: 'SpaceGrotesk-Bold', fontSize: 13, color: DARK },
  langTextActive: { color: 'white' },

  // ── Version
  versionBox: { alignItems: 'center', marginTop: 8 },
  versionText: { fontFamily: 'SpaceGrotesk-Bold', fontSize: 9, color: `${DARK}30`, letterSpacing: 0.5 },
  versionNumber: { fontFamily: 'SpaceGrotesk-Medium', fontSize: 10, color: `${DARK}30`, marginTop: 3 },
});
