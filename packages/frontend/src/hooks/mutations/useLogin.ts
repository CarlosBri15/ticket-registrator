import { useMutation } from "@tanstack/react-query"
import type { ILogin, ILoginResponse } from "@ticket-registrator/shared"
import { loginUser } from "../../api/auth.api"

export const useLogin = () => {
    return useMutation({
        mutationFn: (credentials: ILogin) => loginUser(credentials),
        onSuccess: (data: ILoginResponse) =>{
            localStorage.setItem('access_token', data.access_token);
            alert('Login successful')
        },
        onError: (error: any) => {
            console.log(error),
            alert('Login failed') 
        }
    })
}