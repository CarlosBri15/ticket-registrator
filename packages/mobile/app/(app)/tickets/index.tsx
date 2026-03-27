import { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { useRouter } from 'expo-router';
import { useReportsQuery, useTicketsQuery, type ITicket, type IReport } from '@ticket-registrator/shared';
import { StatusBadge } from '../../../src/components/StatusBadge';
import { TicketDetailModal } from '../../../src/components/TicketDetailModal';
import { mt, colors } from '../../../src/styles/theme';

interface ReportTicketGroupProps {
  report: IReport;
  search: string;
  onTicketPress: (ticket: ITicket, reportId: string) => void;
}

const ReportTicketGroup = ({ report, search, onTicketPress }: ReportTicketGroupProps) => {
  const router = useRouter();
  const { data: tickets, isLoading } = useTicketsQuery(report.id);

  const filtered = tickets?.filter(ticket => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      ticket.location_name?.toLowerCase().includes(q) ||
      ticket.expense_type?.toLowerCase().includes(q) ||
      String(ticket.amount).includes(q)
    );
  });

  if (isLoading) return <ActivityIndicator color={colors.brand} style={{ marginVertical: 8 }} />;
  if (!filtered || filtered.length === 0) return null;

  return (
    <View className="mb-6">
      <TouchableOpacity
        onPress={() => router.push(`/(app)/reports/${report.id}`)}
        className="flex-row items-center gap-1 mb-2 ml-1"
      >
        <Text className={mt.sectionLabel}>{report.name}</Text>
        <Feather name="chevron-right" size={24} color="#94a3b8" />
      </TouchableOpacity>

      <View className={mt.listSection}>
        {filtered.map((ticket, idx) => (
          <TouchableOpacity
            key={ticket.id}
            onPress={() => onTicketPress(ticket, report.id)}
            className={`p-4 flex-row items-center justify-between ${idx < filtered.length - 1 ? 'border-b border-gray-50' : ''}`}
          >
            <View className="flex-row items-center gap-3 flex-1 min-w-0">
              <View className={`${mt.iconBox} bg-gray-50`}>
                <Feather name="file-text" size={32} color="#94a3b8" />
              </View>
              <View className="flex-1 min-w-0">
                <Text className="font-bold text-dark text-sm" numberOfLines={1}>
                  {ticket.location_name ?? 'Ticket'}
                </Text>
                <View className="flex-row items-center gap-2 mt-0.5">
                  <Text className="text-[10px] text-gray-400">
                    {ticket.date ? new Date(ticket.date).toLocaleDateString() : '---'}
                  </Text>
                  {ticket.expense_type ? (
                    <View className="bg-gray-100 px-2 py-0.5 rounded-full">
                      <Text className="text-[9px] font-bold text-gray-500 uppercase">{ticket.expense_type}</Text>
                    </View>
                  ) : null}
                </View>
              </View>
            </View>
            <View className="items-end ml-2">
              <Text className="font-semibold text-dark text-sm">
                {ticket.amount ?? '—'}{' '}
                <Text className="text-[10px] text-gray-400">{ticket.currency}</Text>
              </Text>
              <StatusBadge status={ticket.status} />
            </View>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
};

export default function AllTicketsScreen() {
  const { t } = useTranslation();
  const { data: reports, isLoading } = useReportsQuery();
  const [selectedTicket, setSelectedTicket] = useState<ITicket | null>(null);
  const [selectedReportId, setSelectedReportId] = useState('');
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [search, setSearch] = useState('');

  const handleTicketPress = (ticket: ITicket, reportId: string) => {
    setSelectedTicket(ticket);
    setSelectedReportId(reportId);
    setIsDetailOpen(true);
  };

  return (
    <SafeAreaView className={mt.screen}>
      {/* Header */}
      <View className={mt.pageHeader}>
        <View className="flex-row items-center gap-2 mb-1">
          <Feather name="file-text" size={32} color={colors.brand} />
          <Text className={mt.pageHeaderTitle}>{t('layout.allTickets')}</Text>
        </View>
        <Text className="text-sm text-gray-400">{t('layout.fullHistory')}</Text>
      </View>

      {/* Search */}
      <View className="px-6 pt-4 pb-2">
        <View className={mt.searchBar}>
          <Feather name="search" size={28} color="#94a3b8" />
          <TextInput
            className={mt.searchInput}
            value={search}
            onChangeText={setSearch}
            placeholder="Buscar por establecimiento, categoria..."
            placeholderTextColor="#94a3b8"
          />
          {search.length > 0 && (
            <TouchableOpacity onPress={() => setSearch('')}>
              <Feather name="x" size={28} color="#94a3b8" />
            </TouchableOpacity>
          )}
        </View>
      </View>

      <ScrollView className="flex-1 px-6 pt-4" contentContainerStyle={{ paddingBottom: 40 }}>
        {isLoading ? (
          <View className="flex-1 items-center justify-center py-24">
            <ActivityIndicator size="large" color={colors.brand} />
            <Text className="text-gray-400 mt-3 text-sm">Cargando tickets...</Text>
          </View>
        ) : !reports || reports.length === 0 ? (
          <View className={mt.emptyState}>
            <View className={mt.emptyStateIcon}>
              <Feather name="inbox" size={56} color="#cbd5e1" />
            </View>
            <Text className={mt.emptyStateTitle}>No hay tickets registrados</Text>
            <Text className={mt.emptyStateText}>
              Sube tickets de gasto desde tus reportes para verlos aqui.
            </Text>
          </View>
        ) : (
          reports.map(report => (
            <ReportTicketGroup
              key={report.id}
              report={report}
              search={search}
              onTicketPress={handleTicketPress}
            />
          ))
        )}
      </ScrollView>

      <TicketDetailModal
        visible={isDetailOpen}
        onClose={() => {
          setIsDetailOpen(false);
          setSelectedTicket(null);
        }}
        ticket={selectedTicket}
        reportId={selectedReportId}
      />
    </SafeAreaView>
  );
}
