import type { BillTab } from './billConstants';
import type { LegislativeStatus } from './states';

export type BillTag = 'Healthcare' | 'Education' | 'Identity Documents' | 'Safety' | 'Sports';

export interface RelatedBill {
  bill_id: string;
  summary: string;
  confidence: 'high' | 'medium' | 'low';
}

export interface BillActionItem {
  title: string;
  subtitle: string;
}

export interface BillItem {
  id: string;
  title: string;
  summary: string;
  tags: BillTag[];
  status: LegislativeStatus;
}

export interface BillDetail extends BillItem {
  billTab: BillTab;
  whatItMeans: string;
  whyItMatters: string;
  takeActionTitle: string;
  takeActionBody: string;
  actionItem: BillActionItem;
  relatedBillIds: string[];
  /** Graph / RAG-style related bills with confidence tiers (detail page). */
  relatedBills?: RelatedBill[];
}

interface BillContext {
  stateAbbr: string;
  stateName: string;
  status: LegislativeStatus;
}

export function getBillsForState({ stateAbbr, stateName, status }: BillContext): BillDetail[] {
  const riskLabel =
    status === 'harmful' ? 'High Risk' : status === 'supportive' ? 'Supportive' : 'Mixed';

  return [
    {
      id: 'bill-1',
      title: `${stateAbbr} Bill 1`,
      summary: `${riskLabel} policy update focused on youth protections, school policy, and legal access in ${stateName}.`,
      tags: ['Education', 'Safety'],
      billTab: 'active',
      status,
      whatItMeans:
        'This bill updates policy language that directly affects LGBTQ+ youth access to protections, school support systems, and public services.',
      whyItMatters:
        'The legal standard set here can influence how schools and agencies handle identity, safety, and equal treatment for young people.',
      takeActionTitle: 'Take Action',
      takeActionBody:
        "Make your voice heard. Here's how you can create meaningful change. Get started by drafting an email or phone script about this bill to share with your representative.",
      actionItem: {
        title: 'Contact your representatives',
        subtitle: 'Send a message to your elected officials',
      },
      relatedBillIds: ['bill-2', 'bill-3'],
      relatedBills: [
        {
          bill_id: `${stateAbbr} HB903`,
          summary: 'Repeals homosexual conduct offense; nearly identical',
          confidence: 'high',
        },
        {
          bill_id: `${stateAbbr} HB2758`,
          summary: 'Broader scope; adds same-sex marriage updates',
          confidence: 'high',
        },
        {
          bill_id: `${stateAbbr} HB1601`,
          summary: 'Shared health education updates',
          confidence: 'medium',
        },
        {
          bill_id: `${stateAbbr} HB120`,
          summary: 'Thematically related; opposite approach',
          confidence: 'medium',
        },
        {
          bill_id: `${stateAbbr} HB171`,
          summary: 'Prohibits LGBTQ+ studies at public universities',
          confidence: 'medium',
        },
        {
          bill_id: `${stateAbbr} HB3883`,
          summary: 'Connection unclear from available text',
          confidence: 'low',
        },
      ],
    },
    {
      id: 'bill-2',
      title: `${stateAbbr} Bill 2`,
      summary: 'Proposed changes affecting healthcare access and parental consent requirements.',
      tags: ['Healthcare', 'Identity Documents'],
      billTab: 'active',
      status: status === 'supportive' ? 'mixed' : status,
      whatItMeans:
        'This proposal changes eligibility and process rules for care access, with direct impacts on youth and family decision-making timelines.',
      whyItMatters:
        'Changes here can significantly alter care availability and increase barriers for already vulnerable youth populations.',
      takeActionTitle: 'Take Action',
      takeActionBody:
        "Make your voice heard. Here's how you can create meaningful change. Get started by drafting an email or phone script about this bill to share with your representative.",
      actionItem: {
        title: 'Contact your representatives',
        subtitle: 'Send a message to your elected officials',
      },
      relatedBillIds: ['bill-1', 'bill-3'],
    },
    {
      id: 'bill-3',
      title: `${stateAbbr} Bill 3`,
      summary: 'Regulation changes tied to youth participation in school and public programs.',
      tags: ['Sports', 'Education'],
      billTab: 'passed',
      status: status === 'harmful' ? 'mixed' : status,
      whatItMeans:
        'The bill adjusts participation rules and compliance requirements for schools and public institutions.',
      whyItMatters:
        'It can shape whether youth experience inclusion or exclusion in key day-to-day settings.',
      takeActionTitle: 'Take Action',
      takeActionBody:
        "Make your voice heard. Here's how you can create meaningful change. Get started by drafting an email or phone script about this bill to share with your representative.",
      actionItem: {
        title: 'Contact your representatives',
        subtitle: 'Send a message to your elected officials',
      },
      relatedBillIds: ['bill-1', 'bill-2'],
    },
  ];
}

export function getBillDetailForState(context: BillContext, billId: string): BillDetail | null {
  return getBillsForState(context).find((bill) => bill.id === billId) ?? null;
}
