import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useLogin } from "../hooks/mutations/useLogin"
import { Button } from "../components/Button";
import { Input } from "../components/Input";
import { loginSchema, type LoginSchema } from "@ticket-registrator/shared";

export const LoginForm = () => {
    const { mutate, isPending, isError, error } = useLogin();

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

    const serverErrorMessage = isError ? (error as any)?.response?.data?.message || 'Invalid credentials' : undefined;

    return (
        <div className="min-h-screen w-full grid lg:grid-cols-2">
            <div className="hidden lg:flex flex-col justify-between bg-brand p-12 relative overflow-hidden">
                
                <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
                     <div className="absolute -top-24 -left-24 w-96 h-96 rounded-full bg-white blur-3xl"></div>
                     <div className="absolute bottom-0 right-0 w-80 h-80 rounded-full bg-secondary blur-3xl"></div>
                </div>

                <div className="relative z-10 flex items-center gap-3">
                    <div className="w-10 h-10 bg-white/10 backdrop-blur-sm rounded-lg flex items-center justify-center border border-white/20">
                        <span className="text-white font-bold text-lg">TR</span>
                    </div>
                    <span className="text-white font-bold text-xl tracking-wide">Ticket Registrator</span>
                </div>

                <div className="relative z-10 max-w-lg">
                    <h1 className="text-4xl font-bold text-white mb-4 leading-tight">
                        Control financiero <br/>
                        <span className="text-secondary-light">sólido y transparente.</span>
                    </h1>
                    <p className="text-secondary-light text-lg opacity-90">
                        Gestiona tus tickets, reportes y métricas empresariales en una plataforma unificada y segura.
                    </p>
                </div>

                <div className="relative z-10 text-secondary-light text-sm font-medium opacity-70">
                    System v1.0.0
                </div>
            </div>

            <div className="bg-surface flex flex-col justify-center items-center p-6 sm:p-12 lg:p-24">
                
                <div className="w-full max-w-md space-y-8">
                    
                    <div className="text-center lg:text-left">
                        <h2 className="text-3xl font-bold text-dark tracking-tight">
                            Bienvenido
                        </h2>
                        <p className="mt-2 text-gray-500">
                            Ingresa tus credenciales para acceder al dashboard.
                        </p>
                    </div>

                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                        
                        <Input 
                            label="Correo Electrónico"
                            type="email" 
                            placeholder="usuario@empresa.com"
                            {...register("email")}
                            error={errors.email?.message} 
                        />

                        <Input 
                            label="Contraseña"
                            type="password" 
                            placeholder="••••••••••"
                            {...register("password")}
                            error={errors.password?.message} 
                        />

                        <div className="flex items-center justify-between pt-1">
                            <div className="flex items-center">
                                <input
                                    id="remember-me"
                                    name="remember-me"
                                    type="checkbox"
                                    className="h-4 w-4 rounded border-gray-300 text-brand focus:ring-brand cursor-pointer"
                                />
                                <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-600 cursor-pointer">
                                    Recordarme
                                </label>
                            </div>

                            <div className="text-sm">
                                <a href="#" className="font-medium text-brand hover:text-brand-hover hover:underline">
                                    ¿Olvidaste tu contraseña?
                                </a>
                            </div>
                        </div>

                        {serverErrorMessage && (
                            <div className="p-4 rounded-xl bg-accent/5 border border-accent/20 flex items-start gap-3 animate-in fade-in slide-in-from-top-2">
                                <span className="text-accent text-lg mt-0.5">⚠️</span>
                                <p className="text-sm font-medium text-accent">
                                   {serverErrorMessage}
                                </p>
                            </div>
                        )}

                        <Button type="submit" isLoading={isPending} className="mt-4">
                            Ingresar al Portal
                        </Button>

                    </form>

                    <p className="mt-8 text-center text-xs text-gray-400">
                        &copy; 2026 Ticket Registrator Corp. Todos los derechos reservados.
                    </p>
                </div>
            </div>
        </div>
    );
}
