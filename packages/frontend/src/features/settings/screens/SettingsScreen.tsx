import { useState } from "react";
import { LogOut, Check, Mail, Pencil, X, Shield, Key } from "lucide-react";
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
import { PageHeader } from "../../../components/ui/PageHeader";
import { SectionCard } from "../../../components/ui/SectionCard";
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
    <div className="max-w-2xl mx-auto flex flex-col gap-8">
      <PageHeader title={t("settings.title")} subtitle={t("settings.languageDesc")} />

      {/* Profile */}
      <SectionCard
        title={t("settings.profile")}
        action={
          !isEditing && (
            <button
              type="button"
              onClick={startEdit}
              className="flex items-center gap-1.5 text-[12px] font-sans-medium text-dark/50 hover:text-dark transition-colors"
            >
              <Pencil className="w-3.5 h-3.5" aria-hidden={true} />
              {t("settings.editProfile")}
            </button>
          )
        }
      >
        {isEditing ? (
          <form onSubmit={handleSave} className="flex flex-col gap-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-md bg-[var(--color-secondary)] border border-[var(--color-border-main)] flex items-center justify-center font-sans-bold text-[14px] text-dark/70 shrink-0">
                {userInitials}
              </div>
              <p className="text-[13px] font-sans-normal text-dark/55">
                {t("settings.profileInfo")}
              </p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Input
                label={t("settings.nameLabel")}
                value={form.name}
                onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
                placeholder="Carlos"
                required
              />
              <Input
                label={t("settings.surnameLabel")}
                value={form.surname}
                onChange={(e) => setForm((p) => ({ ...p, surname: e.target.value }))}
                placeholder="García"
              />
            </div>
            <Input
              label={t("settings.email")}
              type="email"
              value={form.email}
              onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))}
              placeholder="carlos@empresa.com"
            />
            <div className="flex gap-3 pt-2">
              <Button
                type="button"
                variant="secondary"
                onClick={cancelEdit}
                leftIcon={<X className="w-3.5 h-3.5" />}
                className="flex-1"
              >
                {t("settings.cancelEdit")}
              </Button>
              <Button
                type="submit"
                isLoading={updateMutation.isPending}
                disabled={!form.name.trim()}
                leftIcon={<Check className="w-3.5 h-3.5" />}
                className="flex-1"
              >
                {t("settings.saveChanges")}
              </Button>
            </div>
          </form>
        ) : (
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-md bg-[var(--color-secondary)] border border-[var(--color-border-main)] flex items-center justify-center font-sans-bold text-[14px] text-dark/70 shrink-0">
                {userInitials}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-sans-semibold text-dark text-[14px] truncate">
                  {user?.name ?? "—"} {user?.surname ?? ""}
                </p>
                <p className="text-[12px] font-sans-medium text-dark/55 flex items-center gap-1.5 mt-0.5 truncate">
                  <Mail className="w-3 h-3 shrink-0 text-dark/40" aria-hidden={true} />
                  {user?.email ?? "—"}
                </p>
              </div>
              {saveOk && (
                <span
                  role="status"
                  className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-[var(--success-bg)] text-[var(--success-text)] text-[11px] font-sans-semibold"
                >
                  <Check className="w-3 h-3" aria-hidden={true} />
                  {t("settings.updateSuccess")}
                </span>
              )}
            </div>

            {(user?.roleName || permissionsCount > 0) && (
              <div className="flex flex-col gap-3 pt-3 border-t border-[var(--color-border-main)]">
                {user?.roleName && (
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-2 text-[12px] font-sans-medium text-dark/55">
                      <Shield className="w-3.5 h-3.5 text-dark/40" aria-hidden={true} />
                      {t("settings.myRole")}
                    </span>
                    <span className="flex items-center gap-2">
                      <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-[var(--color-secondary)] text-dark/70 text-[11px] font-sans-semibold">
                        {user.roleName}
                      </span>
                      {user?.hierarchy !== undefined && (
                        <span className="text-[10px] font-sans-medium text-dark/40">
                          {t("settings.hierarchyLevel", { level: user.hierarchy })}
                        </span>
                      )}
                    </span>
                  </div>
                )}
                {permissionsCount > 0 && (
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-2 text-[12px] font-sans-medium text-dark/55">
                      <Key className="w-3.5 h-3.5 text-dark/40" aria-hidden={true} />
                      {t("settings.myPermissions")}
                    </span>
                    <span className="text-[12px] font-sans-semibold text-dark/70">
                      {t("settings.permissionsCount", { count: permissionsCount })}
                    </span>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </SectionCard>

      {/* Language */}
      <SectionCard title={t("settings.language")}>
        <p className="text-[12px] font-sans-normal text-dark/50 -mt-2">
          {t("settings.languageDesc")}
        </p>
        <div className="flex flex-col gap-2">
          {LANGUAGES.map((lang) => {
            const isActive = i18n.language.startsWith(lang.code);
            return (
              <button
                key={lang.code}
                type="button"
                aria-pressed={isActive}
                onClick={() => i18n.changeLanguage(lang.code)}
                className={`w-full flex items-center justify-between p-3 rounded-md border transition-colors duration-100 ${
                  isActive
                    ? "border-dark/30 bg-[var(--color-secondary)]"
                    : "border-[var(--color-border-main)] bg-[var(--color-surface-card)] hover:bg-[var(--color-secondary)]"
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className="text-xl" aria-hidden={true}>{lang.flag}</span>
                  <div className="text-left">
                    <p className="font-sans-semibold text-[13px] text-dark">{lang.label}</p>
                    <p className="text-[10px] font-sans-medium text-dark/40 uppercase tracking-wide">
                      {lang.code.toUpperCase()}
                    </p>
                  </div>
                </div>
                {isActive && (
                  <Check className="w-4 h-4 text-dark/70" aria-hidden={true} />
                )}
              </button>
            );
          })}
        </div>
      </SectionCard>

      {/* Logout */}
      <button
        type="button"
        onClick={handleLogout}
        className="w-full flex items-center gap-3 px-5 py-4 rounded-lg border border-[var(--danger-border)] bg-[var(--danger-bg)] text-[var(--danger-text)] hover:brightness-95 transition-[filter] cursor-pointer"
      >
        <div className="w-9 h-9 rounded-md bg-white/60 flex items-center justify-center shrink-0">
          <LogOut className="w-4 h-4" aria-hidden={true} />
        </div>
        <div className="text-left">
          <p className="font-sans-semibold text-[13px]">{t("settings.logout")}</p>
          <p className="text-[12px] font-sans-normal opacity-70">
            {t("settings.closeSessionDesc")}
          </p>
        </div>
      </button>
    </div>
  );
};
