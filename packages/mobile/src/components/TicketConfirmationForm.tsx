import React, { useState } from "react";
import { View, Text, ScrollView, TextInput } from "react-native";
import { ITicket } from "@ticket-registrator/shared";
import { Button } from "./Button";
import { Feather } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";

interface TicketConfirmationFormProps {
  ticket: ITicket;
  onConfirm: (updatedTicket: Partial<ITicket>) => void;
  onCancel: () => void;
  isLoading?: boolean;
}

const isExtracted = (value: any): boolean =>
  value !== null && value !== undefined && value !== "";

type FieldKey =
  | "location_name"
  | "location_address"
  | "date"
  | "amount"
  | "currency"
  | "payment_type"
  | "expense_type";

export const TicketConfirmationForm = ({
  ticket,
  onConfirm,
  onCancel,
  isLoading,
}: TicketConfirmationFormProps) => {
  const { t } = useTranslation();

  const [formData, setFormData] = useState<Record<FieldKey, string>>({
    location_name: ticket.location_name || "",
    location_address: ticket.location_address || "",
    date: ticket.date
      ? new Date(ticket.date).toISOString().split("T")[0]
      : "",
    amount:
      ticket.amount !== null && ticket.amount !== undefined
        ? ticket.amount.toString()
        : "",
    currency: ticket.currency || "",
    payment_type: ticket.payment_type || "",
    expense_type: ticket.expense_type || "",
  });

  const extracted: Record<FieldKey, boolean> = {
    location_name: isExtracted(ticket.location_name),
    location_address: isExtracted(ticket.location_address),
    date: isExtracted(ticket.date),
    amount: ticket.amount !== null && ticket.amount !== undefined,
    currency: isExtracted(ticket.currency),
    payment_type: isExtracted(ticket.payment_type),
    expense_type: isExtracted(ticket.expense_type),
  };

  const extractedCount = Object.values(extracted).filter(Boolean).length;
  const totalFields = Object.keys(extracted).length;
  const missingFields = Object.entries(extracted).filter(([, v]) => !v).map(([k]) => k as FieldKey);
  const extractedFields = Object.entries(extracted).filter(([, v]) => v).map(([k]) => k as FieldKey);

  const fieldMeta: Record<FieldKey, { label: string; placeholder: string; icon: string; numeric?: boolean }> = {
    location_name: { label: t("confirmForm.establishment"), placeholder: t("confirmForm.establishmentPlaceholder"), icon: "home" },
    location_address: { label: t("confirmForm.address"), placeholder: t("confirmForm.addressPlaceholder"), icon: "map-pin" },
    date: { label: t("confirmForm.date"), placeholder: "YYYY-MM-DD", icon: "calendar" },
    amount: { label: t("confirmForm.amount"), placeholder: "0.00", icon: "dollar-sign", numeric: true },
    currency: { label: t("confirmForm.currency"), placeholder: "EUR", icon: "credit-card" },
    payment_type: { label: t("confirmForm.paymentMethod"), placeholder: t("confirmForm.paymentMethodPlaceholder"), icon: "credit-card" },
    expense_type: { label: t("confirmForm.category"), placeholder: t("confirmForm.categoryPlaceholder"), icon: "tag" },
  };

  const formatExtractedValue = (key: FieldKey): string => {
    const raw = formData[key];
    if (key === "date" && raw) {
      try {
        return new Date(raw).toLocaleDateString();
      } catch {
        return raw;
      }
    }
    if (key === "amount") {
      const num = Number.parseFloat(raw);
      return Number.isNaN(num) ? raw : `${num.toFixed(2)} ${formData.currency}`;
    }
    return raw;
  };

  const handleChange = (name: FieldKey, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = () => {
    onConfirm({
      location_name: formData.location_name || null,
      location_address: formData.location_address || null,
      date: formData.date || null,
      amount: formData.amount ? Number.parseFloat(formData.amount) : null,
      currency: formData.currency || null,
      payment_type: formData.payment_type || null,
      expense_type: formData.expense_type || null,
    });
  };

  return (
    <View className="flex-1">
      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ padding: 16, paddingBottom: 24 }}
      >
        {/* AI Confidence Banner */}
        <View className="bg-brand/5 border border-brand/10 rounded-2xl p-4 mb-5 flex-row items-center gap-3">
          <View className="w-10 h-10 bg-brand rounded-xl items-center justify-center">
            <Feather name="cpu" size={18} color="white" />
          </View>
          <View className="flex-1">
            <Text className="text-brand font-bold text-sm">
              IA extrajo {extractedCount}/{totalFields} campos
            </Text>
            <View className="mt-2 h-1.5 bg-brand/20 rounded-full overflow-hidden">
              <View
                className="h-full bg-brand rounded-full"
                style={{ width: `${(extractedCount / totalFields) * 100}%` }}
              />
            </View>
          </View>
        </View>

        {/* Extracted Fields (Read-only) */}
        {extractedFields.length > 0 && (
          <View className="mb-5">
            <View className="flex-row items-center gap-2 mb-3">
              <Feather name="check-circle" size={14} color="#22c55e" />
              <Text className="text-[10px] font-bold text-green-600 uppercase tracking-widest">
                Datos extraídos automáticamente
              </Text>
            </View>
            <View className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
              {extractedFields.map((key, idx) => (
                <View
                  key={key}
                  className={`flex-row items-center px-4 py-3.5 gap-3 ${idx < extractedFields.length - 1 ? "border-b border-gray-50" : ""
                    }`}
                >
                  <View className="w-7 h-7 bg-green-50 rounded-lg items-center justify-center">
                    <Feather name={fieldMeta[key].icon as any} size={13} color="#22c55e" />
                  </View>
                  <View className="flex-1">
                    <Text className="text-[10px] text-gray-400 font-bold uppercase tracking-wide">
                      {fieldMeta[key].label}
                    </Text>
                    <Text className="text-sm font-bold text-dark mt-0.5" numberOfLines={1}>
                      {formatExtractedValue(key)}
                    </Text>
                  </View>
                  <Feather name="check" size={14} color="#22c55e" />
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Missing Fields (Editable) */}
        {missingFields.length > 0 && (
          <View className="mb-5">
            <View className="flex-row items-center gap-2 mb-3">
              <Feather name="alert-circle" size={14} color="#f59e0b" />
              <Text className="text-[10px] font-bold text-amber-600 uppercase tracking-widest">
                Completa estos campos
              </Text>
            </View>
            <View className="bg-white rounded-2xl border border-amber-100 overflow-hidden">
              {missingFields.map((key, idx) => (
                <View
                  key={key}
                  className={`px-4 py-3.5 ${idx < missingFields.length - 1 ? "border-b border-gray-50" : ""
                    }`}
                >
                  <View className="flex-row items-center gap-2 mb-2">
                    <Feather name={fieldMeta[key].icon as any} size={13} color="#f59e0b" />
                    <Text className="text-[10px] font-bold text-amber-600 uppercase tracking-wide">
                      {fieldMeta[key].label} *
                    </Text>
                  </View>
                  <TextInput
                    className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 text-dark font-medium text-sm"
                    placeholder={fieldMeta[key].placeholder}
                    placeholderTextColor="#d1a84a"
                    value={formData[key]}
                    onChangeText={(v) => handleChange(key, v)}
                    keyboardType={fieldMeta[key].numeric ? "numeric" : "default"}
                  />
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Items Section */}
        {ticket.items && ticket.items.length > 0 && (
          <View className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
            <View className="px-4 py-3 border-b border-gray-50 flex-row items-center gap-2">
              <Feather name="list" size={14} color="#336b87" />
              <Text className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                {t("confirmForm.itemsSummary")}
              </Text>
            </View>
            {ticket.items.map((item, index) => (
              <View
                key={item.id}
                className={`flex-row justify-between items-center px-4 py-3 ${index < ticket.items!.length - 1 ? "border-b border-gray-50" : ""
                  }`}
              >
                <Text className="text-sm font-medium text-dark flex-1 mr-3" numberOfLines={1}>
                  {item.name}
                </Text>
                <Text className="text-sm font-bold text-brand">
                  {item.amount} {item.currency}
                </Text>
              </View>
            ))}
          </View>
        )}
      </ScrollView>

      {/* Action Buttons */}
      <View className="p-4 border-t border-gray-100 flex-row gap-3 bg-white">
        <Button
          variant="outline"
          onPress={onCancel}
          disabled={isLoading}
          className="flex-1"
        >
          <Text className="text-gray-600 font-bold">Descartar</Text>
        </Button>
        <Button
          onPress={handleSubmit}
          isLoading={isLoading}
          disabled={isLoading}
          className="flex-[2]"
        >
          <Text className="text-white font-bold">Confirmar Ticket</Text>
        </Button>
      </View>
    </View>
  );
};
