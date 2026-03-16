import { useTranslation } from "react-i18next";
import { Globe, User, LogOut, Check, Mail } from "lucide-react";
import { useUserQuery } from "@ticket-registrator/shared";
import { tokenProvider } from "../../api/client";
import { useNavigate } from "react-router-dom";

const LANGUAGES = [
  { code: "es", label: "Español", flag: "🇪🇸" },
  { code: "en", label: "English", flag: "🇬🇧" },
];

export const SettingsScreen = () => {
  const { t, i18n } = useTranslation();
  const { data: user } = useUserQuery();
  const navigate = useNavigate();

  const handleLogout = () => {
    tokenProvider.removeToken();
    navigate("/login");
  };

  const userInitials = user?.name
    ? user.name.split(" ").map((n: string) => n[0]).join("").toUpperCase().substring(0, 2)
    : "?";

  return (
    <div className="max-w-2xl mx-auto space-y-8 animate-in fade-in duration-500 pb-20">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-black text-dark tracking-tight">{t("settings.title")}</h1>
        <p className="text-gray-500 font-medium mt-1">Gestiona tu perfil e idioma de la aplicacion.</p>
      </div>

      {/* Profile Card */}
      <section className="bg-white rounded-[2.5rem] border border-gray-100 shadow-sm overflow-hidden">
        <div className="px-8 py-6 border-b border-gray-50 flex items-center gap-3">
          <User className="w-5 h-5 text-gray-400" />
          <h2 className="font-bold text-dark">{t("settings.profile")}</h2>
        </div>
        <div className="p-8 flex items-center gap-6">
          <div className="w-16 h-16 bg-brand text-white rounded-2xl flex items-center justify-center font-black text-xl shadow-lg shadow-brand/20 shrink-0">
            {userInitials}
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-bold text-dark text-lg truncate">{user?.name || "—"}</p>
            <p className="text-sm text-gray-400 flex items-center gap-2 mt-1 truncate">
              <Mail className="w-3.5 h-3.5 shrink-0" />
              {user?.email || "—"}
            </p>
          </div>
        </div>
      </section>

      {/* Language Section */}
      <section className="bg-white rounded-[2.5rem] border border-gray-100 shadow-sm overflow-hidden">
        <div className="px-8 py-6 border-b border-gray-50 flex items-center gap-3">
          <Globe className="w-5 h-5 text-gray-400" />
          <div>
            <h2 className="font-bold text-dark">{t("settings.language")}</h2>
            <p className="text-xs text-gray-400 mt-0.5">Elige el idioma de visualizacion de la interfaz.</p>
          </div>
        </div>
        <div className="p-6 space-y-3">
          {LANGUAGES.map((lang) => {
            const isActive = i18n.language.startsWith(lang.code);
            return (
              <button
                key={lang.code}
                onClick={() => i18n.changeLanguage(lang.code)}
                className={`w-full flex items-center justify-between p-4 rounded-2xl border-2 transition-all duration-200 ${
                  isActive
                    ? "border-brand bg-brand/5 text-brand"
                    : "border-gray-100 hover:border-brand/30 hover:bg-gray-50 text-gray-600"
                }`}
              >
                <div className="flex items-center gap-4">
                  <span className="text-2xl">{lang.flag}</span>
                  <div className="text-left">
                    <p className={`font-bold text-sm ${isActive ? "text-brand" : "text-dark"}`}>{lang.label}</p>
                    <p className="text-[10px] font-medium text-gray-400 uppercase tracking-widest">{lang.code.toUpperCase()}</p>
                  </div>
                </div>
                {isActive && (
                  <div className="w-6 h-6 bg-brand text-white rounded-full flex items-center justify-center">
                    <Check className="w-3.5 h-3.5" />
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </section>

      {/* Logout */}
      <section className="bg-white rounded-[2.5rem] border border-red-100 shadow-sm overflow-hidden">
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-4 px-8 py-6 text-red-500 hover:bg-red-50 transition-colors group"
        >
          <div className="w-10 h-10 bg-red-50 rounded-xl flex items-center justify-center group-hover:bg-red-100 transition-colors">
            <LogOut className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
          </div>
          <div className="text-left">
            <p className="font-bold">{t("settings.logout")}</p>
            <p className="text-xs text-red-400">Cerrar la sesion actual</p>
          </div>
        </button>
      </section>
    </div>
  );
};
