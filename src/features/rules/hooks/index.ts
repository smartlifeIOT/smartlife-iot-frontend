import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  rulesChainApi,
  queuesApi,
  defaultRuleChainsApi,
} from '@/services/api';
import type {
  RuleChain,
  RuleChainQuery,
} from '@/services/api/rules-chain.api';
import type { Queue, QueueQuery } from '@/services/api/queues.api';
import type {
  DefaultRuleChain,
  DefaultRuleChainQuery,
} from '@/services/api/default-rule-chains.api';

// ============================================
// Rule Chain Hooks
// ============================================

/**
 * Hook to fetch all rule chains
 */
export const useRuleChains = (params?: RuleChainQuery) => {
  return useQuery({
    queryKey: ['rules-chain', params],
    queryFn: () => rulesChainApi.getAll(params),
  });
};

/**
 * Hook to fetch a single rule chain by ID
 */
export const useRuleChain = (ruleChainId: string | undefined) => {
  return useQuery({
    queryKey: ['rules-chain', ruleChainId],
    queryFn: () => rulesChainApi.getById(ruleChainId!),
    enabled: !!ruleChainId,
  });
};

/**
 * Hook to fetch root rule chains
 */
export const useRootRuleChains = () => {
  return useQuery({
    queryKey: ['rules-chain', 'roots'],
    queryFn: () => rulesChainApi.getRoots(),
  });
};

/**
 * Hook to fetch rule chain metadata
 */
export const useRuleChainMetadata = (ruleChainId: string | undefined) => {
  return useQuery({
    queryKey: ['rules-chain', ruleChainId, 'metadata'],
    queryFn: () => rulesChainApi.getMetadata(ruleChainId!),
    enabled: !!ruleChainId,
  });
};

/**
 * Hook to create a rule chain
 */
export const useCreateRuleChain = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: Partial<RuleChain>) => {
      return rulesChainApi.create(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['rules-chain'] });
    },
  });
};

/**
 * Hook to update a rule chain
 */
export const useUpdateRuleChain = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      data,
    }: {
      id: string;
      data: Partial<RuleChain>;
    }) => {
      return rulesChainApi.update(id, data);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['rules-chain'] });
      queryClient.invalidateQueries({
        queryKey: ['rules-chain', variables.id],
      });
    },
  });
};

/**
 * Hook to delete a rule chain
 */
export const useDeleteRuleChain = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      return rulesChainApi.delete(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['rules-chain'] });
    },
  });
};

/**
 * Hook to save rule chain metadata
 */
export const useSaveRuleChainMetadata = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      metadata,
    }: {
      id: string;
      metadata: RuleChain['metadata'];
    }) => {
      return rulesChainApi.saveMetadata(id, metadata);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['rules-chain'] });
      queryClient.invalidateQueries({
        queryKey: ['rules-chain', variables.id],
      });
      queryClient.invalidateQueries({
        queryKey: ['rules-chain', variables.id, 'metadata'],
      });
    },
  });
};

/**
 * Hook to set root rule chain
 */
export const useSetRootRuleChain = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      return rulesChainApi.setRoot(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['rules-chain'] });
      queryClient.invalidateQueries({ queryKey: ['rules-chain', 'roots'] });
    },
  });
};

/**
 * Hook to activate a rule chain
 */
export const useActivateRuleChain = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      return rulesChainApi.activate(id);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['rules-chain'] });
      queryClient.invalidateQueries({
        queryKey: ['rules-chain', variables],
      });
    },
  });
};

/**
 * Hook to deactivate a rule chain
 */
export const useDeactivateRuleChain = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      return rulesChainApi.deactivate(id);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['rules-chain'] });
      queryClient.invalidateQueries({
        queryKey: ['rules-chain', variables],
      });
    },
  });
};

// ============================================
// Queue Hooks
// ============================================

/**
 * Hook to fetch all queues
 */
export const useQueues = (params?: QueueQuery) => {
  return useQuery({
    queryKey: ['queues', params],
    queryFn: () => queuesApi.getAll(params),
  });
};

/**
 * Hook to fetch a single queue by ID
 */
export const useQueue = (queueId: string | undefined) => {
  return useQuery({
    queryKey: ['queues', queueId],
    queryFn: () => queuesApi.getById(queueId!),
    enabled: !!queueId,
  });
};

/**
 * Hook to fetch queue statistics
 */
export const useQueueStatistics = () => {
  return useQuery({
    queryKey: ['queues', 'statistics'],
    queryFn: () => queuesApi.getStatistics(),
  });
};

/**
 * Hook to create a queue
 */
export const useCreateQueue = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: Partial<Queue>) => {
      return queuesApi.create(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['queues'] });
    },
  });
};

/**
 * Hook to update a queue
 */
export const useUpdateQueue = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<Queue> }) => {
      return queuesApi.update(id, data);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['queues'] });
      queryClient.invalidateQueries({
        queryKey: ['queues', variables.id],
      });
    },
  });
};

/**
 * Hook to delete a queue
 */
export const useDeleteQueue = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      return queuesApi.delete(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['queues'] });
    },
  });
};

// ============================================
// Default Rule Chains Hooks (including Edge)
// ============================================

/**
 * Hook to fetch all default rule chains
 */
export const useDefaultRuleChains = (params?: DefaultRuleChainQuery) => {
  return useQuery({
    queryKey: ['default-rule-chains', params],
    queryFn: () => defaultRuleChainsApi.getAll(params),
  });
};

/**
 * Hook to fetch a single default rule chain by ID
 */
export const useDefaultRuleChain = (id: string | undefined) => {
  return useQuery({
    queryKey: ['default-rule-chains', id],
    queryFn: () => defaultRuleChainsApi.getById(id!),
    enabled: !!id,
  });
};

/**
 * Hook to fetch default rule chain by type (DEVICE, ASSET, or EDGE)
 */
export const useDefaultRuleChainByType = (
  type: 'DEVICE' | 'ASSET' | 'EDGE' | undefined
) => {
  return useQuery({
    queryKey: ['default-rule-chains', 'type', type],
    queryFn: () => defaultRuleChainsApi.getByType(type!),
    enabled: !!type,
  });
};

/**
 * Hook to fetch edge rule chain (convenience hook)
 */
export const useEdgeRuleChain = () => {
  return useDefaultRuleChainByType('EDGE');
};

/**
 * Hook to create a default rule chain
 */
export const useCreateDefaultRuleChain = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: Partial<DefaultRuleChain>) => {
      return defaultRuleChainsApi.create(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['default-rule-chains'] });
    },
  });
};

/**
 * Hook to update a default rule chain
 */
export const useUpdateDefaultRuleChain = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      data,
    }: {
      id: string;
      data: Partial<DefaultRuleChain>;
    }) => {
      return defaultRuleChainsApi.update(id, data);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['default-rule-chains'] });
      queryClient.invalidateQueries({
        queryKey: ['default-rule-chains', variables.id],
      });
    },
  });
};

/**
 * Hook to delete a default rule chain
 */
export const useDeleteDefaultRuleChain = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      return defaultRuleChainsApi.delete(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['default-rule-chains'] });
    },
  });
};

/**
 * Hook to set default rule chain for a type
 */
export const useSetDefaultRuleChain = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      type,
      ruleChainId,
    }: {
      type: 'DEVICE' | 'ASSET' | 'EDGE';
      ruleChainId: string;
    }) => {
      return defaultRuleChainsApi.setDefault(type, ruleChainId);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['default-rule-chains'] });
      queryClient.invalidateQueries({
        queryKey: ['default-rule-chains', 'type', variables.type],
      });
    },
  });
};

