import { loginWithGoogle, fetchMe } from '../api/auth'
import { useAuthStore } from '../store/useAuthStore'

export function useAuth() {
  const { token, user, setAuth, clearAuth } = useAuthStore()

  // GoogleLogin 컴포넌트의 onSuccess에서 호출: credential = Google ID Token
  const handleGoogleSuccess = async (credential: string) => {
    try {
      const auth = await loginWithGoogle(credential)
      const me = await fetchMe()
      setAuth(auth.access_token, me)
      window.location.href = '/app'
    } catch (e) {
      console.error('로그인 실패', e)
      throw e
    }
  }

  const logout = () => {
    clearAuth()
    window.location.href = '/login'
  }

  return { token, user, handleGoogleSuccess, logout }
}
