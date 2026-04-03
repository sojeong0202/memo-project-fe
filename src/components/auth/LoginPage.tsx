import { useEffect, useRef, useState } from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'

function BackgroundCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const resize = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }
    resize()
    window.addEventListener('resize', resize)

    type Particle = {
      x: number; y: number; vx: number; vy: number
      r: number; color: string; alpha: number
    }

    const colors = ['#a78bfa', '#818cf8', '#c084fc', '#7c3aed', '#6366f1']
    const particles: Particle[] = Array.from({ length: 40 }, () => ({
      x: Math.random() * window.innerWidth,
      y: Math.random() * window.innerHeight,
      vx: (Math.random() - 0.5) * 0.4,
      vy: (Math.random() - 0.5) * 0.4,
      r: Math.random() * 3 + 2,
      color: colors[Math.floor(Math.random() * colors.length)],
      alpha: Math.random() * 0.5 + 0.2,
    }))

    let animId: number
    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x
          const dy = particles[i].y - particles[j].y
          const dist = Math.sqrt(dx * dx + dy * dy)
          if (dist < 160) {
            ctx.beginPath()
            ctx.moveTo(particles[i].x, particles[i].y)
            ctx.lineTo(particles[j].x, particles[j].y)
            ctx.strokeStyle = `rgba(167,139,250,${0.12 * (1 - dist / 160)})`
            ctx.lineWidth = 1
            ctx.stroke()
          }
        }
      }

      for (const p of particles) {
        const grd = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.r * 5)
        grd.addColorStop(0, `${p.color}55`)
        grd.addColorStop(1, 'transparent')
        ctx.beginPath()
        ctx.arc(p.x, p.y, p.r * 5, 0, Math.PI * 2)
        ctx.fillStyle = grd
        ctx.fill()

        ctx.beginPath()
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2)
        ctx.fillStyle = p.color
        ctx.globalAlpha = p.alpha
        ctx.fill()
        ctx.globalAlpha = 1

        p.x += p.vx
        p.y += p.vy
        if (p.x < 0 || p.x > canvas.width) p.vx *= -1
        if (p.y < 0 || p.y > canvas.height) p.vy *= -1
      }

      animId = requestAnimationFrame(draw)
    }
    draw()

    return () => {
      cancelAnimationFrame(animId)
      window.removeEventListener('resize', resize)
    }
  }, [])

  return <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" style={{ opacity: 0.6 }} />
}

export default function LoginPage() {
  const { token, login } = useAuth()
  const [isHovered, setIsHovered] = useState(false)
  const [error, setError] = useState<string | null>(null)

  if (token) return <Navigate to="/app" replace />

  const handleLogin = () => {
    setError(null)
    try {
      login()
    } catch {
      setError('로그인에 실패했어요. 다시 시도해주세요.')
    }
  }

  return (
    <div
      className="relative min-h-screen flex items-center justify-center overflow-hidden"
      style={{ background: 'radial-gradient(ellipse at 60% 40%, #1a0a3a 0%, #07070f 60%)' }}
    >
      <BackgroundCanvas />

      <div className="absolute top-1/4 left-1/3 w-96 h-96 rounded-full pointer-events-none"
        style={{ background: 'radial-gradient(circle, rgba(124,58,237,0.15) 0%, transparent 70%)', filter: 'blur(40px)' }} />
      <div className="absolute bottom-1/3 right-1/4 w-64 h-64 rounded-full pointer-events-none"
        style={{ background: 'radial-gradient(circle, rgba(99,102,241,0.12) 0%, transparent 70%)', filter: 'blur(40px)' }} />

      {/* 로그인 카드 */}
      <div
        className="relative z-10 flex flex-col items-center gap-8 px-10 py-12 rounded-3xl"
        style={{
          background: 'rgba(255,255,255,0.04)',
          backdropFilter: 'blur(24px)',
          border: '1px solid rgba(255,255,255,0.08)',
          boxShadow: '0 32px 80px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.06)',
          minWidth: 360,
        }}
      >
        {/* 로고 */}
        <div className="flex flex-col items-center gap-3">
          <div
            className="w-12 h-12 rounded-2xl flex items-center justify-center"
            style={{
              background: 'linear-gradient(135deg, #7c3aed, #4f46e5)',
              boxShadow: '0 0 24px rgba(124,58,237,0.5)',
            }}
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="12" r="3" fill="white" />
              <circle cx="4" cy="6" r="2" fill="white" fillOpacity="0.6" />
              <circle cx="20" cy="6" r="2" fill="white" fillOpacity="0.6" />
              <circle cx="4" cy="18" r="2" fill="white" fillOpacity="0.6" />
              <circle cx="20" cy="18" r="2" fill="white" fillOpacity="0.6" />
              <line x1="12" y1="12" x2="4" y2="6" stroke="white" strokeOpacity="0.4" strokeWidth="1.5" />
              <line x1="12" y1="12" x2="20" y2="6" stroke="white" strokeOpacity="0.4" strokeWidth="1.5" />
              <line x1="12" y1="12" x2="4" y2="18" stroke="white" strokeOpacity="0.4" strokeWidth="1.5" />
              <line x1="12" y1="12" x2="20" y2="18" stroke="white" strokeOpacity="0.4" strokeWidth="1.5" />
            </svg>
          </div>
          <div className="text-center">
            <h1 className="text-2xl font-semibold tracking-tight" style={{ color: '#f1f0f5' }}>
              Memo Graph
            </h1>
            <p className="text-sm mt-1" style={{ color: '#9b97b2' }}>
              메모를 연결하고, 지식을 시각화하세요
            </p>
          </div>
        </div>

        <div className="w-full h-px" style={{ background: 'rgba(255,255,255,0.06)' }} />

        <div className="w-full flex flex-col gap-3">
          <button
            onClick={handleLogin}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            className="w-full flex items-center justify-center gap-3 py-3 px-6 rounded-xl font-medium text-sm transition-all duration-200 cursor-pointer"
            style={{
              background: isHovered ? 'rgba(255,255,255,0.1)' : 'rgba(255,255,255,0.06)',
              border: isHovered ? '1px solid rgba(167,139,250,0.4)' : '1px solid rgba(255,255,255,0.1)',
              color: '#f1f0f5',
              boxShadow: isHovered ? '0 0 20px rgba(167,139,250,0.15)' : 'none',
            }}
          >
            <svg width="18" height="18" viewBox="0 0 18 18">
              <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.875 2.684-6.615z" fill="#4285F4" />
              <path d="M9 18c2.43 0 4.467-.806 5.956-2.184l-2.908-2.258c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 009 18z" fill="#34A853" />
              <path d="M3.964 10.707A5.41 5.41 0 013.682 9c0-.593.102-1.17.282-1.707V4.961H.957A8.996 8.996 0 000 9c0 1.452.348 2.827.957 4.039l3.007-2.332z" fill="#FBBC05" />
              <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 00.957 4.96L3.964 7.293C4.672 5.163 6.656 3.58 9 3.58z" fill="#EA4335" />
            </svg>
            Google로 시작하기
          </button>

          {error && (
            <p className="text-xs text-center" style={{ color: '#f87171' }}>{error}</p>
          )}
        </div>

        <p className="text-xs" style={{ color: '#6b6880' }}>
          로그인 시 개인 지식 그래프 공간이 생성됩니다
        </p>
      </div>
    </div>
  )
}
