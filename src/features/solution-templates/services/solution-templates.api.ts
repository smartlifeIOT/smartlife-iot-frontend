import apiClient from '@/lib/axios';
import { TemplatePreviewData } from '../hooks/useSolutionTemplatePrevies';
import {
  CreateSolutionTemplatePayload,
  SolutionTemplate as CreatedSolutionTemplate,
} from '../hooks/useCreateSolutionTemp';

export enum TemplateCategory {
  SMART_HOME = 'smart_home',
  SMART_AGRICULTURE = 'smart_agriculture',
  SMART_CITY = 'smart_city',
  HEALTHCARE = 'healthcare',
  ENERGY = 'smart_energy',
  TRANSPORTATION = 'transportation',
  SMART_RETAIL = 'smart_retail',
  SMART_FACTORY = 'smart_factory',
  SMART_BUILDING = 'smart_building',
  LOGISTICS = 'logistics',
  WATER = 'smart_water',
  CLIMATE = 'climate',
  EDUCATION = 'education',
  SMART_FACILITY = 'smart_facility',
}

export interface TemplateConfiguration {
  devices?: unknown[];
  dashboards?: unknown[];
  rules?: unknown[];
  assets?: unknown[];
}

export interface SolutionTemplate {
  installs: number;
  isInstalled: boolean;
  imageUrl: string;
  id: string;
  name: string;
  title: string;
  description?: string;
  category: TemplateCategory;
  tags?: string[];
  configuration: TemplateConfiguration;
  thumbnail?: string;
  isPublic: boolean;
  installCount: number;
  rating?: number;
  userId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface TemplateQuery {
  search?: string;
  category?: TemplateCategory;
  tags?: string[];
  isPublic?: boolean;
  page?: number;
  limit?: number;
}

export interface PaginatedResponse<T> {
  message: string;
  data: T[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    totalItems: number;
  };
}

export interface ApiResponse<T> {
  message: string;
  data: T;
}

export interface TemplateInstallation {
  id: string;
  templateId: string;
  name: string;
  status: 'in_progress' | 'completed' | 'failed';
  createdAt: string;
}

export const solutionTemplatesApi = {
  // Get all templates
  getAll: (params?: TemplateQuery) =>
    apiClient.get<PaginatedResponse<SolutionTemplate>>('/solution-templates', {
      params,
    }),

  // Get template by ID
  getById: (id: string) =>
    apiClient.get<ApiResponse<SolutionTemplate>>(`/solution-templates/${id}`),

  // Create template
  create: (data: Partial<CreateSolutionTemplatePayload>) =>
    apiClient.post<ApiResponse<CreatedSolutionTemplate>>(
      '/solution-templates',
      data
    ),

  // Update template
  update: (id: string, data: Partial<SolutionTemplate>) =>
    apiClient.patch<ApiResponse<SolutionTemplate>>(
      `/solution-templates/${id}`,
      data
    ),

  // Delete template
  delete: (id: string) => apiClient.delete(`/solution-templates/${id}`),

  // Install template
  install: (id: string, installationName?: string) =>
    apiClient.post<ApiResponse<TemplateInstallation>>(
      `/solution-templates/${id}/install`,
      {
        installationName,
      }
    ),

  // Get installation history
  getInstallations: (id: string) =>
    apiClient.get<ApiResponse<unknown[]>>(
      `/solution-templates/${id}/installations`
    ),

  // Get categories
  getCategories: () =>
    apiClient.get<ApiResponse<TemplateCategory[]>>(
      '/solution-templates/categories'
    ),

  // Get popular templates
  getPopular: (limit?: number) =>
    apiClient.get<ApiResponse<SolutionTemplate[]>>(
      '/solution-templates/popular',
      { params: { limit } }
    ),

  // Get template statistics
  getStatistics: () =>
    apiClient.get<ApiResponse<unknown>>('/solution-templates/statistics'),

  // Rate template
  rate: (id: string, rating: number) =>
    apiClient.post<ApiResponse<unknown>>(`/solution-templates/${id}/rate`, {
      rating,
    }),

  // Get by categoryfs
  getByCategory: (category: TemplateCategory) =>
    apiClient.get<ApiResponse<SolutionTemplate[]>>(
      `/solution-templates/category/${category}`
    ),

  // Get preview
  getSolutionTemplatePreview: (id: number | string) =>
    apiClient.get<ApiResponse<TemplatePreviewData>>(
      `solution-templates/${id}/preview`
    ),
};
