import { useMutation, useQueryClient } from '@tanstack/react-query'
import { deleteNode } from '../api/nodes'

export function useDeleteNode() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (nodeId: string) => deleteNode(nodeId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['graph'] })
    },
  })
}
