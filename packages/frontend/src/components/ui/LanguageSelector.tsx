import { useTranslation } from "react-i18next";
import { Globe, ChevronDown } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { LANGUAGES } from "@ticket-registrator/shared";

export const LanguageSelector = () => {
  const { i18n, t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const changeLanguage = (lng: string) => {
    i18n.changeLanguage(lng);
    setIsOpen(false);
  };

  // Cerrar al hacer clic fuera
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={containerRef}>
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center gap-2 px-3 py-2 text-sm font-medium transition-colors rounded-lg ${isOpen ? 'text-brand bg-brand/5' : 'text-gray-600 hover:text-brand hover:bg-gray-50'}`}
      >
        <Globe className="w-4 h-4" />
        <span className="uppercase">{i18n.language.substring(0, 2)}</span>
        <ChevronDown className={`w-3 h-3 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      </button>
      
      {isOpen && (
        <div className="absolute right-0 mt-2 w-40 bg-white rounded-xl shadow-xl border border-gray-100 py-2 animate-in fade-in slide-in-from-top-2 z-50">
          <p className="px-4 py-1 text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">
            {t("settings.selectLanguage")}
          </p>
          {LANGUAGES.map((lang) => (
            <button
              key={lang.code}
              onClick={() => changeLanguage(lang.code)}
              className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-50 flex items-center justify-between ${i18n.language.startsWith(lang.code) ? 'text-brand font-bold bg-brand/5' : 'text-gray-600'}`}
            >
              {lang.label}
              {i18n.language.startsWith(lang.code) && <span className="w-1.5 h-1.5 bg-brand rounded-full" />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};
