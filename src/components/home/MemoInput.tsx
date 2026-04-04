import { useState, useRef } from 'react'
import { useCreateNode } from '../../hooks/useCreateNode'
import { useUiStore } from '../../store/useUiStore'
import Toast from '../ui/Toast'
import axios from 'axios'

export default function MemoInput() {
  const [text, setText] = useState('')
  const [toast, setToast] = useState<{ message: string; type: 'error' | 'info' } | null>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const { mutate: createNode, isPending } = useCreateNode()
  const setViewMode = useUiStore((s) => s.setViewMode)

  const handleSubmit = () => {
    const trimmed = text.trim()
    if (!trimmed || isPending) return

    createNode(trimmed, {
      onSuccess: () => {
        setText('')
        setViewMode('2d')
      },
      onError: (error) => {
        if (axios.isAxiosError(error) && error.response?.status === 409) {
          setToast({ message: '이미 비슷한 메모가 있어요', type: 'info' })
        } else {
          setToast({ message: '메모 저장에 실패했어요. 다시 시도해주세요.', type: 'error' })
        }
      },
    })
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSubmit()
    }
  }

  // 입력에 따라 textarea 높이 자동 조절
  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setText(e.target.value)
    const el = textareaRef.current
    if (el) {
      el.style.height = 'auto'
      el.style.height = `${Math.min(el.scrollHeight, 160)}px`
    }
  }

  return (
    <>
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}

      <div
        className="w-full max-w-2xl rounded-2xl transition-all duration-200"
        style={{
          background: 'rgba(255,255,255,0.04)',
          border: '1px solid rgba(255,255,255,0.08)',
          boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
        }}
      >
        <textarea
          ref={textareaRef}
          value={text}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          placeholder="메모를 입력하세요... (Enter로 전송, Shift+Enter로 줄바꿈)"
          rows={1}
          className="w-full bg-transparent resize-none outline-none px-5 pt-4 pb-2 text-sm leading-relaxed"
          style={{
            color: '#f1f0f5',
            caretColor: '#a78bfa',
            minHeight: 52,
          }}
        />

        {/* 하단 툴바 */}
        <div className="flex items-center justify-between px-4 pb-3">
          <span className="text-xs" style={{ color: '#4b4860' }}>
            {text.length > 0 ? `${text.length}자` : 'Enter로 전송'}
          </span>
          <button
            onClick={handleSubmit}
            disabled={!text.trim() || isPending}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-150 cursor-pointer"
            style={{
              background: text.trim() && !isPending ? '#7c3aed' : 'rgba(255,255,255,0.06)',
              color: text.trim() && !isPending ? '#fff' : '#4b4860',
              boxShadow: text.trim() && !isPending ? '0 0 16px rgba(124,58,237,0.4)' : 'none',
            }}
          >
            {isPending ? (
              <>
                <svg className="animate-spin" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" strokeOpacity="0.3" />
                  <path d="M21 12a9 9 0 00-9-9" />
                </svg>
                처리 중
              </>
            ) : (
              <>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="22" y1="2" x2="11" y2="13" />
                  <polygon points="22 2 15 22 11 13 2 9 22 2" />
                </svg>
                전송
              </>
            )}
          </button>
        </div>
      </div>
    </>
  )
}
