import React from "react";
import {
  FileText,
  Briefcase,
  Compass,
  ArrowRight,
  TrendingUp,
  Award,
  Layers,
  AlertCircle,
  Download,
  Trash2,
  ExternalLink
} from "lucide-react";
import { Card } from "../components/Card";
import { Badge } from "../components/Badge";
import { MatchResponse, ParsedResume } from "../types";
import { api } from "../services/api";

interface OverviewProps {
  history: MatchResponse[];
  currentResume: ParsedResume | null;
  onNavigate: (tab: any) => void;
  onSelectAnalysis: (analysis: MatchResponse) => void;
  onRefreshHistory: () => void;
}

export const Overview: React.FC<OverviewProps> = ({
  history,
  currentResume,
  onNavigate,
  onSelectAnalysis,
  onRefreshHistory,
}) => {
  // Compute metrics from actual stored analysis records
  const totalAnalyses = history.length;
  const avgScore =
    totalAnalyses > 0
      ? Math.round(
          history.reduce((acc, curr) => acc + curr.overall_score, 0) / totalAnalyses
        )
      : null;

  // Aggregate top detected skills across saved analyses
  const skillCounts: Record<string, number> = {};
  history.forEach((item) => {
    item.skills_analysis?.matching_skills?.forEach((skill) => {
      skillCounts[skill] = (skillCounts[skill] || 0) + 1;
    });
  });
  const topSkills = Object.entries(skillCounts)
    .sort((a, b) => b[1] - a[0].length)
    .slice(0, 6);

  // Aggregate common gaps
  const gapCounts: Record<string, number> = {};
  history.forEach((item) => {
    item.skills_analysis?.missing_required?.forEach((skill) => {
      gapCounts[skill] = (gapCounts[skill] || 0) + 1;
    });
  });
  const topGaps = Object.entries(gapCounts)
    .sort((a, b) => b[1] - a[0].length)
    .slice(0, 5);

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm("Are you sure you want to delete this analysis record?")) {
      await api.deleteHistoryById(id);
      onRefreshHistory();
    }
  };

  return (
    <div className="space-y-8 animate-fade-in pb-12">
      {/* Welcome Banner */}
      <div className="rounded-2xl p-7 bg-gradient-to-r from-slate-900 via-indigo-950/70 to-slate-900 border border-slate-800 shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 w-96 h-96 bg-cyan-500/5 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none"></div>
        <div className="relative z-10 max-w-2xl">
          <Badge variant="cyan" size="sm" className="mb-3">
            NLP-Powered Evaluation Engine
          </Badge>
          <h2 className="text-2xl font-bold text-white tracking-tight">
            CareerMatch AI Dashboard
          </h2>
          <p className="text-sm text-slate-300 mt-2 leading-relaxed">
            Bridge the gap between your resume and industry job requirements using state-of-the-art
            Natural Language Processing, TF-IDF vectorization, semantic sentence transformers, and
            explainable scoring metrics.
          </p>
          <div className="flex flex-wrap items-center gap-3 mt-6">
            <button
              onClick={() => onNavigate("resume")}
              className="px-4 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-semibold text-xs flex items-center gap-2 shadow-lg shadow-cyan-500/20 transition-all hover:scale-[1.02]"
            >
              <FileText size={15} />
              {currentResume ? "Review Extracted Resume" : "Upload & Analyze Resume"}
            </button>
            <button
              onClick={() => onNavigate("job")}
              className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-semibold text-xs flex items-center gap-2 transition-all hover:scale-[1.02]"
            >
              <Briefcase size={15} />
              Match Job Description
            </button>
            <button
              onClick={() => onNavigate("careers")}
              className="px-4 py-2.5 rounded-xl bg-slate-800/60 hover:bg-slate-700/60 text-slate-300 border border-slate-800 font-semibold text-xs flex items-center gap-2 transition-all"
            >
              <Compass size={15} />
              Explore Career Roles
            </button>
          </div>
        </div>
      </div>

      {/* Analytics KPI Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
            <Award size={22} />
          </div>
          <div>
            <p className="text-xs text-slate-400 font-medium">Average Match Score</p>
            <p className="text-2xl font-bold text-white mt-0.5">
              {avgScore !== null ? `${avgScore}%` : "—"}
            </p>
            <span className="text-[11px] text-slate-500">Based on saved analyses</span>
          </div>
        </Card>

        <Card className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
            <TrendingUp size={22} />
          </div>
          <div>
            <p className="text-xs text-slate-400 font-medium">Total Evaluations</p>
            <p className="text-2xl font-bold text-white mt-0.5">{totalAnalyses}</p>
            <span className="text-[11px] text-slate-500">Persisted in SQLite</span>
          </div>
        </Card>

        <Card className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
            <Layers size={22} />
          </div>
          <div>
            <p className="text-xs text-slate-400 font-medium">Skills Verified</p>
            <p className="text-2xl font-bold text-white mt-0.5">
              {currentResume ? currentResume.skills.length : topSkills.length}
            </p>
            <span className="text-[11px] text-slate-500">From active candidate profile</span>
          </div>
        </Card>

        <Card className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-center text-rose-400">
            <AlertCircle size={22} />
          </div>
          <div>
            <p className="text-xs text-slate-400 font-medium">Core Gaps Monitored</p>
            <p className="text-2xl font-bold text-white mt-0.5">{topGaps.length}</p>
            <span className="text-[11px] text-slate-500">Roadmap recommendations</span>
          </div>
        </Card>
      </div>

      {/* Main Content Split: Skills Overview + Recent Analyses */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Top Detected Skills & Gaps */}
        <div className="space-y-6">
          <Card title="Top Verified Skills" subtitle="Detected frequently in candidate profiles">
            {topSkills.length > 0 ? (
              <div className="flex flex-wrap gap-2 pt-1">
                {topSkills.map(([skill, count]) => (
                  <Badge key={skill} variant="success" size="md">
                    {skill} <span className="opacity-60 text-[10px]">({count})</span>
                  </Badge>
                ))}
              </div>
            ) : currentResume && currentResume.skills.length > 0 ? (
              <div className="flex flex-wrap gap-2 pt-1">
                {currentResume.skills.slice(0, 8).map((skill) => (
                  <Badge key={skill} variant="success" size="md">
                    {skill}
                  </Badge>
                ))}
              </div>
            ) : (
              <p className="text-xs text-slate-500 py-3">
                No verified skills recorded yet. Upload a resume to populate skills.
              </p>
            )}
          </Card>

          <Card title="Key Missing Requirements" subtitle="Frequent gaps across evaluated job postings">
            {topGaps.length > 0 ? (
              <div className="space-y-2 pt-1">
                {topGaps.map(([gap, count]) => (
                  <div
                    key={gap}
                    className="flex items-center justify-between p-2 rounded-lg bg-slate-800/40 border border-slate-800 text-xs"
                  >
                    <span className="font-medium text-slate-300">{gap}</span>
                    <Badge variant="danger" size="sm">
                      {count} {count === 1 ? "role" : "roles"}
                    </Badge>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-slate-500 py-3">
                No skill gaps identified yet. Run a job match to uncover skill requirements.
              </p>
            )}
          </Card>
        </div>

        {/* Right Column: Recent Analysis History */}
        <div className="lg:col-span-2">
          <Card
            title="Recent Match Analyses"
            subtitle="View, open, or export previous job evaluations"
            action={
              history.length > 0 && (
                <button
                  onClick={() => onNavigate("history")}
                  className="text-xs text-cyan-400 hover:text-cyan-300 font-semibold flex items-center gap-1"
                >
                  View All ({history.length}) <ArrowRight size={13} />
                </button>
              )
            }
          >
            {history.length > 0 ? (
              <div className="divide-y divide-slate-800/70 overflow-x-auto">
                {history.slice(0, 5).map((item) => {
                  const scoreVariant =
                    item.overall_score >= 85
                      ? "success"
                      : item.overall_score >= 70
                      ? "cyan"
                      : item.overall_score >= 50
                      ? "warning"
                      : "danger";

                  return (
                    <div
                      key={item.id}
                      onClick={() => onSelectAnalysis(item)}
                      className="py-3.5 flex items-center justify-between gap-4 cursor-pointer hover:bg-slate-800/40 px-2 rounded-lg transition-colors group"
                    >
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-semibold text-slate-100 truncate group-hover:text-cyan-300 transition-colors">
                            {item.target_job_title}
                          </p>
                          <Badge variant={scoreVariant} size="sm">
                            {item.overall_score}%
                          </Badge>
                        </div>
                        <p className="text-xs text-slate-400 mt-0.5 truncate">
                          Candidate: {item.candidate_name} &bull;{" "}
                          {item.created_at ? item.created_at.slice(0, 10) : "Recent"}
                        </p>
                      </div>

                      <div className="flex items-center gap-2 flex-shrink-0">
                        <a
                          href={api.getDownloadPdfUrl(item.id)}
                          onClick={(e) => e.stopPropagation()}
                          download
                          className="p-1.5 rounded-lg bg-slate-800 text-slate-300 hover:text-cyan-300 hover:bg-slate-700 transition-colors"
                          title="Download PDF Report"
                        >
                          <Download size={15} />
                        </a>
                        <button
                          onClick={(e) => handleDelete(item.id, e)}
                          className="p-1.5 rounded-lg bg-slate-800 text-slate-400 hover:text-rose-400 hover:bg-slate-700 transition-colors"
                          title="Delete Analysis"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              /* Empty State for New Users */
              <div className="py-12 px-4 text-center">
                <div className="w-14 h-14 rounded-2xl bg-slate-800/60 border border-slate-700/60 flex items-center justify-center text-slate-400 mx-auto mb-4">
                  <FileText size={26} />
                </div>
                <h4 className="text-base font-semibold text-slate-200">No Analyses Recorded Yet</h4>
                <p className="text-xs text-slate-400 max-w-sm mx-auto mt-1 leading-relaxed">
                  Upload a resume and compare it against any target job description. Your evaluation
                  history, metrics, and skill-gap breakdowns will appear here.
                </p>
                <div className="mt-5">
                  <button
                    onClick={() => onNavigate("resume")}
                    className="px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-semibold text-xs shadow-md shadow-cyan-500/20 transition-all"
                  >
                    Get Started with Resume Upload
                  </button>
                </div>
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
};
