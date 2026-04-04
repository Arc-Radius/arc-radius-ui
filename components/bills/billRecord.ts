/** Graph / LegiScan-style bill fields (partial) for detail metadata mapping */
export interface GraphBillRecord {
  bill_pk?: string;
  bill_id?: string;
  state?: string;
  session_id?: string;
  bill_number?: string;
  title?: string;
  description?: string;
  status?: string;
  status_desc?: string;
  status_date?: string;
  url?: string;
  state_link?: string;
  label?: string;
  label_source?: string;
  confidence?: number;
  relevance_score?: number;
  issues?: string;
  issue_categories?: string;
  sponsor_names?: string;
  primary_sponsor?: string;
  last_action?: string;
  last_action_date?: string;
  year?: number;
  state_lean?: string;
  bill_dominant_party?: string;
  state_r_sponsorship_ratio?: number;
  /** Numeric gap or display string e.g. `+12%` */
  pass_rate_gap?: number | string;
  /** Rate 0–1, percent 0–100, or display string e.g. `34%` */
  overall_pass_rate?: number | string;
  session_year?: number;
}
