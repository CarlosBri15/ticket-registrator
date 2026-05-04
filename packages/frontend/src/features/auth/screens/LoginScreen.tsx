import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Link, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useQueryClient } from "@tanstack/react-query";
import { ShieldCheck, Sparkles } from "lucide-react";
import {
  loginSchema,
  type LoginSchema,
  useLoginMutation,
  type ILoginResponse,
  getApiErrorMessage,
} from "@ticket-registrator/shared";
import { Button } from "../../../components/ui/Button";
import { AlertError } from "../../../components/ui/Alert";
import { tokenProvider } from "../../../api/client";

/**
 * Login screen — implements the kit's `.login-shell + .login-aside +
 * .login-form-side` split layout (see preview & ui_kits/web/Screens.jsx).
 * Brand block on the left (Grafito background with Sol gradient overlays
 * defined in `.login-aside::before/::after`), form on the right.
 */
export const LoginForm = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { mutate, isPending, isError, error } = useLoginMutation({
    onSuccess: (data: ILoginResponse) => {
      queryClient.clear();
      tokenProvider.setToken(data.access_token);
      navigate("/home");
    },
  });

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginSchema>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  const onSubmit = (data: LoginSchema) => mutate(data);

  const serverErrorMessage = isError ? getApiErrorMessage(error, t("common.error")) : undefined;

  return (
    <div className="login-shell">
      {/* ── Aside (brand + slogan + security badge) ───────────────────── */}
      <aside className="login-aside hidden lg:flex">
        <div className="flex items-center gap-3">
          <div
            className="sb-mark"
            style={{ background: "var(--accent)", color: "var(--fg-on-accent)" }}
          >
            <Sparkles className="w-4 h-4" aria-hidden={true} />
          </div>
          <div>
            <div className="sb-name text-white">{t("layout.appName")}</div>
            <div className="sb-tagline text-white/50">{t("layout.appTagline")}</div>
          </div>
        </div>

        <div>
          <p className="login-slogan">{t("auth.slogan")}</p>
        </div>

        <div className="login-secbadge">
          <ShieldCheck className="w-3 h-3" aria-hidden={true} />
          {t("auth.securityBadge")}
        </div>
      </aside>

      {/* ── Form side ───────────────────────────────────────────────── */}
      <main className="login-form-side">
        <div className="login-form">
          {/* Mobile-only brand mark (aside is hidden < lg) */}
          <div className="lg:hidden flex justify-center mb-8">
            <div
              className="sb-mark"
              style={{ background: "var(--accent)", color: "var(--fg-on-accent)" }}
            >
              <Sparkles className="w-4 h-4" aria-hidden={true} />
            </div>
          </div>

          <h1 className="text-[32px] font-sans-bold text-dark tracking-tight leading-tight m-0">
            {t("auth.loginTitle")}
          </h1>
          <p className="text-sm font-sans-medium text-dark/55 mt-1 mb-7">
            {t("auth.loginSubtitle")}
          </p>

          <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-3.5">
            <div className="field">
              <label htmlFor="login-email" className="field-label">
                {t("auth.emailLabel")}
              </label>
              <input
                id="login-email"
                type="email"
                autoComplete="email"
                placeholder={t("auth.emailPlaceholder")}
                className="input"
                aria-invalid={!!errors.email}
                aria-describedby={errors.email ? "login-email-error" : undefined}
                {...register("email")}
              />
              {errors.email?.message && (
                <p
                  id="login-email-error"
                  className="text-[11px] font-sans-medium text-danger"
                >
                  {errors.email.message}
                </p>
              )}
            </div>

            <div className="field">
              <div className="flex items-center justify-between">
                <label htmlFor="login-password" className="field-label">
                  {t("auth.passwordLabel")}
                </label>
                <button
                  type="button"
                  onClick={() => {}}
                  className="text-[11px] font-sans-medium text-dark/55 hover:text-dark transition-colors"
                >
                  {t("auth.forgotPassword")}
                </button>
              </div>
              <input
                id="login-password"
                type="password"
                autoComplete="current-password"
                placeholder="••••••••••"
                className="input"
                aria-invalid={!!errors.password}
                aria-describedby={errors.password ? "login-password-error" : undefined}
                {...register("password")}
              />
              {errors.password?.message && (
                <p
                  id="login-password-error"
                  className="text-[11px] font-sans-medium text-danger"
                >
                  {errors.password.message}
                </p>
              )}
            </div>

            {serverErrorMessage && <AlertError message={serverErrorMessage} />}

            <Button type="submit" size="lg" isLoading={isPending} className="w-full mt-2">
              {t("auth.loginButton")}
            </Button>
          </form>

          <p className="text-center text-[13px] font-sans-medium text-dark/55 mt-6">
            {t("auth.noAccount")}{" "}
            <Link
              to="/register"
              className="font-sans-bold text-dark hover:text-dark/70 transition-colors"
            >
              {t("auth.requestAccess")}
            </Link>
          </p>
        </div>
      </main>
    </div>
  );
};
