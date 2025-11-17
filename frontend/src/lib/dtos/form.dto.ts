import { z } from 'zod';

export const CreateFormDTO = z.object({
  name: z.string().min(1).max(100),
  description: z.string().max(500).optional(),
  enableNotifications: z.boolean().optional(),
  notificationEmail: z.string().email().optional().nullable(),
  primaryColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/).optional(),
  accentColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/).optional(),
});

export const UpdateFormDTO = z.object({
  name: z.string().min(1).max(100),
  description: z.string().max(500).optional(),
  enableNotifications: z.boolean().optional(),
  notificationEmail: z.string().email().optional().nullable(),
  primaryColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/).optional(),
  accentColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/).optional(),
});

export type CreateFormInput = z.infer<typeof CreateFormDTO>;
export type UpdateFormInput = z.infer<typeof UpdateFormDTO>;
