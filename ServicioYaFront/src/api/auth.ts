import { http } from './http';

export type RegisterPayload = { email: string; password: string; fullName: string };
export type LoginPayload    = { email: string; password: string };

export type AuthResponse<TUser = any> = {
  accessToken: string;
  user: TUser;
};

export type RegisterResponse<TUser = any> = {
  id: string;
  email: string;
  fullName: string;
  role: string;
} & TUser;


// /auth/register => 201 con usuario (sin token)
export async function register(payload: RegisterPayload) {
  const { data } = await http.post<RegisterResponse>('/auth/register', payload);
  return data;
}

// /auth/login => 200 con { accessToken, user }
export async function login(payload: LoginPayload) {
  const { data } = await http.post<AuthResponse>('/auth/login', payload);
  return data;
}

// /auth/me => requiere Authorization: Bearer <JWT>
export async function me() {
  const { data } = await http.get<{ sub: string; role: string }>('/auth/me');
  return data;
}
