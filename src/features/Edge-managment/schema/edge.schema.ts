import { z } from 'zod';

export const edgeTypeEnum = z.enum(['GATEWAY', 'PROCESSOR', 'RELAY']);

export const syncConfigSchema = z.object({
  syncRules: z.boolean(),
  syncDashboards: z.boolean(),
  syncDevices: z.boolean(),
  syncInterval: z
    .number('Sync interval must be a number')
    .int('Sync interval must be a whole number')
    .positive('Sync interval must be greater than 0'),
  offlineBufferHours: z
    .number('Offline buffer must be a number')
    .int('Offline buffer must be a whole number')
    .nonnegative('Offline buffer cannot be negative')
    .max(720, 'Offline buffer cannot exceed 720 hours (30 days)'),
});

export const edgePayloadSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, 'Name is required')
    .max(120, 'Name must be under 120 characters'),
  description: z
    .string()
    .trim()
    .max(500, 'Description must be under 500 characters')
    .optional()
    .default(''),
  type: edgeTypeEnum,
  location: z.string().trim().min(1, 'Location is required'),
  latitude: z
    .number('Latitude must be a number')
    .min(-90, 'Latitude must be between -90 and 90')
    .max(90, 'Latitude must be between -90 and 90'),
  longitude: z
    .number(' Longitude must be a number')
    .min(-180, 'Longitude must be between -180 and 180')
    .max(180, 'Longitude must be between -180 and 180'),
  syncConfig: syncConfigSchema,
  tags: z.array(z.string().trim().min(1)).default([]),
  additionalInfo: z.record(z.string(), z.unknown()).default({}),
  customerId: z.string().trim().min(1, 'Customer is required'),
});

// Inferred type — keep this as the single source of truth instead of
// hand-writing EdgePayload separately, so schema and type can never drift.
export type EdgePayloadInput = z.infer<typeof edgePayloadSchema>;
