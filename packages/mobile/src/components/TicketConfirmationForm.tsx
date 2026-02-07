import React, { useState } from "react";
import { View, Text, ScrollView, StyleSheet } from "react-native";
import { ITicket } from "@ticket-registrator/shared";
import { Input } from "./Input";
import { Button } from "./Button";
import { Feather } from "@expo/vector-icons";

interface TicketConfirmationFormProps {
  ticket: ITicket;
  onConfirm: (updatedTicket: Partial<ITicket>) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
}

export const TicketConfirmationForm = ({ 
  ticket, 
  onConfirm, 
  onCancel,
  isLoading 
}: TicketConfirmationFormProps) => {
  const [formData, setFormData] = useState({
    location_name: ticket.location_name || "",
    location_address: ticket.location_address || "",
    date: ticket.date ? new Date(ticket.date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
    amount: ticket.amount?.toString() || "0",
    currency: ticket.currency || "EUR",
    payment_type: ticket.payment_type || "",
    expense_type: ticket.expense_type || "",
  });

  const handleChange = (name: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = () => {
    onConfirm({
      ...formData,
      amount: parseFloat(formData.amount)
    });
  };

  return (
    <View className="flex-1">
      <ScrollView 
        className="flex-1 px-4" 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 24 }}
      >
        <View className="space-y-4 pt-4">
          <Input
            label="Establecimiento"
            value={formData.location_name}
            onChangeText={(v) => handleChange("location_name", v)}
            placeholder="Nombre del comercio"
          />

          <Input
            label="Dirección"
            value={formData.location_address}
            onChangeText={(v) => handleChange("location_address", v)}
            placeholder="Dirección completa"
          />

          <View className="flex-row gap-4">
            <View className="flex-1">
              <Input
                label="Fecha (YYYY-MM-DD)"
                value={formData.date}
                onChangeText={(v) => handleChange("date", v)}
                placeholder="2024-01-01"
              />
            </View>
            <View className="flex-1">
              <Input
                label="Importe"
                value={formData.amount}
                onChangeText={(v) => handleChange("amount", v)}
                keyboardType="numeric"
                placeholder="0.00"
              />
            </View>
          </View>

          <View className="flex-row gap-4">
            <View className="flex-1">
              <Input
                label="Moneda"
                value={formData.currency}
                onChangeText={(v) => handleChange("currency", v)}
                placeholder="EUR"
              />
            </View>
            <View className="flex-1">
              <Input
                label="Método Pago"
                value={formData.payment_type}
                onChangeText={(v) => handleChange("payment_type", v)}
                placeholder="Card, Cash"
              />
            </View>
          </View>

          <Input
            label="Categoría"
            value={formData.expense_type}
            onChangeText={(v) => handleChange("expense_type", v)}
            placeholder="Food, Transport"
          />

          <View className="bg-gray-50 p-4 rounded-2xl">
            <Text className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3">Items Extraídos</Text>
            {ticket.items && ticket.items.length > 0 ? (
              ticket.items.map((item, index) => (
                <View key={index} className="flex-row justify-between items-center bg-white p-3 rounded-xl border border-gray-100 mb-2 shadow-sm">
                  <Text className="text-xs font-medium text-dark flex-1 mr-2" numberOfLines={1}>{item.name}</Text>
                  <Text className="text-xs font-bold text-brand">{item.amount} {item.currency}</Text>
                </View>
              ))
            ) : (
              <Text className="text-xs text-gray-400 italic text-center py-2">No se extrajeron items</Text>
            )}
          </View>
        </View>
      </ScrollView>

      <View className="p-4 border-t border-gray-100 flex-row gap-3 bg-white">
        <Button 
          variant="outline" 
          onPress={onCancel}
          disabled={isLoading}
          className="flex-1 border-gray-200"
        >
          <Text className="text-gray-600 font-bold">Descartar</Text>
        </Button>
        <Button 
          onPress={handleSubmit} 
          isLoading={isLoading}
          className="flex-1"
        >
          <Text className="text-white font-bold">Confirmar</Text>
        </Button>
      </View>
    </View>
  );
};
