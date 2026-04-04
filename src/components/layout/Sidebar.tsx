import { useUiStore } from '../../store/useUiStore'
import { useAuthStore } from '../../store/useAuthStore'
import type { ViewMode } from '../../types'

const NAV_ITEMS: { mode: ViewMode; label: string; icon: React.ReactNode }[] = [
  {
    mode: 'home',
    label: '홈',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 9.5L12 3l9 6.5V20a1 1 0 01-1 1H4a1 1 0 01-1-1V9.5z" />
        <path d="M9 21V12h6v9" />
      </svg>
    ),
  },
  {
    mode: '2d',
    label: '그래프',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
        <circle cx="12" cy="12" r="2.5" />
        <circle cx="4" cy="6" r="2" />
        <circle cx="20" cy="6" r="2" />
        <circle cx="4" cy="18" r="2" />
        <circle cx="20" cy="18" r="2" />
        <line x1="12" y1="12" x2="4" y2="6" />
        <line x1="12" y1="12" x2="20" y2="6" />
        <line x1="12" y1="12" x2="4" y2="18" />
        <line x1="12" y1="12" x2="20" y2="18" />
      </svg>
    ),
  },
  {
    mode: '3d',
    label: '터널',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <ellipse cx="12" cy="5" rx="9" ry="3" />
        <path d="M3 5v14c0 1.66 4.03 3 9 3s9-1.34 9-3V5" />
        <path d="M3 12c0 1.66 4.03 3 9 3s9-1.34 9-3" />
      </svg>
    ),
  },
]

export default function Sidebar() {
  const { viewMode, setViewMode } = useUiStore()
  const { user, clearAuth } = useAuthStore()

  const handleLogout = () => {
    clearAuth()
    window.location.href = '/login'
  }

  return (
    <aside
      className="flex flex-col items-center py-5 gap-1 flex-shrink-0"
      style={{
        width: 64,
        background: 'rgba(255,255,255,0.02)',
        borderRight: '1px solid rgba(255,255,255,0.06)',
      }}
    >
      {/* 로고 */}
      <div className="mb-4">
        <div
          className="w-9 h-9 rounded-xl flex items-center justify-center"
          style={{
            background: 'linear-gradient(135deg, #7c3aed, #4f46e5)',
            boxShadow: '0 0 16px rgba(124,58,237,0.4)',
          }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="12" r="3" fill="white" />
            <circle cx="4" cy="6" r="2" fill="white" fillOpacity="0.6" />
            <circle cx="20" cy="6" r="2" fill="white" fillOpacity="0.6" />
            <circle cx="4" cy="18" r="2" fill="white" fillOpacity="0.6" />
            <circle cx="20" cy="18" r="2" fill="white" fillOpacity="0.6" />
            <line x1="12" y1="12" x2="4" y2="6" stroke="white" strokeOpacity="0.5" strokeWidth="1.5" />
            <line x1="12" y1="12" x2="20" y2="6" stroke="white" strokeOpacity="0.5" strokeWidth="1.5" />
            <line x1="12" y1="12" x2="4" y2="18" stroke="white" strokeOpacity="0.5" strokeWidth="1.5" />
            <line x1="12" y1="12" x2="20" y2="18" stroke="white" strokeOpacity="0.5" strokeWidth="1.5" />
          </svg>
        </div>
      </div>

      {/* 네비게이션 */}
      <nav className="flex flex-col items-center gap-1 flex-1">
        {NAV_ITEMS.map(({ mode, label, icon }) => {
          const active = viewMode === mode
          return (
            <button
              key={mode}
              onClick={() => setViewMode(mode)}
              title={label}
              className="relative w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-150 cursor-pointer group"
              style={{
                background: active ? 'rgba(167,139,250,0.15)' : 'transparent',
                color: active ? '#a78bfa' : '#6b6880',
              }}
              onMouseEnter={(e) => {
                if (!active) e.currentTarget.style.background = 'rgba(255,255,255,0.06)'
              }}
              onMouseLeave={(e) => {
                if (!active) e.currentTarget.style.background = 'transparent'
              }}
            >
              {active && (
                <span
                  className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 rounded-r-full"
                  style={{ background: '#a78bfa' }}
                />
              )}
              {icon}
            </button>
          )
        })}
      </nav>

      {/* 프로필 / 로그아웃 */}
      <button
        onClick={handleLogout}
        title={user?.email ?? '로그아웃'}
        className="w-8 h-8 rounded-full overflow-hidden flex items-center justify-center transition-all duration-150 cursor-pointer mt-2"
        style={{ background: 'rgba(255,255,255,0.08)', color: '#9b97b2' }}
        onMouseEnter={(e) => { e.currentTarget.style.color = '#f87171' }}
        onMouseLeave={(e) => { e.currentTarget.style.color = '#9b97b2' }}
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
          <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4" />
          <polyline points="16 17 21 12 16 7" />
          <line x1="21" y1="12" x2="9" y2="12" />
        </svg>
      </button>
    </aside>
  )
}
