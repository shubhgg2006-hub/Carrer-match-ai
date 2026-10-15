import React, { useState } from "react";
import {
  Target,
  ExternalLink,
  BookOpen,
  Code2,
  AlertCircle,
  CheckCircle2,
  Filter
} from "lucide-react";
import { Card } from "../components/Card";
import { Badge } from "../components/Badge";
import { MatchResponse, SkillGapItem } from "../types";

interface SkillGapAnalysisProps {
  currentMatch: MatchResponse | null;
  onNavigateToJob: () => void;
}

export const SkillGapAnalysis: React.FC<SkillGapAnalysisProps> = ({
  currentMatch,
  onNavigateToJob,
}) => {
  const [filterPriority, setFilterPriority] = useState<string>("All");

  if (!currentMatch) {
    return (
      <div className="py-20 text-center animate-fade-in">
        <div className="w-16 h-16 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-500 mx-auto mb-4">
          <Target size={30} />
        </div>
        <h3 className="text-base font-semibold text-slate-200">No Active Match Evaluation</h3>
        <p className="text-xs text-slate-400 max-w-sm mx-auto mt-1 mb-5">
          Run an intelligent match between your resume and a job description to generate a customized
          skill gap roadmap.
        </p>
        <button
          onClick={onNavigateToJob}
          className="px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs shadow-md shadow-cyan-500/20 transition-all"
        >
          Go to Job Matcher
        </button>
      </div>
    );
  }

  const gaps = currentMatch.skill_gaps || [];
  const filteredGaps =
    filterPriority === "All"
      ? gaps
      : gaps.filter((g) => g.priority === filterPriority);

  const highCount = gaps.filter((g) => g.priority === "High").length;
  const medCount = gaps.filter((g) => g.priority === "Medium").length;
  const optCount = gaps.filter((g) => g.priority === "Optional").length;

  return (
    <div className="space-y-8 animate-fade-in pb-16">
      {/* Top Role Header */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-slate-900 via-indigo-950/60 to-slate-900 border border-slate-800 shadow-xl flex flex-wrap items-center justify-between gap-4">
        <div>
          <Badge variant="cyan" size="sm" className="mb-2">
            Target Role Roadmap
          </Badge>
          <h2 className="text-xl font-bold text-white tracking-tight">
            Skill Gap & Learning Roadmap:{" "}
            <span className="text-cyan-300">{currentMatch.target_job_title}</span>
          </h2>
          <p className="text-xs text-slate-300 mt-1">
            Actionable learning recommendations to bridge the gap between candidate qualifications and role expectations.
          </p>
        </div>

        {/* Priority Filter Buttons */}
        <div className="flex items-center gap-1.5 p-1 rounded-xl bg-slate-950 border border-slate-800 text-xs">
          {["All", "High", "Medium", "Optional"].map((prio) => (
            <button
              key={prio}
              onClick={() => setFilterPriority(prio)}
              className={`px-3 py-1.5 rounded-lg font-semibold transition-colors ${
                filterPriority === prio
                  ? "bg-cyan-500 text-slate-950"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              {prio}{" "}
              {prio === "High" && `(${highCount})`}
              {prio === "Medium" && `(${medCount})`}
              {prio === "Optional" && `(${optCount})`}
            </button>
          ))}
        </div>
      </div>

      {/* Overview Stat Badges */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-xl bg-rose-950/20 border border-rose-500/30 flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-rose-300">High Priority Gaps</span>
            <p className="text-2xl font-extrabold text-white mt-0.5">{highCount}</p>
            <span className="text-[10px] text-slate-400">Critical missing required skills</span>
          </div>
          <Badge variant="danger" size="md">Immediate Focus</Badge>
        </div>

        <div className="p-4 rounded-xl bg-amber-950/20 border border-amber-500/30 flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-amber-300">Medium Priority Gaps</span>
            <p className="text-2xl font-extrabold text-white mt-0.5">{medCount}</p>
            <span className="text-[10px] text-slate-400">Missing preferred qualifications</span>
          </div>
          <Badge variant="warning" size="md">Competitive Edge</Badge>
        </div>

        <div className="p-4 rounded-xl bg-cyan-950/20 border border-cyan-500/30 flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-cyan-300">Optional Enhancements</span>
            <p className="text-2xl font-extrabold text-white mt-0.5">{optCount}</p>
            <span className="text-[10px] text-slate-400">Advanced architectures</span>
          </div>
          <Badge variant="cyan" size="md">Nice to Have</Badge>
        </div>
      </div>

      {/* Prioritized Gap Cards List */}
      <div className="space-y-4">
        {filteredGaps.length > 0 ? (
          filteredGaps.map((item, idx) => {
            const prioVariant =
              item.priority === "High"
                ? "danger"
                : item.priority === "Medium"
                ? "warning"
                : "cyan";

            return (
              <Card key={idx} className="space-y-4 hover:border-slate-700 transition-all">
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-slate-800 flex items-center justify-center text-cyan-400">
                      <Target size={18} />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-base font-bold text-slate-100">{item.skill}</h3>
                        <Badge variant={prioVariant} size="sm">
                          {item.priority} Priority
                        </Badge>
                        <Badge variant="neutral" size="sm">
                          {item.is_required ? "Required Criterion" : "Preferred Criterion"}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                  {/* Left: Why it matters & Evidence */}
                  <div className="space-y-3">
                    <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/80">
                      <span className="font-bold text-slate-300 block mb-1">Why It Matters for This Role:</span>
                      <p className="text-slate-400 leading-relaxed">{item.why_it_matters}</p>
                    </div>

                    <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/80">
                      <span className="font-bold text-slate-300 block mb-1">Resume Verification Status:</span>
                      <p className="text-slate-400 leading-relaxed">{item.missing_evidence}</p>
                    </div>
                  </div>

                  {/* Right: Suggested Project & Resources */}
                  <div className="space-y-3">
                    <div className="p-3 rounded-xl bg-cyan-950/20 border border-cyan-500/25">
                      <span className="font-bold text-cyan-300 flex items-center gap-1.5 mb-1">
                        <Code2 size={14} /> Suggested Practice Project:
                      </span>
                      <p className="text-slate-300 leading-relaxed">{item.suggested_project}</p>
                    </div>

                    {item.learning_resources.length > 0 && (
                      <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/80">
                        <span className="font-bold text-slate-300 flex items-center gap-1.5 mb-1.5">
                          <BookOpen size={14} className="text-indigo-400" /> Curated Learning Resources:
                        </span>
                        <div className="space-y-1">
                          {item.learning_resources.map((res, rIdx) => (
                            <a
                              key={rIdx}
                              href={res.url}
                              target="_blank"
                              rel="noreferrer"
                              className="text-xs text-cyan-400 hover:text-cyan-300 flex items-center gap-1 hover:underline"
                            >
                              <span>{res.title}</span>
                              <ExternalLink size={11} />
                            </a>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </Card>
            );
          })
        ) : (
          <div className="py-12 text-center text-xs text-slate-400">
            No skill gaps match the selected filter.
          </div>
        )}
      </div>
    </div>
  );
};
