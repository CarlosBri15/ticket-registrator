import {
  View,
  Text,
  ScrollView,
  Alert,
  ActivityIndicator,
  StyleSheet,
  StatusBar,
} from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { createReportSchema, CreateReportSchema, useCreateReportMutation } from '@ticket-registrator/shared';
import { useRouter } from 'expo-router';
import { IconX, IconPlus } from '@tabler/icons-react-native';
import { useTranslation } from 'react-i18next';
import {
  PixelCard,
  DARK,
  CARD_BG,
  SCREEN_BG,
  colors,
} from '../../../src/components/ui/PixelCard';
import { CurrencySelect } from '../../../src/components/features/CurrencySelect';
import { ReportTypeSelect } from '../../../src/components/features/ReportTypeSelect';
import { DateRangePicker } from '../../../src/components/features/DateRangePicker';
import { PixelField } from '../../../src/components/ui/PixelField';
import { PixelInput } from '../../../src/components/ui/PixelInput';

export default function CreateReportScreen() {
  const { t } = useTranslation();
  const router = useRouter();

  const { mutate: createReport, isPending } = useCreateReportMutation({
    onSuccess: () => router.back(),
    onError: (error: any) => {
      Alert.alert(t('common.error'), error?.response?.data?.message ?? t('trips.createError'));
    },
  });

  const { control, handleSubmit, formState: { errors } } = useForm<CreateReportSchema>({
    resolver: zodResolver(createReportSchema) as any,
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

      {/* Handle */}
      <View style={s.handle} />

      {/* Header */}
      <View style={s.header}>
        <Text style={s.headerTitle}>{t('trips.newTripTitle')}</Text>
        <PixelCard bg={colors.danger} shadowOffset={3} onPress={() => router.back()} radius={8}>
          <View style={s.closeBtnInner}>
            <IconX size={16} color="white" />
          </View>
        </PixelCard>
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
            <PixelField label="Nombre">
              <PixelInput
                placeholder={t('trips.namePlaceholder')}
                onBlur={onBlur}
                onChangeText={onChange}
                value={value}
                error={!!errors.name}
              />
              {errors.name && (
                <Text style={s.errorText}>{errors.name.message}</Text>
              )}
            </PixelField>
          )}
        />

        {/* Fechas */}
        <Controller
          control={control}
          name="start_date"
          render={({ field: { onChange: onStartChange, value: startVal } }) => (
            <Controller
              control={control}
              name="end_date"
              render={({ field: { onChange: onEndChange, value: endVal } }) => (
                <PixelField label={`${t('trips.startLabel')} — ${t('trips.endLabel')}`}>
                  <DateRangePicker
                    startDate={startVal ? new Date(startVal) : null}
                    endDate={endVal ? new Date(endVal) : null}
                    onStartChange={(d) => onStartChange(d.toISOString())}
                    onEndChange={(d) => onEndChange(d ? d.toISOString() : '')}
                    startLabel={t('trips.startLabel')}
                    endLabel={t('trips.endLabel')}
                    error={errors.start_date?.message ?? errors.end_date?.message}
                  />
                </PixelField>
              )}
            />
          )}
        />

        {/* Moneda — Select ya renderiza su propio label */}
        <Controller
          control={control}
          name="currency"
          render={({ field: { onChange, value } }) => (
            <CurrencySelect value={value} onChange={onChange} error={undefined} />
          )}
        />

        {/* Tipo — Select ya renderiza su propio label */}
        <Controller
          control={control}
          name="type"
          render={({ field: { onChange, value } }) => (
            <ReportTypeSelect value={value ?? ''} onChange={onChange} error={undefined} />
          )}
        />

        {/* Submit */}
        <View style={[s.submitWrapper, isPending && s.submitDisabled]}>
          <PixelCard
            bg={colors.brand}
            shadowOffset={4}
            onPress={isPending ? undefined : handleSubmit(onSubmit)}
          >
            <View style={s.submitInner}>
              {isPending ? (
                <ActivityIndicator color="white" />
              ) : (
                <>
                  <IconPlus size={18} color="white" />
                  <Text style={s.submitText}>{t('trips.saveButton')}</Text>
                </>
              )}
            </View>
          </PixelCard>
        </View>
      </ScrollView>
    </View>
  );
}

const s = StyleSheet.create({
  sheet: {
    flex: 1,
    backgroundColor: CARD_BG,
  },

  handle: {
    width: 48,
    height: 6,
    backgroundColor: DARK,
    alignSelf: 'center',
    marginTop: 14,
    marginBottom: 4,
  },

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
    flex: 1,
    fontFamily: 'SpaceGrotesk-Bold',
    fontSize: 20,
    color: DARK,
    letterSpacing: 0.3,
  },
  closeBtnInner: {
    width: 34,
    height: 34,
    alignItems: 'center',
    justifyContent: 'center',
  },

  scrollArea: {
    flex: 1,
    backgroundColor: SCREEN_BG,
  },
  form: {
    padding: 20,
    paddingBottom: 48,
    gap: 4,
  },
  errorText: {
    fontFamily: 'SpaceGrotesk-Bold',
    fontSize: 10,
    color: colors.danger,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginTop: 6,
    marginLeft: 4,
  },

  submitWrapper: {
    marginTop: 12,
  },
  submitDisabled: {
    opacity: 0.65,
  },
  submitInner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 18,
    paddingHorizontal: 24,
  },
  submitText: {
    color: 'white',
    fontSize: 15,
    fontFamily: 'SpaceGrotesk-Bold',
    letterSpacing: 0.3,
  },
});
