import { z } from 'zod';

export const AddFormFieldDTO = z.object({
  type: z.enum([
    'TEXT',
    'EMAIL',
    'NUMBER',
    'SELECT',
    'CHECKBOX',
    'RADIO',
    'DATE',
    'TIME',
    'FILE',
    'RATING',
    'NPS',
  ]),
  label: z.string().min(1).max(200),
  required: z.boolean().default(false),
  order: z.number().int().min(0),
  settings: z.record(z.string(), z.any()).optional(),
});

export type AddFormFieldInput = z.infer<typeof AddFormFieldDTO>;
