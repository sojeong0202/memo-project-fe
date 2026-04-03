import { apiClient } from './client'
import type { GraphData } from '../types'

export async function fetchGraph(): Promise<GraphData> {
  const res = await apiClient.get<GraphData>('/api/graph')
  return res.data
}
