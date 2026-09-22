import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { schedulesService } from '../services/schedulesService';
import toast from 'react-hot-toast';
import type { Schedule, ScheduleQuery } from '@/services/api/schedules.api';

// Query keys
export const scheduleKeys = {
  all: ['schedules'] as const,
  lists: () => [...scheduleKeys.all, 'list'] as const,
  list: (params: ScheduleQuery) => [...scheduleKeys.lists(), params] as const,
  details: () => [...scheduleKeys.all, 'detail'] as const,
  detail: (id: string) => [...scheduleKeys.details(), id] as const,
  statistics: () => [...scheduleKeys.all, 'statistics'] as const,
  history: (id: string) => [...scheduleKeys.detail(id), 'history'] as const,
  upcoming: () => [...scheduleKeys.all, 'upcoming'] as const,
};

export const useSchedules = (params?: ScheduleQuery) => {
  return useQuery({
    queryKey: scheduleKeys.list(params || {}),
    queryFn: () => schedulesService.getAll(params),
  });
};

export const useAllScheduleStatistics = () => {
  return useQuery({
    queryKey: scheduleKeys.statistics(),
    queryFn: () => schedulesService.getAllStatistics(),
  });
};

export const useScheduleById = (id?: string) => {
  return useQuery({
    queryKey: scheduleKeys.detail(id as string),
    queryFn: () => schedulesService.getById(id as string),
    enabled: !!id,
  });
};

export const useScheduleStatistics = () => {
  return useQuery({
    queryKey: scheduleKeys.statistics(),
    queryFn: () => schedulesService.getStatistics(),
  });
};

export const useScheduleHistory = (
  id?: string,
  page?: number,
  limit?: number
) => {
  return useQuery({
    queryKey: [...scheduleKeys.history(id as string), { page, limit }],
    queryFn: () => schedulesService.getHistory(id as string, page, limit),
    enabled: !!id,
  });
};

export const useUpcomingSchedules = (limit?: number) => {
  return useQuery({
    queryKey: [...scheduleKeys.upcoming(), { limit }],
    queryFn: () => schedulesService.getUpcoming(limit),
  });
};

export const useCreateSchedule = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: Partial<Schedule>) =>
      schedulesService.createSchedule(data),
    onSuccess: () => {
      toast.success('Schedule created successfully');
      queryClient.invalidateQueries({ queryKey: scheduleKeys.lists() });
      queryClient.invalidateQueries({ queryKey: scheduleKeys.statistics() });
    },
    onError: (error: any) => {
      toast.error(
        error?.response?.data?.message || 'Failed to create schedule'
      );
    },
  });
};

export const useUpdateSchedule = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Schedule> }) =>
      schedulesService.updateSchedule(id, data),
    onSuccess: (_, variables) => {
      toast.success('Schedule updated successfully');
      queryClient.invalidateQueries({
        queryKey: scheduleKeys.detail(variables.id),
      });
      queryClient.invalidateQueries({ queryKey: scheduleKeys.lists() });
    },
    onError: (error: any) => {
      toast.error(
        error?.response?.data?.message || 'Failed to update schedule'
      );
    },
  });
};

export const useDeleteSchedule = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => schedulesService.deleteSchedule(id),
    onSuccess: () => {
      toast.success('Schedule deleted successfully');
      queryClient.invalidateQueries({ queryKey: scheduleKeys.lists() });
      queryClient.invalidateQueries({ queryKey: scheduleKeys.statistics() });
    },
    onError: (error: any) => {
      toast.error(
        error?.response?.data?.message || 'Failed to delete schedule'
      );
    },
  });
};

export const useToggleSchedule = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => schedulesService.toggleSchedule(id),
    onSuccess: (_, id) => {
      toast.success('Schedule status updated');
      queryClient.invalidateQueries({ queryKey: scheduleKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: scheduleKeys.lists() });
    },
    onError: (error: any) => {
      toast.error(
        error?.response?.data?.message || 'Failed to toggle schedule'
      );
    },
  });
};

export const useExecuteSchedule = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => schedulesService.executeSchedule(id),
    onSuccess: (_, id) => {
      toast.success('Schedule executed successfully');
      queryClient.invalidateQueries({ queryKey: scheduleKeys.history(id) });
    },
    onError: (error: any) => {
      toast.error(
        error?.response?.data?.message || 'Failed to execute schedule'
      );
    },
  });
};

export const useValidateCron = () => {
  return useMutation({
    mutationFn: (expression: string) =>
      schedulesService.validateCron(expression),
  });
};
