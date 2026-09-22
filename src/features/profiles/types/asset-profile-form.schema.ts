import { z } from 'zod';

export const assetProfileFormSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100, 'Name must be less than 100 characters'),
  defaultRuleChain: z.string().optional(),
  mobileDashboard: z.string().optional(),
  queue: z.string().optional(),
  defaultEdgeRuleChain: z.string().optional(),
  assetProfileImage: z.union([
    z.instanceof(File),
    z.string(),
    z.undefined(),
  ]).optional(),
  description: z.string().optional(),
});

export type AssetProfileFormSchema = z.infer<typeof assetProfileFormSchema>;

