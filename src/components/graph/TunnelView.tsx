import { useRef, useEffect, useState, useMemo } from 'react'
import { useGraph } from '../../hooks/useGraph'
import { useUiStore } from '../../store/useUiStore'
import NodeDetailPanel from './NodeDetailPanel'
import type { Node as MemoData } from '../../types'

const CARD_WIDTH = 220
const CARD_HEIGHT = 158  // 카드 렌더 높이 추정치 (엣지 연결점 계산용)
const CARD_GAP_H = 24    // 같은 행 내 카드 간격
const ROW_GAP = 80       // 행 간 수직 간격 (카드 아래 끝 ~ 다음 카드 위 시작)
const PADDING_V = 48
const PADDING_H = 40
const TIME_BUCKET_MS = 10 * 60 * 1000  // 10분 이내 = 같은 행

interface NodePos { x: number; y: number }

// 노드를 시간 버킷(행)으로 그루핑, 픽셀 좌표 계산
function computeLayout(nodes: MemoData[], containerWidth: number) {
  if (nodes.length === 0) return { positions: new Map<string, NodePos>(), totalHeight: 400 }

  // 오래된 것 → 위 (낮은 Y), 최신 → 아래 (높은 Y)
  const sorted = [...nodes].sort(
    (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
  )

  // 시간 버킷으로 그루핑
  const rows: MemoData[][] = []
  let current: MemoData[] = [sorted[0]]

  for (let i = 1; i < sorted.length; i++) {
    const dt =
      new Date(sorted[i].created_at).getTime() -
      new Date(sorted[i - 1].created_at).getTime()
    if (dt > TIME_BUCKET_MS) {
      rows.push(current)
      current = []
    }
    current.push(sorted[i])
  }
  rows.push(current)

  const positions = new Map<string, NodePos>()
  let y = PADDING_V

  rows.forEach((row) => {
    // 행 내 카드들을 가로로 가운데 정렬
    const rowWidth = row.length * CARD_WIDTH + (row.length - 1) * CARD_GAP_H
    const startX = Math.max(PADDING_H, (containerWidth - rowWidth) / 2)

    row.forEach((node, colIdx) => {
      positions.set(node.node_id, {
        x: startX + colIdx * (CARD_WIDTH + CARD_GAP_H),
        y,
      })
    })

    y += CARD_HEIGHT + ROW_GAP
  })

  return { positions, totalHeight: y + PADDING_V }
}

// SVG 엣지: 두 카드의 중심을 cubic bezier로 연결
interface EdgePathProps {
  from: NodePos
  to: NodePos
  score: number
}

function EdgePath({ from, to, score }: EdgePathProps) {
  const sx = from.x + CARD_WIDTH / 2
  const sy = from.y + CARD_HEIGHT / 2
  const tx = to.x + CARD_WIDTH / 2
  const ty = to.y + CARD_HEIGHT / 2

  // 두 점 사이를 자연스럽게 잇는 cubic bezier
  const dy = ty - sy
  const vOffset = Math.max(50, Math.abs(dy) * 0.45)
  const d = `M ${sx} ${sy} C ${sx} ${sy + vOffset}, ${tx} ${ty - vOffset}, ${tx} ${ty}`

  return (
    <path
      d={d}
      fill="none"
      stroke="#a78bfa"
      strokeWidth={0.8 + score * 1.8}
      strokeOpacity={0.18 + score * 0.38}
    />
  )
}

// 메모 카드 (2D 뷰와 동일한 스타일)
interface MemoCardProps {
  node: MemoData
  pos: NodePos
  selected: boolean
  onClick: () => void
}

function MemoCard({ node, pos, selected, onClick }: MemoCardProps) {
  return (
    <div
      onClick={(e) => { e.stopPropagation(); onClick() }}
      style={{
        position: 'absolute',
        left: pos.x,
        top: pos.y,
        width: CARD_WIDTH,
        background: selected ? 'rgba(167,139,250,0.1)' : 'rgba(255,255,255,0.04)',
        border: `1.5px solid ${selected ? '#a78bfa' : node.category_color + '88'}`,
        borderRadius: 12,
        padding: '10px 14px',
        backdropFilter: 'blur(8px)',
        boxShadow: selected
          ? '0 0 20px rgba(167,139,250,0.25)'
          : `0 0 10px ${node.category_color}22`,
        cursor: 'pointer',
        transition: 'border-color 0.15s, box-shadow 0.15s',
        boxSizing: 'border-box',
      }}
    >
      {/* 카테고리 컬러 */}
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
  )
}

// ─── 메인 ────────────────────────────────────────────────────────────────────

export default function TunnelView() {
  const { data, isLoading, isError } = useGraph()
  const { selectedNodeId, selectNode, closePanel } = useUiStore()
  const containerRef = useRef<HTMLDivElement>(null)
  const [containerWidth, setContainerWidth] = useState(900)

  // 컨테이너 너비 감지
  useEffect(() => {
    const el = containerRef.current
    if (!el) return
    const obs = new ResizeObserver((entries) => {
      setContainerWidth(entries[0].contentRect.width)
    })
    obs.observe(el)
    return () => obs.disconnect()
  }, [])

  const { positions, totalHeight } = useMemo(
    () => computeLayout(data?.nodes ?? [], containerWidth),
    [data, containerWidth]
  )

  // 최신 메모(아래)로 초기 스크롤
  useEffect(() => {
    if (containerRef.current && data?.nodes.length) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight
    }
  }, [data])

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center flex-col gap-3" style={{ color: '#9b97b2' }}>
        <svg className="animate-spin" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
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
      <div className="flex-1 flex items-center justify-center flex-col gap-3" style={{ color: '#6b6880' }}>
        <p className="text-sm font-medium" style={{ color: '#9b97b2' }}>아직 메모가 없어요</p>
        <p className="text-xs">홈으로 돌아가 첫 메모를 작성해보세요</p>
      </div>
    )
  }

  return (
    <div className="flex-1 relative overflow-hidden">
      {/* 스크롤 컨테이너 */}
      <div
        ref={containerRef}
        onClick={closePanel}
        style={{
          width: '100%',
          height: '100%',
          overflowY: 'auto',
          overflowX: 'hidden',
          position: 'relative',
        }}
      >
        {/* 내부 캔버스 */}
        <div
          style={{
            position: 'relative',
            width: '100%',
            height: totalHeight,
          }}
        >
          {/* SVG 엣지 레이어 */}
          <svg
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: totalHeight,
              pointerEvents: 'none',
              overflow: 'visible',
            }}
          >
            {data.edges.map((edge) => {
              const from = positions.get(edge.source_node_id)
              const to = positions.get(edge.target_node_id)
              if (!from || !to) return null
              return (
                <EdgePath
                  key={edge.edge_id}
                  from={from}
                  to={to}
                  score={edge.similarity_score}
                />
              )
            })}
          </svg>

          {/* 카드 노드 레이어 */}
          {data.nodes.map((node) => {
            const pos = positions.get(node.node_id)
            if (!pos) return null
            return (
              <MemoCard
                key={node.node_id}
                node={node}
                pos={pos}
                selected={node.node_id === selectedNodeId}
                onClick={() => selectNode(node.node_id)}
              />
            )
          })}
        </div>
      </div>

      {/* 스크롤 힌트 (처음에만 표시) */}
      <div
        style={{
          position: 'absolute',
          top: 16,
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
          <path d="M12 19V5M5 12l7-7 7 7" />
        </svg>
        위로 스크롤 — 과거 메모 보기
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
