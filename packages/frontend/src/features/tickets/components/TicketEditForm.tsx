import { useTranslation } from "react-i18next";
import { X } from "lucide-react";
import { Button } from "../../../components/ui/Button";
import { Input } from "../../../components/ui/Input";
import { PixelCard } from "../../../components/ui/PixelCard";

interface TicketEditFormProps {
  formData: {
    location_name: string;
    location_address: string;
    date: string;
    amount: string | number;
    currency: string;
    payment_type: string;
  };
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSave: () => void;
  onCancel: () => void;
  isSaving: boolean;
}

export const TicketEditForm = ({
  formData,
  onChange,
  onSave,
  onCancel,
  isSaving,
}: TicketEditFormProps) => {
  const { t } = useTranslation();

  return (
    <div className="space-y-4 animate-in fade-in duration-200">
      <PixelCard className="w-full">
        <div className="p-5 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <Input
                label={t("confirmForm.establishment")}
                name="location_name"
                value={formData.location_name}
                onChange={onChange}
                placeholder={t("confirmForm.establishmentPlaceholder")}
              />
            </div>
            <div className="md:col-span-2">
              <Input
                label={t("confirmForm.address")}
                name="location_address"
                value={formData.location_address}
                onChange={onChange}
                placeholder={t("confirmForm.addressPlaceholder")}
              />
            </div>
            <Input
              label={t("confirmForm.date")}
              name="date"
              type="date"
              value={formData.date}
              onChange={onChange}
            />
            <Input
              label={t("confirmForm.amount")}
              name="amount"
              type="number"
              step="0.01"
              value={String(formData.amount)}
              onChange={onChange}
              placeholder="0.00"
            />
            <Input
              label={t("confirmForm.currency")}
              name="currency"
              value={formData.currency}
              onChange={onChange}
              placeholder="EUR"
            />
            <Input
              label={t("confirmForm.paymentMethod")}
              name="payment_type"
              value={formData.payment_type}
              onChange={onChange}
              placeholder={t("confirmForm.paymentMethodPlaceholder")}
            />
          </div>
          <div className="flex gap-3 pt-1">
            <Button
              type="button"
              variant="secondary"
              onClick={onCancel}
              disabled={isSaving}
              className="flex-1"
            >
              <X className="w-4 h-4 mr-1.5" />
              {t("common.cancel")}
            </Button>
            <Button
              type="button"
              onClick={onSave}
              isLoading={isSaving}
              className="flex-1"
            >
              {t("common.save")}
            </Button>
          </div>
        </div>
      </PixelCard>
    </div>
  );
};
