import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Button } from "../../components/ui/Button";
import { Input } from "../../components/ui/Input";
import { loginSchema, type LoginSchema, useLoginMutation, type ILoginResponse } from "@ticket-registrator/shared";
import { Link, useNavigate } from "react-router-dom";
import { Scan, ShieldCheck, Sparkles } from "lucide-react";
import { tokenProvider } from "../../api/client";
import { useTranslation } from "react-i18next";
import { AxiosError } from "axios";

export const LoginForm = () => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const { mutate, isPending, isError, error } = useLoginMutation({
        onSuccess: (data: ILoginResponse) => {
            tokenProvider.setToken(data.access_token);
            navigate('/home');
        }
    });

    const { register, handleSubmit, formState: { errors } } = useForm<LoginSchema>({
        resolver: zodResolver(loginSchema),
        defaultValues: {
            email: '',
            password: ''
        }
    });

    const onSubmit = (data: LoginSchema) => {
        mutate(data);
    };

    const serverErrorMessage = isError ? (error as AxiosError<{ message: string }>)?.response?.data?.message || t('common.error') : undefined;

    return (
        <div className="min-h-screen w-full grid lg:grid-cols-2 bg-surface">

            {/* PANEL IZQUIERDO: Visual / Branding */}
            <div className="hidden lg:flex relative flex-col justify-between bg-dark p-16 overflow-hidden">
                <div className="absolute inset-0 bg-grid-pattern opacity-20" />
                <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-brand/20 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2" />
                <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-secondary/10 rounded-full blur-[100px] translate-y-1/3 -translate-x-1/3" />

                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md">
                    <div className="absolute top-0 right-10 w-48 h-64 bg-white/5 backdrop-blur-md rounded-2xl border border-white/10 p-6 transform rotate-6 animate-float shadow-2xl">
                         <div className="w-12 h-12 bg-white/10 rounded-full mb-4" />
                         <div className="w-full h-2 bg-white/10 rounded mb-2" />
                         <div className="w-2/3 h-2 bg-white/10 rounded mb-6" />
                         <div className="w-full h-20 bg-white/5 rounded border border-dashed border-white/20 flex items-center justify-center">
                            <Scan className="text-brand/50 w-8 h-8" />
                         </div>
                    </div>

                    <div className="absolute top-20 left-10 w-56 h-40 bg-brand/20 backdrop-blur-xl rounded-2xl border border-white/10 p-6 transform -rotate-3 animate-pulse-slow shadow-2xl z-10">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse" />
                            <span className="text-xs font-mono text-green-200">AI PROCESSING...</span>
                        </div>
                        <div className="space-y-2">
                             <div className="flex justify-between text-xs text-white/50 font-mono">
                                 <span>DATE</span>
                                 <span>DETECTED</span>
                             </div>
                             <div className="flex justify-between text-xs text-white/50 font-mono">
                                 <span>AMOUNT</span>
                                 <span>VERIFIED</span>
                             </div>
                        </div>
                    </div>
                </div>

                <div className="relative z-10 flex items-center gap-3">
                    <div className="w-10 h-10 bg-brand rounded-xl flex items-center justify-center shadow-lg shadow-brand/20 border border-white/10">
                        <Sparkles className="text-white w-5 h-5" />
                    </div>
                    <span className="text-white font-bold text-xl tracking-wide">TicketReg AI</span>
                </div>

                <div className="relative z-10">
                    <blockquote className="text-2xl font-medium text-white leading-relaxed mb-6">
                        "{t('auth.slogan')}"
                    </blockquote>
                    <div className="flex items-center gap-4 text-sm text-gray-400 font-medium">
                        <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10">
                            <ShieldCheck className="w-4 h-4" />
                            {t('auth.securityBadge')}
                        </div>
                        <span>v2.0.1 Stable</span>
                    </div>
                </div>
            </div>

            {/* PANEL DERECHO: Formulario */}
            <div className="flex flex-col justify-center items-center p-6 sm:p-12 lg:p-24 bg-surface">
                <div className="w-full max-w-md animate-in slide-in-from-bottom-4 duration-500">
                    <div className="lg:hidden flex justify-center mb-8">
                        <div className="w-12 h-12 bg-brand rounded-xl flex items-center justify-center shadow-lg shadow-brand/30">
                            <Sparkles className="text-white w-6 h-6" />
                        </div>
                    </div>

                    <div className="text-center lg:text-left mb-10">
                        <h1 className="text-3xl lg:text-4xl font-bold text-dark tracking-tight mb-3">
                            {t('auth.loginTitle')}
                        </h1>
                        <p className="text-gray-500">
                            {t('auth.loginSubtitle')}
                        </p>
                    </div>

                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                        <Input
                            label={t('auth.emailLabel')}
                            type="email"
                            placeholder={t('auth.emailPlaceholder')}
                            {...register("email")}
                            error={errors.email?.message}
                            autoComplete="email"
                        />

                        <div className="space-y-1">
                            <Input
                                label={t('auth.passwordLabel')}
                                type="password"
                                placeholder="••••••••••"
                                {...register("password")}
                                error={errors.password?.message}
                                autoComplete="current-password"
                            />
                            <div className="flex justify-end">
                                <a href="#" className="text-xs font-semibold text-brand hover:text-brand-hover transition-colors">
                                    {t('auth.forgotPassword')}
                                </a>
                            </div>
                        </div>

                        {serverErrorMessage && (
                            <div className="p-4 rounded-xl bg-red-50 border border-red-100 flex items-start gap-3 animate-in fade-in slide-in-from-top-2">
                                <span className="text-red-500 mt-0.5">⚠️</span>
                                <p className="text-sm font-medium text-red-700">
                                   {serverErrorMessage}
                                </p>
                            </div>
                        )}

                        <Button type="submit" isLoading={isPending} className="w-full mt-2 text-lg">
                            {t('auth.loginButton')}
                        </Button>
                    </form>

                    <p className="mt-8 text-center text-sm text-gray-500">
                        {t('auth.noAccount')}{' '}
                        <Link to="/register" className="font-bold text-brand hover:text-brand-hover transition-colors">
                            {t('auth.requestAccess')}
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
}
