import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { createReportSchema, type CreateReportSchema, useCreateReportMutation } from "@ticket-registrator/shared";
import { Button } from "../components/Button";
import { Input } from "../components/Input";
import { Banknote, Tag } from "lucide-react";

interface ReportFormProps {
  onSuccess: () => void;
  onCancel: () => void;
}

export const ReportForm = ({ onSuccess, onCancel }: ReportFormProps) => {
  const { mutate: createReport, isPending } = useCreateReportMutation({
    onSuccess: () => {
        onSuccess();
    },
    onError: (error: any) => {
        const message = error?.response?.data?.message || 'Error al crear el viaje';
        alert(message);
    }
  });

  const { register, handleSubmit, formState: { errors } } = useForm<CreateReportSchema>({
    resolver: zodResolver(createReportSchema) as any,
    defaultValues: {
      name: "",
      currency: "EUR",
      type: ""
    }
  });

  const onSubmit = (data: CreateReportSchema) => {
    createReport(data);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
      <div className="space-y-6">
        <Input
          label="Identificador del Viaje"
          placeholder="Ej: Convención Anual Madrid 2026"
          {...register("name")}
          error={errors.name?.message}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Input
            type="date"
            label="Fecha Inicio"
            {...register("start_date", { valueAsDate: true })}
            error={errors.start_date?.message}
          />

          <Input
            type="date"
            label="Fecha Fin"
            {...register("end_date", { valueAsDate: true })}
            error={errors.end_date?.message}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="relative">
             <Input
                label="Moneda Base"
                placeholder="EUR"
                {...register("currency")}
                error={errors.currency?.message}
                className="pl-11"
              />
              <Banknote className="absolute left-4 top-[42px] w-5 h-5 text-gray-400" />
          </div>

          <div className="relative">
              <Input
                label="Categoría / Tipo"
                placeholder="Ej: Viaje de Negocios"
                {...register("type")}
                error={errors.type?.message}
                className="pl-11"
              />
              <Tag className="absolute left-4 top-[42px] w-5 h-5 text-gray-400" />
          </div>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row justify-end gap-3 pt-6 border-t border-gray-100">
        <Button 
          type="button" 
          variant="ghost" 
          onClick={onCancel}
          className="sm:w-auto"
        >
          Descartar
        </Button>
        <Button 
          type="submit" 
          isLoading={isPending}
          className="sm:w-auto px-10 shadow-xl shadow-brand/20"
        >
          Crear Viaje
        </Button>
      </div>
    </form>
  );
};
