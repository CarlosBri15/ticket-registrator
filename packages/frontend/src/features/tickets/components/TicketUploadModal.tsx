import { useState, useCallback } from "react";
import { Upload, File, AlertCircle, Sparkles } from "lucide-react";
import { Modal } from "../../../components/ui/Modal";
import { Button } from "../../../components/ui/Button";
import { useUploadTicketMutation, useUpdateTicketMutation, useDeleteTicketMutation } from "@ticket-registrator/shared";
import type { ITicket } from "@ticket-registrator/shared";
import { TicketConfirmationForm } from "./TicketConfirmationForm";
import { tokens, radius } from "../../../styles/theme";

interface TicketUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  reportId: string;
}

type Step = 'upload' | 'confirm';

export const TicketUploadModal = ({ isOpen, onClose, reportId }: TicketUploadModalProps) => {
  const [step, setStep] = useState<Step>('upload');
  const [file, setFile] = useState<File | null>(null);
  const [extractedTicket, setExtractedTicket] = useState<ITicket | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  const uploadMutation = useUploadTicketMutation({
    onSuccess: (ticket: ITicket) => {
      setExtractedTicket(ticket);
      setStep('confirm');
    }
  });

  const updateMutation = useUpdateTicketMutation({
    onSuccess: () => {
      handleClose();
    }
  });

  const deleteMutation = useDeleteTicketMutation({
    onSuccess: () => {
      setStep('upload');
      setExtractedTicket(null);
      setFile(null);
    }
  });

  const handleClose = () => {
    onClose();
    // Reset state after a delay to allow for closing animation
    setTimeout(() => {
      setStep('upload');
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
    formData.append('image', file); // 'image' field as expected by backend

    uploadMutation.mutate({ reportId, formData });
  };

  const handleConfirm = (updatedData: Partial<ITicket>) => {
    if (!extractedTicket) return;
    updateMutation.mutate({
      reportId,
      ticketId: extractedTicket.id,
      data: updatedData
    });
  };

  const handleDiscard = () => {
    if (!extractedTicket) {
      setFile(null);
      return;
    }
    // Delete the pending ticket if user cancels
    deleteMutation.mutate({ reportId, ticketId: extractedTicket.id });
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={step === 'upload' ? "Subir Ticket de Gasto" : "Confirmar Datos Extraídos"}
    >
      <div className="space-y-6">
        {step === 'upload' ? (
          <>
            <label
              onDragOver={onDragOver}
              onDragLeave={onDragLeave}
              onDrop={onDrop}
              className={`
                relative border-2 border-dashed ${radius.card} p-8 transition-all duration-300 flex flex-col items-center justify-center cursor-pointer
                ${isDragging ? 'border-brand bg-brand/5' : 'border-slate-200 bg-slate-50/50 hover:bg-white hover:border-brand/30'}
                ${file ? 'border-success/50 bg-success/5' : ''}
              `}
            >
              <input
                type="file"
                className="sr-only"
                onChange={handleFileChange}
                accept="image/*,application/pdf"
                disabled={uploadMutation.isPending}
              />

              {file ? (
                <div className="flex flex-col items-center animate-in zoom-in-95 duration-300">
                  <div className={`w-14 h-14 bg-success/10 text-success ${radius.base} flex items-center justify-center mb-4`}>
                    <File className="w-7 h-7" />
                  </div>
                  <p className="text-dark font-semibold mb-1">{file.name}</p>
                  <p className="text-slate-400 text-sm">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                  {!uploadMutation.isPending && (
                    <button
                      onClick={(e) => { e.preventDefault(); e.stopPropagation(); setFile(null); }}
                      className="mt-4 text-xs font-semibold text-danger hover:text-red-700 uppercase tracking-wide"
                    >
                      Quitar archivo
                    </button>
                  )}
                </div>
              ) : (
                <div className="flex flex-col items-center text-center">
                  <div className={`w-14 h-14 bg-brand/10 text-brand ${radius.base} flex items-center justify-center mb-4`}>
                    <Upload className="w-7 h-7" />
                  </div>
                  <h4 className="text-base font-semibold text-dark mb-1">Arrastra tu ticket aquí</h4>
                  <p className="text-slate-500 text-sm max-w-[200px]">Soporta imágenes (JPG, PNG) y documentos PDF</p>
                  <div className={`mt-5 px-4 py-2 bg-white border border-slate-200 ${radius.base} text-xs font-semibold text-slate-500 shadow-sm`}>
                    O haz clic para explorar
                  </div>
                </div>
              )}
            </label>

            <div className={`${tokens.alert} ${tokens.alertWarning}`}>
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <p className="text-xs leading-relaxed font-medium">
                Asegúrate de que el ticket sea legible y contenga claramente la fecha, el importe total y el comercio. Nuestra IA se encargará del resto.
              </p>
            </div>

            <div className="flex gap-3 pt-2">
              <Button variant="ghost" onClick={handleClose} disabled={uploadMutation.isPending} className="flex-1">
                Cancelar
              </Button>
              <Button
                onClick={handleUpload}
                isLoading={uploadMutation.isPending}
                disabled={!file}
                className="flex-1"
              >
                <Sparkles className="w-4 h-4 mr-2" />
                Procesar con IA
              </Button>
            </div>
          </>
        ) : (
          <div className="space-y-4">
            {extractedTicket && (() => {
              const missing = [
                extractedTicket.location_name, extractedTicket.location_address,
                extractedTicket.date, extractedTicket.currency,
                extractedTicket.payment_type
              ].filter(v => v === null || v === undefined || v === "").length;
              const hasMissing = missing > 0 || (extractedTicket.amount === null || extractedTicket.amount === undefined);
              return hasMissing ? (
                <div className={`${tokens.alert} ${tokens.alertWarning}`}>
                  <Sparkles className="w-4 h-4 shrink-0 mt-0.5" />
                  <p className="text-xs leading-relaxed font-medium">
                    La IA no pudo leer algunos campos del ticket. Completa los que aparecen destacados antes de confirmar.
                  </p>
                </div>
              ) : (
                <div className={`${tokens.alert} ${tokens.alertInfo}`}>
                  <Sparkles className="w-4 h-4 shrink-0 mt-0.5" />
                  <p className="text-xs leading-relaxed font-medium">
                    La IA extrajo todos los datos de tu ticket correctamente. Revisa la información y confirma.
                  </p>
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
