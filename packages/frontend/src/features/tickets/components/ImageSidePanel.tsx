import { useTranslation } from "react-i18next";
import { Camera, ExternalLink, Image as ImageIcon, X } from "lucide-react";
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
      <div className="px-6 pt-6 pb-4 border-b border-[var(--color-border-main)] shrink-0">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5 min-w-0">
            <Camera className="w-4 h-4 text-dark/45 shrink-0" aria-hidden={true} />
            <h2 className="text-[16px] font-sans-bold text-dark tracking-tight truncate">
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
            <div className="w-5 h-5 border-2 border-dark/20 border-t-dark/60 rounded-full animate-spin" />
            <p className="text-[11px] font-sans-medium text-dark/45 uppercase tracking-wide">
              {t("common.loading")}
            </p>
          </div>
        ) : imageUrl ? (
          <img
            src={imageUrl}
            alt="Ticket"
            className="max-w-full max-h-full object-contain rounded-lg border border-[var(--color-border-main)]"
          />
        ) : (
          <div className="flex flex-col items-center text-center gap-2">
            <div className="w-10 h-10 rounded-md bg-[var(--color-secondary)] border border-[var(--color-border-main)] flex items-center justify-center text-dark/40">
              <ImageIcon className="w-4 h-4" aria-hidden={true} />
            </div>
            <p className="text-[12px] font-sans-medium text-dark/55">
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
            className="flex items-center justify-center gap-2 py-2.5 rounded-md border border-[var(--color-border-main)] bg-[var(--color-surface-card)] hover:bg-[var(--color-secondary)] text-[12px] font-sans-medium text-dark/70 transition-colors"
          >
            <ExternalLink className="w-3.5 h-3.5" aria-hidden={true} />
            {t("ticketDetail.fullscreen")}
          </a>
        </div>
      )}
    </>
  );
};
