import axios from 'axios'

export const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL as string,
  headers: {
    'Content-Type': 'application/json',
  },
})

// 요청 인터셉터: JWT 자동 첨부
apiClient.interceptors.request.use((config) => {
  const raw = localStorage.getItem('auth-storage')
  if (raw) {
    try {
      const parsed = JSON.parse(raw) as { state?: { token?: string } }
      const token = parsed?.state?.token
      if (token) {
        config.headers.Authorization = `Bearer ${token}`
      }
    } catch {
      // 파싱 실패 시 무시
    }
  }
  return config
})

// 응답 인터셉터: 401/403 → 로그아웃 후 /login 리다이렉트
// 단, 로그인 요청 자체(/api/auth/google)는 제외 (무한 리다이렉트 방지)
apiClient.interceptors.response.use(
  (response) => response,
  (error: unknown) => {
    if (axios.isAxiosError(error)) {
      const status = error.response?.status
      const url = error.config?.url ?? ''
      if ((status === 401 || status === 403) && !url.includes('/api/auth/google')) {
        localStorage.removeItem('auth-storage')
        window.location.href = '/login'
      }
    }
    return Promise.reject(error)
  },
)
