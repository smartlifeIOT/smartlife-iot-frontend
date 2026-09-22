import * as z from 'zod';

export const actionSchema = z.object({
  id: z.string().optional(),
  type: z.string().min(1, 'Action type is required'),
  deviceId: z.string().optional(),
  command: z.string().optional(),
  value: z.any().optional(),
  message: z.string().optional(),
  recipients: z.array(z.string()).optional(),
  webhookUrl: z.string().optional(),
  webhookMethod: z.string().optional(),
  webhookHeaders: z.any().optional(),
  webhookBody: z.any().optional(),
  delay: z.number().optional(),
  priority: z.enum(['low', 'medium', 'high']).optional(),
  channel: z.string().optional(),
  params: z.any().optional(),
});

export const automationSchema = z.object({
  name: z.string().min(3, 'Name must be at least 3 characters'),
  description: z.string().optional(),
  enabled: z.boolean().default(true),
  status: z.enum(['active', 'inactive', 'error']).default('active'),
  trigger: z.object({
    type: z.string().min(1, 'Trigger type is required'),
    deviceId: z.string().optional(),
    telemetryKey: z.string().optional(),
    attributeKey: z.string().optional(),
    operator: z.string().optional(),
    value: z.any().optional(),
    value2: z.any().optional(),
    schedule: z.string().optional(),
    debounce: z.number().optional(),
    enableDebounce: z.boolean().optional(),
    activeHoursEnabled: z.boolean().optional(),
    activeHours: z
      .object({
        start: z.string().default('08:00'),
        end: z.string().default('18:00'),
      })
      .optional(),
    activeDays: z.array(z.number()).optional(),
  }),
  action: actionSchema.optional(),
  actions: z.array(actionSchema).min(1, 'At least one action is required'),
  execution: z
    .object({
      sequence: z.boolean().default(true),
      parallel: z.boolean().default(false),
      stopOnError: z.boolean().default(false),
      retryCount: z.number().default(3),
    })
    .optional(),
  settings: z
    .object({
      cooldown: z.number().default(300),
      maxExecutionsPerDay: z.number().default(10),
      activeDays: z.array(z.number()).default([1, 2, 3, 4, 5]),
      maxRetries: z.number().default(3),
      activeHours: z
        .object({
          start: z.string().default('08:00'),
          end: z.string().default('18:00'),
        })
        .optional(),
      retryOnFailure: z.boolean().default(true),
      notifyEmail: z.boolean().default(false),
      notifyPush: z.boolean().default(false),
      logHistory: z.boolean().default(true),
    })
    .optional(),
  tags: z.array(z.string()).optional(),
});

