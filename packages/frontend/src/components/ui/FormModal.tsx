import { Modal } from "./Modal";
import { Button } from "./Button";
import { AlertError, getApiErrorMessage } from "./Alert";

interface FormModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  size?: "md" | "lg" | "xl";
  onSubmit: (e: React.FormEvent) => void;
  submitLabel: string;
  isPending?: boolean;
  isValid?: boolean;
  error?: any;
  children: React.ReactNode;
}

export const FormModal = ({
  isOpen,
  onClose,
  title,
  subtitle,
  size = "md",
  onSubmit,
  submitLabel,
  isPending = false,
  isValid = true,
  error,
  children,
}: FormModalProps) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} subtitle={subtitle} size={size}>
      <form onSubmit={onSubmit} className="space-y-4">
        {error && <AlertError message={getApiErrorMessage(error)} />}
        
        {children}

        <div className="flex gap-3 pt-2">
          <Button type="button" variant="ghost" onClick={onClose} className="flex-1">
            Cancelar
          </Button>
          <Button type="submit" isLoading={isPending} disabled={!isValid} className="flex-1">
            {submitLabel}
          </Button>
        </div>
      </form>
    </Modal>
  );
};
