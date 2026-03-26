import { z } from 'zod';

const legislativeStatusSchema = z.enum(['supportive', 'mixed', 'harmful']);
const billTabSchema = z.enum(['active', 'passed']);

export const relatedBillSchema = z.object({
  bill_id: z.string(),
  summary: z.string(),
  confidence: z.enum(['high', 'medium', 'low']),
});

export const billDetailSchema = z.object({
  id: z.string(),
  title: z.string(),
  summary: z.string(),
  tags: z.array(z.enum(['Healthcare', 'Education', 'Identity Documents', 'Safety', 'Sports'])),
  status: legislativeStatusSchema,
  billTab: billTabSchema,
  whatItMeans: z.string(),
  whyItMatters: z.string(),
  takeActionTitle: z.string(),
  takeActionBody: z.string(),
  actionItem: z.object({
    title: z.string(),
    subtitle: z.string(),
  }),
  relatedBillIds: z.array(z.string()),
  relatedBills: z.array(relatedBillSchema).optional(),
});

export const stateBillsResponseSchema = z.array(billDetailSchema);

export const billDetailResponseSchema = billDetailSchema;

export type StateBillsResponse = z.infer<typeof stateBillsResponseSchema>;
export type BillDetailResponse = z.infer<typeof billDetailResponseSchema>;
