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
  relevance: z.number().nullable().optional(),
});

/** Matches backend `ListMeta` for `/bills` list responses. */
export const stateBillsMetaSchema = z.object({
  sortBy: z.string().optional(),
  sortDir: z.string().optional(),
  pageSize: z.number().optional(),
  cursor: z.string().nullable().optional(),
  nextCursor: z.string().nullable().optional(),
  hasMore: z.boolean().optional(),
  totalCount: z.number().optional(),
});

export const stateBillsEnvelopeSchema = z.object({
  bills: z.array(stateBillListItemSchema),
  facets: z.unknown().optional(),
  meta: stateBillsMetaSchema.optional(),
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

/** Graph / Neo4j metadata returned alongside `bill` from `GET /bills/:billPk`. */
export const graphRecordSchema = z
  .object({
    bill_pk: z.string().optional(),
    bill_id: z.string().optional(),
    state: z.string().optional(),
    session_id: z.string().optional(),
    bill_number: z.string().optional(),
    title: z.string().optional(),
    description: z.string().optional(),
    status: z.string().optional(),
    status_desc: z.string().optional(),
    status_date: z.string().optional(),
    url: z.string().optional(),
    state_link: z.string().optional(),
    label: z.string().optional(),
    label_source: z.string().optional(),
    confidence: z.number().nullable().optional(),
    relevance_score: z.number().nullable().optional(),
    issues: z.string().nullable().optional(),
    issue_categories: z.string().nullable().optional(),
    sponsor_names: z.string().nullable().optional(),
    primary_sponsor: z.string().nullable().optional(),
    last_action: z.string().optional(),
    last_action_date: z.string().optional(),
    year: z.number().optional(),
    session_year: z.number().optional(),
    state_lean: z.string().optional(),
    bill_dominant_party: z.string().optional(),
    state_r_sponsorship_ratio: z.number().optional(),
    pass_rate_gap: z.union([z.number(), z.string()]).optional(),
    overall_pass_rate: z.union([z.number(), z.string()]).optional(),
    committee_id: z.string().optional(),
  })
  .passthrough();

export const billDetailEnvelopeSchema = z.object({
  bill: apiBillDetailItemSchema,
  graphRecord: graphRecordSchema.optional(),
});

/** GET /states — minimal fields used by the homepage; extra keys are ignored. */
export const stateCountsSchema = z.object({
  activeBills: z.number(),
  passedBills: z.number(),
});

export const stateListItemSchema = z.object({
  abbr: z.string(),
  name: z.string(),
  status: z.enum(['supportive', 'mixed', 'harmful']),
  counts: stateCountsSchema,
});

export const statesResponseSchema = z.object({
  states: z.array(stateListItemSchema),
});

export type StateBillsResponse = z.infer<typeof stateBillsResponseSchema>;
export type BillDetailResponse = z.infer<typeof billDetailResponseSchema>;
export type ApiBillDetailItem = z.infer<typeof apiBillDetailItemSchema>;
export type GraphRecordParsed = z.infer<typeof graphRecordSchema>;
export type StateBillsEnvelopeResponse = z.infer<typeof stateBillsEnvelopeSchema>;
export type StateBillsMeta = z.infer<typeof stateBillsMetaSchema>;
export type StateBillListItem = z.infer<typeof stateBillListItemSchema>;
export type StateListItem = z.infer<typeof stateListItemSchema>;
export type StatesResponse = z.infer<typeof statesResponseSchema>;
