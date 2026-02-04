import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Link } from "react-router-dom";
import { registerSchema, type RegisterSchema } from "@ticket-registrator/shared";
import { useRegister } from "../hooks/mutations/useRegister";
import { Input } from "../components/Input";
import { Button } from "../components/Button";

export const RegisterForm = () => {
    const { mutate, isPending, isError, error } = useRegister();

    const { register, handleSubmit, formState: { errors } } = useForm<RegisterSchema>({
        resolver: zodResolver(registerSchema),
        defaultValues: {
            name: "",
            email: "",
            password: "",
            confirmPassword: ""
        }
    });

    const onSubmit = (data: RegisterSchema) => {
        const { confirmPassword, ...rest } = data; 
        mutate(rest);
    };

    const serverErrorMessage = isError ? (error as any)?.response?.data?.message || 'Error creating account' : null;

    return (
        <div className="min-h-screen w-full grid lg:grid-cols-2">
            
            <div className="bg-surface flex flex-col justify-center items-center p-6 sm:p-12 lg:p-24 order-2 lg:order-1">
                <div className="w-full max-w-md space-y-8">
                    
                    <div className="text-center lg:text-left">
                        <h2 className="text-3xl font-bold text-dark tracking-tight">
                            Crear Cuenta
                        </h2>
                        <p className="mt-2 text-gray-500">
                            Únete para gestionar tus finanzas de forma inteligente.
                        </p>
                    </div>

                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                        
                        <Input 
                            label="Nombre Completo"
                            placeholder="Juan Pérez"
                            {...register("name")}
                            error={errors.name?.message} 
                        />

                        <Input 
                            label="Correo Electrónico"
                            type="email" 
                            placeholder="usuario@empresa.com"
                            {...register("email")}
                            error={errors.email?.message} 
                        />

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <Input 
                                label="Contraseña"
                                type="password" 
                                placeholder="Mínimo 10 caracteres"
                                {...register("password")}
                                error={errors.password?.message} 
                            />

                            <Input 
                                label="Confirmar Contraseña"
                                type="password" 
                                placeholder="Repite la contraseña"
                                {...register("confirmPassword")}
                                error={errors.confirmPassword?.message} 
                            />
                        </div>

                        {serverErrorMessage && (
                            <div className="p-4 rounded-xl bg-accent/5 border border-accent/20 flex items-start gap-3">
                                <span className="text-accent text-lg mt-0.5">⚠️</span>
                                <p className="text-sm font-medium text-accent">
                                   {serverErrorMessage}
                                </p>
                            </div>
                        )}

                        <Button type="submit" isLoading={isPending} className="mt-6">
                            Registrarse
                        </Button>

                        <div className="text-center mt-6">
                            <p className="text-sm text-gray-500">
                                ¿Ya tienes una cuenta?{' '}
                                <Link to="/login" className="font-semibold text-brand hover:text-brand-hover hover:underline">
                                    Inicia sesión aquí
                                </Link>
                            </p>
                        </div>

                    </form>
                </div>
            </div>

            <div className="hidden lg:flex flex-col justify-center bg-dark p-12 relative overflow-hidden order-1 lg:order-2 text-right">
                <div className="absolute top-0 left-0 w-full h-full opacity-20 pointer-events-none">
                     <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full bg-brand blur-[100px]"></div>
                </div>

                <div className="relative z-10 flex flex-col items-end">
                    <div className="w-16 h-16 bg-white/5 backdrop-blur-md rounded-2xl flex items-center justify-center border border-white/10 mb-6 shadow-2xl">
                        <span className="text-white font-bold text-2xl">TR</span>
                    </div>
                    
                    <h1 className="text-4xl font-bold text-white mb-6 leading-tight">
                        Empieza tu viaje <br/>
                        <span className="text-secondary">hacia el control total.</span>
                    </h1>
                    
                    <ul className="space-y-4 text-gray-300 text-lg mb-8">
                        <li className="flex items-center justify-end gap-3">
                            <span>Métricas en tiempo real</span>
                            <span className="text-brand text-xl">✓</span>
                        </li>
                        <li className="flex items-center justify-end gap-3">
                            <span>Reportes automatizados</span>
                            <span className="text-brand text-xl">✓</span>
                        </li>
                        <li className="flex items-center justify-end gap-3">
                            <span>Seguridad de grado bancario</span>
                            <span className="text-brand text-xl">✓</span>
                        </li>
                    </ul>
                </div>
            </div>

        </div>
    );
};