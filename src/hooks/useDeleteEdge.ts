import { useMutation, useQueryClient } from '@tanstack/react-query'
import { deleteEdge } from '../api/edges'

export function useDeleteEdge() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (edgeId: string) => deleteEdge(edgeId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['graph'] })
    },
  })
}
