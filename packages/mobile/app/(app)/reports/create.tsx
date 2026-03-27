import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
  StyleSheet,
  StatusBar,
} from 'react-native';
// TextInput se mantiene para el campo nombre
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { createReportSchema, CreateReportSchema, useCreateReportMutation } from '@ticket-registrator/shared';
import { useRouter } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { colors } from '../../../src/styles/theme';
import { CurrencySelect } from '../../../src/components/CurrencySelect';
import { ReportTypeSelect } from '../../../src/components/ReportTypeSelect';
import { DateRangePicker } from '../../../src/components/DateRangePicker';

export default function CreateReportScreen() {
  const { t } = useTranslation();
  const router = useRouter();

  const { mutate: createReport, isPending } = useCreateReportMutation({
    onSuccess: () => {
      router.back();
    },
    onError: (error: any) => {
      Alert.alert(t('common.error'), error?.response?.data?.message ?? t('trips.createError'));
    },
  });

  const { control, handleSubmit, formState: { errors } } = useForm<CreateReportSchema>({
    resolver: zodResolver(createReportSchema) as any,
    defaultValues: {
      name: '',
      currency: 'EUR',
      type: t('trips.typeBusinessTrip'),
    },
  });

  const onSubmit = (data: CreateReportSchema) => createReport(data);

  return (
    <View style={styles.sheet}>
      <StatusBar barStyle="dark-content" />

      {/* Handle */}
      <View style={styles.handle} />

      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>{t('trips.newTripTitle')}</Text>
          <Text style={styles.headerSub}>{t('trips.newTripSubtitle') || 'Rellena los datos del reporte'}</Text>
        </View>
        <TouchableOpacity onPress={() => router.back()} style={styles.closeBtn} activeOpacity={0.7}>
          <Feather name="x" size={18} color="#64748b" />
        </TouchableOpacity>
      </View>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={styles.form}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Name */}
        <Controller
          control={control}
          name="name"
          render={({ field: { onChange, onBlur, value } }) => (
            <View style={styles.field}>
              <Text style={styles.fieldLabel}>{t('trips.nameLabel')}</Text>
              <TextInput
                style={[styles.input, errors.name && styles.inputError]}
                placeholder={t('trips.namePlaceholder')}
                placeholderTextColor="#94a3b8"
                onBlur={onBlur}
                onChangeText={onChange}
                value={value}
                returnKeyType="next"
              />
              {errors.name && (
                <Text style={styles.errorText}>{errors.name.message}</Text>
              )}
            </View>
          )}
        />

        {/* Dates */}
        <Controller
          control={control}
          name="start_date"
          render={({ field: { onChange: onStartChange, value: startVal } }) => (
            <Controller
              control={control}
              name="end_date"
              render={({ field: { onChange: onEndChange, value: endVal } }) => (
                <View style={styles.field}>
                  <Text style={styles.fieldLabel}>{t('trips.startLabel')} — {t('trips.endLabel')}</Text>
                  <DateRangePicker
                    startDate={startVal ? new Date(startVal) : null}
                    endDate={endVal ? new Date(endVal) : null}
                    onStartChange={(d) => onStartChange(d.toISOString())}
                    onEndChange={(d) => onEndChange(d ? d.toISOString() : '')}
                    startLabel={t('trips.startLabel')}
                    endLabel={t('trips.endLabel')}
                    error={errors.start_date?.message ?? errors.end_date?.message}
                  />
                </View>
              )}
            />
          )}
        />

        {/* Currency */}
        <Controller
          control={control}
          name="currency"
          render={({ field: { onChange, value } }) => (
            <View style={styles.field}>
              <CurrencySelect
                value={value}
                onChange={onChange}
                error={undefined}
              />
            </View>
          )}
        />

        {/* Type */}
        <Controller
          control={control}
          name="type"
          render={({ field: { onChange, value } }) => (
            <View style={styles.field}>
              <ReportTypeSelect
                value={value}
                onChange={onChange}
                error={undefined}
              />
            </View>
          )}
        />

        {/* Submit */}
        <TouchableOpacity
          onPress={handleSubmit(onSubmit)}
          disabled={isPending}
          style={[styles.submitBtn, isPending && styles.submitBtnDisabled]}
          activeOpacity={0.85}
        >
          {isPending ? (
            <ActivityIndicator color="white" />
          ) : (
            <>
              <Feather name="check" size={18} color="white" />
              <Text style={styles.submitText}>{t('trips.saveButton')}</Text>
            </>
          )}
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  sheet: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },

  // Handle bar
  handle: {
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#e2e8f0',
    alignSelf: 'center',
    marginTop: 12,
    marginBottom: 4,
  },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 20,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#1e293b',
    letterSpacing: -0.4,
    marginBottom: 2,
  },
  headerSub: {
    fontSize: 12,
    color: '#94a3b8',
    fontWeight: '500',
  },
  closeBtn: {
    width: 34,
    height: 34,
    borderRadius: 10,
    backgroundColor: '#f1f5f9',
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Form
  form: {
    padding: 20,
    paddingBottom: 48,
    gap: 4,
  },
  field: {
    marginBottom: 20,
  },
  fieldLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#64748b',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: 8,
    marginLeft: 2,
  },
  input: {
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 15,
    fontWeight: '500',
    color: '#1e293b',
  },
  inputError: {
    borderColor: '#fca5a5',
    backgroundColor: '#fff8f8',
  },
  errorText: {
    fontSize: 11,
    color: '#ef4444',
    marginTop: 6,
    marginLeft: 4,
    fontWeight: '500',
  },

  // Row (dates)
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  rowSeparator: {
    width: 12,
  },

  // Submit
  submitBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: colors.brand,
    borderRadius: 16,
    paddingVertical: 16,
    marginTop: 8,
    shadowColor: colors.brand,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 6,
  },
  submitBtnDisabled: {
    opacity: 0.65,
  },
  submitText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: -0.2,
  },
});
