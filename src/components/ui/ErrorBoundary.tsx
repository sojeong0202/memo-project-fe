import { Component, type ErrorInfo, type ReactNode } from 'react'

interface Props {
  children: ReactNode
}

interface State {
  hasError: boolean
  message: string
}

export default class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false, message: '' }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, message: error.message }
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('ErrorBoundary caught:', error, info)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div
          style={{
            height: '100vh',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 16,
            background: '#07070f',
            color: '#9b97b2',
            fontFamily: "'Pretendard', 'Inter', sans-serif",
          }}
        >
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#6b6880" strokeWidth="1.5">
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="12" />
            <line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
          <p style={{ fontSize: 14 }}>예상치 못한 오류가 발생했어요.</p>
          <button
            onClick={() => window.location.reload()}
            style={{
              padding: '8px 20px',
              borderRadius: 8,
              border: '1px solid rgba(255,255,255,0.1)',
              background: 'rgba(255,255,255,0.05)',
              color: '#f1f0f5',
              fontSize: 13,
              cursor: 'pointer',
            }}
          >
            새로고침
          </button>
        </div>
      )
    }

    return this.props.children
  }
}
