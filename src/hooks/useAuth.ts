import { useGoogleLogin } from '@react-oauth/google'
import { loginWithGoogle, fetchMe } from '../api/auth'
import { useAuthStore } from '../store/useAuthStore'

export function useAuth(onError?: (msg: string) => void) {
  const { token, user, setAuth, clearAuth } = useAuthStore()

  const login = useGoogleLogin({
    flow: 'implicit',
    scope: 'openid email profile',
    onSuccess: async (tokenResponse) => {
      try {
        const idToken = (tokenResponse as unknown as { id_token?: string }).id_token
        const credential = idToken ?? tokenResponse.access_token
        const auth = await loginWithGoogle(credential)
        const me = await fetchMe()
        setAuth(auth.access_token, me)
        window.location.href = '/app'
      } catch (e) {
        console.error('로그인 실패', e)
        onError?.('로그인에 실패했어요. 다시 시도해주세요.')
      }
    },
    onError: () => {
      console.error('Google OAuth 실패')
      onError?.('Google 인증에 실패했어요.')
    },
  })

  const logout = () => {
    clearAuth()
    window.location.href = '/login'
  }

  return { token, user, login, logout }
}
