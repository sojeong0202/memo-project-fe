import { apiClient } from './client'
import type { Node, Edge } from '../types'

export interface CreateNodeResponse {
  node: Node
  new_edges: Edge[]
}

export async function createNode(text: string): Promise<CreateNodeResponse> {
  const res = await apiClient.post<CreateNodeResponse>('/api/nodes', { text })
  return res.data
}

export async function fetchNode(nodeId: string): Promise<Node> {
  const res = await apiClient.get<Node>(`/api/nodes/${nodeId}`)
  return res.data
}

export async function updateNode(nodeId: string, summary: string): Promise<Node> {
  const res = await apiClient.patch<Node>(`/api/nodes/${nodeId}`, { summary })
  return res.data
}

export async function deleteNode(nodeId: string): Promise<void> {
  await apiClient.delete(`/api/nodes/${nodeId}`)
}
