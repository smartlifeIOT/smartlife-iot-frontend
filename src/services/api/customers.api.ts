import apiClient from '@/lib/axios.ts';
import type {
  Customer,
  CreateCustomerData,
  CustomerQuery,
} from '@/features/customer/types';
import type { User } from '@/services/api/users.api';

export interface PaginatedResponse<T> {
  message: string;
  data: T[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface ApiResponse<T> {
  message: string;
  data: T;
}

export const customersApi = {
  // Get all customers
  getAll: (params?: CustomerQuery) =>
    apiClient.get<ApiResponse<PaginatedResponse<Customer>>>('/customers', {
      params,
    }),

  // Get customer by ID
  getById: (id: string) =>
    apiClient.get<ApiResponse<ApiResponse<Customer>>>(`/customers/${id}`),

  // Create customer
  create: (data: CreateCustomerData) =>
    apiClient.post<ApiResponse<Customer>>('/customers', data),

  // Update customer
  update: (id: string, data: Partial<CreateCustomerData>) =>
    apiClient.patch<ApiResponse<Customer>>(`/customers/${id}`, data),

  // Delete customer
  delete: (id: string) => apiClient.delete(`/customers/${id}`),

  // Get customer statistics
  getStatistics: () => apiClient.get<ApiResponse<any>>('/customers/statistics'),

  // Activate customer
  activate: (id: string) =>
    apiClient.patch<ApiResponse<Customer>>(`/customers/${id}/activate`),

  // Deactivate customer
  deactivate: (id: string) =>
    apiClient.patch<ApiResponse<Customer>>(`/customers/${id}/deactivate`),

  // Suspend customer
  suspend: (id: string) =>
    apiClient.patch<ApiResponse<Customer>>(`/customers/${id}/suspend`),

  // Get customers by tenant
  getByTenant: () =>
    apiClient.get<ApiResponse<PaginatedResponse<Customer>>>(
      `/customers/tenant`
    ),

  // Get users by customer
  getUsersByCustomer: (
    customerId: string,
    params?: { page?: number; limit?: number; search?: string }
  ) =>
    apiClient.get<ApiResponse<PaginatedResponse<User>>>(
      `/customer-users/customer/${customerId}`,
      { params }
    ),

  // Bulk delete customers
  bulkDelete: (customerIds: string[]) =>
    apiClient.post<ApiResponse<any>>('/customers/bulk/delete', { customerIds }),

  // Bulk update customers
  bulkUpdate: (customerIds: string[], data: Partial<CreateCustomerData>) =>
    apiClient.patch<ApiResponse<any>>('/customers/bulk/update', {
      customerIds,
      data,
    }),
};
