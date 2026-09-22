import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { EdgePayload, EdgeListParams } from '../hooks/edge.types';
import { edgeService } from './edge.service';
import toast from 'react-hot-toast';

// Central query key so invalidation stays consistent across all edge hooks
export const EDGE_QUERY_KEY = 'edges';

/** Fetch a paginated/filtered list of edges */
export const useEdges = (params?: EdgeListParams) => {
  return useQuery({
    queryKey: [EDGE_QUERY_KEY, 'list', params],
    queryFn: () => edgeService.getAll(params),
  });
};

/** Fetch a single edge by id */
export const useEdgeById = (id?: string) => {
  return useQuery({
    queryKey: [EDGE_QUERY_KEY, 'detail', id],
    queryFn: () => edgeService.getById(id as string),
    enabled: !!id,
  });
};

/** Create a new edge/gateway */
export const useCreateEdge = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: EdgePayload) => edgeService.create(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [EDGE_QUERY_KEY, 'list'] });
      toast.success('Edge created successfully');
    },
    onError: (error) => {
      toast.error('Failed to create edge');
      console.error(error);
    },
  });
};

/** Full update (PUT) of an edge */
export const useUpdateEdge = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: string;
      payload: Partial<EdgePayload>;
    }) => edgeService.update(id, payload),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: [EDGE_QUERY_KEY, 'list'] });
      queryClient.invalidateQueries({
        queryKey: [EDGE_QUERY_KEY, 'detail', variables.id],
      });
    },
  });
};

/** Partial update (PATCH) of an edge */
export const usePatchEdge = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: string;
      payload: Partial<EdgePayload>;
    }) => edgeService.patch(id, payload),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: [EDGE_QUERY_KEY, 'list'] });
      queryClient.invalidateQueries({
        queryKey: [EDGE_QUERY_KEY, 'detail', variables.id],
      });
    },
  });
};

/** Delete an edge */
export const useDeleteEdge = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => edgeService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [EDGE_QUERY_KEY, 'list'] });
    },
  });
};

/** Trigger a manual sync on a gateway */
export const useTriggerEdgeSync = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => edgeService.triggerSync(id),
    onSuccess: (_data, id) => {
      queryClient.invalidateQueries({
        queryKey: [EDGE_QUERY_KEY, 'detail', id],
      });
    },
  });
};
