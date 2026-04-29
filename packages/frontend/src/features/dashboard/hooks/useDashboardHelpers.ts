import { useTranslation } from "react-i18next";
import { useDateLocale } from "../../../hooks/useDateLocale";

export const useDashboardHelpers = () => {
  const { t, i18n } = useTranslation();
  const dateLocale = useDateLocale();

  const getGreetingKey = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "home.greetingMorning";
    if (hour < 19) return "home.greetingAfternoon";
    return "home.greetingEvening";
  };

  return {
    t,
    i18n,
    getGreetingKey,
    dateLocale,
  };
};
