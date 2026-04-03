import { apiClient } from './client'

export interface AuthResponse {
  access_token: string
  token_type: string
}

export interface MeResponse {
  user_id: string
  email: string
  google_id: string
}

export async function loginWithGoogle(token: string): Promise<AuthResponse> {
  const res = await apiClient.post<AuthResponse>('/api/auth/google', { token })
  return res.data
}

export async function fetchMe(): Promise<MeResponse> {
  const res = await apiClient.get<MeResponse>('/api/auth/me')
  return res.data
}
