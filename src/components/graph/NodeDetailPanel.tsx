import { useState } from 'react'
import type { Node } from '../../types'
import { useDeleteNode } from '../../hooks/useDeleteNode'
import { useUiStore } from '../../store/useUiStore'

interface NodeDetailPanelProps {
  node: Node | null
  onClose: () => void
}

export default function NodeDetailPanel({ node, onClose }: NodeDetailPanelProps) {
  const [confirmDelete, setConfirmDelete] = useState(false)
  const { mutate: deleteNode, isPending } = useDeleteNode()
  const closePanel = useUiStore((s) => s.closePanel)

  if (!node) return null

  const handleDelete = () => {
    if (!confirmDelete) {
      setConfirmDelete(true)
      return
    }
    deleteNode(node.node_id, {
      onSuccess: () => closePanel(),
    })
  }

  const formattedDate = new Date(node.created_at).toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })

  return (
    <div
      style={{
        position: 'absolute',
        top: 0,
        right: 0,
        width: 320,
        height: '100%',
        background: 'rgba(10,8,20,0.85)',
        backdropFilter: 'blur(20px)',
        borderLeft: '1px solid rgba(255,255,255,0.08)',
        display: 'flex',
        flexDirection: 'column',
        zIndex: 10,
        animation: 'slideInRight 0.2s ease',
      }}
    >
      {/* 헤더 */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '16px 20px',
          borderBottom: '1px solid rgba(255,255,255,0.06)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div
            style={{
              width: 10,
              height: 10,
              borderRadius: '50%',
              background: node.category_color,
              boxShadow: `0 0 8px ${node.category_color}88`,
            }}
          />
          <span style={{ color: '#9b97b2', fontSize: 12 }}>메모 상세</span>
        </div>
        <button
          onClick={onClose}
          style={{
            background: 'none',
            border: 'none',
            color: '#6b6880',
            cursor: 'pointer',
            padding: 4,
            display: 'flex',
            alignItems: 'center',
          }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>
      </div>

      {/* 내용 */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '20px' }}>
        {/* 키워드 */}
        {node.keywords.length > 0 && (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 16 }}>
            {node.keywords.map((kw) => (
              <span
                key={kw}
                style={{
                  fontSize: 11,
                  padding: '3px 10px',
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

        {/* AI 요약 */}
        <div style={{ marginBottom: 20 }}>
          <p style={{ color: '#6b6880', fontSize: 11, marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            AI 요약
          </p>
          <p style={{ color: '#c4b5fd', fontSize: 13, lineHeight: 1.7, margin: 0 }}>
            {node.summary}
          </p>
        </div>

        {/* 구분선 */}
        <div style={{ height: 1, background: 'rgba(255,255,255,0.06)', marginBottom: 20 }} />

        {/* 원본 메모 */}
        <div style={{ marginBottom: 20 }}>
          <p style={{ color: '#6b6880', fontSize: 11, marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            원본 메모
          </p>
          <p style={{ color: '#f1f0f5', fontSize: 13, lineHeight: 1.8, margin: 0, whiteSpace: 'pre-wrap' }}>
            {node.original_text}
          </p>
        </div>

        {/* 날짜 */}
        <p style={{ color: '#4b4860', fontSize: 11 }}>{formattedDate}</p>
      </div>

      {/* 하단 삭제 버튼 */}
      <div style={{ padding: '16px 20px', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
        <button
          onClick={handleDelete}
          disabled={isPending}
          style={{
            width: '100%',
            padding: '10px',
            borderRadius: 10,
            border: confirmDelete
              ? '1px solid rgba(239,68,68,0.5)'
              : '1px solid rgba(255,255,255,0.08)',
            background: confirmDelete
              ? 'rgba(239,68,68,0.12)'
              : 'rgba(255,255,255,0.04)',
            color: confirmDelete ? '#f87171' : '#6b6880',
            fontSize: 13,
            cursor: isPending ? 'default' : 'pointer',
            transition: 'all 0.15s ease',
          }}
        >
          {isPending ? '삭제 중...' : confirmDelete ? '정말 삭제할까요? 다시 클릭하세요' : '메모 삭제'}
        </button>
        {confirmDelete && !isPending && (
          <button
            onClick={() => setConfirmDelete(false)}
            style={{
              width: '100%',
              marginTop: 6,
              padding: '6px',
              background: 'none',
              border: 'none',
              color: '#6b6880',
              fontSize: 12,
              cursor: 'pointer',
            }}
          >
            취소
          </button>
        )}
      </div>
    </div>
  )
}
