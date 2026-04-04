import { useUiStore } from '../../store/useUiStore'
import Sidebar from './Sidebar'
import HomeView from '../home/HomeView'

// Phase 4/5에서 구현 예정
function GraphView() {
  return (
    <div className="flex-1 flex items-center justify-center" style={{ color: '#6b6880' }}>
      <div className="text-center flex flex-col gap-2">
        <span className="text-4xl">🕸</span>
        <p className="text-sm">2D 그래프 뷰 — Phase 4에서 구현 예정</p>
      </div>
    </div>
  )
}

function TunnelView() {
  return (
    <div className="flex-1 flex items-center justify-center" style={{ color: '#6b6880' }}>
      <div className="text-center flex flex-col gap-2">
        <span className="text-4xl">🌀</span>
        <p className="text-sm">3D 터널 뷰 — Phase 5에서 구현 예정</p>
      </div>
    </div>
  )
}

export default function AppLayout() {
  const viewMode = useUiStore((s) => s.viewMode)

  return (
    <div
      className="flex h-screen w-screen overflow-hidden"
      style={{ background: 'radial-gradient(ellipse at 30% 20%, #120a2a 0%, #07070f 60%)' }}
    >
      <Sidebar />

      <main className="flex-1 flex overflow-hidden">
        {viewMode === 'home' && <HomeView />}
        {viewMode === '2d' && <GraphView />}
        {viewMode === '3d' && <TunnelView />}
      </main>
    </div>
  )
}
