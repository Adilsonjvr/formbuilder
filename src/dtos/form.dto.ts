import { z } from 'zod';

export const CreateFormDTO = z.object({
  name: z.string().min(1).max(100),
  description: z.string().max(500).optional(),
});

export type CreateFormInput = z.infer<typeof CreateFormDTO>;
