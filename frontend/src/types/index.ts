export interface EducationItem {
  degree: string;
  institution: string;
  year: string;
  details: string;
}

export interface WorkExperienceItem {
  title: string;
  company: string;
  duration: string;
  bullets: string[];
}

export interface ProjectItem {
  name: string;
  tech_stack: string[];
  description: string;
  bullets: string[];
}

export interface ParsedResume {
  candidate_name: string;
  email?: string | null;
  phone?: string | null;
  skills: string[];
  education: EducationItem[];
  work_experience: WorkExperienceItem[];
  projects: ProjectItem[];
  certifications: string[];
  raw_text: string;
  file_name: string;
  is_scanned_pdf: boolean;
  extraction_warning?: string | null;
}

export interface ParsedJob {
  title: string;
  required_skills: string[];
  preferred_skills: string[];
  qualifications: string[];
  years_of_experience?: number | null;
  responsibilities: string[];
  raw_text: string;
}

export interface MatchWeights {
  semantic_similarity: number;
  required_skills: number;
  preferred_skills: number;
  experience: number;
  education: number;
}

export interface RequirementEvidence {
  requirement: string;
  resume_evidence: string;
  status: "Matched" | "Partially Matched" | "Missing" | "Unassessed";
  explanation: string;
}

export interface SkillAnalysisResult {
  matching_skills: string[];
  missing_required: string[];
  missing_preferred: string[];
  candidate_extra_skills: string[];
  skill_coverage_pct: number;
  required_coverage_pct: number;
  preferred_coverage_pct: number;
}

export interface ScoringBreakdown {
  semantic_score: number;
  required_skill_score: number;
  preferred_skill_score: number;
  experience_score: number;
  education_score: number;
  weights_used: Record<string, number>;
  category_status: Record<string, string>;
}

export interface LearningResource {
  title: string;
  url: string;
}

export interface SkillGapItem {
  skill: string;
  priority: "High" | "Medium" | "Optional";
  is_required: boolean;
  why_it_matters: string;
  missing_evidence: string;
  suggested_project: string;
  learning_resources: LearningResource[];
}

export interface BulletImprovementItem {
  original_bullet: string;
  improved_bullet: string;
  rationale: string;
  detected_issues: string[];
  weak_verbs_found: string[];
  missing_metric: boolean;
}

export interface ResumeImprovementResult {
  bullet_suggestions: BulletImprovementItem[];
  strong_action_verbs_recommended: string[];
  formatting_critique: string[];
  metrics_detected_count: number;
  weak_verbs_detected_count: number;
}

export interface MatchResponse {
  id: string;
  created_at: string;
  resume_filename: string;
  candidate_name: string;
  target_job_title: string;
  overall_score: number;
  compatibility_category: "Strong Match" | "Good Match" | "Moderate Match" | "Low Match";
  summary_explanation: string;
  key_strengths: string[];
  key_gaps: string[];
  scoring_breakdown: ScoringBreakdown;
  skills_analysis: SkillAnalysisResult;
  requirements_analysis: RequirementEvidence[];
  skill_gaps: SkillGapItem[];
  improvement_suggestions: ResumeImprovementResult;
  engine_mode: string;
}

export interface CareerRoleTemplate {
  id: string;
  title: string;
  category: string;
  description: string;
  core_skills: string[];
  preferred_skills: string[];
  min_experience_years: number;
}

export interface CareerMatchItem {
  role: CareerRoleTemplate;
  match_score: number;
  matching_skills: string[];
  skills_to_develop: string[];
  fit_rationale: string;
}

export interface SystemHealthResponse {
  status: string;
  spacy_loaded: boolean;
  transformer_loaded: boolean;
  active_nlp_mode: string;
  models_info: Record<string, any>;
}
