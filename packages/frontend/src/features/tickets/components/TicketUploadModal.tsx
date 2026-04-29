import { useState, useCallback } from "react";
import { Upload, File, AlertCircle, Sparkles } from "lucide-react";
import { Modal } from "../../../components/ui/Modal";
import { Button } from "../../../components/ui/Button";
import {
  useUploadTicketMutation,
  useUpdateTicketMutation,
  useDeleteTicketMutation,
} from "@ticket-registrator/shared";
import type { ITicket } from "@ticket-registrator/shared";
import { TicketConfirmationForm } from "./TicketConfirmationForm";

interface TicketUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  reportId: string;
}

type Step = "upload" | "confirm";

export const TicketUploadModal = ({ isOpen, onClose, reportId }: TicketUploadModalProps) => {
  const [step, setStep] = useState<Step>("upload");
  const [file, setFile] = useState<File | null>(null);
  const [extractedTicket, setExtractedTicket] = useState<ITicket | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  const uploadMutation = useUploadTicketMutation({
    onSuccess: (ticket: ITicket) => {
      setExtractedTicket(ticket);
      setStep("confirm");
    },
  });

  const updateMutation = useUpdateTicketMutation({
    onSuccess: () => handleClose(),
  });

  const deleteMutation = useDeleteTicketMutation({
    onSuccess: () => {
      setStep("upload");
      setExtractedTicket(null);
      setFile(null);
    },
  });

  const handleClose = () => {
    onClose();
    setTimeout(() => {
      setStep("upload");
      setFile(null);
      setExtractedTicket(null);
    }, 300);
  };

  const onDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const onDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files?.[0]) {
      setFile(e.dataTransfer.files[0]);
    }
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleUpload = () => {
    if (!file) return;
    const formData = new FormData();
    formData.append("image", file);
    uploadMutation.mutate({ reportId, formData });
  };

  const handleConfirm = (updatedData: Partial<ITicket>) => {
    if (!extractedTicket) return;
    updateMutation.mutate({
      reportId,
      ticketId: extractedTicket.id,
      data: updatedData,
    });
  };

  const handleDiscard = () => {
    if (!extractedTicket) {
      setFile(null);
      return;
    }
    deleteMutation.mutate({ reportId, ticketId: extractedTicket.id });
  };

  const dropZoneClass = (() => {
    if (file) return "border-success/40 bg-green-50/40";
    if (isDragging) return "border-dark/50 bg-[var(--color-secondary)]";
    return "border-[var(--color-border-main)] bg-[var(--color-surface-card)] hover:bg-[var(--color-secondary)]";
  })();

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={step === "upload" ? "Subir Ticket de Gasto" : "Confirmar Datos Extraídos"}
    >
      <div className="flex flex-col gap-5">
        {step === "upload" ? (
          <>
            <label
              onDragOver={onDragOver}
              onDragLeave={onDragLeave}
              onDrop={onDrop}
              className={`relative border border-dashed rounded-lg p-10 transition-colors duration-200 flex flex-col items-center justify-center cursor-pointer ${dropZoneClass}`}
            >
              <input
                type="file"
                className="sr-only"
                onChange={handleFileChange}
                accept="image/*,application/pdf"
                disabled={uploadMutation.isPending}
              />

              {file ? (
                <div className="flex flex-col items-center gap-3 animate-in zoom-in-95 duration-200">
                  <div className="w-12 h-12 rounded-md bg-green-50 border border-green-100 flex items-center justify-center text-success">
                    <File className="w-5 h-5" aria-hidden={true} />
                  </div>
                  <div className="text-center">
                    <p className="text-[14px] font-sans-semibold text-dark">{file.name}</p>
                    <p className="text-[12px] font-sans-medium text-dark/45 mt-0.5">
                      {(file.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                  </div>
                  {!uploadMutation.isPending && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        setFile(null);
                      }}
                      className="text-[12px] font-sans-medium text-danger hover:opacity-80 mt-1"
                    >
                      Quitar archivo
                    </button>
                  )}
                </div>
              ) : (
                <div className="flex flex-col items-center text-center gap-3">
                  <div className="w-12 h-12 rounded-md bg-[var(--color-secondary)] border border-[var(--color-border-main)] flex items-center justify-center text-dark/45">
                    <Upload className="w-5 h-5" aria-hidden={true} />
                  </div>
                  <div>
                    <p className="text-[15px] font-sans-bold text-dark">
                      Arrastra tu ticket aquí
                    </p>
                    <p className="text-[12px] font-sans-medium text-dark/55 max-w-[240px] mt-1">
                      Soporta imágenes (JPG, PNG) y documentos PDF
                    </p>
                  </div>
                  <p className="mt-2 text-[11px] font-sans-medium text-dark/45 underline underline-offset-2">
                    O haz clic para explorar
                  </p>
                </div>
              )}
            </label>

            <div className="flex items-start gap-3 px-4 py-3 rounded-lg bg-amber-50 border border-amber-100">
              <AlertCircle
                className="w-4 h-4 text-amber-700 shrink-0 mt-0.5"
                aria-hidden={true}
              />
              <p className="text-[12px] font-sans-medium text-amber-800 leading-relaxed">
                Asegúrate de que el ticket sea legible y contenga claramente la fecha, el importe
                total y el comercio. Nuestra IA se encargará del resto.
              </p>
            </div>

            <div className="flex gap-3 pt-1">
              <Button
                variant="secondary"
                onClick={handleClose}
                disabled={uploadMutation.isPending}
                className="flex-1"
              >
                Cancelar
              </Button>
              <Button
                onClick={handleUpload}
                isLoading={uploadMutation.isPending}
                disabled={!file}
                leftIcon={<Sparkles className="w-3.5 h-3.5" />}
                className="flex-1"
              >
                Procesar con IA
              </Button>
            </div>
          </>
        ) : (
          <div className="flex flex-col gap-4">
            {extractedTicket &&
              (() => {
                const missing = [
                  extractedTicket.location_name,
                  extractedTicket.location_address,
                  extractedTicket.date,
                  extractedTicket.currency,
                  extractedTicket.payment_type,
                  extractedTicket.items?.[0]?.categoryId,
                ].filter((v) => v === null || v === undefined || v === "").length;
                const hasMissing =
                  missing > 0 ||
                  extractedTicket.amount === null ||
                  extractedTicket.amount === undefined;
                const variantClass = hasMissing
                  ? "bg-amber-50 border-amber-100 text-amber-800"
                  : "bg-blue-50 border-blue-100 text-blue-800";
                const message = hasMissing
                  ? "La IA no pudo leer algunos campos del ticket. Completa los que aparecen destacados antes de confirmar."
                  : "La IA extrajo todos los datos de tu ticket correctamente. Revisa la información y confirma.";
                return (
                  <div
                    className={`flex items-start gap-3 px-4 py-3 rounded-lg border ${variantClass}`}
                  >
                    <Sparkles className="w-4 h-4 shrink-0 mt-0.5" aria-hidden={true} />
                    <p className="text-[12px] font-sans-medium leading-relaxed">{message}</p>
                  </div>
                );
              })()}

            {extractedTicket && (
              <TicketConfirmationForm
                ticket={extractedTicket}
                onConfirm={handleConfirm}
                onCancel={handleDiscard}
                isLoading={updateMutation.isPending || deleteMutation.isPending}
              />
            )}
          </div>
        )}
      </div>
    </Modal>
  );
};
