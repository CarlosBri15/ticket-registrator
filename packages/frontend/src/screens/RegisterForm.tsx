import { useState, type ChangeEvent, type SyntheticEvent } from "react";
import { useRegister } from "../hooks/mutations/useRegister"
import type { ICreateUser } from "@ticket-registrator/shared";

export const RegisterForm = () => {
    const { mutate, isPending, isError, error } = useRegister();

    const [formData, setFormData] = useState<ICreateUser>({
        name: '',
        surname: '',
        email: '',
        username: '',
        password: ''
    });

    const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = (e: SyntheticEvent) => {
        e.preventDefault();
        mutate(formData);
    };

    return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxWidth: '300px' }}>
      <h2>Crear Cuenta</h2>
      
      <input 
        name="name" 
        placeholder="Nombre" 
        value={formData.name} 
        onChange={handleChange} 
        required 
      />
      <input 
        name="surname" 
        placeholder="Apellido" 
        value={formData.surname} 
        onChange={handleChange} 
        required 
      />
      <input 
        name="username" 
        placeholder="Usuario" 
        value={formData.username} 
        onChange={handleChange} 
        required 
      />
      <input 
        type="email" 
        name="email" 
        placeholder="Email" 
        value={formData.email} 
        onChange={handleChange} 
        required 
      />
      <input 
        type="password" 
        name="password" 
        placeholder="Contraseña" 
        value={formData.password} 
        onChange={handleChange} 
        required 
      />

      <button type="submit" disabled={isPending}>
        {isPending ? 'Registrando...' : 'Registrarse'}
      </button>

      {isError && (
        <p style={{ color: 'red' }}>
          Error: {(error as any)?.response?.data?.message || 'Hubo un error'}
        </p>
      )}
    </form>
  );
}