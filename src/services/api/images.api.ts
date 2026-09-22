import apiClient from '@/lib/axios';

export enum ImageType {
  PROFILE = 'profile',
  LOGO = 'logo',
  ASSET = 'asset',
  DEVICE = 'device',
  BACKGROUND = 'background',
  ICON = 'icon',
}

export interface Image {
  id: string;
  name: string;
  type: ImageType;
  url: string;
  thumbnailUrl?: string;
  size: number;
  mimeType: string;
  width?: number;
  height?: number;
  userId: string;
  tenantId?: string;
  metadata?: Record<string, any>;
  createdAt: string;
  updatedAt: string;
}

export interface ImageQuery {
  search?: string;
  type?: ImageType;
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
  };
}

export interface ApiResponse<T> {
  message: string;
  data: T;
}

export const imagesApi = {
  // Get all images
  getAll: (params?: ImageQuery) =>
    apiClient.get<PaginatedResponse<Image>>('/images', { params }),

  // Get image by ID
  getById: (id: string) =>
    apiClient.get<ApiResponse<Image>>(`/images/${id}`),

  // Upload image
  upload: (file: File, type: ImageType, metadata?: Record<string, any>) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('type', type);
    if (metadata) {
      formData.append('metadata', JSON.stringify(metadata));
    }
    return apiClient.post<ApiResponse<Image>>('/images', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },

  // Update image metadata
  update: (id: string, data: Partial<Image>) =>
    apiClient.patch<ApiResponse<Image>>(`/images/${id}`, data),

  // Delete image
  delete: (id: string) => apiClient.delete(`/images/${id}`),

  // Get by type
  getByType: (type: ImageType) =>
    apiClient.get<ApiResponse<Image[]>>(`/images/type/${type}`),

  // Generate thumbnail
  generateThumbnail: (id: string, width?: number, height?: number) =>
    apiClient.post<ApiResponse<{ thumbnailUrl: string }>>(
      `/images/${id}/thumbnail`,
      { width, height }
    ),

  // Get statistics
  getStatistics: () =>
    apiClient.get<ApiResponse<any>>('/images/statistics'),

  // Bulk upload
  bulkUpload: (files: File[], type: ImageType) => {
    const formData = new FormData();
    files.forEach((file) => formData.append('files', file));
    formData.append('type', type);
    return apiClient.post<ApiResponse<Image[]>>('/images/bulk', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },

  // Download image
  download: (id: string) =>
    apiClient.get(`/images/${id}/download`, { responseType: 'blob' }),
};