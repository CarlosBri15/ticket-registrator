import { useTranslation } from "react-i18next";
import { Camera, ExternalLink, Image as ImageIcon, Loader2, X } from "lucide-react";
import { tokens } from "../../../styles/theme";

interface ImageSidePanelProps {
  imageUrl?: string;
  isLoading: boolean;
  onClose: () => void;
}

export const ImageSidePanel = ({ imageUrl, isLoading, onClose }: ImageSidePanelProps) => {
  const { t } = useTranslation();

  return (
    <>
      <div className="bg-[var(--color-surface-header)] border-b-4 border-[var(--color-shadow-main)] px-6 pt-6 pb-5 shrink-0">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <Camera className="w-5 h-5 text-dark/50 shrink-0" />
            <h2 className="text-xl font-space-bold text-dark tracking-tight truncate">
              {t("ticketDetail.imageTitle")}
            </h2>
          </div>
          <button type="button" onClick={onClose} className={tokens.modalClose}>
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center p-6 overflow-hidden min-h-0">
        {isLoading ? (
          <div className="flex flex-col items-center gap-3">
            <Loader2 className="w-8 h-8 text-dark/30 animate-spin" />
            <p className="text-[10px] font-space-bold text-dark/30 uppercase tracking-widest">
              {t("common.loading")}
            </p>
          </div>
        ) : imageUrl ? (
          <img
            src={imageUrl}
            alt="Ticket"
            className="max-w-full max-h-full object-contain rounded-lg"
            style={{ boxShadow: "4px 4px 0px rgba(26,26,26,0.35)" }}
          />
        ) : (
          <div className="text-center">
            <div className="w-16 h-16 rounded-lg border-2 border-border-main flex items-center justify-center mx-auto mb-3">
              <ImageIcon className="w-7 h-7 text-dark/20" />
            </div>
            <p className="text-[10px] font-space-bold text-dark/30 uppercase tracking-widest">
              {t("ticketDetail.noImage")}
            </p>
          </div>
        )}
      </div>

      {imageUrl && (
        <div className="px-5 pb-5 shrink-0">
          <a
            href={imageUrl}
            target="_blank"
            rel="noreferrer"
            className="flex items-center justify-center gap-2 py-3 rounded-lg border-2 border-border-main text-xs font-space-bold text-dark/50 hover:text-dark transition-colors bg-[var(--color-surface-card)] shadow-hard-sm"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            {t("ticketDetail.fullscreen")}
          </a>
        </div>
      )}
    </>
  );
};
