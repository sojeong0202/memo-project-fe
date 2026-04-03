import { create } from 'zustand'
import type { ViewMode } from '../types'

interface UiState {
  viewMode: ViewMode
  selectedNodeId: string | null
  isPanelOpen: boolean
  setViewMode: (mode: ViewMode) => void
  selectNode: (nodeId: string) => void
  closePanel: () => void
}

export const useUiStore = create<UiState>()((set) => ({
  viewMode: 'home',
  selectedNodeId: null,
  isPanelOpen: false,
  setViewMode: (mode) => set({ viewMode: mode, selectedNodeId: null, isPanelOpen: false }),
  selectNode: (nodeId) => set({ selectedNodeId: nodeId, isPanelOpen: true }),
  closePanel: () => set({ selectedNodeId: null, isPanelOpen: false }),
}))
