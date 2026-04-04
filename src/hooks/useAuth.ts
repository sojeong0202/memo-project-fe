import { loginWithGoogle, fetchMe } from '../api/auth'
import { useAuthStore } from '../store/useAuthStore'

export function useAuth(onError?: (msg: string) => void) {
  const { token, user, setAuth, clearAuth } = useAuthStore()

  // GoogleLogin 컴포넌트의 onSuccess에서 호출 — credential = Google ID Token
  const handleCredential = async (credential: string) => {
    try {
      const auth = await loginWithGoogle(credential)
      // fetchMe에 토큰을 직접 전달 → setAuth 전에도 인증 헤더 포함
      const me = await fetchMe(auth.access_token)
      setAuth(auth.access_token, me)
      window.location.href = '/app'
    } catch (e) {
      console.error('로그인 실패', e)
      onError?.('로그인에 실패했어요. 다시 시도해주세요.')
    }
  }

  const logout = () => {
    clearAuth()
    window.location.href = '/login'
  }

  return { token, user, handleCredential, logout }
}
