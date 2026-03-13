export interface ICreateUser {
  name: string;
  surname: string;
  email: string;
  username: string;
  password: string;
  confirmPassword: string;
  isVisible?: boolean;
}