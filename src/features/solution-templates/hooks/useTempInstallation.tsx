import { useMutation, useQueryClient } from '@tanstack/react-query';
import { solutionTemplatesApi } from '../services/solution-templates.api';
import toast from 'react-hot-toast';
import { templatePreviewKeys } from './useSolutionTemplatePrevies';
import { useNavigate } from 'react-router-dom';

export const useTempInstallation = () => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  return useMutation({
    mutationFn: ({
      id,
      installationName,
    }: {
      id: string;
      installationName?: string;
    }) => solutionTemplatesApi.install(id, installationName),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({
        queryKey: ['solution-templates', id],
      });
      queryClient.invalidateQueries({
        queryKey: ['dashboards', id],
      });
      queryClient.invalidateQueries({
        queryKey: templatePreviewKeys.detail(id),
      });

      toast.success('Solution template installed successfully');
      navigate(`/solution-dashboards`);
    },
    onError: () => {
      toast.error('Failed to install solution template');
    },
  });
};
