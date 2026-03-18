import { useState } from "react";
import { Globe, User, LogOut, Check, Mail, Pencil, X, Shield, Key } from "lucide-react";
import {
  useUserQuery,
  useUpdateUserMutation,
} from "@ticket-registrator/shared";
import { tokenProvider } from "../../api/client";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Button } from "../../components/ui/Button";
import { Input } from "../../components/ui/Input";

const LANGUAGES = [
  { code: "es", label: "Español", flag: "🇪🇸" },
  { code: "en", label: "English", flag: "🇬🇧" },
];

export const SettingsScreen = () => {
  const { t, i18n } = useTranslation();
  const { data: user } = useUserQuery();
  const navigate = useNavigate();

  const [isEditing, setIsEditing] = useState(false);
  const [form, setForm] = useState({ name: "", surname: "", email: "" });
  const [saveOk, setSaveOk] = useState(false);

  const updateMutation = useUpdateUserMutation({
    onSuccess: () => {
      setIsEditing(false);
      setSaveOk(true);
      setTimeout(() => setSaveOk(false), 3000);
    },
  });

  const startEdit = () => {
    setForm({
      name: user?.name ?? "",
      surname: (user as any)?.surname ?? "",
      email: user?.email ?? "",
    });
    setIsEditing(true);
    setSaveOk(false);
  };

  const cancelEdit = () => setIsEditing(false);

  const handleSave = (e: { preventDefault(): void }) => {
    e.preventDefault();
    if (!user?.id) return;
    const payload: Record<string, string> = {};
    if (form.name.trim()) payload.name = form.name.trim();
    if (form.surname.trim()) payload.surname = form.surname.trim();
    if (form.email.trim()) payload.email = form.email.trim();
    updateMutation.mutate({ id: user.id, data: payload });
  };

  const handleLogout = () => {
    tokenProvider.removeToken();
    navigate("/login");
  };

  const userInitials = user?.name
    ? user.name.split(" ").map((n: string) => n[0]).join("").toUpperCase().substring(0, 2)
    : "?";

  const permissionsCount = (user as any)?.permissions?.length ?? 0;

  return (
    <div className="max-w-2xl mx-auto space-y-8 animate-in fade-in duration-500 pb-20">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-black text-dark tracking-tight">{t("settings.title")}</h1>
        <p className="text-gray-500 font-medium mt-1">{t("settings.languageDesc")}</p>
      </div>

      {/* Profile Card */}
      <section className="bg-white rounded-[2.5rem] border border-gray-100 shadow-sm overflow-hidden">
        <div className="px-8 py-5 border-b border-gray-50 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <User className="w-5 h-5 text-gray-400" />
            <h2 className="font-bold text-dark">{t("settings.profile")}</h2>
          </div>
          {!isEditing && (
            <button
              onClick={startEdit}
              className="flex items-center gap-1.5 text-xs font-black text-brand hover:text-brand/70 transition-colors"
            >
              <Pencil className="w-3.5 h-3.5" />
              {t("settings.editProfile")}
            </button>
          )}
        </div>

        {isEditing ? (
          <form onSubmit={handleSave} className="p-8 space-y-5">
            <div className="flex items-center gap-5 mb-2">
              <div className="w-14 h-14 bg-brand text-white rounded-2xl flex items-center justify-center font-black text-xl shadow-lg shadow-brand/20 shrink-0">
                {userInitials}
              </div>
              <p className="text-sm text-gray-400 font-medium">{t("settings.profileInfo")}</p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Input
                label={t("settings.nameLabel")}
                value={form.name}
                onChange={(e) => setForm(p => ({ ...p, name: e.target.value }))}
                placeholder="Carlos"
                required
              />
              <Input
                label={t("settings.surnameLabel")}
                value={form.surname}
                onChange={(e) => setForm(p => ({ ...p, surname: e.target.value }))}
                placeholder="García"
              />
            </div>
            <Input
              label={t("settings.email")}
              type="email"
              value={form.email}
              onChange={(e) => setForm(p => ({ ...p, email: e.target.value }))}
              placeholder="carlos@empresa.com"
            />
            <div className="flex gap-3 pt-2">
              <Button
                type="button"
                variant="ghost"
                onClick={cancelEdit}
                className="flex-1"
              >
                <X className="w-4 h-4 mr-1.5" />
                {t("settings.cancelEdit")}
              </Button>
              <Button
                type="submit"
                isLoading={updateMutation.isPending}
                disabled={!form.name.trim()}
                className="flex-1"
              >
                <Check className="w-4 h-4 mr-1.5" />
                {t("settings.saveChanges")}
              </Button>
            </div>
          </form>
        ) : (
          <div className="p-8">
            <div className="flex items-center gap-6 mb-6">
              <div className="w-16 h-16 bg-brand text-white rounded-2xl flex items-center justify-center font-black text-xl shadow-lg shadow-brand/20 shrink-0">
                {userInitials}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-bold text-dark text-lg truncate">
                  {user?.name ?? "—"} {(user as any)?.surname ?? ""}
                </p>
                <p className="text-sm text-gray-400 flex items-center gap-2 mt-1 truncate">
                  <Mail className="w-3.5 h-3.5 shrink-0" />
                  {user?.email ?? "—"}
                </p>
              </div>
              {saveOk && (
                <div className="flex items-center gap-1.5 text-xs font-black text-green-600 bg-green-50 px-3 py-1.5 rounded-xl border border-green-100 shrink-0">
                  <Check className="w-3.5 h-3.5" />
                  {t("settings.updateSuccess")}
                </div>
              )}
            </div>

            {/* Role + Permissions info */}
            {((user as any)?.roleName || permissionsCount > 0) && (
              <div className="space-y-3 pt-5 border-t border-gray-50">
                {(user as any)?.roleName && (
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-xs font-black text-gray-400 uppercase tracking-widest">
                      <Shield className="w-3.5 h-3.5" />
                      {t("settings.myRole")}
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-black text-brand bg-brand/10 px-2.5 py-1 rounded-full">
                        {(user as any).roleName}
                      </span>
                      {(user as any)?.hierarchy !== undefined && (
                        <span className="text-[10px] font-bold text-gray-400">
                          {t("settings.hierarchyLevel", { level: (user as any).hierarchy })}
                        </span>
                      )}
                    </div>
                  </div>
                )}
                {permissionsCount > 0 && (
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-xs font-black text-gray-400 uppercase tracking-widest">
                      <Key className="w-3.5 h-3.5" />
                      {t("settings.myPermissions")}
                    </div>
                    <span className="text-xs font-bold text-gray-500">
                      {t("settings.permissionsCount", { count: permissionsCount })}
                    </span>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </section>

      {/* Language Section */}
      <section className="bg-white rounded-[2.5rem] border border-gray-100 shadow-sm overflow-hidden">
        <div className="px-8 py-5 border-b border-gray-50 flex items-center gap-3">
          <Globe className="w-5 h-5 text-gray-400" />
          <div>
            <h2 className="font-bold text-dark">{t("settings.language")}</h2>
            <p className="text-xs text-gray-400 mt-0.5">{t("settings.languageDesc")}</p>
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
            <p className="text-xs text-red-400">{t("settings.closeSessionDesc")}</p>
          </div>
        </button>
      </section>
    </div>
  );
};
