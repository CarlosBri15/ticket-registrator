import React, { useState, useEffect } from "react";
import { Award } from "lucide-react";
import { PixelCard } from "../../../components/ui/PixelCard";
import { useTranslation } from "react-i18next";

interface UserDetailRatingProps {
  ratingValue: number;
  ratingColor: string;
  ratingLabel: string;
}

export const UserDetailRating: React.FC<UserDetailRatingProps> = ({
  ratingValue,
  ratingColor,
  ratingLabel,
}) => {
  const { t } = useTranslation();
  const [animatedProgress, setAnimatedProgress] = useState(0);

  useEffect(() => {
    const timer = setTimeout(() => {
      setAnimatedProgress(ratingValue);
    }, 100);
    return () => clearTimeout(timer);
  }, [ratingValue]);

  return (
    <section>
      <PixelCard className="shadow-[6px_6px_0px_var(--color-shadow-main)]">
        <div className="p-6 flex flex-col items-center">
          <div className="w-full flex items-center justify-between mb-6">
            <h3 className="font-space-bold text-[10px] uppercase tracking-[0.2em] text-dark/30">
              {t("users.userRating", "REPUTACIÓN")}
            </h3>
            <Award className="w-4 h-4 text-dark/20" />
          </div>
          
          {/* Rating Circle */}
          <div className="relative flex items-center justify-center">
            <svg className="w-32 h-32 transform -rotate-90">
              <circle
                cx="64"
                cy="64"
                r="54"
                stroke="currentColor"
                strokeWidth="16"
                fill="transparent"
                className="text-dark/5"
              />
              <circle
                cx="64"
                cy="64"
                r="54"
                stroke="currentColor"
                strokeWidth="16"
                fill="transparent"
                strokeDasharray={339.3}
                strokeDashoffset={339.3 - (339.3 * animatedProgress) / 100}
                style={{ color: ratingColor }}
                className="transition-all duration-1000 ease-out"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-4xl font-space-bold text-dark leading-none">
                {Math.round(animatedProgress)}
              </span>
              <span className="text-[10px] font-space-bold uppercase tracking-widest text-dark/30 mt-1">/ 100</span>
            </div>
          </div>

          <div className="mt-6 w-full flex items-center justify-center gap-2">
            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: ratingColor }} />
            <span className="font-space-bold text-[11px] uppercase tracking-wider" style={{ color: ratingColor }}>
              {ratingLabel}
            </span>
          </div>
        </div>
      </PixelCard>
    </section>
  );
};
