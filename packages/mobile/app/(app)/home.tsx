import {
  Image,
  View,
  Text,
  ScrollView,
  RefreshControl,
  StatusBar,
  TouchableOpacity,
  StyleSheet,
  Modal,
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { ChevronRight, Clock, X, Camera, ImageIcon } from 'lucide-react-native';

import { Card } from '../../src/components/ui/Card';
import { HeroReportCard, HistoryRow } from '../../src/components/features/ReportListItem';
import { EmptyState } from '../../src/components/ui/EmptyState';
import { ScanningOverlay } from '../../src/components/features/ScanningOverlay';
import { TicketConfirmationForm } from '../../src/components/features/TicketConfirmationForm';
import { colors } from '../../src/constants/theme';

import { useHomeScreen } from '../../src/hooks/useHomeScreen';
import { reportIcon, userIcon, cameraIcon } from '@ticket-registrator/shared/assets';

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
      <StatusBar barStyle="dark-content" backgroundColor={colors.surface} />
      <View style={{ height: insets.top, backgroundColor: colors.surface }} />

      {/* ── Page header ── */}
      <View style={s.pageHead}>
        <View style={s.pageHeadText}>
          <Text style={s.pageEyebrow}>Hola</Text>
          <Text style={s.pageTitle} numberOfLines={1}>{firstName}</Text>
        </View>

        <TouchableOpacity
          onPress={() => router.push('/(app)/profile')}
          activeOpacity={0.85}
          accessibilityRole="button"
          accessibilityLabel="open profile"
          style={s.avatarBtn}
        >
          <Image source={userIcon} style={s.avatarImage} />
        </TouchableOpacity>
      </View>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={s.scroll}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.brand} />
        }
      >
        {/* ── Active report + scan CTA ── */}
        {activeReport ? (
          <View style={s.activeBlock}>
            <HeroReportCard
              report={activeReport}
              onPress={() => router.push(`/(app)/reports/${activeReport.id}`)}
              dateLocale={dateLocale}
            />
            <TouchableOpacity
              onPress={() => setScanSheetOpen(true)}
              activeOpacity={0.85}
              style={s.scanCard}
              accessibilityRole="button"
              accessibilityLabel={t('reportDetail.scanTicket')}
            >
              <Image source={cameraIcon} style={s.scanIconImage} resizeMode="contain" />
              <Text style={s.scanTitle}>{t('reportDetail.scanTicket')}</Text>
              <ChevronRight size={18} color={colors.fgOnSidebarSecondary} strokeWidth={2} />
            </TouchableOpacity>
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

        {/* ── Stats (kit `.stat--tone-*`) ── */}
        <View style={s.sectionHeader}>
          <Clock size={12} color={colors.fgSecondary} strokeWidth={2} />
          <Text style={s.sectionTitle}>En revisión</Text>
        </View>
        <View style={s.statGrid}>
          <Card variant="brand" style={s.statTile}>
            <Text style={s.statTileLabelOnBrand}>Reportes</Text>
            <Text style={s.statTileValueOnBrand}>{stats.inReviewCount}</Text>
            <Text style={s.statTileSubOnBrand}>{stats.inReviewCount === 1 ? 'en revisión' : 'en revisión'}</Text>
          </Card>
          <Card variant="accent" style={s.statTile}>
            <Text style={s.statTileLabelOnAccent}>Pendiente</Text>
            <Text style={s.statTileValueOnAccent}>
              {stats.inReview.toFixed(0)}
              <Text style={s.statTileCurrencyOnAccent}> €</Text>
            </Text>
            <Text style={s.statTileSubOnAccent}>por aprobar</Text>
          </Card>
        </View>

        {/* ── Recent activity ── */}
        {recentCompleted.length > 0 ? (
          <View style={s.section}>
            <View style={s.sectionHeader}>
              <Clock size={12} color={colors.fgSecondary} strokeWidth={2} />
              <Text style={s.sectionTitle}>{t('home.recentCompleted')}</Text>
            </View>
            {recentCompleted.map((r) => (
              <HistoryRow
                key={r.id}
                report={r}
                onPress={() => router.push(`/(app)/reports/${r.id}`)}
                dateLocale={dateLocale}
              />
            ))}
          </View>
        ) : null}
      </ScrollView>

      {/* ── Scan sheet ── */}
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
            <TouchableOpacity
              onPress={() => setScanSheetOpen(false)}
              style={s.sheetCloseBtn}
              activeOpacity={0.7}
              accessibilityRole="button"
              accessibilityLabel="close"
            >
              <X size={16} color={colors.fgSecondary} strokeWidth={2} />
            </TouchableOpacity>
          </View>
          <View style={s.sheetOptions}>
            <TouchableOpacity onPress={pickFromCamera} activeOpacity={0.85} style={s.sheetOption}>
              <View style={[s.sheetOptionIcon, { backgroundColor: colors.overlayLight }]}>
                <Camera size={22} color={colors.dark} strokeWidth={2} />
              </View>
              <Text style={s.sheetOptionTitle}>Cámara</Text>
              <Text style={s.sheetOptionSub}>Toma una foto</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={pickFromGallery} activeOpacity={0.85} style={s.sheetOption}>
              <View style={[s.sheetOptionIcon, { backgroundColor: colors.overlayLight }]}>
                <ImageIcon size={22} color={colors.dark} strokeWidth={2} />
              </View>
              <Text style={s.sheetOptionTitle}>Galería</Text>
              <Text style={s.sheetOptionSub}>Elige una imagen</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* ── Confirmation modal ── */}
      <Modal
        visible={isModalOpen}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={handleDiscard}
      >
        <View style={{ flex: 1, backgroundColor: colors.surfaceCard }}>
          <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
            <View style={s.modalHandle} />
            <View style={s.modalHeader}>
              <Text style={s.modalTitle}>{t('upload.confirmTitle')}</Text>
              <TouchableOpacity
                onPress={handleDiscard}
                style={s.sheetCloseBtn}
                activeOpacity={0.7}
                accessibilityRole="button"
                accessibilityLabel="close"
              >
                <X size={16} color={colors.fgSecondary} strokeWidth={2} />
              </TouchableOpacity>
            </View>
            <View style={{ flex: 1, backgroundColor: colors.surface }}>
              {extractedTicket ? (
                <TicketConfirmationForm
                  ticket={extractedTicket}
                  onConfirm={handleConfirm}
                  onCancel={handleDiscard}
                  isLoading={isConfirming}
                />
              ) : null}
            </View>
          </KeyboardAvoidingView>
        </View>
      </Modal>

      <ScanningOverlay visible={isUploading} />
    </View>
  );
}

const s = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.surface },

  // ── Page header
  pageHead: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    paddingHorizontal: 22,
    paddingTop: 12,
    paddingBottom: 16,
    backgroundColor: colors.surface,
    gap: 12,
  },
  pageHeadText: { flex: 1, minWidth: 0 },
  pageEyebrow: {
    fontFamily: 'Manrope-SemiBold',
    fontSize: 12,
    color: colors.fgTertiary,
    letterSpacing: 0,
    marginBottom: 2,
  },
  pageTitle: {
    fontFamily: 'Manrope-Bold',
    fontSize: 34,
    color: colors.dark,
    letterSpacing: -1,
    lineHeight: 36,
  },
  avatarBtn: {
    width: 44,
    height: 44,
    borderRadius: 9999,
    backgroundColor: colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  avatarImage: { width: 40, height: 40 },

  scroll: { padding: 20, paddingBottom: 120 },

  // ── Active block
  activeBlock: { marginBottom: 28 },

  // ── Scan CTA
  scanCard: {
    marginTop: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: colors.brand,
    borderRadius: 14,
  },
  scanIconImage: { width: 36, height: 36 },
  scanTitle: { flex: 1, fontFamily: 'Manrope-SemiBold', fontSize: 14, color: colors.fgOnBrand },

  // ── Stats (tone tile grid — kit `.stat--tone-brand` / `.stat--tone-accent`)
  statGrid: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 28,
  },
  statTile: {
    flex: 1,
    padding: 18,
    gap: 6,
  },
  statTileLabelOnBrand: {
    fontFamily: 'Manrope-SemiBold',
    fontSize: 11,
    color: colors.fgOnSidebarSecondary,
  },
  statTileValueOnBrand: {
    fontFamily: 'Manrope-Bold',
    fontSize: 30,
    color: colors.fgOnBrand,
    letterSpacing: -1,
    lineHeight: 32,
  },
  statTileSubOnBrand: {
    fontFamily: 'Manrope-Medium',
    fontSize: 11,
    color: colors.fgOnSidebarSecondary,
  },
  statTileLabelOnAccent: {
    fontFamily: 'Manrope-SemiBold',
    fontSize: 11,
    color: colors.fgSecondary,
  },
  statTileValueOnAccent: {
    fontFamily: 'Manrope-Bold',
    fontSize: 30,
    color: colors.dark,
    letterSpacing: -1,
    lineHeight: 32,
  },
  statTileCurrencyOnAccent: {
    fontFamily: 'Manrope-SemiBold',
    fontSize: 16,
    color: colors.fgSecondary,
    letterSpacing: 0,
  },
  statTileSubOnAccent: {
    fontFamily: 'Manrope-Medium',
    fontSize: 11,
    color: colors.fgSecondary,
  },

  // ── Sections
  section: { marginBottom: 24 },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 12 },
  sectionTitle: {
    flex: 1,
    fontFamily: 'Manrope-SemiBold',
    fontSize: 13,
    color: colors.dark,
    letterSpacing: -0.1,
  },

  // ── Scan sheet
  sheetOverlay: { flex: 1, backgroundColor: colors.overlayStrong },
  sheet: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: colors.surfaceCard,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
  },
  sheetHandle: {
    width: 36,
    height: 4,
    backgroundColor: colors.overlayMedium,
    alignSelf: 'center',
    marginTop: 10,
    borderRadius: 9999,
  },
  sheetHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingTop: 14,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  sheetTitle: {
    fontFamily: 'Manrope-Bold',
    fontSize: 18,
    color: colors.dark,
    letterSpacing: -0.2,
  },
  sheetCloseBtn: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 9999,
  },
  sheetOptions: { flexDirection: 'row', gap: 12, padding: 20 },
  sheetOption: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 20,
    paddingHorizontal: 12,
    gap: 8,
    backgroundColor: colors.surfaceCard,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 14,
  },
  sheetOptionIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sheetOptionTitle: { fontFamily: 'Manrope-SemiBold', fontSize: 14, color: colors.dark },
  sheetOptionSub: { fontFamily: 'Manrope-Medium', fontSize: 12, color: colors.fgSecondary },

  // ── Confirmation modal
  modalHandle: {
    width: 36,
    height: 4,
    backgroundColor: colors.overlayMedium,
    alignSelf: 'center',
    marginTop: 10,
    borderRadius: 9999,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingTop: 14,
    paddingBottom: 12,
    backgroundColor: colors.surfaceCard,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  modalTitle: {
    fontFamily: 'Manrope-Bold',
    fontSize: 18,
    color: colors.dark,
    letterSpacing: -0.2,
  },
});
