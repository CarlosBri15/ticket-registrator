import React from 'react';
import { 
  View, 
  Text, 
  ScrollView, 
  TouchableOpacity,
  RefreshControl,
  StatusBar
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { 
  Wallet, 
  Plane, 
  AlertCircle, 
  Plus, 
  FileText,
  TrendingUp,
  ChevronRight
} from 'lucide-react-native';
import { Button } from '../../src/components/Button';
import { useUserQuery, useReportsQuery, ReportStatus } from '@ticket-registrator/shared';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';

const StatusBadge = ({ status }: { status: string }) => {
  const { t } = useTranslation();
  const colors: Record<string, { bg: string, text: string }> = {
    DRAFT: { bg: 'bg-gray-100', text: 'text-gray-600' },
    PAID: { bg: 'bg-green-100', text: 'text-green-600' },
    APPROVED: { bg: 'bg-blue-100', text: 'text-blue-600' },
    REJECTED: { bg: 'bg-red-100', text: 'text-red-600' },
    PENDING: { bg: 'bg-amber-100', text: 'text-amber-600' },
  };

  const config = colors[status.toUpperCase()] || colors.DRAFT;

  return (
    <View className={`${config.bg} px-2 py-0.5 rounded-full`}>
      <Text className={`${config.text} text-[10px] font-bold uppercase`}>{t(`status.${status}`)}</Text>
    </View>
  );
};

export default function HomeScreen() {
  const { t, i18n } = useTranslation();
  const router = useRouter();
  const { data: user, isLoading: userLoading } = useUserQuery();
  const { data: reports, isLoading: reportsLoading, refetch } = useReportsQuery();
  const [refreshing, setRefreshing] = React.useState(false);

  const onRefresh = React.useCallback(async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  }, [refetch]);

  const totalSpent = reports?.reduce((acc, r) => acc + (r.requested_amount || 0), 0) || 0;
  const activeTrips = reports?.filter(r => r.status === ReportStatus.CREATED || r.status === ReportStatus.SUBMITTED).length || 0;
  const rejectedItems = reports?.filter(r => r.status === ReportStatus.DECLINED).length || 0;

  const getGreetingKey = () => {
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 12) return 'home.greetingMorning';
    if (hour >= 12 && hour < 20) return 'home.greetingAfternoon';
    return 'home.greetingEvening';
  };

  const userInitials = user?.name 
    ? user.name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2)
    : '';

  const formattedDate = new Date().toLocaleDateString(i18n.language, { 
    weekday: 'long', 
    day: 'numeric', 
    month: 'long' 
  });

  return (
    <SafeAreaView className="flex-1 bg-surface" edges={['top']}>
      <StatusBar barStyle="dark-content" />
      <ScrollView 
        className="flex-1 px-6"
        contentContainerStyle={{ paddingTop: 20, paddingBottom: 40 }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#336b87" />
        }
      >
        {/* Modern Executive Header */}
        <View className="flex-row justify-between items-end mb-10">
          <View className="flex-1">
            <Text className="text-brand font-bold uppercase tracking-widest text-[10px] mb-1">
              {formattedDate}
            </Text>
            <Text className="text-4xl font-black text-dark tracking-tighter">
              {user?.name?.split(' ')[0] || 'Dashboard'}
            </Text>
          </View>
          
          <TouchableOpacity 
            onPress={() => router.push('/(app)/profile')}
            activeOpacity={0.8}
            className="w-14 h-14 bg-white rounded-[1.2rem] items-center justify-center shadow-sm border border-gray-100"
          >
            <View className="w-11 h-11 bg-secondary/10 rounded-xl items-center justify-center">
              <Text className="text-brand font-black text-base tracking-tighter">{userInitials}</Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* Stats Cards - Horizontal Scroll */}
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false} 
          className="flex-row mb-8 -mx-6 px-6"
        >
          <View className="bg-brand p-6 rounded-3xl w-64 mr-4 shadow-lg shadow-brand/20">
            <View className="flex-row justify-between items-start mb-4">
              <View className="p-2 bg-white/20 rounded-xl">
                <Wallet size={24} color="white" />
              </View>
              <View className="flex-row items-center bg-white/20 px-2 py-1 rounded-full">
                <TrendingUp size={12} color="white" />
                <Text className="text-white text-[10px] font-bold ml-1">TOTAL</Text>
              </View>
            </View>
            <Text className="text-white/70 text-sm font-medium">{t('home.totalSpent')}</Text>
            <Text className="text-white text-3xl font-bold mt-1">{totalSpent.toFixed(2)} €</Text>
          </View>

          <View className="bg-white p-6 rounded-3xl w-64 mr-4 shadow-sm border border-gray-100">
            <View className="flex-row justify-between items-start mb-4">
              <View className="p-2 bg-secondary/20 rounded-xl">
                <Plane size={24} color="#336b87" />
              </View>
            </View>
            <Text className="text-gray-500 text-sm font-medium">{t('home.activeTrips')}</Text>
            <Text className="text-dark text-3xl font-bold mt-1">{activeTrips}</Text>
          </View>

          <View className="bg-red-50 p-6 rounded-3xl w-64 border border-red-100">
            <View className="flex-row justify-between items-start mb-4">
              <View className="p-2 bg-white rounded-xl">
                <AlertCircle size={24} color="#763626" />
              </View>
            </View>
            <Text className="text-accent/70 text-sm font-medium">{t('home.rejectedItems')}</Text>
            <Text className="text-accent text-3xl font-bold mt-1">{rejectedItems}</Text>
          </View>
        </ScrollView>

        {/* Active Trip Card */}
        {reports?.find(r => r.status === ReportStatus.CREATED) && (
            <View className="mb-8">
            <View className="flex-row items-center mb-4">
                <Plane size={18} color="#336b87" />
                <Text className="text-lg font-bold text-dark ml-2">{t('home.activeTrip')}</Text>
            </View>

            {(() => {
                const activeTrip = reports.find(r => r.status === ReportStatus.CREATED)!;
                return (
                    <TouchableOpacity 
                        onPress={() => router.push(`/(app)/trips/${activeTrip.id}`)}
                        className="bg-white rounded-3xl p-6 shadow-sm border border-brand/10 relative overflow-hidden"
                    >
                        {/* Background Decoration */}
                        <View className="absolute -top-10 -right-10 w-32 h-32 bg-secondary/10 rounded-full" />

                        <View className="flex-row justify-between items-start relative z-10">
                            <View className="flex-1">
                                <View className="flex-row items-center space-x-2 mb-2">
                                <StatusBadge status={activeTrip.status} />
                                <Text className="text-[10px] text-gray-400 font-bold uppercase ml-2">ID: {activeTrip.id.substring(0,8)}</Text>
                                </View>
                                <Text className="text-xl font-bold text-dark mb-1">{activeTrip.name}</Text>
                                <Text className="text-xs text-gray-500">📅 {new Date(activeTrip.start_date).toLocaleDateString()}</Text>
                            </View>
                            <View className="items-end">
                                <Text className="text-xs text-gray-500">{t('common.amount')}</Text>
                                <Text className="text-xl font-bold text-brand">{activeTrip.requested_amount} {activeTrip.currency}</Text>
                            </View>
                        </View>

                        <View className="flex-row mt-6 space-x-4 gap-4">
                            <TouchableOpacity 
                                onPress={() => router.push(`/(app)/trips/${activeTrip.id}`)}
                                className="flex-1 bg-gray-50 p-3 rounded-2xl border border-gray-100 items-center justify-center"
                            >
                                <Text className="text-[10px] text-gray-500 uppercase font-bold mb-1">{t('common.viewAll')}</Text>
                                <ChevronRight size={18} color="#336b87" />
                            </TouchableOpacity>
                            <TouchableOpacity 
                                onPress={() => router.push('/(app)/trips/create')}
                                className="flex-[2] bg-brand rounded-2xl flex-row items-center justify-center shadow-md shadow-brand/20"
                            >
                                <Plus size={18} color="white" />
                                <Text className="text-white font-bold ml-2">{t('home.addExpense')}</Text>
                            </TouchableOpacity>
                        </View>
                    </TouchableOpacity>
                )
            })()}
            </View>
        )}

        {/* Recent Activity */}
        <View>
          <View className="flex-row justify-between items-center mb-4">
            <Text className="text-lg font-bold text-dark">{t('home.recentActivity')}</Text>
            <TouchableOpacity onPress={() => router.push('/(app)/trips')}>
              <Text className="text-xs font-bold text-brand">{t('common.viewAll')}</Text>
            </TouchableOpacity>
          </View>

          <View className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
            {reports?.slice(0, 5).map((report, idx) => (
              <TouchableOpacity 
                key={report.id || `report-${idx}`} 
                onPress={() => router.push(`/(app)/trips/${report.id}`)}
                className={`p-4 flex-row items-center justify-between ${idx !== (reports.length > 5 ? 4 : reports.length - 1) ? 'border-b border-gray-50' : ''}`}
              >
                <View className="flex-row items-center flex-1">
                  <View className="w-10 h-10 bg-surface rounded-full items-center justify-center mr-3">
                    <FileText size={18} color="#64748b" />
                  </View>
                  <View className="flex-1">
                    <Text className="font-bold text-dark text-sm truncate" numberOfLines={1}>
                      {report.name}
                    </Text>
                    <Text className="text-[10px] text-gray-400">{new Date(report.start_date).toLocaleDateString()}</Text>
                  </View>
                </View>
                <View className="items-end">
                  <Text className="font-bold text-dark text-sm mb-1">{report.requested_amount} {report.currency}</Text>
                  <StatusBadge status={report.status} />
                </View>
                <ChevronRight size={16} color="#cbd5e1" className="ml-2" />
              </TouchableOpacity>
            ))}
            
            {(!reports || reports.length === 0) && (
                <View className="p-8 items-center">
                    <Text className="text-gray-400 text-sm">{t('home.noTrips')}</Text>
                </View>
            )}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}