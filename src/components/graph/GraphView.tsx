import { useCallback, useEffect, useRef } from 'react'
import {
  ReactFlow,
  Background,
  Controls,
  useNodesState,
  useEdgesState,
  BackgroundVariant,
  type NodeMouseHandler,
  type Node as RFNode,
  type Edge as RFEdge,
} from '@xyflow/react'
import '@xyflow/react/dist/style.css'
import { useGraph } from '../../hooks/useGraph'
import { useUiStore } from '../../store/useUiStore'
import MemoNode from './MemoNode'
import NodeDetailPanel from './NodeDetailPanel'
import type { Node as MemoData, Edge as MemoEdge } from '../../types'

const nodeTypes = { memo: MemoNode }

// ─── Force-directed layout ────────────────────────────────────────────────────

function runForceLayout(
  nodes: MemoData[],
  edges: MemoEdge[]
): Map<string, { x: number; y: number }> {
  const n = nodes.length
  if (n === 0) return new Map()

  // 결정론적 초기 배치 (원형)
  type Particle = { x: number; y: number; vx: number; vy: number }
  const particles = new Map<string, Particle>()
  nodes.forEach((node, i) => {
    const angle = (i / n) * 2 * Math.PI
    const r = 300 + n * 8
    particles.set(node.node_id, { x: r * Math.cos(angle), y: r * Math.sin(angle), vx: 0, vy: 0 })
  })

  const ids = nodes.map((n) => n.node_id)
  const k = Math.sqrt((1400 * 1000) / Math.max(1, n)) // 이상적 거리
  const ITERATIONS = 280

  for (let iter = 0; iter < ITERATIONS; iter++) {
    const cooling = Math.max(0.05, 1 - iter / ITERATIONS)

    // 반발력 (모든 쌍)
    for (let i = 0; i < ids.length; i++) {
      for (let j = i + 1; j < ids.length; j++) {
        const pi = particles.get(ids[i])!
        const pj = particles.get(ids[j])!
        const dx = pi.x - pj.x || 0.01
        const dy = pi.y - pj.y || 0.01
        const dist = Math.sqrt(dx * dx + dy * dy) || 0.01
        const rep = (k * k) / dist
        const fx = (dx / dist) * rep
        const fy = (dy / dist) * rep
        pi.vx += fx; pi.vy += fy
        pj.vx -= fx; pj.vy -= fy
      }
    }

    // 인력 (엣지: 유사도 높을수록 강하게 당김)
    for (const edge of edges) {
      const ps = particles.get(edge.source_node_id)
      const pt = particles.get(edge.target_node_id)
      if (!ps || !pt) continue
      const dx = pt.x - ps.x
      const dy = pt.y - ps.y
      const dist = Math.sqrt(dx * dx + dy * dy) || 0.01
      const targetDist = k * (1.2 - edge.similarity_score * 0.7)
      const attrForce = ((dist - targetDist) / dist) * 0.4 * edge.similarity_score
      const fx = dx * attrForce
      const fy = dy * attrForce
      ps.vx += fx; ps.vy += fy
      pt.vx -= fx; pt.vy -= fy
    }

    // 속도 적용 + 냉각
    for (const p of particles.values()) {
      const speed = Math.sqrt(p.vx * p.vx + p.vy * p.vy)
      const maxSpeed = k * cooling * 0.6
      if (speed > maxSpeed && speed > 0) {
        p.vx = (p.vx / speed) * maxSpeed
        p.vy = (p.vy / speed) * maxSpeed
      }
      p.x += p.vx
      p.y += p.vy
      p.vx *= 0.82
      p.vy *= 0.82
    }
  }

  return new Map(Array.from(particles.entries()).map(([id, p]) => [id, { x: p.x, y: p.y }]))
}

// 최신 노드일수록 넓은 카드
function computeNodeWidths(nodes: MemoData[]): Map<string, number> {
  if (nodes.length === 0) return new Map()
  const times = nodes.map((n) => new Date(n.created_at).getTime())
  const minT = Math.min(...times)
  const maxT = Math.max(...times)
  const range = maxT - minT || 1
  return new Map(
    nodes.map((n) => {
      const age = (new Date(n.created_at).getTime() - minT) / range // 0=가장 오래됨, 1=최신
      return [n.node_id, Math.round(160 + age * 80)] // 160 ~ 240px
    })
  )
}

// ─── GraphView ────────────────────────────────────────────────────────────────

export default function GraphView() {
  const { data, isLoading, isError } = useGraph()
  const { selectedNodeId, selectNode, closePanel } = useUiStore()

  const [rfNodes, setRfNodes, onNodesChange] = useNodesState<RFNode>([])
  const [rfEdges, setRfEdges, onEdgesChange] = useEdgesState<RFEdge>([])

  // 레이아웃은 data 변경 시에만 계산
  const layoutRef = useRef<{
    positions: Map<string, { x: number; y: number }>
    widths: Map<string, number>
  } | null>(null)

  useEffect(() => {
    if (!data) return
    const positions = runForceLayout(data.nodes, data.edges)
    const widths = computeNodeWidths(data.nodes)
    layoutRef.current = { positions, widths }

    setRfEdges(
      data.edges.map((edge) => ({
        id: edge.edge_id,
        source: edge.source_node_id,
        target: edge.target_node_id,
        style: {
          stroke: `rgba(167,139,250,${0.15 + edge.similarity_score * 0.5})`,
          strokeWidth: 1 + edge.similarity_score * 1.5,
        },
        animated: edge.similarity_score > 0.7,
      }))
    )
  }, [data]) // eslint-disable-line react-hooks/exhaustive-deps

  // 선택 상태 변경 시 위치 재계산 없이 노드만 업데이트
  useEffect(() => {
    if (!data || !layoutRef.current) return
    const { positions, widths } = layoutRef.current

    setRfNodes(
      data.nodes.map((node) => {
        const pos = positions.get(node.node_id) ?? { x: 0, y: 0 }
        const nodeWidth = widths.get(node.node_id) ?? 180
        return {
          id: node.node_id,
          type: 'memo',
          position: pos,
          data: { ...node, nodeWidth } as unknown as Record<string, unknown>,
          selected: node.node_id === selectedNodeId,
        }
      })
    )
  }, [data, selectedNodeId]) // eslint-disable-line react-hooks/exhaustive-deps

  const handleNodeClick: NodeMouseHandler = useCallback(
    (_event, node) => selectNode(node.id),
    [selectNode]
  )

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center flex-col gap-3" style={{ color: '#9b97b2' }}>
        <svg className="animate-spin" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" strokeOpacity="0.3" />
          <path d="M21 12a9 9 0 00-9-9" />
        </svg>
        <span className="text-sm">그래프 불러오는 중...</span>
      </div>
    )
  }

  if (isError) {
    return (
      <div className="flex-1 flex items-center justify-center" style={{ color: '#9b97b2' }}>
        <p className="text-sm">그래프를 불러오지 못했어요.</p>
      </div>
    )
  }

  if (!data || data.nodes.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center flex-col gap-3" style={{ color: '#6b6880' }}>
        <svg width="44" height="44" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" strokeOpacity="0.35">
          <circle cx="12" cy="12" r="3" />
          <circle cx="4" cy="6" r="2" /><circle cx="20" cy="6" r="2" />
          <circle cx="4" cy="18" r="2" /><circle cx="20" cy="18" r="2" />
          <line x1="12" y1="12" x2="4" y2="6" /><line x1="12" y1="12" x2="20" y2="6" />
          <line x1="12" y1="12" x2="4" y2="18" /><line x1="12" y1="12" x2="20" y2="18" />
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
      <ReactFlow
        nodes={rfNodes}
        edges={rfEdges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onNodeClick={handleNodeClick}
        onPaneClick={closePanel}
        nodeTypes={nodeTypes}
        fitView
        fitViewOptions={{ padding: 0.25 }}
        minZoom={0.15}
        maxZoom={2}
        proOptions={{ hideAttribution: true }}
        style={{ background: 'transparent' }}
      >
        <Background variant={BackgroundVariant.Dots} gap={32} size={1} color="rgba(255,255,255,0.04)" />
        <Controls showInteractive={false} />
      </ReactFlow>

      {selectedNodeId && data && (
        <NodeDetailPanel
          node={data.nodes.find((n) => n.node_id === selectedNodeId) ?? null}
          onClose={closePanel}
        />
      )}
    </div>
  )
}
