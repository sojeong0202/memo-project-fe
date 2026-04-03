import { useMutation, useQueryClient } from '@tanstack/react-query'
import { createNode } from '../api/nodes'

export function useCreateNode() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (text: string) => createNode(text),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['graph'] })
    },
  })
}
