
export enum RoleType {
  Tech = 'Tech',
  NonTech = 'Non-Tech',
  Executive = 'Executive'
}

export interface JobAnalysis {
  role_type: RoleType;
  required_keywords: string[];
  preferred_keywords: string[];
  experience_required: string;
  seniority_level: string;
}

export interface ScoreBreakdown {
  ats_match: number;
  experience: number;
  skills: number;
  seniority: number;
  education: number;
}

export interface CandidateResult {
  candidate_id: string;
  experience_years: string;
  ats_keyword_match_score: string | number;
  fit_score: number;
  strengths: string[];
  gaps: string[];
  missing_keywords: string[];
  recommendation: 'Strong Fit' | 'Potential Fit' | 'Weak Fit';
  justification: string[];
  score_breakdown: ScoreBreakdown;
}

export interface RankingItem {
  candidate_id: string;
  rank: number;
  fit_score: number;
}

export interface ScreenerOutput {
  job_analysis: JobAnalysis;
  candidates: CandidateResult[];
  final_ranking: RankingItem[];
}

export interface ResumeInput {
  id: string;
  text: string;
}
