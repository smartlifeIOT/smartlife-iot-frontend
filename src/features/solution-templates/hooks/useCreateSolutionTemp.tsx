import {
  useMutation,
  useQueryClient,
  UseMutationOptions,
} from '@tanstack/react-query';
import { templatePreviewKeys } from './useSolutionTemplatePrevies';
import toast from 'react-hot-toast';
import { solutionTemplatesApi } from '../services/solution-templates.api';

// ---- Payload type matching the request body ----

export interface CreateSolutionTemplatePayload {
  name: string;
  description: string;
  category: string;
  icon: string;
  author: string;
  features: string[];
  devices: number;
  dashboards: number;
  rules: number;
  tags: string[];
  isPremium: boolean;
  configuration: Record<string, unknown>;
  previewImage: string;
}

// ---- Response type — adjust fields to match what the API actually returns ----

export interface SolutionTemplate extends CreateSolutionTemplatePayload {
  id: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateSolutionTemplateResponse {
  success: boolean;
  data: SolutionTemplate;
  timestamp: string;
}

async function createSolutionTemplate(
  payload: CreateSolutionTemplatePayload
): Promise<SolutionTemplate> {
  const res = await solutionTemplatesApi.create(payload);

  return res.data.data;
}

export function useCreateSolutionTemplate(
  options?: UseMutationOptions<
    SolutionTemplate,
    Error,
    CreateSolutionTemplatePayload
  >
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createSolutionTemplate,
    onSuccess: () => {
      // refresh any cached template lists/previews so the new template shows up
      queryClient.invalidateQueries({ queryKey: templatePreviewKeys.all });
      queryClient.invalidateQueries({ queryKey: ['solution-templates'] });
      toast.success('Tempate Created Succesfully');
    },
    ...options,
  });
}
