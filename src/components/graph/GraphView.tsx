import { useCallback, useEffect } from 'react'
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

const nodeTypes = { memo: MemoNode }

// 황금각(golden angle) 기반 phyllotaxis 레이아웃 — 자연스럽게 퍼짐
function computePositions(count: number): Array<{ x: number; y: number }> {
  const goldenAngle = Math.PI * (3 - Math.sqrt(5))
  return Array.from({ length: count }, (_, i) => {
    const radius = i === 0 ? 0 : 150 * Math.sqrt(i)
    const angle = i * goldenAngle
    return {
      x: radius * Math.cos(angle),
      y: radius * Math.sin(angle),
    }
  })
}

export default function GraphView() {
  const { data, isLoading, isError } = useGraph()
  const { selectedNodeId, selectNode, closePanel } = useUiStore()

  const [rfNodes, setRfNodes, onNodesChange] = useNodesState<RFNode>([])
  const [rfEdges, setRfEdges, onEdgesChange] = useEdgesState<RFEdge>([])

  useEffect(() => {
    if (!data) return

    const positions = computePositions(data.nodes.length)

    setRfNodes(
      data.nodes.map((node, i) => ({
        id: node.node_id,
        type: 'memo',
        position: positions[i],
        data: node as unknown as Record<string, unknown>,
        selected: node.node_id === selectedNodeId,
      }))
    )

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
  }, [data, selectedNodeId]) // eslint-disable-line react-hooks/exhaustive-deps

  const handleNodeClick: NodeMouseHandler = useCallback(
    (_event, node) => {
      selectNode(node.id)
    },
    [selectNode]
  )

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
      <div
        className="flex-1 flex items-center justify-center flex-col gap-3"
        style={{ color: '#6b6880' }}
      >
        <svg
          width="44"
          height="44"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.2"
          strokeOpacity="0.35"
        >
          <circle cx="12" cy="12" r="3" />
          <circle cx="4" cy="6" r="2" />
          <circle cx="20" cy="6" r="2" />
          <circle cx="4" cy="18" r="2" />
          <circle cx="20" cy="18" r="2" />
          <line x1="12" y1="12" x2="4" y2="6" />
          <line x1="12" y1="12" x2="20" y2="6" />
          <line x1="12" y1="12" x2="4" y2="18" />
          <line x1="12" y1="12" x2="20" y2="18" />
        </svg>
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
      <ReactFlow
        nodes={rfNodes}
        edges={rfEdges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onNodeClick={handleNodeClick}
        onPaneClick={closePanel}
        nodeTypes={nodeTypes}
        fitView
        fitViewOptions={{ padding: 0.3 }}
        minZoom={0.2}
        maxZoom={2}
        proOptions={{ hideAttribution: true }}
        style={{ background: 'transparent' }}
      >
        <Background
          variant={BackgroundVariant.Dots}
          gap={32}
          size={1}
          color="rgba(255,255,255,0.04)"
        />
        <Controls
          style={{
            background: 'rgba(255,255,255,0.05)',
            border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: 8,
          }}
        />
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
