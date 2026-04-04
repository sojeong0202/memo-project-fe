import MemoInput from './MemoInput'
import { useAuthStore } from '../../store/useAuthStore'

const SUGGESTIONS = [
  '오늘 배운 React 19의 새로운 훅들 정리',
  '독서 메모: 생각에 관한 생각 — 카너먼',
  '사이드 프로젝트 아이디어: AI 기반 일정 관리',
]

export default function HomeView() {
  const user = useAuthStore((s) => s.user)
  const firstName = user?.email?.split('@')[0] ?? '사용자'

  return (
    <div className="flex-1 flex flex-col items-center justify-center px-8 gap-10">
      {/* 인사말 */}
      <div className="text-center flex flex-col gap-2">
        <h2
          className="text-3xl font-semibold tracking-tight"
          style={{ color: '#f1f0f5' }}
        >
          안녕하세요, {firstName}님
        </h2>
        <p className="text-sm" style={{ color: '#6b6880' }}>
          메모를 입력하면 AI가 요약하고 지식 그래프로 연결해드려요
        </p>
      </div>

      {/* 입력창 */}
      <MemoInput />

      {/* 예시 제안 */}
      <div className="flex flex-col items-center gap-3">
        <p className="text-xs" style={{ color: '#4b4860' }}>이런 메모는 어떠세요?</p>
        <div className="flex flex-wrap justify-center gap-2">
          {SUGGESTIONS.map((s) => (
            <span
              key={s}
              className="text-xs px-3 py-1.5 rounded-full"
              style={{
                background: 'rgba(255,255,255,0.04)',
                border: '1px solid rgba(255,255,255,0.07)',
                color: '#6b6880',
              }}
            >
              {s}
            </span>
          ))}
        </div>
      </div>
    </div>
  )
}
