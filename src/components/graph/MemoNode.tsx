import { Handle, Position, type NodeProps } from '@xyflow/react'
import type { Node as MemoData } from '../../types'

export default function MemoNode({ data: rawData, selected }: NodeProps) {
  const data = rawData as unknown as MemoData
  return (
    <>
      <Handle
        type="target"
        position={Position.Top}
        style={{ opacity: 0, pointerEvents: 'none' }}
      />

      <div
        style={{
          background: selected
            ? 'rgba(167,139,250,0.1)'
            : 'rgba(255,255,255,0.04)',
          border: `1.5px solid ${selected ? '#a78bfa' : data.category_color + '99'}`,
          borderRadius: 12,
          padding: '10px 14px',
          minWidth: 150,
          maxWidth: 210,
          backdropFilter: 'blur(8px)',
          boxShadow: selected
            ? '0 0 20px rgba(167,139,250,0.25)'
            : `0 0 10px ${data.category_color}22`,
          transition: 'all 0.15s ease',
          cursor: 'pointer',
        }}
      >
        {/* 카테고리 컬러 인디케이터 */}
        <div
          style={{
            width: 8,
            height: 8,
            borderRadius: '50%',
            background: data.category_color,
            marginBottom: 8,
            boxShadow: `0 0 6px ${data.category_color}88`,
          }}
        />

        {/* 요약 텍스트 */}
        <p
          style={{
            color: '#f1f0f5',
            fontSize: 12,
            lineHeight: 1.6,
            margin: 0,
            display: '-webkit-box',
            WebkitLineClamp: 3,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
          }}
        >
          {data.summary}
        </p>

        {/* 키워드 */}
        {data.keywords.length > 0 && (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginTop: 8 }}>
            {data.keywords.slice(0, 3).map((kw) => (
              <span
                key={kw}
                style={{
                  fontSize: 10,
                  padding: '1px 7px',
                  borderRadius: 20,
                  background: `${data.category_color}18`,
                  color: data.category_color,
                  border: `1px solid ${data.category_color}40`,
                }}
              >
                {kw}
              </span>
            ))}
          </div>
        )}
      </div>

      <Handle
        type="source"
        position={Position.Bottom}
        style={{ opacity: 0, pointerEvents: 'none' }}
      />
    </>
  )
}
