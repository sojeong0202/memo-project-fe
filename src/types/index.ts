// 백엔드 API 응답 타입

export interface Node {
  node_id: string
  user_id?: string
  original_text: string
  summary: string
  keywords: string[]
  category_color: string
  created_at: string
  updated_at?: string
}

export interface Edge {
  edge_id: string
  source_node_id: string
  target_node_id: string
  similarity_score: number
  is_manual: boolean
}

export interface GraphData {
  nodes: Node[]
  edges: Edge[]
}

export interface User {
  user_id: string
  email: string
  google_id: string
}

// UI 상태 타입

export type ViewMode = 'home' | '2d' | '3d'
