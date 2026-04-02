import { useTranslation } from "react-i18next";
import { es, enUS } from "date-fns/locale";

export const useDashboardHelpers = () => {
  const { t, i18n } = useTranslation();

  const getGreetingKey = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "home.greetingMorning";
    if (hour < 19) return "home.greetingAfternoon";
    return "home.greetingEvening";
  };

  const dateLocale = i18n.language.startsWith("es") ? es : enUS;

  return {
    t,
    i18n,
    getGreetingKey,
    dateLocale,
  };
};
