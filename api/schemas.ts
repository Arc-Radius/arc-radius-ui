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

export const stateBillListItemSchema = z.object({
  id: z.string(),
  bill_number: z.string(),
  title: z.string(),
  description: z.string(),
  stance: legislativeStatusSchema,
  billTab: billTabSchema,
  status: z.string(),
  status_desc: z.string(),
  last_action: z.string(),
  last_action_date: z.string(),
  year: z.number(),
  primary_sponsor: z.string(),
  issue_categories: z.array(z.string()),
  url: z.string().optional(),
});

export const stateBillsEnvelopeSchema = z.object({
  bills: z.array(stateBillListItemSchema),
  facets: z.unknown().optional(),
  meta: z.unknown().optional(),
});

export const apiBillDetailItemSchema = z.object({
  id: z.string(),
  number: z.string().optional(),
  title: z.string(),
  summary: z.string(),
  fullText: z.string().optional(),
  state: z.string().optional(),
  status: z.string().optional(),
  progression: z.number().optional(),
  lastAction: z.string().optional(),
  lastActionDate: z.string().optional(),
  pendingCommittee: z.string().optional(),
  sponsors: z
    .array(
      z.object({
        name: z.string(),
        party: z.enum(['D', 'R', 'I']),
      })
    )
    .optional(),
  spectrum: z.enum(['Supportive', 'Neutral', 'Harmful']).optional(),
  introducedDate: z.string().optional(),
  history: z
    .array(
      z.object({
        date: z.string(),
        chamber: z.string(),
        action: z.string(),
      })
    )
    .optional(),
  subjects: z.array(z.string()).optional(),
  similarBills: z.array(z.string()).optional(),
  relatedBills: z.array(z.unknown()).optional(),
  keyDates: z.array(z.unknown()).optional(),
  aiAnalysis: z.unknown().nullable().optional(),
  researchEvidence: z.unknown().nullable().optional(),
  sponsorContact: z.unknown().nullable().optional(),
  billTab: billTabSchema.optional(),
});

export const billDetailEnvelopeSchema = z.object({
  bill: apiBillDetailItemSchema,
  graphRecord: z.unknown().optional(),
});

export type StateBillsResponse = z.infer<typeof stateBillsResponseSchema>;
export type BillDetailResponse = z.infer<typeof billDetailResponseSchema>;
export type StateBillsEnvelopeResponse = z.infer<typeof stateBillsEnvelopeSchema>;
