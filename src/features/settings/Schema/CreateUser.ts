import { z } from 'zod';

export const createProfileSchema = (t: (key: string) => string) => z.object({
    name: z.string().min(1, t('CommonPrifleSchema.name') || 'Name is required'),
    email: z.string().email(t('common.invalidEmail') || 'Invalid email'),
    companyName: z.string(),
    phone: z
        .string()
        .optional()
        .transform((v) => (typeof v === 'string' ? v.trim() : v))
        .refine(
            (v) => !v || /^[+]?[\d\s().-]{7,20}$/.test(v),
            t('CommonPrifleSchema.invalidPhone') || 'Invalid phone number'
        ),
});