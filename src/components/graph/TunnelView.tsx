import { useRef, useEffect, useMemo } from 'react'
import { Canvas, useThree, useFrame } from '@react-three/fiber'
import { Html, Line } from '@react-three/drei'
import * as THREE from 'three'
import { useGraph } from '../../hooks/useGraph'
import { useUiStore } from '../../store/useUiStore'
import NodeDetailPanel from './NodeDetailPanel'
import type { Node as MemoData } from '../../types'

const Z_SPACING = 6   // 노드 간 Z 간격
const START_Z = 10    // 카메라 초기 Z

// 최신 노드 = Z 가까이, 오래된 노드 = Z 깊숙이
function buildPositions(nodes: MemoData[]): Map<string, THREE.Vector3> {
  const sorted = [...nodes].sort(
    (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    // 최신순 정렬: index 0이 가장 최신 → z=0 (카메라에 가장 가까움)
  )
  const goldenAngle = Math.PI * (3 - Math.sqrt(5)) // 2.4rad
  const map = new Map<string, THREE.Vector3>()
  sorted.forEach((node, i) => {
    const z = -(i * Z_SPACING)
    const r = Math.min(4, 0.5 + i * 0.5) // 반지름을 서서히 키우되 최대 4 제한
    const angle = i * goldenAngle
    map.set(
      node.node_id,
      new THREE.Vector3(r * Math.cos(angle), r * Math.sin(angle) * 0.6, z)
    )
  })
  return map
}

// ─── 카드 노드 ───────────────────────────────────────────────────────────────

interface MemoCardProps {
  node: MemoData
  position: THREE.Vector3
  selected: boolean
  onClick: () => void
}

function MemoCard({ node, position, selected, onClick }: MemoCardProps) {
  return (
    <Html center distanceFactor={9} position={position} style={{ width: 210 }}>
      <div
        onClick={(e) => { e.stopPropagation(); onClick() }}
        style={{
          width: 210,
          background: selected ? 'rgba(167,139,250,0.1)' : 'rgba(14,12,28,0.75)',
          border: `1.5px solid ${selected ? '#a78bfa' : node.category_color + '88'}`,
          borderRadius: 12,
          padding: '10px 14px',
          backdropFilter: 'blur(12px)',
          boxShadow: selected
            ? '0 0 24px rgba(167,139,250,0.3), 0 4px 24px rgba(0,0,0,0.5)'
            : `0 0 12px ${node.category_color}22, 0 4px 20px rgba(0,0,0,0.4)`,
          cursor: 'pointer',
          fontFamily: "'Pretendard', 'Inter', sans-serif",
          transition: 'border-color 0.15s, box-shadow 0.15s',
        }}
      >
        {/* 카테고리 컬러 인디케이터 */}
        <div
          style={{
            width: 8,
            height: 8,
            borderRadius: '50%',
            background: node.category_color,
            boxShadow: `0 0 6px ${node.category_color}88`,
            marginBottom: 8,
          }}
        />

        {/* 요약 */}
        <p
          style={{
            color: '#f1f0f5',
            fontSize: 12,
            lineHeight: 1.65,
            margin: 0,
            display: '-webkit-box',
            WebkitLineClamp: 3,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
          }}
        >
          {node.summary}
        </p>

        {/* 키워드 */}
        {node.keywords.length > 0 && (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginTop: 8 }}>
            {node.keywords.slice(0, 3).map((kw) => (
              <span
                key={kw}
                style={{
                  fontSize: 10,
                  padding: '1px 7px',
                  borderRadius: 20,
                  background: `${node.category_color}18`,
                  color: node.category_color,
                  border: `1px solid ${node.category_color}40`,
                }}
              >
                {kw}
              </span>
            ))}
          </div>
        )}
      </div>
    </Html>
  )
}

// ─── 카메라 스크롤 컨트롤러 ─────────────────────────────────────────────────

function CameraController({ nodeCount }: { nodeCount: number }) {
  const { camera } = useThree()
  const targetZ = useRef(START_Z)
  const minZ = -(nodeCount - 1) * Z_SPACING - 8

  useEffect(() => {
    const handleWheel = (e: WheelEvent) => {
      e.preventDefault()
      // 아래로 스크롤 → 과거로 이동 (Z 감소)
      targetZ.current = Math.max(
        minZ,
        Math.min(START_Z, targetZ.current - e.deltaY * 0.03)
      )
    }
    window.addEventListener('wheel', handleWheel, { passive: false })
    return () => window.removeEventListener('wheel', handleWheel)
  }, [minZ])

  useFrame(() => {
    camera.position.z += (targetZ.current - camera.position.z) * 0.09
  })

  return null
}

// ─── 씬 ──────────────────────────────────────────────────────────────────────

interface SceneProps {
  nodes: MemoData[]
  edges: {
    edge_id: string
    source_node_id: string
    target_node_id: string
    similarity_score: number
  }[]
  selectedNodeId: string | null
  onNodeClick: (id: string) => void
  onPaneClick: () => void
}

function Scene({ nodes, edges, selectedNodeId, onNodeClick, onPaneClick }: SceneProps) {
  const positions = useMemo(() => buildPositions(nodes), [nodes])

  return (
    <>
      {/* 엣지 (카드 뒤에 렌더링됨) */}
      {edges.map((edge) => {
        const from = positions.get(edge.source_node_id)
        const to = positions.get(edge.target_node_id)
        if (!from || !to) return null
        return (
          <Line
            key={edge.edge_id}
            points={[
              from.toArray() as [number, number, number],
              to.toArray() as [number, number, number],
            ]}
            color="#a78bfa"
            lineWidth={0.4 + edge.similarity_score * 1.2}
            opacity={0.1 + edge.similarity_score * 0.28}
            transparent
          />
        )
      })}

      {/* 카드 노드 */}
      {nodes.map((node) => {
        const pos = positions.get(node.node_id)
        if (!pos) return null
        return (
          <MemoCard
            key={node.node_id}
            node={node}
            position={pos}
            selected={node.node_id === selectedNodeId}
            onClick={() => onNodeClick(node.node_id)}
          />
        )
      })}

      {/* 배경 클릭 → 패널 닫기 */}
      <mesh position={[0, 0, -9999]} onClick={onPaneClick} visible={false}>
        <planeGeometry args={[99999, 99999]} />
        <meshBasicMaterial />
      </mesh>

      <CameraController nodeCount={nodes.length} />
    </>
  )
}

// ─── 메인 ────────────────────────────────────────────────────────────────────

export default function TunnelView() {
  const { data, isLoading, isError } = useGraph()
  const { selectedNodeId, selectNode, closePanel } = useUiStore()

  if (isLoading) {
    return (
      <div
        className="flex-1 flex items-center justify-center flex-col gap-3"
        style={{ color: '#9b97b2' }}
      >
        <svg
          className="animate-spin"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <path d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" strokeOpacity="0.3" />
          <path d="M21 12a9 9 0 00-9-9" />
        </svg>
        <span className="text-sm">불러오는 중...</span>
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
      <div
        className="flex-1 flex items-center justify-center flex-col gap-3"
        style={{ color: '#6b6880' }}
      >
        <div className="text-center">
          <p className="text-sm font-medium" style={{ color: '#9b97b2' }}>
            아직 메모가 없어요
          </p>
          <p className="text-xs mt-1">홈으로 돌아가 첫 메모를 작성해보세요</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex-1 relative overflow-hidden">
      <Canvas
        camera={{ position: [0, 0, START_Z], fov: 55 }}
        style={{ background: 'radial-gradient(ellipse at 50% 40%, #120a2a 0%, #07070f 70%)' }}
        gl={{ antialias: true, alpha: false }}
      >
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
        <svg
          width="12"
          height="12"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <path d="M12 5v14M5 12l7 7 7-7" />
        </svg>
        스크롤 — 과거 메모로 이동
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
