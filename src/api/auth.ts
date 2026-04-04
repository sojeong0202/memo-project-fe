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

// token을 직접 받아 헤더에 꽂음 — setAuth 이전에도 인증 요청 가능
export async function fetchMe(token: string): Promise<MeResponse> {
  const res = await apiClient.get<MeResponse>('/api/auth/me', {
    headers: { Authorization: `Bearer ${token}` },
  })
  return res.data
}
