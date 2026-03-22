import { View, Text, TextInput, TouchableOpacity, ScrollView, Alert, ActivityIndicator } from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { createReportSchema, CreateReportSchema, useCreateReportMutation } from '@ticket-registrator/shared';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { mt } from '../../../src/styles/theme';

export default function CreateReportScreen() {
  const { t } = useTranslation();
  const router = useRouter();

  const { mutate: createReport, isPending } = useCreateReportMutation({
    onSuccess: () => {
      Alert.alert(t('common.success'), t('trips.saveButton'));
      router.back();
    },
    onError: (error: any) => {
      Alert.alert(t('common.error'), error?.response?.data?.message ?? t('trips.createError'));
    },
  });

  const { control, handleSubmit, formState: { errors } } = useForm<CreateReportSchema>({
    resolver: zodResolver(createReportSchema) as any,
    defaultValues: { name: '', currency: 'EUR', type: t('trips.typeBusinessTrip') },
  });

  const onSubmit = (data: CreateReportSchema) => createReport(data);

  return (
    <SafeAreaView className={mt.screen}>
      <View className={`${mt.pageHeader} flex-row items-center justify-between`}>
        <TouchableOpacity onPress={() => router.back()}>
          <Feather name="x" size={24} color="#2a3132" />
        </TouchableOpacity>
        <Text className="text-xl font-bold text-dark text-center flex-1 mr-6">
          {t('trips.newTripTitle')}
        </Text>
      </View>

      <ScrollView className="flex-1 px-6 pt-8">
        <View className="space-y-6">
          <Controller
            control={control}
            name="name"
            render={({ field: { onChange, onBlur, value } }) => (
              <View className="mb-5">
                <Text className={`${mt.inputLabel} ml-2`}>
                  {t('trips.nameLabel')}
                </Text>
                <TextInput
                  className="w-full bg-white border border-gray-100 rounded-2xl px-5 py-4 text-dark font-medium shadow-sm"
                  placeholder={t('trips.namePlaceholder')}
                  onBlur={onBlur}
                  onChangeText={onChange}
                  value={value}
                />
                {errors.name && (
                  <Text className="text-red-500 text-xs mt-2 ml-2">{errors.name.message}</Text>
                )}
              </View>
            )}
          />

          <View className="flex-row gap-4">
            <Controller
              control={control}
              name="start_date"
              render={({ field: { onChange, value } }) => (
                <View className="flex-1 mb-5">
                  <Text className={`${mt.inputLabel} ml-2`}>
                    {t('trips.startLabel')}
                  </Text>
                  <TextInput
                    className="w-full bg-white border border-gray-100 rounded-2xl px-5 py-4 text-dark font-medium shadow-sm"
                    placeholder="YYYY-MM-DD"
                    onChangeText={onChange}
                    value={value ? new Date(value).toISOString().split('T')[0] : ''}
                  />
                  {errors.start_date && (
                    <Text className="text-red-500 text-xs mt-2 ml-2">{t('common.error')}</Text>
                  )}
                </View>
              )}
            />
            <Controller
              control={control}
              name="end_date"
              render={({ field: { onChange, value } }) => (
                <View className="flex-1 mb-5">
                  <Text className={`${mt.inputLabel} ml-2`}>
                    {t('trips.endLabel')}
                  </Text>
                  <TextInput
                    className="w-full bg-white border border-gray-100 rounded-2xl px-5 py-4 text-dark font-medium shadow-sm"
                    placeholder="YYYY-MM-DD"
                    onChangeText={onChange}
                    value={value ? new Date(value).toISOString().split('T')[0] : ''}
                  />
                  {errors.end_date && (
                    <Text className="text-red-500 text-xs mt-2 ml-2">{t('common.error')}</Text>
                  )}
                </View>
              )}
            />
          </View>

          <Controller
            control={control}
            name="currency"
            render={({ field: { onChange, value } }) => (
              <View className="mb-5">
                <Text className={`${mt.inputLabel} ml-2`}>
                  {t('trips.currencyLabel')}
                </Text>
                <TextInput
                  className="w-full bg-white border border-gray-100 rounded-2xl px-5 py-4 text-dark font-medium shadow-sm"
                  placeholder="EUR"
                  onChangeText={onChange}
                  value={value}
                />
              </View>
            )}
          />

          <Controller
            control={control}
            name="type"
            render={({ field: { onChange, value } }) => (
              <View className="mb-8">
                <Text className={`${mt.inputLabel} ml-2`}>
                  {t('trips.categoryLabel')}
                </Text>
                <TextInput
                  className="w-full bg-white border border-gray-100 rounded-2xl px-5 py-4 text-dark font-medium shadow-sm"
                  placeholder={t('trips.categoryPlaceholder')}
                  onChangeText={onChange}
                  value={value}
                />
              </View>
            )}
          />

          <TouchableOpacity
            onPress={handleSubmit(onSubmit)}
            disabled={isPending}
            className={`w-full py-5 rounded-[2rem] items-center justify-center shadow-xl shadow-brand/20 ${isPending ? 'bg-brand/70' : 'bg-brand'}`}
          >
            {isPending ? (
              <ActivityIndicator color="white" />
            ) : (
              <Text className="text-white font-bold text-lg">{t('trips.saveButton')}</Text>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
