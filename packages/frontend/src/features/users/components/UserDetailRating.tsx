import React, { useState, useEffect } from "react";
import { Award } from "lucide-react";
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
    <section className="rounded-lg border border-[var(--color-border-main)] bg-[var(--color-surface-card)]">
      <div className="p-5 flex flex-col items-center gap-4">
        <div className="w-full flex items-center justify-between">
          <h3 className="text-[12px] font-sans-bold text-dark/70 uppercase tracking-wide">
            {t("users.userRating", "Reputación")}
          </h3>
          <Award className="w-4 h-4 text-dark/30" aria-hidden={true} />
        </div>

        <div className="relative flex items-center justify-center">
          <svg className="w-32 h-32 transform -rotate-90">
            <circle
              cx="64"
              cy="64"
              r="54"
              stroke="currentColor"
              strokeWidth="10"
              fill="transparent"
              className="text-dark/8"
            />
            <circle
              cx="64"
              cy="64"
              r="54"
              stroke="currentColor"
              strokeWidth="10"
              fill="transparent"
              strokeLinecap="round"
              strokeDasharray={339.3}
              strokeDashoffset={339.3 - (339.3 * animatedProgress) / 100}
              style={{ color: ratingColor }}
              className="transition-all duration-1000 ease-out"
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-[32px] font-sans-bold text-dark leading-none">
              {Math.round(animatedProgress)}
            </span>
            <span className="text-[10px] font-sans-medium tracking-widest text-dark/40 mt-1">
              / 100
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full" style={{ backgroundColor: ratingColor }} />
          <span
            className="font-sans-semibold text-[11px] tracking-wide"
            style={{ color: ratingColor }}
          >
            {ratingLabel}
          </span>
        </div>
      </div>
    </section>
  );
};
