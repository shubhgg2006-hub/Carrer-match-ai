import {
  ParsedResume,
  ParsedJob,
  MatchWeights,
  MatchResponse,
  SkillGapItem,
  ResumeImprovementResult,
  CareerRoleTemplate,
  CareerMatchItem,
  SystemHealthResponse
} from "../types";

const API_BASE = "http://127.0.0.1:8000/api";

export const api = {
  // System Health
  async getHealth(): Promise<SystemHealthResponse> {
    const res = await fetch(`${API_BASE}/health`);
    if (!res.ok) throw new Error("Health check failed");
    return res.json();
  },

  // Resume Upload
  async uploadResume(file: File): Promise<ParsedResume> {
    const formData = new FormData();
    formData.append("file", file);

    const res = await fetch(`${API_BASE}/resume/upload`, {
      method: "POST",
      body: formData,
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({ detail: "Failed to upload resume" }));
      throw new Error(err.detail || "Resume upload failed");
    }

    return res.json();
  },

  // Resume Analyze (pasted text)
  async analyzeResumeText(text: string, fileName = "pasted_resume.txt"): Promise<ParsedResume> {
    const res = await fetch(`${API_BASE}/resume/analyze`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text, file_name: fileName }),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({ detail: "Failed to analyze resume" }));
      throw new Error(err.detail || "Resume analysis failed");
    }

    return res.json();
  },

  // Resume Improvement
  async improveResume(resume: ParsedResume): Promise<ResumeImprovementResult> {
    const res = await fetch(`${API_BASE}/resume/improve`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(resume),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({ detail: "Failed to get suggestions" }));
      throw new Error(err.detail || "Resume improvement analysis failed");
    }

    return res.json();
  },

  // Job Description Analyze
  async analyzeJobText(text: string, title?: string): Promise<ParsedJob> {
    const res = await fetch(`${API_BASE}/job/analyze`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text, title }),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({ detail: "Failed to parse job description" }));
      throw new Error(err.detail || "Job description analysis failed");
    }

    return res.json();
  },

  // Intelligent Match
  async runMatch(resume: ParsedResume, job: ParsedJob, weights?: MatchWeights): Promise<MatchResponse> {
    const res = await fetch(`${API_BASE}/match`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        resume_data: resume,
        job_data: job,
        weights: weights || null,
      }),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({ detail: "Matching algorithm failed" }));
      throw new Error(err.detail || "Match calculation failed");
    }

    return res.json();
  },

  // Skill Gap Analysis
  async getSkillGaps(resume: ParsedResume, job: ParsedJob): Promise<SkillGapItem[]> {
    const res = await fetch(`${API_BASE}/skills/gap-analysis`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        resume_data: resume,
        job_data: job,
      }),
    });

    if (!res.ok) throw new Error("Skill gap analysis failed");
    return res.json();
  },

  // Career Explorer
  async getCareerRoles(): Promise<CareerRoleTemplate[]> {
    const res = await fetch(`${API_BASE}/careers`);
    if (!res.ok) throw new Error("Failed to load career roles");
    return res.json();
  },

  async matchCareerRoles(resume: ParsedResume): Promise<CareerMatchItem[]> {
    const res = await fetch(`${API_BASE}/careers/match`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(resume),
    });

    if (!res.ok) throw new Error("Failed to match career paths");
    return res.json();
  },

  // Analysis History
  async getHistory(): Promise<MatchResponse[]> {
    const res = await fetch(`${API_BASE}/history`);
    if (!res.ok) throw new Error("Failed to retrieve analysis history");
    return res.json();
  },

  async getHistoryById(id: string): Promise<MatchResponse> {
    const res = await fetch(`${API_BASE}/history/${id}`);
    if (!res.ok) throw new Error("Analysis record not found");
    return res.json();
  },

  async deleteHistoryById(id: string): Promise<void> {
    const res = await fetch(`${API_BASE}/history/${id}`, {
      method: "DELETE",
    });
    if (!res.ok) throw new Error("Failed to delete analysis");
  },

  async clearAllHistory(): Promise<void> {
    const res = await fetch(`${API_BASE}/history`, {
      method: "DELETE",
    });
    if (!res.ok) throw new Error("Failed to clear history");
  },

  getDownloadPdfUrl(id: string): string {
    return `${API_BASE}/history/${id}/pdf`;
  }
};
