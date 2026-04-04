import { useRef, useEffect, useMemo } from 'react'
import { Canvas, useThree, useFrame } from '@react-three/fiber'
import { Html, Line } from '@react-three/drei'
import * as THREE from 'three'
import { useGraph } from '../../hooks/useGraph'
import { useUiStore } from '../../store/useUiStore'
import NodeDetailPanel from './NodeDetailPanel'
import type { Node as MemoData } from '../../types'

const Z_SPACING = 5
const START_Z = 8

// 오래된 노드일수록 Z 음수 방향으로 배치 (터널 안쪽)
function buildPositions(nodes: MemoData[]): Map<string, THREE.Vector3> {
  const sorted = [...nodes].sort(
    (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
  )
  const map = new Map<string, THREE.Vector3>()
  sorted.forEach((node, i) => {
    const z = -(i * Z_SPACING)
    const angle = i * 2.4 // ~황금각 (radians)
    const r = 1.8 + (i % 2) * 1.2
    map.set(
      node.node_id,
      new THREE.Vector3(r * Math.cos(angle), r * Math.sin(angle) * 0.55, z)
    )
  })
  return map
}

// ─── 노드 구체 ────────────────────────────────────────────────────────────────

interface MemoSphereProps {
  node: MemoData
  position: THREE.Vector3
  selected: boolean
  onClick: () => void
}

function MemoSphere({ node, position, selected, onClick }: MemoSphereProps) {
  const meshRef = useRef<THREE.Mesh>(null)

  useFrame(() => {
    if (!meshRef.current) return
    const s = 1 + Math.sin(Date.now() * 0.002 + position.z * 0.3) * 0.04
    meshRef.current.scale.setScalar(selected ? s * 1.35 : s)
  })

  return (
    <group position={position}>
      {/* 메인 구체 */}
      <mesh ref={meshRef} onClick={(e) => { e.stopPropagation(); onClick() }}>
        <sphereGeometry args={[0.35, 24, 24]} />
        <meshStandardMaterial
          color={node.category_color}
          emissive={node.category_color}
          emissiveIntensity={selected ? 2 : 0.6}
          roughness={0.3}
          metalness={0.1}
          transparent
          opacity={0.9}
        />
      </mesh>

      {/* 글로우 헤일로 */}
      <mesh>
        <sphereGeometry args={[0.58, 16, 16]} />
        <meshBasicMaterial
          color={node.category_color}
          transparent
          opacity={selected ? 0.15 : 0.07}
          side={THREE.BackSide}
        />
      </mesh>

      {/* 선택 시 링 */}
      {selected && (
        <mesh>
          <ringGeometry args={[0.48, 0.58, 32]} />
          <meshBasicMaterial
            color="#a78bfa"
            transparent
            opacity={0.75}
            side={THREE.DoubleSide}
          />
        </mesh>
      )}

      {/* 키워드 레이블 */}
      {node.keywords[0] && (
        <Html
          center
          distanceFactor={12}
          position={[0, 0.68, 0]}
          style={{ pointerEvents: 'none', userSelect: 'none' }}
        >
          <span
            style={{
              color: '#c4b5fd',
              fontSize: 11,
              fontFamily: "'Pretendard', 'Inter', sans-serif",
              whiteSpace: 'nowrap',
              textShadow: '0 0 8px rgba(196,181,253,0.6)',
            }}
          >
            {node.keywords[0]}
          </span>
        </Html>
      )}
    </group>
  )
}

// ─── 카메라 스크롤 컨트롤러 ─────────────────────────────────────────────────

function CameraController({ nodeCount }: { nodeCount: number }) {
  const { camera } = useThree()
  const targetZ = useRef(START_Z)
  const minZ = -(nodeCount - 1) * Z_SPACING - 6

  useEffect(() => {
    const handleWheel = (e: WheelEvent) => {
      e.preventDefault()
      targetZ.current = Math.max(
        minZ,
        Math.min(START_Z, targetZ.current - e.deltaY * 0.025)
      )
    }
    window.addEventListener('wheel', handleWheel, { passive: false })
    return () => window.removeEventListener('wheel', handleWheel)
  }, [minZ])

  useFrame(() => {
    camera.position.z += (targetZ.current - camera.position.z) * 0.1
  })

  return null
}

// ─── 씬 내부 ─────────────────────────────────────────────────────────────────

interface SceneProps {
  nodes: MemoData[]
  edges: { edge_id: string; source_node_id: string; target_node_id: string; similarity_score: number }[]
  selectedNodeId: string | null
  onNodeClick: (id: string) => void
  onPaneClick: () => void
}

function Scene({ nodes, edges, selectedNodeId, onNodeClick, onPaneClick }: SceneProps) {
  const positions = useMemo(() => buildPositions(nodes), [nodes])
  const ringCount = Math.ceil(nodes.length * 1.5) + 4

  return (
    <>
      <ambientLight intensity={0.25} />
      <pointLight position={[0, 0, START_Z]} intensity={3} color="#a78bfa" distance={30} />

      {/* 터널 링 장식 */}
      {Array.from({ length: ringCount }, (_, i) => (
        <mesh
          key={`ring-${i}`}
          position={[0, 0, -(i * Z_SPACING * 0.72)]}
          rotation={[Math.PI / 2, 0, 0]}
        >
          <torusGeometry args={[3.8, 0.012, 8, 72]} />
          <meshBasicMaterial color="#a78bfa" transparent opacity={0.05} />
        </mesh>
      ))}

      {/* 엣지 */}
      {edges.map((edge) => {
        const from = positions.get(edge.source_node_id)
        const to = positions.get(edge.target_node_id)
        if (!from || !to) return null
        return (
          <Line
            key={edge.edge_id}
            points={[from.toArray() as [number, number, number], to.toArray() as [number, number, number]]}
            color="#a78bfa"
            lineWidth={0.5 + edge.similarity_score * 1.5}
            opacity={0.12 + edge.similarity_score * 0.3}
            transparent
          />
        )
      })}

      {/* 노드 */}
      {nodes.map((node) => {
        const pos = positions.get(node.node_id)
        if (!pos) return null
        return (
          <MemoSphere
            key={node.node_id}
            node={node}
            position={pos}
            selected={node.node_id === selectedNodeId}
            onClick={() => onNodeClick(node.node_id)}
          />
        )
      })}

      {/* 배경 클릭 시 패널 닫기 */}
      <mesh
        position={[0, 0, -999]}
        onClick={onPaneClick}
        visible={false}
      >
        <planeGeometry args={[9999, 9999]} />
        <meshBasicMaterial />
      </mesh>

      <CameraController nodeCount={nodes.length} />
    </>
  )
}

// ─── 메인 TunnelView ──────────────────────────────────────────────────────────

export default function TunnelView() {
  const { data, isLoading, isError } = useGraph()
  const { selectedNodeId, selectNode, closePanel } = useUiStore()

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center flex-col gap-3" style={{ color: '#9b97b2' }}>
        <svg className="animate-spin" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" strokeOpacity="0.3" />
          <path d="M21 12a9 9 0 00-9-9" />
        </svg>
        <span className="text-sm">터널 불러오는 중...</span>
      </div>
    )
  }

  if (isError) {
    return (
      <div className="flex-1 flex items-center justify-center" style={{ color: '#9b97b2' }}>
        <p className="text-sm">데이터를 불러오지 못했어요.</p>
      </div>
    )
  }

  if (!data || data.nodes.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center flex-col gap-3" style={{ color: '#6b6880' }}>
        <svg width="44" height="44" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" strokeOpacity="0.35">
          <circle cx="12" cy="12" r="3" />
          <path d="M12 3a9 9 0 000 18A9 9 0 0012 3" strokeDasharray="3 2" />
        </svg>
        <div className="text-center">
          <p className="text-sm font-medium" style={{ color: '#9b97b2' }}>아직 메모가 없어요</p>
          <p className="text-xs mt-1">홈으로 돌아가 첫 메모를 작성해보세요</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex-1 relative overflow-hidden">
      <Canvas
        camera={{ position: [0, 0, START_Z], fov: 60 }}
        style={{ background: '#07070f' }}
        gl={{ antialias: true, alpha: false }}
      >
        <fog attach="fog" args={['#07070f', 20, 60]} />
        <Scene
          nodes={data.nodes}
          edges={data.edges}
          selectedNodeId={selectedNodeId}
          onNodeClick={selectNode}
          onPaneClick={closePanel}
        />
      </Canvas>

      {/* 스크롤 힌트 */}
      <div
        style={{
          position: 'absolute',
          bottom: 24,
          left: '50%',
          transform: 'translateX(-50%)',
          color: '#4b4860',
          fontSize: 12,
          pointerEvents: 'none',
          display: 'flex',
          alignItems: 'center',
          gap: 6,
        }}
      >
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M12 5v14M5 12l7 7 7-7" />
        </svg>
        스크롤하여 시간축 탐색
      </div>

      {/* 노드 상세 패널 */}
      {selectedNodeId && (
        <NodeDetailPanel
          node={data.nodes.find((n) => n.node_id === selectedNodeId) ?? null}
          onClose={closePanel}
        />
      )}
    </div>
  )
}
