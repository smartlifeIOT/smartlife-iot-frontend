import { AxiosError } from 'axios';

export interface ApiError {
  message: string;
  statusCode?: number;
  errors?: Record<string, string[]>;
}

export const handleApiError = (error: unknown): ApiError => {
  if (error instanceof AxiosError) {
    const statusCode = error.response?.status;
    const message = error.response?.data?.message || error.message;
    const errors = error.response?.data?.errors;

    return {
      message,
      statusCode,
      errors,
    };
  }

  if (error instanceof Error) {
    return {
      message: error.message,
    };
  }

  return {
    message: 'An unknown error occurred',
  };
};

export const getErrorMessage = (error: unknown): string => {
  const apiError = handleApiError(error);
  return apiError.message;
};

export const getValidationErrors = (
  error: unknown
): Record<string, string[]> | undefined => {
  const apiError = handleApiError(error);
  return apiError.errors;
};

export const isUnauthorizedError = (error: unknown): boolean => {
  const apiError = handleApiError(error);
  return apiError.statusCode === 401;
};

export const isForbiddenError = (error: unknown): boolean => {
  const apiError = handleApiError(error);
  return apiError.statusCode === 403;
};

export const isNotFoundError = (error: unknown): boolean => {
  const apiError = handleApiError(error);
  return apiError.statusCode === 404;
};

export const isValidationError = (error: unknown): boolean => {
  const apiError = handleApiError(error);
  return apiError.statusCode === 422 || !!apiError.errors;
};

export const isServerError = (error: unknown): boolean => {
  const apiError = handleApiError(error);
  return (apiError.statusCode ?? 0) >= 500;
};
