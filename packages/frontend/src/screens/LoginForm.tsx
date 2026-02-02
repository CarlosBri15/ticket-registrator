import { useState, type ChangeEvent, type SyntheticEvent } from "react";
import { useLogin } from "../hooks/mutations/useLogin"
import type { ILogin } from "@ticket-registrator/shared";

export const LoginForm = () => {
    const { mutate, isPending, isError, error } = useLogin();

    const [credentials, setCredentials] = useState<ILogin>({
        email: '',
        password: ''
    });

    const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
        setCredentials({
            ...credentials,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = (e: SyntheticEvent) => {
        e.preventDefault();
        mutate(credentials);
    }

    return (
        // Contenedor principal: Centrado perfecto y fondo suave
        <div className="min-h-screen flex items-center justify-center bg-surface p-4">
            
            {/* Tarjeta del Login: Sombra suave, bordes redondeados, fondo blanco */}
            <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
                
                <div className="mb-8 text-center">
                    <h2 className="text-3xl font-bold text-gray-900 tracking-tight">
                        Bienvenido
                    </h2>
                    <p className="text-sm text-gray-500 mt-2">
                        Ingresa tus credenciales para gestionar tus finanzas
                    </p>
                </div>
                
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Correo Electrónico
                        </label>
                        <input 
                            type="email" 
                            name="email" 
                            value={credentials.email} 
                            onChange={handleChange} 
                            required 
                            placeholder="ejemplo@empresa.com"
                            className="w-full px-4 py-3 rounded-lg bg-gray-50 border border-gray-200 text-gray-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand transition-all duration-200"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Contraseña
                        </label>
                        <input 
                            type="password" 
                            name="password" 
                            value={credentials.password} 
                            onChange={handleChange} 
                            required 
                            placeholder="••••••••"
                            className="w-full px-4 py-3 rounded-lg bg-gray-50 border border-gray-200 text-gray-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand transition-all duration-200"
                        />
                    </div>

                    <button 
                        type="submit" 
                        disabled={isPending}
                        className="w-full bg-brand hover:bg-brand-hover text-white font-semibold py-3 px-4 rounded-lg shadow-md hover:shadow-lg transition-all duration-200 disabled:opacity-70 disabled:cursor-not-allowed flex justify-center items-center"
                    >
                        {isPending ? (
                            // Pequeño spinner hecho con clases de Tailwind
                            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        ) : (
                            'Ingresar al Portal'
                        )}
                    </button>

                    {isError && (
                        <div className="p-3 rounded-lg bg-red-50 border border-red-100 text-red-600 text-sm text-center animate-pulse">
                           {(error as any)?.response?.data?.message || 'Credenciales inválidas. Por favor intenta de nuevo.'}
                        </div>
                    )}
                </form>

                {/* Pie de página sutil */}
                <p className="mt-8 text-center text-xs text-gray-400">
                    &copy; 2026 Ticket Registrator Corp.
                </p>
            </div>
        </div>
    );
}