import { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  createReportSchema,
  type CreateReportSchema,
  useCreateReportMutation,
} from "@ticket-registrator/shared";
import { Button } from "../../../components/ui/Button";
import { AlertCircle } from "lucide-react";
import { AxiosError } from "axios";
import { useTranslation } from "react-i18next";
import { tokens } from "../../../styles/theme";
import { DatePicker } from "../../../components/ui/DatePicker";
import { Input } from "../../../components/ui/Input";
import { ReportTypeSelect } from "./ReportTypeSelect";
import { CurrencySelect } from "../../settings/components/CurrencySelect";

interface ReportFormProps {
  onSuccess: () => void;
  onCancel: () => void;
}

export const ReportForm = ({ onSuccess, onCancel }: ReportFormProps) => {
  const { t } = useTranslation();
  const [apiError, setApiError] = useState<string | null>(null);

  const { mutate: createReport, isPending } = useCreateReportMutation({
    onSuccess: () => {
      setApiError(null);
      onSuccess();
    },
    onError: (error: AxiosError<{ message: string }>) => {
      const message = error?.response?.data?.message || t("trips.createError");
      setApiError(message);
    },
  });

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<CreateReportSchema>({
    resolver: zodResolver(createReportSchema) as any,
    defaultValues: {
      name: "",
      start_date: undefined as any,
      end_date: undefined as any,
      currency: "EUR",
      type: "",
    },
  });

  const onSubmit = (data: CreateReportSchema) => {
    setApiError(null);
    createReport(data);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit as any)} className="space-y-8">
      {apiError && (
        <div className={`${tokens.alert} ${tokens.alertError}`}>
          <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
          <span className="text-sm font-medium">{apiError}</span>
        </div>
      )}

      <div className="space-y-6">
        <Input
          label={t("trips.nameLabel")}
          placeholder={t("trips.namePlaceholder")}
          {...register("name")}
          error={errors.name?.message}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Controller
            name="start_date"
            control={control}
            render={({ field }) => (
              <DatePicker
                label={t("trips.startLabel")}
                value={field.value}
                onChange={field.onChange}
                error={errors.start_date?.message}
              />
            )}
          />
          <Controller
            name="end_date"
            control={control}
            render={({ field }) => (
              <DatePicker
                label={t("trips.endLabel")}
                value={field.value}
                onChange={field.onChange}
                error={errors.end_date?.message}
              />
            )}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Controller
            name="currency"
            control={control}
            render={({ field }) => (
              <CurrencySelect
                label={t("trips.currencyLabel")}
                value={field.value}
                onChange={field.onChange}
                error={errors.currency?.message}
              />
            )}
          />

          <Controller
            name="type"
            control={control}
            render={({ field }) => (
              <ReportTypeSelect
                label={t("trips.categoryLabel")}
                value={field.value}
                onChange={field.onChange}
                placeholder={t("trips.categoryPlaceholder")}
                error={errors.type?.message}
              />
            )}
          />
        </div>
      </div>

      <div className="flex flex-col sm:flex-row justify-end gap-3 pt-6 border-t border-slate-100">
        <Button
          type="button"
          variant="secondary"
          onClick={onCancel}
          className="w-full sm:w-auto"
        >
          {t("common.cancel")}
        </Button>
        <Button
          type="submit"
          isLoading={isPending}
          className="w-full sm:w-auto px-10"
        >
          {t("trips.saveButton")}
        </Button>
      </div>
    </form>
  );
};
