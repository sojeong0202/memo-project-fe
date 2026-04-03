import { useGoogleLogin } from '@react-oauth/google'
import { loginWithGoogle, fetchMe } from '../api/auth'
import { useAuthStore } from '../store/useAuthStore'

export function useAuth() {
  const { token, user, setAuth, clearAuth } = useAuthStore()

  const login = useGoogleLogin({
    flow: 'implicit',
    scope: 'openid email profile',
    onSuccess: async (tokenResponse) => {
      try {
        // implicit flow + openid scope → id_token이 응답에 포함됨 (타입 미지원이라 캐스팅)
        const idToken = (tokenResponse as unknown as { id_token?: string }).id_token
        const credential = idToken ?? tokenResponse.access_token
        const auth = await loginWithGoogle(credential)
        const me = await fetchMe()
        setAuth(auth.access_token, me)
        window.location.href = '/app'
      } catch (e) {
        console.error('로그인 실패', e)
        throw e
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
