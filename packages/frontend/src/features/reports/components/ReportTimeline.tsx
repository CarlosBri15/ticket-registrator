import { Clock } from "lucide-react";
import { useTranslation } from "react-i18next";

export const ReportTimeline = () => {
  const { t } = useTranslation();

  return (
    <div className="flex flex-col items-center justify-center text-center py-6 gap-2">
      <div className="act-icon">
        <Clock aria-hidden={true} />
      </div>
      <p className="text-[13px] font-sans-medium text-dark/55">
        {t("reportDetail.timelineEmpty")}
      </p>
    </div>
  );
};
