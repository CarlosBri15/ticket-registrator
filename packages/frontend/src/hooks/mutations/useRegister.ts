import { useMutation } from "@tanstack/react-query"
import type { ICreateUser, IUser } from "@ticket-registrator/shared"
import { registerUser } from "../../api/auth.api"

export const useRegister = () => {
    return useMutation({
        mutationFn: (data: ICreateUser) => registerUser(data),
        onSuccess: (data: IUser) => {
            console.log(data),
            alert('Registration successful')
        },
        onError: (error: any) => {
            console.log(error),
            alert('Registration failed')
        }
    })
}