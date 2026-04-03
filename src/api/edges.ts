import { apiClient } from './client'

export async function deleteEdge(edgeId: string): Promise<void> {
  await apiClient.delete(`/api/edges/${edgeId}`)
}
