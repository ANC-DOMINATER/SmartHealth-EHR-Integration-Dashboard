import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "@/hooks/use-toast"

// Generic hook for API queries with error handling
export function useApiQuery<T>(
  key: string[],
  queryFn: () => Promise<T>,
  options?: {
    enabled?: boolean
    staleTime?: number
    refetchOnWindowFocus?: boolean
  },
) {
  return useQuery({
    queryKey: key,
    queryFn,
    staleTime: options?.staleTime ?? 5 * 60 * 1000, // 5 minutes default
    refetchOnWindowFocus: options?.refetchOnWindowFocus ?? false,
    enabled: options?.enabled ?? true,
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.response?.data?.message || "An error occurred",
        variant: "destructive",
      })
    },
  })
}

// Generic hook for API mutations with success/error handling
export function useApiMutation<TData, TVariables>(
  mutationFn: (variables: TVariables) => Promise<TData>,
  options?: {
    onSuccess?: (data: TData, variables: TVariables) => void
    onError?: (error: any, variables: TVariables) => void
    invalidateQueries?: string[][]
    successMessage?: string
  },
) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn,
    onSuccess: (data, variables) => {
      // Show success message
      if (options?.successMessage) {
        toast({
          title: "Success",
          description: options.successMessage,
        })
      }

      // Invalidate related queries
      if (options?.invalidateQueries) {
        options.invalidateQueries.forEach((queryKey) => {
          queryClient.invalidateQueries({ queryKey })
        })
      }

      // Custom success handler
      options?.onSuccess?.(data, variables)
    },
    onError: (error: any, variables) => {
      // Show error message
      toast({
        title: "Error",
        description: error.response?.data?.message || "An error occurred",
        variant: "destructive",
      })

      // Custom error handler
      options?.onError?.(error, variables)
    },
  })
}
