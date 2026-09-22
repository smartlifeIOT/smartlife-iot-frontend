import { schedulesApi } from '@/services/api/schedules.api';
import type { Schedule, ScheduleQuery } from '@/services/api/schedules.api';

/**
 * Schedules Feature Service
 * Handles business logic for schedule management
 */
export const schedulesService = {
  async getAll(params?: ScheduleQuery) {
    const response = await schedulesApi.getAll(params);
    return response.data;
  },
  async getAllStatistics() {
    const response = await schedulesApi.getAllStatistics();
    return response.data;
  },
  async getById(id: string) {
    const response = await schedulesApi.getById(id);
    return response.data.data;
  },

  async createSchedule(data: Partial<Schedule>) {
    const response = await schedulesApi.create(data);
    return response.data.data;
  },

  async updateSchedule(id: string, data: Partial<Schedule>) {
    const response = await schedulesApi.update(id, data);
    return response.data.data;
  },

  async deleteSchedule(id: string) {
    await schedulesApi.delete(id);
    return { success: true, id };
  },

  async toggleSchedule(id: string) {
    const response = await schedulesApi.toggle(id);
    return response.data.data;
  },

  async executeSchedule(id: string) {
    const response = await schedulesApi.execute(id);
    return response.data.data;
  },

  async getHistory(id: string, page?: number, limit?: number) {
    const response = await schedulesApi.getHistory(id, page, limit);
    return response.data;
  },

  async getStatistics() {
    const response = await schedulesApi.getStatistics();
    return response.data.data;
  },

  async validateCron(expression: string) {
    const response = await schedulesApi.validateCron(expression);
    return response.data.data;
  },

  async getUpcoming(limit?: number) {
    const response = await schedulesApi.getUpcoming(limit);
    return response.data.data;
  },
};
