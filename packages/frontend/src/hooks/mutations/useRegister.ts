import { useMutation } from "@tanstack/react-query"
import type { ICreateUser } from "@ticket-registrator/shared"
import { registerUser } from "../../api/users.api"

export const useRegister = () => {
    return useMutation({
        mutationFn: (data: ICreateUser) => registerUser(data),
        onSuccess: (data) => {
            console.log(data),
            alert('Registration successful')
        },
        onError: (error: any) => {
            console.log(error),
            alert('Registration failed')
        }
    })
}