import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { createReportSchema, type CreateReportSchema, useCreateReportMutation } from "@ticket-registrator/shared";
import { Button } from "../../../components/ui/Button";
import { Input } from "../../../components/ui/Input";
import { Banknote, Tag, AlertCircle } from "lucide-react";
import { AxiosError } from "axios";
import { useTranslation } from "react-i18next";

interface ReportFormProps {
  onSuccess: () => void;
  onCancel: () => void;
}

const CURRENCIES = ["EUR", "USD", "GBP", "CHF", "JPY", "MXN", "COP", "ARS", "BRL"];

const TRIP_TYPE_KEYS = [
  "trips.typeBusinessTrip",
  "trips.typeTraining",
  "trips.typeConference",
  "trips.typeClient",
  "trips.typeProject",
  "trips.typeOther",
] as const;

export const ReportForm = ({ onSuccess, onCancel }: ReportFormProps) => {
  const { t } = useTranslation();
  const [apiError, setApiError] = useState<string | null>(null);

  const { mutate: createReport, isPending } = useCreateReportMutation({
    onSuccess: () => {
      setApiError(null);
      onSuccess();
    },
    onError: (error: AxiosError<{ message: string }>) => {
      const message = error?.response?.data?.message || t('trips.createError');
      setApiError(message);
    }
  });

  const { register, handleSubmit, formState: { errors } } = useForm<CreateReportSchema>({
    resolver: zodResolver(createReportSchema),
    defaultValues: {
      name: "",
      start_date: new Date(),
      end_date: new Date(),
      currency: "EUR",
      type: ""
    }
  });

  const onSubmit = (data: CreateReportSchema) => {
    setApiError(null);
    createReport(data);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
      {apiError && (
        <div className="flex items-start gap-3 bg-red-50 border border-red-200 text-red-700 rounded-2xl px-4 py-3 text-sm font-medium">
          <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
          <span>{apiError}</span>
        </div>
      )}

      <div className="space-y-6">
        <Input
          label={t('trips.nameLabel')}
          placeholder={t('trips.namePlaceholder')}
          {...register("name")}
          error={errors.name?.message}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Input
            type="date"
            label={t('trips.startLabel')}
            {...register("start_date", { valueAsDate: true })}
            error={errors.start_date?.message}
          />
          <Input
            type="date"
            label={t('trips.endLabel')}
            {...register("end_date", { valueAsDate: true })}
            error={errors.end_date?.message}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Currency select */}
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-bold text-dark">{t('trips.currencyLabel')}</label>
            <div className="relative">
              <Banknote className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
              <select
                {...register("currency")}
                className="w-full pl-11 pr-4 py-3.5 bg-white border border-gray-200 rounded-2xl text-sm font-medium text-dark focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand/40 transition-all appearance-none cursor-pointer"
              >
                {CURRENCIES.map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
            {errors.currency?.message && (
              <p className="text-xs text-red-500 font-medium">{errors.currency.message}</p>
            )}
          </div>

          {/* Trip type select */}
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-bold text-dark">{t('trips.categoryLabel')}</label>
            <div className="relative">
              <Tag className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
              <select
                {...register("type")}
                className="w-full pl-11 pr-4 py-3.5 bg-white border border-gray-200 rounded-2xl text-sm font-medium text-dark focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand/40 transition-all appearance-none cursor-pointer"
              >
                <option value="">{t('trips.categoryPlaceholder')}</option>
                {TRIP_TYPE_KEYS.map(key => (
                  <option key={key} value={t(key)}>{t(key)}</option>
                ))}
              </select>
            </div>
            {errors.type?.message && (
              <p className="text-xs text-red-500 font-medium">{errors.type.message}</p>
            )}
          </div>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row justify-end gap-3 pt-6 border-t border-gray-100">
        <Button
          type="button"
          variant="ghost"
          onClick={onCancel}
          className="w-full sm:w-auto"
        >
          {t('common.cancel')}
        </Button>
        <Button
          type="submit"
          isLoading={isPending}
          className="w-full sm:w-auto px-10 shadow-xl shadow-brand/20"
        >
          {t('trips.saveButton')}
        </Button>
      </div>
    </form>
  );
};
