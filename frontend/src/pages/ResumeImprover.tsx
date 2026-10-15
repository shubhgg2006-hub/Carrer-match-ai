import React, { useState } from "react";
import {
  Sparkles,
  Copy,
  Check,
  Download,
  AlertTriangle,
  Flame,
  ArrowRight,
  TrendingUp,
  FileCheck,
  Info
} from "lucide-react";
import { Card } from "../components/Card";
import { Badge } from "../components/Badge";
import { ParsedResume, ResumeImprovementResult } from "../types";
import { api } from "../services/api";

interface ResumeImproverProps {
  currentResume: ParsedResume | null;
  onNavigateToResume: () => void;
}

export const ResumeImprover: React.FC<ResumeImproverProps> = ({
  currentResume,
  onNavigateToResume,
}) => {
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [copiedDraft, setCopiedDraft] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<ResumeImprovementResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  React.useEffect(() => {
    if (currentResume) {
      setIsLoading(true);
      api
        .improveResume(currentResume)
        .then((res) => setAnalysisResult(res))
        .catch((err) => console.error(err))
        .finally(() => setIsLoading(false));
    }
  }, [currentResume]);

  if (!currentResume) {
    return (
      <div className="py-20 text-center animate-fade-in">
        <div className="w-16 h-16 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-500 mx-auto mb-4">
          <Sparkles size={30} />
        </div>
        <h3 className="text-base font-semibold text-slate-200">No Resume Loaded</h3>
        <p className="text-xs text-slate-400 max-w-sm mx-auto mt-1 mb-5">
          Please upload or paste a resume first to run automated bullet analysis and generate action
          verb enhancements.
        </p>
        <button
          onClick={onNavigateToResume}
          className="px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs shadow-md shadow-cyan-500/20 transition-all"
        >
          Go to Resume Analyzer
        </button>
      </div>
    );
  }

  const handleCopyBullet = (text: string, idx: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(idx);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const handleExportRevisedDraft = () => {
    if (!currentResume || !analysisResult) return;

    let revisedText = currentResume.raw_text;
    analysisResult.bullet_suggestions.forEach((item) => {
      revisedText = revisedText.replace(item.original_bullet, item.improved_bullet);
    });

    const blob = new Blob([revisedText], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `Revised_${currentResume.candidate_name.replace(/\s+/g, "_")}_Draft.txt`;
    link.click();
    URL.revokeObjectURL(url);

    setCopiedDraft(true);
    setTimeout(() => setCopiedDraft(false), 2500);
  };

  const suggestions = analysisResult?.bullet_suggestions || [];
  const metricsCount = analysisResult?.metrics_detected_count || 0;
  const weakCount = analysisResult?.weak_verbs_detected_count || 0;

  return (
    <div className="space-y-8 animate-fade-in pb-16">
      {/* Header Banner */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-slate-900 via-indigo-950/60 to-slate-900 border border-slate-800 shadow-xl flex flex-wrap items-center justify-between gap-4">
        <div>
          <Badge variant="cyan" size="sm" className="mb-2">
            Action Verb & Metric Optimizer
          </Badge>
          <h2 className="text-xl font-bold text-white tracking-tight">
            Resume Improvement Assistant: <span className="text-cyan-300">{currentResume.candidate_name}</span>
          </h2>
          <p className="text-xs text-slate-300 mt-1 max-w-2xl leading-relaxed">
            Enhance passive bullet points with quantifiable engineering impact. All rewrites use
            bracketed placeholders (e.g. <code className="text-cyan-300 font-mono">[X]%</code>) so you can insert verified numbers without inventing facts.
          </p>
        </div>

        <button
          onClick={handleExportRevisedDraft}
          disabled={suggestions.length === 0}
          className="px-4 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 disabled:opacity-50 text-slate-950 font-bold text-xs flex items-center gap-2 shadow-lg shadow-cyan-500/20 transition-all hover:scale-[1.02]"
        >
          {copiedDraft ? <Check size={14} /> : <Download size={14} />}
          {copiedDraft ? "Downloaded Revised Draft!" : "Export Revised Resume Draft"}
        </button>
      </div>

      {/* Diagnostics KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-emerald-400">Quantified Metrics Found</span>
            <p className="text-2xl font-extrabold text-white mt-0.5">{metricsCount}</p>
            <span className="text-[10px] text-slate-400">Bullets with measurable data</span>
          </div>
          <FileCheck size={26} className="text-emerald-400" />
        </div>

        <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-rose-400">Weak Phrasings Detected</span>
            <p className="text-2xl font-extrabold text-white mt-0.5">{weakCount}</p>
            <span className="text-[10px] text-slate-400">"Worked on", "Helped with", etc.</span>
          </div>
          <AlertTriangle size={26} className="text-rose-400" />
        </div>

        <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-cyan-400">Actionable Suggestions</span>
            <p className="text-2xl font-extrabold text-white mt-0.5">{suggestions.length}</p>
            <span className="text-[10px] text-slate-400">Before-and-after improvements</span>
          </div>
          <Sparkles size={26} className="text-cyan-400" />
        </div>
      </div>

      {/* Recommended Strong Action Verbs */}
      <Card title="Recommended Strong Action Verbs" subtitle="Power verbs for engineering resumes">
        <div className="flex flex-wrap gap-2 pt-1">
          {analysisResult?.strong_action_verbs_recommended.map((verb) => (
            <span
              key={verb}
              className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-indigo-500/15 text-indigo-300 border border-indigo-500/30"
            >
              {verb}
            </span>
          ))}
        </div>
      </Card>

      {/* Formatting Critiques */}
      {analysisResult?.formatting_critique && analysisResult.formatting_critique.length > 0 && (
        <div className="p-4 rounded-xl bg-indigo-950/20 border border-indigo-500/30 text-xs text-indigo-200 space-y-1.5">
          <p className="font-bold flex items-center gap-1.5 text-indigo-300">
            <Info size={14} /> Structural Formatting Feedback:
          </p>
          <ul className="list-disc list-inside space-y-1 text-slate-300">
            {analysisResult.formatting_critique.map((critique, i) => (
              <li key={i}>{critique}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Before and After Bullet Improvements List */}
      <div className="space-y-4">
        <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
          <span>Actionable Before & After Bullet Points</span>
          <Badge variant="cyan" size="sm">{suggestions.length} items</Badge>
        </h3>

        {suggestions.length > 0 ? (
          suggestions.map((item, idx) => (
            <Card key={idx} className="space-y-3 hover:border-slate-700 transition-all">
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 pb-2">
                <div className="flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-slate-800 text-cyan-400 text-[11px] font-bold flex items-center justify-center">
                    {idx + 1}
                  </span>
                  <span className="text-xs font-bold text-slate-300">Optimization Opportunity</span>
                </div>
                <div className="flex items-center gap-1.5">
                  {item.missing_metric && (
                    <Badge variant="danger" size="sm">Missing Metric</Badge>
                  )}
                  {item.weak_verbs_found.length > 0 && (
                    <Badge variant="warning" size="sm">
                      Weak Verb: {item.weak_verbs_found.join(", ")}
                    </Badge>
                  )}
                </div>
              </div>

              {/* Before */}
              <div className="p-3 rounded-lg bg-rose-950/15 border border-rose-500/20 text-xs">
                <span className="text-[10px] uppercase font-bold tracking-wider text-rose-400 block mb-1">
                  Original (Passive / Brief):
                </span>
                <p className="text-slate-300 font-mono leading-relaxed">{item.original_bullet}</p>
              </div>

              {/* After */}
              <div className="p-3.5 rounded-lg bg-emerald-950/20 border border-emerald-500/30 text-xs relative">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[10px] uppercase font-bold tracking-wider text-emerald-400 block">
                    Recommended Rewrite (Action-Driven):
                  </span>
                  <button
                    onClick={() => handleCopyBullet(item.improved_bullet, idx)}
                    className="p-1 px-2 rounded-md bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 font-semibold text-[11px] flex items-center gap-1 transition-colors"
                    title="Copy improved bullet point"
                  >
                    {copiedIndex === idx ? <Check size={12} /> : <Copy size={12} />}
                    {copiedIndex === idx ? "Copied!" : "Copy"}
                  </button>
                </div>
                <p className="text-slate-100 font-medium leading-relaxed">{item.improved_bullet}</p>
              </div>

              {/* Rationale */}
              <div className="text-[11px] text-slate-400 flex items-start gap-1.5 pt-1">
                <Flame size={13} className="text-amber-400 mt-0.5 flex-shrink-0" />
                <span><b>Why this works:</b> {item.rationale}</span>
              </div>
            </Card>
          ))
        ) : (
          <div className="py-12 text-center text-xs text-slate-400">
            No bullet points requiring immediate revision were identified. Your bullet points demonstrate active phrasing!
          </div>
        )}
      </div>
    </div>
  );
};
