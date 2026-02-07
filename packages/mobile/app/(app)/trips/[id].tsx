import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useReportQuery, useTicketsQuery, useUploadTicketMutation } from '@ticket-registrator/shared';
import { Feather } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useTranslation } from 'react-i18next';

export default function TripDetailScreen() {
  const { t } = useTranslation();
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  
  const { data: report, isLoading: loadingReport } = useReportQuery(id);
  const { data: tickets, isLoading: loadingTickets } = useTicketsQuery(id!);
  
  const { mutate: uploadTicket, isPending: isUploading } = useUploadTicketMutation({
    onSuccess: () => {
        Alert.alert(t('common.success'), "Ticket procesado correctamente por la IA.");
    },
    onError: (error: any) => {
        Alert.alert(t('common.error'), error?.response?.data?.message || "Error al subir el ticket");
    }
  });

  const pickImage = async () => {
    // Pedir permisos
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permiso denegado', 'Necesitamos acceso a la cámara para escanear tickets.');
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaType.Images,
      quality: 0.8,
    });

    if (!result.canceled) {
      const imageUri = result.assets[0].uri;
      handleUpload(imageUri);
    }
  };

  const handleUpload = async (uri: string) => {
    const formData = new FormData();
    const filename = uri.split('/').pop() || 'ticket.jpg';
    
    // Preparar archivo para FormData en React Native
    const match = /\.(\w+)$/.exec(filename);
    const type = match ? `image/${match[1]}` : `image`;

    formData.append('file', {
      uri,
      name: filename,
      type,
    } as any);

    uploadTicket({ reportId: id!, formData });
  };

  if (loadingReport) {
    return (
      <View className="flex-1 justify-center items-center bg-surface">
        <ActivityIndicator size="large" color="#336b87" />
      </View>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-surface">
      
      {/* Header */}
      <View className="px-6 py-4 flex-row items-center gap-4 bg-white border-b border-gray-50">
        <TouchableOpacity onPress={() => router.back()}>
            <Feather name="arrow-left" size={24} color="#2a3132" />
        </TouchableOpacity>
        <View className="flex-1">
            <Text className="text-xl font-bold text-dark truncate">{report?.name}</Text>
            <Text className="text-xs text-gray-400 uppercase font-bold tracking-widest">{report?.status}</Text>
        </View>
      </View>

      <ScrollView className="flex-1" contentContainerStyle={{ padding: 24 }}>
        
        {/* Summary Card */}
        <View className="bg-white p-6 rounded-[2.5rem] border border-gray-100 shadow-sm mb-8">
            <View className="flex-row justify-between items-center mb-6">
                <View className="w-12 h-12 bg-brand/10 rounded-2xl items-center justify-center">
                    <Feather name="pie-chart" size={24} color="#336b87" />
                </View>
                <View className="items-end">
                    <Text className="text-[10px] text-gray-400 font-bold uppercase">{t('trips.budget')}</Text>
                    <Text className="text-lg font-bold text-dark">{report?.requested_amount} {report?.currency}</Text>
                </View>
            </View>

            <View className="flex-row gap-4">
                <View className="flex-1 bg-green-50 p-4 rounded-2xl border border-green-100">
                    <Text className="text-[10px] text-green-700 font-bold uppercase mb-1">{t('trips.approved')}</Text>
                    <Text className="text-lg font-bold text-green-600">{report?.approved_amount} {report?.currency}</Text>
                </View>
                <View className="flex-1 bg-amber-50 p-4 rounded-2xl border border-amber-100">
                    <Text className="text-[10px] text-amber-700 font-bold uppercase mb-1">{t('trips.pending')}</Text>
                    <Text className="text-lg font-bold text-amber-600">0.00 {report?.currency}</Text>
                </View>
            </View>
        </View>

        {/* Action Button */}
        <TouchableOpacity 
            onPress={pickImage}
            disabled={isUploading}
            className="bg-brand py-5 rounded-[2rem] flex-row items-center justify-center shadow-xl shadow-brand/30 mb-8"
        >
            {isUploading ? (
                <ActivityIndicator color="white" />
            ) : (
                <>
                    <Feather name="camera" size={20} color="white" />
                    <Text className="text-white font-bold text-lg ml-3">{t('home.scanTicket')}</Text>
                </>
            )}
        </TouchableOpacity>

        {/* Tickets List */}
        <View className="space-y-4 mb-10">
            <Text className="text-lg font-bold text-dark mb-4">{t('trips.ticketsList')}</Text>
            
            {loadingTickets ? (
                <ActivityIndicator color="#336b87" />
            ) : tickets && tickets.length > 0 ? (
                tickets.map((ticket, idx) => (
                    <View key={ticket.id || `ticket-${idx}`} className="bg-white p-4 rounded-2xl border border-gray-100 flex-row justify-between items-center mb-3">
                        <View className="flex-row items-center gap-3">
                            <View className="w-10 h-10 bg-gray-50 rounded-xl items-center justify-center">
                                <Feather name="file-text" size={20} color="#9ca3af" />
                            </View>
                            <View>
                                <Text className="font-bold text-dark text-sm">{ticket.location_name || 'Ticket'}</Text>
                                <Text className="text-[10px] text-gray-400">{new Date(ticket.date).toLocaleDateString()}</Text>
                            </View>
                        </View>
                        <Text className="font-bold text-dark">{ticket.amount} {ticket.currency}</Text>
                    </View>
                ))
            ) : (
                <View className="items-center py-10">
                    <Feather name="image" size={40} color="#cbd5e1" />
                    <Text className="text-gray-400 mt-2">{t('trips.noTickets')}</Text>
                </View>
            )}
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}
