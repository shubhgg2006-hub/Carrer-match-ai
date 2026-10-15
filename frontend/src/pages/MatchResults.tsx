import React from "react";
import {
  Download,
  CheckCircle,
  AlertTriangle,
  XCircle,
  HelpCircle,
  ArrowRight,
  TrendingUp,
  FileText,
  Award,
  Sparkles,
  Target
} from "lucide-react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar
} from "recharts";
import { Card } from "../components/Card";
import { Badge } from "../components/Badge";
import { MatchResponse } from "../types";
import { api } from "../services/api";

interface MatchResultsProps {
  result: MatchResponse;
  onNavigateToGaps: () => void;
  onNavigateToImprove: () => void;
  onNavigateToJob: () => void;
}

export const MatchResults: React.FC<MatchResultsProps> = ({
  result,
  onNavigateToGaps,
  onNavigateToImprove,
  onNavigateToJob,
}) => {
  const scoreVariant =
    result.overall_score >= 85
      ? "success"
      : result.overall_score >= 70
      ? "cyan"
      : result.overall_score >= 50
      ? "warning"
      : "danger";

  // Data for Category Bar Chart
  const breakdown = result.scoring_breakdown;
  const chartData = [
    { category: "Semantic Sim.", score: breakdown.semantic_score, weight: (breakdown.weights_used.semantic_similarity || 0.35) * 100 },
    { category: "Req. Skills", score: breakdown.required_skill_score, weight: (breakdown.weights_used.required_skills || 0.30) * 100 },
    { category: "Pref. Skills", score: breakdown.preferred_skill_score, weight: (breakdown.weights_used.preferred_skills || 0.15) * 100 },
    { category: "Experience", score: breakdown.experience_score, weight: (breakdown.weights_used.experience || 0.10) * 100 },
    { category: "Education", score: breakdown.education_score, weight: (breakdown.weights_used.education || 0.10) * 100 },
  ];

  // Data for Radar Chart
  const radarData = [
    { subject: "Semantic Similarity", value: breakdown.semantic_score, fullMark: 100 },
    { subject: "Required Skills", value: breakdown.required_skill_score, fullMark: 100 },
    { subject: "Preferred Skills", value: breakdown.preferred_skill_score, fullMark: 100 },
    { subject: "Experience Alignment", value: breakdown.experience_score, fullMark: 100 },
    { subject: "Education Alignment", value: breakdown.education_score, fullMark: 100 },
  ];

  return (
    <div className="space-y-8 animate-fade-in pb-16">
      {/* Top Header Card */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-slate-900 via-indigo-950/60 to-slate-900 border border-slate-800 shadow-xl flex flex-wrap items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <Badge variant="cyan" size="sm">
              {result.engine_mode}
            </Badge>
            <span className="text-xs text-slate-400">
              Analysis ID: {result.id.slice(0, 8)}
            </span>
          </div>
          <h2 className="text-xl font-bold text-white tracking-tight">
            Match Report: <span className="text-cyan-300">{result.target_job_title}</span>
          </h2>
          <p className="text-xs text-slate-300 mt-1">
            Candidate: <b>{result.candidate_name}</b> ({result.resume_filename}) &bull;{" "}
            {result.created_at ? result.created_at.slice(0, 10) : "Just now"}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <a
            href={api.getDownloadPdfUrl(result.id)}
            download
            className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-semibold text-xs flex items-center gap-2 shadow-md transition-all"
          >
            <Download size={14} className="text-cyan-400" />
            Download PDF Report
          </a>
          <button
            onClick={onNavigateToGaps}
            className="px-4 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs flex items-center gap-2 shadow-lg shadow-cyan-500/20 transition-all hover:scale-[1.02]"
          >
            <Target size={14} />
            View Skill Gap Roadmap
          </button>
        </div>
      </div>

      {/* Hero Compatibility Score Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Score Widget */}
        <Card className="flex flex-col items-center justify-center p-8 text-center relative overflow-hidden">
          <div className="relative mb-3">
            <div className="w-32 h-32 rounded-full border-4 border-slate-800 flex items-center justify-center bg-slate-950/80 shadow-2xl">
              <div className="text-center">
                <span className="text-4xl font-extrabold text-white tracking-tighter">
                  {result.overall_score}%
                </span>
                <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">
                  Match
                </span>
              </div>
            </div>
          </div>

          <Badge variant={scoreVariant} size="md" className="mb-2 text-sm font-bold">
            {result.compatibility_category}
          </Badge>
          <span className="text-[11px] text-slate-400 font-semibold uppercase tracking-wider">
            Estimated Match Score
          </span>
          <p className="text-[10px] text-slate-500 max-w-xs mt-2 leading-relaxed">
            Note: Approximate tool-generated estimate derived from NLP and semantic vector
            representations, not a probability of hiring.
          </p>
        </Card>

        {/* Executive Summary & Insights */}
        <div className="lg:col-span-2 space-y-4">
          <Card title="Executive Compatibility Summary" subtitle="Algorithmically explained rationale">
            <p className="text-sm text-slate-200 leading-relaxed">
              {result.summary_explanation}
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-5 pt-4 border-t border-slate-800/80">
              <div className="p-3.5 rounded-xl bg-emerald-950/20 border border-emerald-500/30">
                <h4 className="text-xs font-bold text-emerald-300 flex items-center gap-1.5 mb-2">
                  <CheckCircle size={14} /> Key Profile Strengths
                </h4>
                <ul className="text-xs text-slate-300 space-y-1 list-disc list-inside">
                  {result.key_strengths.map((str, i) => (
                    <li key={i}>{str}</li>
                  ))}
                </ul>
              </div>

              <div className="p-3.5 rounded-xl bg-rose-950/20 border border-rose-500/30">
                <h4 className="text-xs font-bold text-rose-300 flex items-center gap-1.5 mb-2">
                  <AlertTriangle size={14} /> Most Important Gaps
                </h4>
                <ul className="text-xs text-slate-300 space-y-1 list-disc list-inside">
                  {result.key_gaps.map((gap, i) => (
                    <li key={i}>{gap}</li>
                  ))}
                </ul>
              </div>
            </div>
          </Card>
        </div>
      </div>

      {/* Supporting Visual Analytics: Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card title="Category Alignment Scores (0-100)" subtitle="Performance across evaluated dimensions">
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 15, right: 20, left: -10, bottom: 5 }}>
                <XAxis dataKey="category" tick={{ fill: "#94a3b8", fontSize: 11 }} />
                <YAxis domain={[0, 100]} tick={{ fill: "#94a3b8", fontSize: 11 }} />
                <Tooltip
                  contentStyle={{ backgroundColor: "#0f172a", borderColor: "#334155", borderRadius: "8px", fontSize: "12px" }}
                  formatter={(value: any) => [`${value}%`, "Score"]}
                />
                <Bar dataKey="score" fill="#06b6d4" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-3 flex items-center justify-between text-[11px] text-slate-400 border-t border-slate-800 pt-2">
            <span>Weights: 35% Semantic &bull; 30% Required Skills &bull; 15% Preferred &bull; 10% Exp. &bull; 10% Edu.</span>
          </div>
        </Card>

        <Card title="Competency Radar Alignment" subtitle="Normalized multi-dimensional balance">
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={radarData} outerRadius="70%">
                <PolarGrid stroke="#334155" />
                <PolarAngleAxis dataKey="subject" tick={{ fill: "#94a3b8", fontSize: 10 }} />
                <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fill: "#64748b", fontSize: 9 }} />
                <Radar name="Candidate" dataKey="value" stroke="#22d3ee" fill="#06b6d4" fillOpacity={0.4} />
              </RadarChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-3 text-center text-[11px] text-slate-400 border-t border-slate-800 pt-2">
            Displays normalized alignment profile across all 5 evaluation vectors
          </div>
        </Card>
      </div>

      {/* Skill Comparison Breakdown */}
      <Card title="Skill Comparison & Coverage" subtitle="Categorized taxonomy breakdown">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
          <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800">
            <p className="text-xs text-slate-400">Total Skill Coverage</p>
            <p className="text-2xl font-bold text-white mt-1">
              {result.skills_analysis.skill_coverage_pct}%
            </p>
          </div>
          <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800">
            <p className="text-xs text-slate-400">Required Skills Coverage</p>
            <p className="text-2xl font-bold text-rose-300 mt-1">
              {result.skills_analysis.required_coverage_pct}%
            </p>
          </div>
          <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800">
            <p className="text-xs text-slate-400">Preferred Skills Coverage</p>
            <p className="text-2xl font-bold text-amber-300 mt-1">
              {result.skills_analysis.preferred_coverage_pct}%
            </p>
          </div>
          <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800">
            <p className="text-xs text-slate-400">Extra Candidate Skills</p>
            <p className="text-2xl font-bold text-cyan-300 mt-1">
              {result.skills_analysis.candidate_extra_skills.length}
            </p>
          </div>
        </div>

        <div className="space-y-4 pt-2">
          {/* Matching Skills */}
          <div>
            <span className="text-xs font-bold text-emerald-400 block mb-1.5">
              Matching Skills ({result.skills_analysis.matching_skills.length}):
            </span>
            <div className="flex flex-wrap gap-1.5">
              {result.skills_analysis.matching_skills.length > 0 ? (
                result.skills_analysis.matching_skills.map((s) => (
                  <Badge key={s} variant="success">
                    {s}
                  </Badge>
                ))
              ) : (
                <span className="text-xs text-slate-500">No matching skills identified.</span>
              )}
            </div>
          </div>

          {/* Missing Required Skills */}
          <div>
            <span className="text-xs font-bold text-rose-400 block mb-1.5">
              Missing Required Skills ({result.skills_analysis.missing_required.length}):
            </span>
            <div className="flex flex-wrap gap-1.5">
              {result.skills_analysis.missing_required.length > 0 ? (
                result.skills_analysis.missing_required.map((s) => (
                  <Badge key={s} variant="danger">
                    {s}
                  </Badge>
                ))
              ) : (
                <span className="text-xs text-emerald-400 font-semibold">100% Required Skills Covered!</span>
              )}
            </div>
          </div>

          {/* Missing Preferred Skills */}
          <div>
            <span className="text-xs font-bold text-amber-400 block mb-1.5">
              Missing Preferred Skills ({result.skills_analysis.missing_preferred.length}):
            </span>
            <div className="flex flex-wrap gap-1.5">
              {result.skills_analysis.missing_preferred.length > 0 ? (
                result.skills_analysis.missing_preferred.map((s) => (
                  <Badge key={s} variant="warning">
                    {s}
                  </Badge>
                ))
              ) : (
                <span className="text-xs text-slate-500">No missing preferred skills.</span>
              )}
            </div>
          </div>

          {/* Extra Candidate Skills */}
          <div>
            <span className="text-xs font-bold text-slate-300 block mb-1.5">
              Additional Skills Candidate Brings ({result.skills_analysis.candidate_extra_skills.length}):
            </span>
            <div className="flex flex-wrap gap-1.5">
              {result.skills_analysis.candidate_extra_skills.slice(0, 12).map((s) => (
                <Badge key={s} variant="neutral">
                  {s}
                </Badge>
              ))}
            </div>
          </div>
        </div>
      </Card>

      {/* Requirement-by-Requirement Evidence Table */}
      <Card
        title="Requirement-by-Requirement Evidence Table"
        subtitle="Full transparency into how the resume matches each requirement"
      >
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950/80 text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-800">
              <tr>
                <th className="py-3 px-4 font-semibold">Requirement</th>
                <th className="py-3 px-4 font-semibold">Status</th>
                <th className="py-3 px-4 font-semibold">Resume Evidence</th>
                <th className="py-3 px-4 font-semibold">NLP Explanation</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-300">
              {result.requirements_analysis.map((req, idx) => {
                const statusBadge =
                  req.status === "Matched" ? (
                    <Badge variant="success" size="sm">
                      <CheckCircle size={12} /> Matched
                    </Badge>
                  ) : req.status === "Partially Matched" ? (
                    <Badge variant="warning" size="sm">
                      <AlertTriangle size={12} /> Partial
                    </Badge>
                  ) : req.status === "Missing" ? (
                    <Badge variant="danger" size="sm">
                      <XCircle size={12} /> Missing
                    </Badge>
                  ) : (
                    <Badge variant="neutral" size="sm">
                      <HelpCircle size={12} /> Unassessed
                    </Badge>
                  );

                return (
                  <tr key={idx} className="hover:bg-slate-800/30 transition-colors">
                    <td className="py-3 px-4 font-semibold text-slate-100 max-w-[180px]">
                      {req.requirement}
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap">{statusBadge}</td>
                    <td className="py-3 px-4 max-w-[280px] font-mono text-[11px] text-slate-300">
                      {req.resume_evidence}
                    </td>
                    <td className="py-3 px-4 max-w-[280px] text-slate-400">
                      {req.explanation}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Next Step Navigation CTA */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-5 rounded-2xl bg-slate-900 border border-slate-800">
        <div>
          <h4 className="text-sm font-semibold text-slate-200">Recommended Next Steps:</h4>
          <p className="text-xs text-slate-400">
            Address identified skill gaps or polish resume bullet points to increase your match score.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={onNavigateToImprove}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold flex items-center gap-1.5 transition-colors"
          >
            <Sparkles size={14} className="text-cyan-400" />
            Resume Improvement Assistant
          </button>
          <button
            onClick={onNavigateToGaps}
            className="px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-xs font-bold flex items-center gap-1.5 shadow-md shadow-cyan-500/20 transition-all"
          >
            Skill Gap Action Plan <ArrowRight size={14} />
          </button>
        </div>
      </div>
    </div>
  );
};
