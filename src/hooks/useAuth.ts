import { useGoogleLogin } from '@react-oauth/google'
import { loginWithGoogle, fetchMe } from '../api/auth'
import { useAuthStore } from '../store/useAuthStore'

export function useAuth() {
  const { token, user, setAuth, clearAuth } = useAuthStore()

  const login = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      try {
        const auth = await loginWithGoogle(tokenResponse.access_token)
        const me = await fetchMe()
        setAuth(auth.access_token, me)
        window.location.href = '/app'
      } catch (e) {
        console.error('로그인 실패', e)
      }
    },
    onError: (e) => console.error('Google OAuth 실패', e),
  })

  const logout = () => {
    clearAuth()
    window.location.href = '/login'
  }

  return { token, user, login, logout }
}
