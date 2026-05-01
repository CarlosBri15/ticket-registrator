import React from "react";
import { useTranslation } from "react-i18next";
import { Modal } from "./Modal";
import { Button } from "./Button";
import { AlertError, getApiErrorMessage } from "./Alert";

interface FormModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  size?: "md" | "lg" | "xl";
  onSubmit: React.SubmitEventHandler<HTMLFormElement>;
  submitLabel: string;
  /** Optional override for the cancel button label (defaults to `common.cancel`). */
  cancelLabel?: string;
  isPending?: boolean;
  isValid?: boolean;
  error?: unknown;
  /** When provided, the inline error alert renders a dismiss button that
   *  invokes this callback (typically `mutation.reset`). */
  onErrorDismiss?: () => void;
  children: React.ReactNode;
}

/**
 * Standard form modal: Modal shell + optional error alert + cancel/submit row.
 * Used by all "create / edit" feature modals (Department, OnboardOrganization,
 * CreateUser, EditUser …) so the boilerplate lives in one place.
 */
export const FormModal = ({
  isOpen,
  onClose,
  title,
  subtitle,
  size = "md",
  onSubmit,
  submitLabel,
  cancelLabel,
  isPending = false,
  isValid = true,
  error,
  onErrorDismiss,
  children,
}: FormModalProps) => {
  const { t } = useTranslation();

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} subtitle={subtitle} size={size}>
      <form onSubmit={onSubmit} className="space-y-4">
        {error ? (
          <AlertError message={getApiErrorMessage(error)} onDismiss={onErrorDismiss} />
        ) : null}

        {children}

        <div className="flex gap-3 pt-2">
          <Button type="button" variant="ghost" onClick={onClose} className="flex-1">
            {cancelLabel ?? t("common.cancel")}
          </Button>
          <Button type="submit" isLoading={isPending} disabled={!isValid} className="flex-1">
            {submitLabel}
          </Button>
        </div>
      </form>
    </Modal>
  );
};
