import { View, Text, FlatList, TouchableOpacity, RefreshControl, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useReportsQuery, ReportStatus } from '@ticket-registrator/shared';
import { Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

export default function TripsScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const { data: reports, refetch, isLoading } = useReportsQuery();
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  };

  // Separar viajes activos e históricos
  const activeReports = reports?.filter(r => ['CREATED', 'DRAFT', 'PENDING', 'SUBMITTED'].includes(r.status.toUpperCase())) || [];
  const completedReports = reports?.filter(r => ['APPROVED', 'PAID', 'REJECTED'].includes(r.status.toUpperCase())) || [];

  const currentTrip = activeReports.length > 0 ? activeReports[0] : null;

  return (
    <SafeAreaView className="flex-1 bg-surface" edges={['top']}>
        {/* Header */}
        <View className="px-6 py-4 flex-row justify-between items-center bg-white border-b border-gray-50">
            <Text className="text-2xl font-bold text-dark">{t('trips.title')}</Text>
            {!currentTrip && (
                <TouchableOpacity 
                    onPress={() => router.push('/(app)/trips/create')}
                    className="w-10 h-10 bg-brand rounded-xl items-center justify-center shadow-lg shadow-brand/20"
                >
                    <Feather name="plus" size={20} color="white" />
                </TouchableOpacity>
            )}
        </View>

        <ScrollView 
            className="flex-1"
            contentContainerStyle={{ padding: 24, paddingBottom: 100 }}
            refreshControl={
                <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#336b87" />
            }
        >
            {/* 1. Active Trip Highlight */}
            {currentTrip ? (
                <View className="mb-8">
                    <View className="flex-row items-center mb-4">
                        <View className="w-2 h-2 bg-brand rounded-full mr-2 animate-pulse" />
                        <Text className="text-lg font-bold text-dark">{t('home.activeTrip')}</Text>
                    </View>

                    <TouchableOpacity 
                        onPress={() => router.push(`/(app)/trips/${currentTrip.id}`)}
                        activeOpacity={0.9}
                        className="bg-brand rounded-[2rem] p-6 shadow-xl shadow-brand/30 relative overflow-hidden"
                    >
                        <View className="absolute -top-10 -right-10 w-40 h-40 bg-white/10 rounded-full" />
                        
                        <View className="flex-row justify-between items-start mb-6">
                            <View className="bg-white/20 px-3 py-1 rounded-lg backdrop-blur-md">
                                <Text className="text-white text-xs font-bold uppercase tracking-wide">
                                    {t(`status.${currentTrip.status}`)}
                                </Text>
                            </View>
                            <Feather name="chevron-right" size={24} color="white" />
                        </View>

                        <Text className="text-3xl font-bold text-white mb-2 leading-tight">
                            {currentTrip.name}
                        </Text>

                        <View className="flex-row items-center mb-8">
                            <Feather name="calendar" size={14} color="rgba(255,255,255,0.7)" />
                            <Text className="text-white/70 text-sm ml-2 font-medium">
                                {new Date(currentTrip.start_date).toLocaleDateString()}
                            </Text>
                        </View>

                        <View className="flex-row justify-between items-end pt-6 border-t border-white/10">
                            <View>
                                <Text className="text-white/60 text-xs font-bold uppercase mb-1">{t('reportDetail.totalRequested')}</Text>
                                <Text className="text-white text-2xl font-black">
                                    {currentTrip.requested_amount} <Text className="text-sm font-bold opacity-70">{currentTrip.currency}</Text>
                                </Text>
                            </View>
                            <View className="bg-white p-3 rounded-xl shadow-sm">
                                <Feather name="camera" size={20} color="#336b87" />
                            </View>
                        </View>
                    </TouchableOpacity>
                </View>
            ) : (
                !isLoading && (
                    <View className="bg-white rounded-[2rem] border border-dashed border-gray-200 p-8 items-center mb-8">
                        <View className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4">
                            <Feather name="briefcase" size={24} color="#cbd5e1" />
                        </View>
                        <Text className="text-gray-400 text-center mb-6">{t('trips.noActiveTrips')}</Text>
                        <TouchableOpacity 
                            onPress={() => router.push('/(app)/trips/create')}
                            className="bg-brand px-6 py-3 rounded-xl shadow-lg shadow-brand/20"
                        >
                            <Text className="text-white font-bold">{t('home.createFirst')}</Text>
                        </TouchableOpacity>
                    </View>
                )
            )}

            {/* 2. History List */}
            {completedReports.length > 0 && (
                <View>
                    <Text className="text-lg font-bold text-dark mb-4 px-1">{t('trips.completedTrips')}</Text>
                    
                    {completedReports.map((item, index) => (
                        <TouchableOpacity 
                            key={item.id || (item as any)._id || `completed-${index}`}
                            onPress={() => router.push(`/(app)/trips/${item.id || (item as any)._id}`)}
                            className="bg-white p-5 rounded-3xl border border-gray-100 mb-4 flex-row justify-between items-center"
                        >
                            <View className="flex-1 mr-4">
                                <View className="flex-row items-center mb-2">
                                    <View className={`w-2 h-2 rounded-full mr-2 ${
                                        item.status === ReportStatus.APPROVED ? 'bg-green-500' : 'bg-red-500'
                                    }`} />
                                    <Text className="text-xs font-bold text-gray-400 uppercase tracking-wide">
                                        {t(`status.${item.status}`)}
                                    </Text>
                                </View>
                                <Text className="text-base font-bold text-dark mb-1" numberOfLines={1}>
                                    {item.name}
                                </Text>
                                <Text className="text-xs text-gray-400">
                                    {new Date(item.end_date).toLocaleDateString()}
                                </Text>
                            </View>

                            <View className="items-end">
                                <Text className="font-bold text-dark text-base">
                                    {item.approved_amount} {item.currency}
                                </Text>
                                <Text className="text-[10px] text-gray-400 font-bold uppercase mt-1">
                                    {t('trips.approved')}
                                </Text>
                            </View>
                        </TouchableOpacity>
                    ))}
                </View>
            )}
        </ScrollView>
    </SafeAreaView>
  );
}