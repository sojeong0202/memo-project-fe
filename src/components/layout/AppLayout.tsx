import { useUiStore } from '../../store/useUiStore'
import Sidebar from './Sidebar'
import HomeView from '../home/HomeView'
import GraphView from '../graph/GraphView'
import TunnelView from '../graph/TunnelView'

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
