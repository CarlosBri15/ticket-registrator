import { useState } from "react";
import { Globe, User, LogOut, Check, Mail, Pencil, X, Shield, Key } from "lucide-react";
import {
  useUserQuery,
  useUpdateUserMutation,
  type ICurrentUser,
} from "@ticket-registrator/shared";
import { tokenProvider } from "../../../api/client";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Button } from "../../../components/ui/Button";
import { Input } from "../../../components/ui/Input";
import { tokens, radius } from "../../../styles/theme";
import { LANGUAGES } from "../../../constants/config";

import { useQueryClient } from "@tanstack/react-query";

export const SettingsScreen = () => {
  const { t, i18n } = useTranslation();
  const queryClient = useQueryClient();
  const { data: user } = useUserQuery() as { data: ICurrentUser | undefined };
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
      surname: user?.surname ?? "",
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
    queryClient.clear();
    navigate("/login");
  };

  const userInitials = user?.name
    ? user.name.split(" ").map((n: string) => n[0]).join("").toUpperCase().substring(0, 2)
    : "?";

  const permissionsCount = user?.permissions?.length ?? 0;

  return (
    <div className="max-w-2xl mx-auto space-y-8 animate-in fade-in duration-500 pb-20">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-dark tracking-tight">{t("settings.title")}</h1>
        <p className="text-slate-500 text-sm mt-1">{t("settings.languageDesc")}</p>
      </div>

      {/* Profile Card */}
      <section className={`${tokens.listSection}`}>
        <div className={`${tokens.listSectionHeader} px-6 py-4`}>
          <div className="flex items-center gap-3 flex-1">
            <User className="w-4 h-4 text-slate-400" />
            <h2 className="font-semibold text-dark">{t("settings.profile")}</h2>
          </div>
          {!isEditing && (
            <button
              onClick={startEdit}
              className="flex items-center gap-1.5 text-xs font-semibold text-brand hover:text-brand/70 transition-colors"
            >
              <Pencil className="w-3.5 h-3.5" />
              {t("settings.editProfile")}
            </button>
          )}
        </div>

        {isEditing ? (
          <form onSubmit={handleSave} className="p-6 space-y-4">
            <div className="flex items-center gap-5 mb-2">
              <div className={`w-12 h-12 bg-brand text-white ${radius.sm} flex items-center justify-center font-bold text-lg shadow-sm shrink-0`}>
                {userInitials}
              </div>
              <p className="text-sm text-slate-400 font-medium">{t("settings.profileInfo")}</p>
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
          <div className="p-6">
            <div className="flex items-center gap-5 mb-5">
              <div className={`w-12 h-12 bg-brand text-white ${radius.sm} flex items-center justify-center font-bold text-lg shadow-sm shrink-0`}>
                {userInitials}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-dark truncate">
                  {user?.name ?? "—"} {user?.surname ?? ""}
                </p>
                <p className="text-sm text-slate-400 flex items-center gap-2 mt-1 truncate">
                  <Mail className="w-3.5 h-3.5 shrink-0" />
                  {user?.email ?? "—"}
                </p>
              </div>
              {saveOk && (
                <div className={`${tokens.badgeSm} ${tokens.badgeSuccess} shrink-0`}>
                  <Check className="w-3 h-3" />
                  {t("settings.updateSuccess")}
                </div>
              )}
            </div>

            {/* Role + Permissions info */}
            {(user?.roleName || permissionsCount > 0) && (
              <div className="space-y-3 pt-4 border-t border-slate-100">
                {user?.roleName && (
                  <div className="flex items-center justify-between">
                    <div className={`flex items-center gap-2 ${tokens.listSectionTitle}`}>
                      <Shield className="w-3.5 h-3.5" />
                      {t("settings.myRole")}
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`${tokens.badgeSm} ${tokens.badgeBrand}`}>
                        {user.roleName}
                      </span>
                      {user?.hierarchy !== undefined && (
                        <span className="text-[10px] font-semibold text-slate-400">
                          {t("settings.hierarchyLevel", { level: user.hierarchy })}
                        </span>
                      )}
                    </div>
                  </div>
                )}
                {permissionsCount > 0 && (
                  <div className="flex items-center justify-between">
                    <div className={`flex items-center gap-2 ${tokens.listSectionTitle}`}>
                      <Key className="w-3.5 h-3.5" />
                      {t("settings.myPermissions")}
                    </div>
                    <span className="text-xs font-semibold text-slate-500">
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
      <section className={tokens.listSection}>
        <div className={`${tokens.listSectionHeader} px-6 py-4`}>
          <Globe className="w-4 h-4 text-slate-400" />
          <div>
            <h2 className="font-semibold text-dark">{t("settings.language")}</h2>
            <p className="text-xs text-slate-400 mt-0.5">{t("settings.languageDesc")}</p>
          </div>
        </div>
        <div className="p-5 space-y-2">
          {LANGUAGES.map((lang) => {
            const isActive = i18n.language.startsWith(lang.code);
            return (
              <button
                key={lang.code}
                onClick={() => i18n.changeLanguage(lang.code)}
                className={`w-full flex items-center justify-between p-4 ${radius.sm} border-2 transition-all duration-200 ${
                  isActive
                    ? "border-brand bg-brand/5 text-brand"
                    : "border-slate-100 hover:border-brand/30 hover:bg-slate-50 text-slate-600"
                }`}
              >
                <div className="flex items-center gap-4">
                  <span className="text-2xl">{lang.flag}</span>
                  <div className="text-left">
                    <p className={`font-semibold text-sm ${isActive ? "text-brand" : "text-dark"}`}>{lang.label}</p>
                    <p className="text-[10px] font-medium text-slate-400 uppercase tracking-widest">{lang.code.toUpperCase()}</p>
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
      <section className={`bg-white ${radius.card} border border-danger/15 shadow-sm overflow-hidden`}>
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-4 px-6 py-5 text-danger hover:bg-danger/5 transition-colors group"
        >
          <div className={`w-9 h-9 bg-danger/10 ${radius.sm} flex items-center justify-center group-hover:bg-danger/15 transition-colors`}>
            <LogOut className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
          </div>
          <div className="text-left">
            <p className="font-semibold text-sm">{t("settings.logout")}</p>
            <p className="text-xs text-danger/60">{t("settings.closeSessionDesc")}</p>
          </div>
        </button>
      </section>
    </div>
  );
};
