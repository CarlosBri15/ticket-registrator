import {
  Image,
  View,
  Text,
  ScrollView,
  RefreshControl,
  StatusBar,
  StyleSheet,
  Modal,
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { IconChevronRight, IconClock, IconX, IconCamera, IconPhoto } from '@tabler/icons-react-native';

import {
  PixelCard,
  DARK,
  CARD_BG,
  SCREEN_BG,
  BORDER_WIDTH,
  colors,
} from '../../src/components/ui/PixelCard';
import { HeroReportCard, HistoryRow } from '../../src/components/features/ReportListItem';
import { EmptyState } from '../../src/components/ui/EmptyState';
import { ScanningOverlay } from '../../src/components/features/ScanningOverlay';
import { TicketConfirmationForm } from '../../src/components/features/TicketConfirmationForm';

import { useHomeScreen } from '../../src/hooks/useHomeScreen';
import { reportIcon, userIcon, cameraIcon } from '@ticket-registrator/shared/assets';

const AVATAR_BG = '#E8E8FF';

export default function HomeScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const {
    refreshing,
    onRefresh,
    stats,
    activeReport,
    recentCompleted,
    firstName,
    dateLocale,
    scanSheetOpen,
    setScanSheetOpen,
    isModalOpen,
    extractedTicket,
    isUploading,
    isConfirming,
    pickFromCamera,
    pickFromGallery,
    handleConfirm,
    handleDiscard,
  } = useHomeScreen();

  return (
    <View style={s.screen}>
      <StatusBar barStyle="dark-content" backgroundColor={CARD_BG} />
      <View style={{ height: insets.top, backgroundColor: CARD_BG }} />

      {/* ── Header ── */}
      <View style={s.header}>
        <Text style={s.headerTitle}>{firstName}</Text>

        <PixelCard
          bg={AVATAR_BG}
          shadowOffset={3}
          radius={14}
          onPress={() => router.push('/(app)/profile')}
        >
          <View style={s.avatarInner}>
            <Image source={userIcon} style={s.avatarImage} />
          </View>
        </PixelCard>
      </View>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={s.scroll}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.brand} />
        }
      >
        {/* ── Reporte activo + cámara ── */}
        {activeReport ? (
          <View style={s.activeBlock}>
            <HeroReportCard
              report={activeReport}
              onPress={() => router.push(`/(app)/reports/${activeReport.id}`)}
              dateLocale={dateLocale}
            />
            <PixelCard
              bg={colors.brand}
              shadowOffset={4}
              style={s.scanCard}
              onPress={() => setScanSheetOpen(true)}
            >
              <View style={s.scanInner}>
                <Image source={cameraIcon} style={s.scanIconImage} resizeMode="contain" />
                <Text style={s.scanTitle}>{t('reportDetail.scanTicket')}</Text>
                <IconChevronRight size={20} color="rgba(255,255,255,0.6)" />
              </View>
            </PixelCard>
          </View>
        ) : (
          <View style={s.section}>
            <EmptyState
              icon={reportIcon}
              title={t('home.noActive')}
              description={t('home.noActiveDesc')}
              buttonLabel={t('home.createFirst')}
              onButtonPress={() => router.push('/(app)/reports/create')}
            />
          </View>
        )}

        {/* ── Stats ── */}
        <View style={s.sectionHeader}>
          <IconClock size={11} color={DARK} />
          <Text style={s.sectionTitle}>En revisión</Text>
        </View>
        <PixelCard bg={colors.secondary} shadowOffset={4} style={s.statCard}>
          <View style={s.statCardInner}>
            <View style={s.statCardBody}>
              <View style={s.statItem}>
                <Text style={s.statBigNum}>{stats.inReviewCount}</Text>
                <Text style={s.statItemLabel}>{stats.inReviewCount === 1 ? 'reporte' : 'reportes'}</Text>
              </View>
              <View style={s.statDivider} />
              <View style={s.statItem}>
                <Text style={s.statBigNum}>{stats.inReview.toFixed(0)}€</Text>
                <Text style={s.statItemLabel}>pendiente</Text>
              </View>
            </View>
          </View>
        </PixelCard>

        {/* ── Actividad reciente ── */}
        {recentCompleted.length > 0 && (
          <View style={s.section}>
            <View style={s.sectionHeader}>
              <IconClock size={11} color={DARK} />
              <Text style={s.sectionTitle}>{t('home.recentCompleted')}</Text>
            </View>
            {recentCompleted.map(r => (
              <HistoryRow
                key={r.id}
                report={r}
                onPress={() => router.push(`/(app)/reports/${r.id}`)}
                dateLocale={dateLocale}
              />
            ))}
          </View>
        )}
      </ScrollView>

      {/* ── Sheet: cámara o galería ── */}
      <Modal
        visible={scanSheetOpen}
        transparent
        animationType="slide"
        onRequestClose={() => setScanSheetOpen(false)}
      >
        <TouchableWithoutFeedback onPress={() => setScanSheetOpen(false)}>
          <View style={s.sheetOverlay} />
        </TouchableWithoutFeedback>
        <View style={[s.sheet, { paddingBottom: Math.max(insets.bottom, 16) }]}>
          <View style={s.sheetHandle} />
          <View style={s.sheetHeader}>
            <Text style={s.sheetTitle}>{t('reportDetail.scanTicket')}</Text>
            <PixelCard bg={colors.danger} shadowOffset={3} radius={8} onPress={() => setScanSheetOpen(false)}>
              <View style={s.iconBtnInner}>
                <IconX size={15} color="white" />
              </View>
            </PixelCard>
          </View>
          <View style={s.sheetOptions}>
            <PixelCard bg={CARD_BG} shadowOffset={4} style={{ flex: 1 }} onPress={pickFromCamera}>
              <View style={s.sheetOption}>
                <View style={[s.sheetOptionIcon, { backgroundColor: `${colors.brand}15`, borderColor: colors.brand }]}>
                  <IconCamera size={22} color={colors.brand} />
                </View>
                <Text style={s.sheetOptionTitle}>Cámara</Text>
                <Text style={s.sheetOptionSub}>Toma una foto</Text>
              </View>
            </PixelCard>
            <PixelCard bg={CARD_BG} shadowOffset={4} style={{ flex: 1 }} onPress={pickFromGallery}>
              <View style={s.sheetOption}>
                <View style={[s.sheetOptionIcon, { backgroundColor: `${DARK}08`, borderColor: `${DARK}30` }]}>
                  <IconPhoto size={22} color={DARK} />
                </View>
                <Text style={s.sheetOptionTitle}>Galería</Text>
                <Text style={s.sheetOptionSub}>Elige una imagen</Text>
              </View>
            </PixelCard>
          </View>
        </View>
      </Modal>

      {/* ── Modal de confirmación ── */}
      <Modal
        visible={isModalOpen}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={handleDiscard}
      >
        <View style={{ flex: 1, backgroundColor: CARD_BG }}>
          <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
            <View style={s.modalHandle} />
            <View style={s.modalHeader}>
              <Text style={s.modalTitle}>{t('upload.confirmTitle')}</Text>
              <PixelCard bg={colors.danger} shadowOffset={3} radius={8} onPress={handleDiscard}>
                <View style={s.iconBtnInner}>
                  <IconX size={15} color="white" />
                </View>
              </PixelCard>
            </View>
            <View style={{ flex: 1, backgroundColor: SCREEN_BG }}>
              {extractedTicket && (
                <TicketConfirmationForm
                  ticket={extractedTicket}
                  onConfirm={handleConfirm}
                  onCancel={handleDiscard}
                  isLoading={isConfirming}
                />
              )}
            </View>
          </KeyboardAvoidingView>
        </View>
      </Modal>

      {/* ── Scanning overlay ── */}
      <ScanningOverlay visible={isUploading} />
    </View>
  );
}

const s = StyleSheet.create({
  screen: { flex: 1, backgroundColor: SCREEN_BG },

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
  avatarInner: { width: 52, height: 52, alignItems: 'center', justifyContent: 'center', overflow: 'hidden' },
  avatarImage: { width: '100%', height: '100%' },
  avatarText: { fontFamily: 'SpaceGrotesk-Bold', fontSize: 18, color: DARK },

  scroll: { padding: 20, paddingBottom: 120 },

  // ── Active block
  activeBlock: { marginBottom: 28 },

  // ── Scan CTA
  scanCard: { marginTop: 8 },
  scanInner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    paddingHorizontal: 16,
    paddingVertical: 3,
  },
  scanIconImage: { width: 58, height: 58 },
  scanTitle: { flex: 1, fontFamily: 'SpaceGrotesk-Bold', fontSize: 15, color: 'white', letterSpacing: 0.2 },

  // ── Stats
  statCard: { marginBottom: 28 },
  statCardInner: { padding: 16 },
  statCardBody: { flexDirection: 'row', alignItems: 'center' },
  statItem: { flex: 1, alignItems: 'center' },
  statBigNum: { fontFamily: 'SpaceGrotesk-Bold', fontSize: 32, color: DARK, letterSpacing: -1 },
  statItemLabel: { fontFamily: 'SpaceGrotesk-Bold', fontSize: 10, color: `${DARK}80`, letterSpacing: 0.3, marginTop: 2 },
  statDivider: { width: 2, height: 44, backgroundColor: `${DARK}15` },

  // ── Sections
  section: { marginBottom: 28 },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 14 },
  sectionTitle: { flex: 1, fontFamily: 'SpaceGrotesk-Bold', fontSize: 12, color: DARK, letterSpacing: 0.3 },

  // ── Scan sheet
  sheetOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.45)' },
  sheet: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: CARD_BG,
    borderTopLeftRadius: 40,
    borderTopRightRadius: 40,
  },
  sheetHandle: {
    width: 48, height: 6,
    backgroundColor: DARK,
    alignSelf: 'center',
    marginTop: 14, marginBottom: 0,
  },
  sheetHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 16,
    borderBottomWidth: 4,
    borderBottomColor: DARK,
  },
  sheetTitle: { fontFamily: 'SpaceGrotesk-Bold', fontSize: 20, color: DARK, letterSpacing: 0.3 },
  iconBtnInner: { width: 34, height: 34, alignItems: 'center', justifyContent: 'center' },
  sheetOptions: { flexDirection: 'row', gap: 12, padding: 20 },
  sheetOption: { alignItems: 'center', paddingVertical: 20, paddingHorizontal: 12, gap: 8 },
  sheetOptionIcon: {
    width: 56, height: 56,
    borderRadius: 10,
    borderWidth: BORDER_WIDTH,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  sheetOptionTitle: { fontFamily: 'SpaceGrotesk-Bold', fontSize: 13, color: DARK },
  sheetOptionSub: { fontFamily: 'SpaceGrotesk-Medium', fontSize: 10, color: `${DARK}55` },

  // ── Confirmation modal
  modalHandle: {
    width: 48, height: 6,
    backgroundColor: DARK,
    alignSelf: 'center',
    marginTop: 14,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 16,
    backgroundColor: CARD_BG,
    borderBottomWidth: 4,
    borderBottomColor: DARK,
  },
  modalTitle: { fontFamily: 'SpaceGrotesk-Bold', fontSize: 20, color: DARK, letterSpacing: 0.3 },
});
