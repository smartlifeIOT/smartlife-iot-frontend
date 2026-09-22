import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { alarmsApi } from '@/services/api';
import { alarmService } from '../services/alarmService';
import type {
  Alarm,
  AlarmQuery,
  PaginatedResponse,
  CreateAlarmRulePayload,
} from '@/services/api/alarms.api';
import toast from 'react-hot-toast';
import { getErrorMessage } from '@/utils/helpers/apiErrorHandler';

type AlarmListResponse = Alarm[] | PaginatedResponse<Alarm>;

const toAlarmList = (payload: AlarmListResponse): Alarm[] =>
  Array.isArray(payload) ? payload : payload.data;

export const useAlarms = (params?: AlarmQuery) => {
  return useQuery({
    queryKey: ['alarms', params],
    queryFn: () => alarmsApi.getAll(params),
  });
};
// get critical alarms by status endpoint /alarms/critical
export const useCriticalAlarms = (options?: { enabled?: boolean }) => {
  return useQuery({
    queryKey: ['criticalAlarms'],
    queryFn: async () => {
      const res = await alarmsApi.getCritical();
      return toAlarmList(res.data.data);
    },
    enabled: options?.enabled ?? true,
  });
};
// get active alarms by status endpoint /alarms/active
export const useActiveAlarms = (options?: { enabled?: boolean }) => {
  return useQuery({
    queryKey: ['activeAlarms'],
    queryFn: async () => {
      const res = await alarmsApi.getActive();
      return toAlarmList(res.data.data);
    },
    enabled: options?.enabled ?? true,
  });
};
// get alarm escalation  history
export const useAlarmEscalationHistory = (alarmId: string) => {
  return useQuery({
    queryKey: ['alarmEscalationHistory', alarmId],
    queryFn: () => alarmsApi.getEscalationHistory(alarmId),
  });
};
export const useAlarm = (alarmId: string) => {
  return useQuery({
    queryKey: ['alarm', alarmId],
    queryFn: async () => {
      const res = await alarmsApi.getById(alarmId);
      return res.data.data;
    },
    enabled: !!alarmId,
  });
};

// get alarms analytics
export const useGetAlarmAnalytics = (timeRange?: string) => {
  return useQuery({
    queryKey: ['alarm-analytics', timeRange],
    queryFn: async () => {
      const res = await alarmsApi.analytics(timeRange);
      return res.data.data;
    },
    staleTime: 60 * 1000,
    refetchOnWindowFocus: false,
  });
};

export const useAcknowledgeAlarm = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ alarmId }: { alarmId: string }) =>
      alarmService.acknowledgeAlarm(alarmId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['alarms'] });
      queryClient.invalidateQueries({ queryKey: ['criticalAlarms'] });
      queryClient.invalidateQueries({ queryKey: ['activeAlarms'] });
      toast.success('Alarm acknowledged successfully');
    },
    onError(error) {
      toast.error(getErrorMessage(error) || 'Something went wrong');
    },
  });
};

// resolve alaram
export const useResolveAlarm = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ alarmId, note }: { alarmId: string; note: string }) =>
      alarmsApi.resolve({ id: alarmId, note }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['alarms'] });
      queryClient.invalidateQueries({ queryKey: ['criticalAlarms'] });
      queryClient.invalidateQueries({ queryKey: ['activeAlarms'] });
      toast.success('Alarm resolved successfully');
    },
    onError(error) {
      toast.error(getErrorMessage(error) || 'Something went wrong');
    },
  });
};
export const useClearAlarm = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      alarmId,
      resolution,
    }: {
      alarmId: string;
      resolution?: string;
    }) => alarmService.clearAlarm(alarmId, resolution),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['alarms'] });
      queryClient.invalidateQueries({ queryKey: ['criticalAlarms'] });
      queryClient.invalidateQueries({ queryKey: ['activeAlarms'] });
      toast.success('Alarm cleared successfully');
    },
  });
};

// get alarms statistics
export const useGetStatsAlaram = () => {
  return useQuery({
    queryKey: ['alaramStats'],
    queryFn: async () => {
      const apiresponse = await alarmsApi.getStatistics();
      return apiresponse.data.data;
    },
  });
};

// create alarm rule
export const useCreateAlarmRule = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateAlarmRulePayload) => alarmsApi.createRule(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['alarmRules'] });
      queryClient.invalidateQueries({ queryKey: ['alarms'] });
      toast.success('Alarm rule created successfully');
    },
    onError: (error) => {
      toast.error(getErrorMessage(error) || 'Failed to create alarm rule');
    },
  });
};

// update alarm rule
export const useUpdateAlarmRule = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: string;
      data: Partial<CreateAlarmRulePayload>;
    }) => alarmsApi.update(id, data as any),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['alarmRules'] });
      queryClient.invalidateQueries({ queryKey: ['alarms'] });
      queryClient.invalidateQueries({ queryKey: ['alarm', variables.id] });
      toast.success('Alarm rule updated successfully');
    },
    onError: (error) => {
      toast.error(getErrorMessage(error) || 'Failed to update alarm rule');
    },
  });
};

// delete alarm
export const useDeleteAlarm = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => alarmsApi.deleteAlarm(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['alarms'] });
      toast.success('Alarm deleted successfully');
    },
    onError: (error) => {
      toast.error(getErrorMessage(error) || 'Failed to delete alarm');
    },
  });
};
