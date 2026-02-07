import { useState, useCallback } from "react";
import { Upload, File, AlertCircle } from "lucide-react";
import { Modal } from "./Modal";
import { Button } from "./Button";

interface TicketUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  reportId: string;
}

export const TicketUploadModal = ({ isOpen, onClose, reportId }: TicketUploadModalProps) => {
  const [file, setFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

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
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setFile(e.dataTransfer.files[0]);
    }
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleUpload = async () => {
    if (!file) return;
    setIsUploading(true);
    
    try {
      // TODO: Implement actual upload API call
      // const formData = new FormData();
      // formData.append('file', file);
      // await uploadTicket(reportId, formData);
      
      console.log('Uploading file for report:', reportId, file.name);
      await new Promise(resolve => setTimeout(resolve, 2000)); // Simulating upload
      
      onClose();
      setFile(null);
    } catch (error) {
      console.error('Upload failed', error);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Subir Ticket de Gasto">
      <div className="space-y-6">
        <div 
          onDragOver={onDragOver}
          onDragLeave={onDragLeave}
          onDrop={onDrop}
          className={`
            relative border-2 border-dashed rounded-[2rem] p-10 transition-all duration-300 flex flex-col items-center justify-center
            ${isDragging ? 'border-brand bg-brand/5' : 'border-gray-200 bg-gray-50/50 hover:bg-white hover:border-brand/30'}
            ${file ? 'border-green-500/50 bg-green-50/10' : ''}
          `}
        >
          <input 
            type="file" 
            className="absolute inset-0 opacity-0 cursor-pointer" 
            onChange={handleFileChange}
            accept="image/*,application/pdf"
          />
          
          {file ? (
            <div className="flex flex-col items-center animate-in zoom-in-95 duration-300">
               <div className="w-16 h-16 bg-green-100 text-green-600 rounded-2xl flex items-center justify-center mb-4">
                  <File className="w-8 h-8" />
               </div>
               <p className="text-dark font-bold text-lg mb-1">{file.name}</p>
               <p className="text-gray-400 text-sm">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
               <button 
                onClick={(e) => { e.preventDefault(); setFile(null); }}
                className="mt-4 text-xs font-bold text-red-500 hover:text-red-600 uppercase tracking-widest"
               >
                 Quitar archivo
               </button>
            </div>
          ) : (
            <div className="flex flex-col items-center text-center">
              <div className="w-16 h-16 bg-brand/10 text-brand rounded-2xl flex items-center justify-center mb-4">
                  <Upload className="w-8 h-8" />
              </div>
              <h4 className="text-lg font-bold text-dark mb-1">Arrastra tu ticket aquí</h4>
              <p className="text-gray-500 text-sm max-w-[200px]">Soporta imágenes (JPG, PNG) y documentos PDF</p>
              <div className="mt-6 px-4 py-2 bg-white border border-gray-200 rounded-xl text-xs font-bold text-gray-500 shadow-sm">
                O haz clic para explorar
              </div>
            </div>
          )}
        </div>

        <div className="bg-amber-50 p-4 rounded-2xl flex gap-3 border border-amber-100">
            <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <p className="text-xs text-amber-800 leading-relaxed font-medium">
              Asegúrate de que el ticket sea legible y contenga claramente la fecha, el importe total y el comercio. Nuestra IA se encargará del resto.
            </p>
        </div>

        <div className="flex gap-3 pt-2">
            <Button variant="ghost" onClick={onClose} disabled={isUploading}>
                Cancelar
            </Button>
            <Button 
                onClick={handleUpload} 
                isLoading={isUploading} 
                disabled={!file}
                className="shadow-xl shadow-brand/20"
            >
                Procesar con IA
            </Button>
        </div>
      </div>
    </Modal>
  );
};
