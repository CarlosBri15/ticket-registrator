import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, Image, Modal, Dimensions } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTicketQuery, useTicketImageQuery } from '@ticket-registrator/shared';
import { Feather } from '@expo/vector-icons';
import { useState } from 'react';

const { width, height } = Dimensions.get('window');

export default function TicketDetailScreen() {
  const { ticketId, reportId } = useLocalSearchParams<{ ticketId: string, reportId: string }>();
  const router = useRouter();
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);

  const { data: ticket, isLoading } = useTicketQuery(reportId!, ticketId!);
  const { data: imageData, isLoading: isLoadingImage } = useTicketImageQuery(reportId!, ticketId!);

  if (isLoading) {
    return (
      <View className="flex-1 justify-center items-center bg-surface">
        <ActivityIndicator size="large" color="#336b87" />
      </View>
    );
  }

  if (!ticket) {
      return (
          <View className="flex-1 justify-center items-center bg-surface px-6">
              <Feather name="alert-circle" size={48} color="#ef4444" />
              <Text className="text-dark font-bold text-lg mt-4 text-center">Ticket no encontrado</Text>
              <TouchableOpacity onPress={() => router.back()} className="mt-6 bg-brand px-6 py-3 rounded-xl">
                  <Text className="text-white font-bold">Volver</Text>
              </TouchableOpacity>
          </View>
      )
  }

  return (
    <SafeAreaView className="flex-1 bg-surface">
      {/* Header */}
      <View className="px-6 py-4 flex-row items-center gap-4 bg-white border-b border-gray-50">
        <TouchableOpacity onPress={() => router.back()}>
            <Feather name="arrow-left" size={24} color="#2a3132" />
        </TouchableOpacity>
        <View className="flex-1">
            <Text className="text-xl font-bold text-dark truncate">{ticket.location_name || 'Ticket'}</Text>
            <Text className="text-xs text-gray-400 uppercase font-bold tracking-widest">Detalle del Ticket</Text>
        </View>
      </View>

      <ScrollView className="flex-1" contentContainerStyle={{ padding: 24 }}>
        
        {/* Main Amount Card */}
        <View className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm mb-6 items-center">
            <Text className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mb-2">Importe Total</Text>
            <View className="flex-row items-baseline">
                <Text className="text-5xl font-extrabold text-dark">{ticket.amount}</Text>
                <Text className="text-xl font-bold text-gray-400 ml-2">{ticket.currency}</Text>
            </View>
            <View className="mt-6 px-4 py-1.5 rounded-full bg-brand/10 border border-brand/5">
                <Text className="text-brand font-bold text-xs uppercase">{ticket.status}</Text>
            </View>
        </View>

        {/* Info Grid */}
        <View className="flex-row flex-wrap gap-4 mb-6">
            <View className="flex-1 min-w-[45%] bg-white p-5 rounded-3xl border border-gray-100 shadow-sm">
                <Feather name="calendar" size={16} color="#336b87" />
                <Text className="text-[10px] text-gray-400 font-bold uppercase mt-3 mb-1">Fecha</Text>
                <Text className="text-sm font-bold text-dark">{ticket.date ? new Date(ticket.date).toLocaleDateString() : '---'}</Text>
            </View>
            <View className="flex-1 min-w-[45%] bg-white p-5 rounded-3xl border border-gray-100 shadow-sm">
                <Feather name="tag" size={16} color="#336b87" />
                <Text className="text-[10px] text-gray-400 font-bold uppercase mt-3 mb-1">Categoría</Text>
                <Text className="text-sm font-bold text-dark">{ticket.expense_type || '---'}</Text>
            </View>
            <View className="flex-1 min-w-[45%] bg-white p-5 rounded-3xl border border-gray-100 shadow-sm">
                <Feather name="credit-card" size={16} color="#336b87" />
                <Text className="text-[10px] text-gray-400 font-bold uppercase mt-3 mb-1">Pago</Text>
                <Text className="text-sm font-bold text-dark" numberOfLines={1}>{ticket.payment_type || '---'} {ticket.last_four_digits ? `(**** ${ticket.last_four_digits})` : ''}</Text>
            </View>
            <View className="flex-1 min-w-[45%] bg-white p-5 rounded-3xl border border-gray-100 shadow-sm">
                <Feather name="map-pin" size={16} color="#336b87" />
                <Text className="text-[10px] text-gray-400 font-bold uppercase mt-3 mb-1">Ubicación</Text>
                <Text className="text-sm font-bold text-dark" numberOfLines={1}>{ticket.location_address || '---'}</Text>
            </View>
        </View>

        {/* Image Preview */}
        <View className="bg-white p-4 rounded-3xl border border-gray-100 shadow-sm mb-6">
            <Text className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mb-4 ml-2">Foto del Ticket</Text>
            {isLoadingImage ? (
                <View className="h-48 items-center justify-center bg-gray-50 rounded-2xl">
                    <ActivityIndicator color="#336b87" />
                </View>
            ) : imageData?.url ? (
                <TouchableOpacity onPress={() => setIsImageModalOpen(true)} className="relative overflow-hidden rounded-2xl">
                    <Image 
                        source={{ uri: imageData.url }} 
                        className="h-64 w-full"
                        resizeMode="cover"
                    />
                    <View className="absolute inset-0 bg-dark/20 items-center justify-center">
                        <View className="bg-white/90 px-4 py-2 rounded-xl flex-row items-center gap-2">
                            <Feather name="maximize-2" size={14} color="#2a3132" />
                            <Text className="text-dark font-bold text-xs">Ver pantalla completa</Text>
                        </View>
                    </View>
                </TouchableOpacity>
            ) : (
                <View className="h-48 items-center justify-center bg-gray-50 rounded-2xl border border-dashed border-gray-200">
                    <Feather name="image" size={32} color="#cbd5e1" />
                    <Text className="text-gray-400 text-xs font-bold mt-2">Sin imagen</Text>
                </View>
            )}
        </View>

        {/* Items List */}
        <View className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm mb-10">
            <Text className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mb-4">Items del Recibo</Text>
            {ticket.items && ticket.items.length > 0 ? (
                ticket.items.map((item, idx) => (
                    <View key={idx} className="flex-row justify-between items-center py-3 border-b border-gray-50">
                        <Text className="text-sm font-medium text-dark flex-1 mr-4" numberOfLines={1}>{item.name}</Text>
                        <Text className="text-sm font-bold text-brand">{item.amount} {item.currency}</Text>
                    </View>
                ))
            ) : (
                <Text className="text-sm text-gray-400 italic text-center py-4">No se extrajeron items individuales</Text>
            )}
        </View>

      </ScrollView>

      {/* Full Image Modal */}
      <Modal visible={isImageModalOpen} transparent={false} animationType="fade">
          <SafeAreaView className="flex-1 bg-dark">
              <View className="px-6 py-4 flex-row items-center justify-between">
                  <Text className="text-white font-bold text-lg">Ticket</Text>
                  <TouchableOpacity onPress={() => setIsImageModalOpen(false)}>
                      <Feather name="x" size={28} color="white" />
                  </TouchableOpacity>
              </View>
              <View className="flex-1 items-center justify-center">
                  {imageData?.url && (
                      <Image 
                        source={{ uri: imageData.url }} 
                        style={{ width: width, height: height * 0.8 }}
                        resizeMode="contain"
                      />
                  )}
              </View>
          </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
}
