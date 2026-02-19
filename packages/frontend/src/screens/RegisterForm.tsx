import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Link, useNavigate } from "react-router-dom";
import { registerSchema, type RegisterSchema, useRegisterMutation } from "@ticket-registrator/shared";
import { Input } from "../components/Input";
import { Button } from "../components/Button";
import { Sparkles, PieChart, TrendingUp, CheckCircle2 } from "lucide-react";
import { useTranslation } from "react-i18next";
import { AxiosError } from "axios";

export const RegisterForm = () => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const { mutate, isPending, isError, error } = useRegisterMutation({
        onSuccess: () => {
            navigate('/login');
        }
    });

    const { register, handleSubmit, formState: { errors } } = useForm<RegisterSchema>({
        resolver: zodResolver(registerSchema),
        defaultValues: {
            name: "",
            surname: "",
            email: "",
            username: "",
            password: "",
            confirmPassword: ""
        }
    });

    const onSubmit = (data: RegisterSchema) => {
        mutate(data as any);
    };

    const serverErrorMessage = isError ? (error as AxiosError<{ message: string }>)?.response?.data?.message || t('common.error') : null;

    return (
        <div className="min-h-screen w-full grid lg:grid-cols-2 bg-surface">

            {/* PANEL IZQUIERDO: Visual / Branding */}
            <div className="hidden lg:flex relative flex-col justify-between bg-dark p-16 overflow-hidden">
                <div className="absolute inset-0 bg-grid-pattern opacity-20" />
                <div className="absolute -top-24 -left-24 w-[600px] h-[600px] bg-brand/30 rounded-full blur-[120px]" />
                <div className="absolute bottom-0 right-0 w-[400px] h-[400px] bg-secondary/20 rounded-full blur-[100px]" />

                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md">
                    <div className="relative z-10 bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-6 shadow-2xl animate-float">
                        <div className="flex justify-between items-center mb-6">
                            <div className="flex items-center gap-2">
                                <div className="p-2 bg-brand/20 rounded-lg text-brand-light">
                                    <PieChart className="w-5 h-5 text-white" />
                                </div>
                                <span className="text-white font-medium text-sm">{t('register.monthlyExpenses')}</span>
                            </div>
                            <span className="text-green-400 text-xs font-mono">+12.5%</span>
                        </div>
                        <div className="flex items-end justify-between h-32 gap-2">
                            {[40, 70, 45, 90, 60, 80].map((h, i) => (
                                <div key={i} className="w-full bg-white/10 rounded-t-sm hover:bg-brand/50 transition-colors duration-500" style={{ height: `${h}%` }}></div>
                            ))}
                        </div>
                    </div>

                    <div className="absolute -bottom-6 -right-6 bg-surface text-dark px-4 py-3 rounded-xl shadow-xl flex items-center gap-3 animate-pulse-slow">
                        <div className="bg-green-100 p-1.5 rounded-full text-green-600">
                            <TrendingUp className="w-4 h-4" />
                        </div>
                        <div>
                            <p className="text-[10px] text-gray-500 font-bold uppercase">{t('register.estimatedSavings')}</p>
                            <p className="font-bold text-sm">24% {t('register.yearly')}</p>
                        </div>
                    </div>
                </div>

                <div className="relative z-10 flex items-center gap-3">
                    <div className="w-10 h-10 bg-brand rounded-xl flex items-center justify-center shadow-lg shadow-brand/30 border border-white/10">
                        <Sparkles className="text-white w-5 h-5" />
                    </div>
                    <span className="text-white font-bold text-xl tracking-wide">TicketReg AI</span>
                </div>

                <div className="relative z-10 space-y-4">
                    <h3 className="text-white font-semibold text-lg mb-2">{t('register.benefitsTitle')}</h3>
                    {[
                        t('register.benefit1'),
                        t('register.benefit2'),
                        t('register.benefit3')
                    ].map((item, idx) => (
                        <div key={idx} className="flex items-center gap-3 text-gray-300">
                            <CheckCircle2 className="w-5 h-5 text-brand" />
                            <span>{item}</span>
                        </div>
                    ))}
                </div>
            </div>

            {/* PANEL DERECHO: Formulario */}
            <div className="flex flex-col justify-center items-center p-6 sm:p-12 lg:p-24 bg-surface">
                <div className="w-full max-w-md animate-in slide-in-from-bottom-4 duration-500">
                    <div className="text-center lg:text-left mb-8">
                        <h1 className="text-3xl lg:text-4xl font-bold text-dark tracking-tight mb-3">
                            {t('register.title')}
                        </h1>
                        <p className="text-gray-500">
                            {t('register.subtitle')}
                        </p>
                    </div>

                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                            <Input
                                label={t('register.nameLabel')}
                                placeholder="Ej: Ana"
                                {...register("name")}
                                error={errors.name?.message}
                            />
                            <Input
                                label={t('register.surnameLabel') || "Apellidos"}
                                placeholder="Ej: García"
                                {...register("surname")}
                                error={errors.surname?.message}
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                            <Input
                                label={t('register.emailLabel')}
                                type="email"
                                placeholder="ana@empresa.com"
                                {...register("email")}
                                error={errors.email?.message}
                            />
                            <Input
                                label={t('register.usernameLabel') || "Usuario"}
                                placeholder="ana.garcia"
                                {...register("username")}
                                error={errors.username?.message}
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                            <Input
                                label={t('auth.passwordLabel')}
                                type="password"
                                placeholder="••••••••••"
                                {...register("password")}
                                error={errors.password?.message}
                            />

                            <Input
                                label={t('register.confirmPasswordLabel')}
                                type="password"
                                placeholder="••••••••••"
                                {...register("confirmPassword")}
                                error={errors.confirmPassword?.message}
                            />
                        </div>

                        {serverErrorMessage && (
                            <div className="p-4 rounded-xl bg-red-50 border border-red-100 flex items-start gap-3 animate-in fade-in slide-in-from-top-2">
                                <span className="text-red-500 mt-0.5">⚠️</span>
                                <p className="text-sm font-medium text-red-700">
                                    {serverErrorMessage}
                                </p>
                            </div>
                        )}

                        <Button type="submit" isLoading={isPending} className="mt-4 text-lg">
                            {t('register.submitButton')}
                        </Button>
                    </form>

                    <div className="mt-8 pt-6 border-t border-gray-100 text-center">
                        <p className="text-sm text-gray-500">
                            {t('register.hasAccount')}{' '}
                            <Link to="/login" className="font-bold text-brand hover:text-brand-hover transition-colors">
                                {t('register.loginLink')}
                            </Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};