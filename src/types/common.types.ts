/**
 * Common TypeScript Types for the Application
 */

export interface ApiResponse<T> {
  data: T;
  message?: string;
  success: boolean;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
}

export interface PaginationParams {
  page: number;
  limit: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface SearchParams extends PaginationParams {
  search?: string;
  filters?: Record<string, unknown>;
}

export type Status = 'active' | 'inactive' | 'pending' | 'error';

export type ConnectionStatus = 'online' | 'offline' | 'connecting';

export interface BaseEntity {
  id: string;
  createdAt: string;
  updatedAt: string;
}
