import {
  View,
  Text,
  ScrollView,
  Alert,
  ActivityIndicator,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
} from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { createReportSchema, type CreateReportSchema, useCreateReportMutation } from '@ticket-registrator/shared';
import { useRouter } from 'expo-router';
import { X, Plus } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';
import { Input } from '../../../src/components/ui/Input';
import { CurrencySelect } from '../../../src/components/features/CurrencySelect';
import { ReportTypeSelect } from '../../../src/components/features/ReportTypeSelect';
import { DateRangePicker } from '../../../src/components/features/DateRangePicker';
import { colors } from '../../../src/constants/theme';

export default function CreateReportScreen() {
  const { t } = useTranslation();
  const router = useRouter();

  const { mutate: createReport, isPending } = useCreateReportMutation({
    onSuccess: () => router.back(),
    onError: (error: { response?: { data?: { message?: string } } }) => {
      Alert.alert(
        t('common.error'),
        error?.response?.data?.message ?? t('trips.createError'),
      );
    },
  });

  const { control, handleSubmit, formState: { errors } } = useForm<CreateReportSchema>({
    resolver: zodResolver(createReportSchema) as never,
    defaultValues: {
      name: '',
      currency: '',
      type: '',
    },
  });

  const onSubmit = (data: CreateReportSchema) => createReport(data);

  return (
    <View style={s.sheet}>
      <StatusBar barStyle="dark-content" />

      <View style={s.handle} />

      <View style={s.header}>
        <Text style={s.headerTitle}>{t('trips.newTripTitle')}</Text>
        <TouchableOpacity
          onPress={() => router.back()}
          activeOpacity={0.7}
          style={s.closeBtn}
          accessibilityRole="button"
          accessibilityLabel="close"
        >
          <X size={16} color={colors.fgSecondary} strokeWidth={2} />
        </TouchableOpacity>
      </View>

      <ScrollView
        style={s.scrollArea}
        contentContainerStyle={s.form}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Nombre */}
        <Controller
          control={control}
          name="name"
          render={({ field: { onChange, onBlur, value } }) => (
            <Input
              label="Nombre"
              placeholder={t('trips.namePlaceholder')}
              onBlur={onBlur}
              onChangeText={onChange}
              value={value}
              error={errors.name?.message}
            />
          )}
        />

        {/* Fechas */}
        <View style={s.dateField}>
          <Text style={s.dateLabel}>{t('trips.startLabel')} — {t('trips.endLabel')}</Text>
          <Controller
            control={control}
            name="start_date"
            render={({ field: { onChange: onStartChange, value: startVal } }) => (
              <Controller
                control={control}
                name="end_date"
                render={({ field: { onChange: onEndChange, value: endVal } }) => (
                  <DateRangePicker
                    startDate={startVal ? new Date(startVal) : null}
                    endDate={endVal ? new Date(endVal) : null}
                    onStartChange={(d) => onStartChange(d.toISOString())}
                    onEndChange={(d) => onEndChange(d ? d.toISOString() : '')}
                    startLabel={t('trips.startLabel')}
                    endLabel={t('trips.endLabel')}
                    error={errors.start_date?.message ?? errors.end_date?.message}
                  />
                )}
              />
            )}
          />
        </View>

        {/* Moneda */}
        <Controller
          control={control}
          name="currency"
          render={({ field: { onChange, value } }) => (
            <CurrencySelect value={value} onChange={onChange} error={undefined} />
          )}
        />

        {/* Tipo */}
        <Controller
          control={control}
          name="type"
          render={({ field: { onChange, value } }) => (
            <ReportTypeSelect value={value ?? ''} onChange={onChange} error={undefined} />
          )}
        />

        {/* Submit */}
        <TouchableOpacity
          onPress={isPending ? undefined : handleSubmit(onSubmit)}
          disabled={isPending}
          activeOpacity={0.85}
          style={[s.submitBtn, isPending && s.submitDisabled]}
        >
          {isPending ? (
            <ActivityIndicator color={colors.fgOnBrand} />
          ) : (
            <>
              <Plus size={16} color={colors.fgOnBrand} strokeWidth={2} />
              <Text style={s.submitText}>{t('trips.saveButton')}</Text>
            </>
          )}
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const s = StyleSheet.create({
  sheet: {
    flex: 1,
    backgroundColor: colors.surfaceCard,
  },

  handle: {
    width: 36,
    height: 4,
    backgroundColor: colors.overlayMedium,
    alignSelf: 'center',
    marginTop: 10,
    marginBottom: 2,
    borderRadius: 9999,
  },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingTop: 12,
    paddingBottom: 14,
    backgroundColor: colors.surfaceCard,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  headerTitle: {
    flex: 1,
    fontFamily: 'Manrope-Bold',
    fontSize: 20,
    color: colors.dark,
    letterSpacing: -0.3,
  },
  closeBtn: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 9999,
  },

  scrollArea: {
    flex: 1,
    backgroundColor: colors.surface,
  },
  form: {
    padding: 20,
    paddingBottom: 48,
    gap: 4,
  },

  dateField: {
    marginBottom: 16,
    gap: 6,
  },
  dateLabel: {
    fontFamily: 'Manrope-SemiBold',
    fontSize: 11,
    color: colors.fgSecondary,
  },

  submitBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    backgroundColor: colors.brand,
    borderRadius: 9999,
    marginTop: 12,
  },
  submitDisabled: {
    opacity: 0.65,
  },
  submitText: {
    color: colors.fgOnBrand,
    fontSize: 14,
    fontFamily: 'Manrope-SemiBold',
  },
});
