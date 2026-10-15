import React, { useEffect, useState } from "react";
import {
  Sliders,
  RotateCcw,
  Cpu,
  ShieldCheck,
  Info,
  CheckCircle2,
  AlertTriangle,
  BookOpen
} from "lucide-react";
import { Card } from "../components/Card";
import { Badge } from "../components/Badge";
import { MatchWeights, SystemHealthResponse } from "../types";
import { api } from "../services/api";

interface SettingsProps {
  weights: MatchWeights;
  setWeights: (weights: MatchWeights) => void;
}

export const Settings: React.FC<SettingsProps> = ({ weights, setWeights }) => {
  const [health, setHealth] = useState<SystemHealthResponse | null>(null);

  useEffect(() => {
    api
      .getHealth()
      .then((data) => setHealth(data))
      .catch((err) => console.error(err));
  }, []);

  const totalPercentage = Math.round(
    (weights.semantic_similarity +
      weights.required_skills +
      weights.preferred_skills +
      weights.experience +
      weights.education) *
      100
  );

  const handleWeightChange = (key: keyof MatchWeights, value: number) => {
    setWeights({
      ...weights,
      [key]: value / 100.0,
    });
  };

  const handleResetDefaults = () => {
    setWeights({
      semantic_similarity: 0.35,
      required_skills: 0.30,
      preferred_skills: 0.15,
      experience: 0.10,
      education: 0.10,
    });
  };

  return (
    <div className="space-y-8 animate-fade-in pb-16">
      {/* Header Banner */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-slate-900 via-indigo-950/60 to-slate-900 border border-slate-800 shadow-xl flex flex-wrap items-center justify-between gap-4">
        <div>
          <Badge variant="cyan" size="sm" className="mb-2">
            System Tuning & NLP Configuration
          </Badge>
          <h2 className="text-xl font-bold text-white tracking-tight">
            Matching Formula Weights & Engine Status
          </h2>
          <p className="text-xs text-slate-300 mt-1 max-w-2xl leading-relaxed">
            Customize the weighting formula applied when calculating the final 0–100 Estimated Match Score.
            Inspect active NLP models, sentence transformers, and taxonomy settings.
          </p>
        </div>

        <button
          onClick={handleResetDefaults}
          className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 text-xs font-semibold flex items-center gap-2 transition-colors"
        >
          <RotateCcw size={14} />
          Reset Default Weights
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Scoring Weights Sliders */}
        <Card
          title="Scoring Formula Weights"
          subtitle="Adjust the proportion allocated to each evaluation signal"
          action={
            <Badge
              variant={totalPercentage === 100 ? "success" : "warning"}
              size="sm"
            >
              Total: {totalPercentage}%
            </Badge>
          }
        >
          <div className="space-y-6 pt-2">
            {/* Semantic Similarity */}
            <div>
              <div className="flex justify-between text-xs mb-1.5 font-semibold text-slate-200">
                <span>Semantic Sentence Similarity</span>
                <span className="text-cyan-400 font-mono">
                  {Math.round(weights.semantic_similarity * 100)}%
                </span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                step="5"
                value={Math.round(weights.semantic_similarity * 100)}
                onChange={(e) =>
                  handleWeightChange("semantic_similarity", Number(e.target.value))
                }
                className="w-full accent-cyan-400 cursor-pointer"
              />
              <p className="text-[11px] text-slate-400 mt-1">
                Dense embedding cosine similarity using pretrained SentenceTransformers or sublinear N-grams.
              </p>
            </div>

            {/* Required Skills */}
            <div>
              <div className="flex justify-between text-xs mb-1.5 font-semibold text-slate-200">
                <span>Required Skills Coverage</span>
                <span className="text-rose-400 font-mono">
                  {Math.round(weights.required_skills * 100)}%
                </span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                step="5"
                value={Math.round(weights.required_skills * 100)}
                onChange={(e) =>
                  handleWeightChange("required_skills", Number(e.target.value))
                }
                className="w-full accent-rose-400 cursor-pointer"
              />
              <p className="text-[11px] text-slate-400 mt-1">
                Ratio of verified candidate skills to explicitly required technical criteria.
              </p>
            </div>

            {/* Preferred Skills */}
            <div>
              <div className="flex justify-between text-xs mb-1.5 font-semibold text-slate-200">
                <span>Preferred Skills Coverage</span>
                <span className="text-amber-400 font-mono">
                  {Math.round(weights.preferred_skills * 100)}%
                </span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                step="5"
                value={Math.round(weights.preferred_skills * 100)}
                onChange={(e) =>
                  handleWeightChange("preferred_skills", Number(e.target.value))
                }
                className="w-full accent-amber-400 cursor-pointer"
              />
              <p className="text-[11px] text-slate-400 mt-1">
                Bonus points for nice-to-have technologies, frameworks, and tools.
              </p>
            </div>

            {/* Experience Alignment */}
            <div>
              <div className="flex justify-between text-xs mb-1.5 font-semibold text-slate-200">
                <span>Experience Alignment</span>
                <span className="text-indigo-400 font-mono">
                  {Math.round(weights.experience * 100)}%
                </span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                step="5"
                value={Math.round(weights.experience * 100)}
                onChange={(e) =>
                  handleWeightChange("experience", Number(e.target.value))
                }
                className="w-full accent-indigo-400 cursor-pointer"
              />
              <p className="text-[11px] text-slate-400 mt-1">
                Years of professional experience required vs candidate documented tenure.
              </p>
            </div>

            {/* Education Alignment */}
            <div>
              <div className="flex justify-between text-xs mb-1.5 font-semibold text-slate-200">
                <span>Education & Qualifications</span>
                <span className="text-emerald-400 font-mono">
                  {Math.round(weights.education * 100)}%
                </span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                step="5"
                value={Math.round(weights.education * 100)}
                onChange={(e) =>
                  handleWeightChange("education", Number(e.target.value))
                }
                className="w-full accent-emerald-400 cursor-pointer"
              />
              <p className="text-[11px] text-slate-400 mt-1">
                Degree alignment (B.Tech, B.S., M.S., Ph.D.) with specified requirements.
              </p>
            </div>
          </div>
        </Card>

        {/* NLP Architecture & Diagnostic Status */}
        <div className="space-y-6">
          <Card
            title="Active NLP Engine Status"
            subtitle="Real-time diagnostics of loaded models"
          >
            <div className="space-y-4 pt-1 text-xs">
              <div className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800 flex items-center justify-between">
                <div>
                  <span className="text-slate-400 text-[10px] uppercase font-bold tracking-wider">
                    Semantic Similarity Pipeline
                  </span>
                  <p className="text-sm font-bold text-white mt-0.5">
                    {health?.active_nlp_mode || "SentenceTransformer (all-MiniLM-L6-v2)"}
                  </p>
                </div>
                <Badge variant={health?.transformer_loaded ? "success" : "warning"} size="sm">
                  {health?.transformer_loaded ? "Model Ready" : "Fallback Active"}
                </Badge>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800 flex items-center justify-between">
                <div>
                  <span className="text-slate-400 text-[10px] uppercase font-bold tracking-wider">
                    Taxonomy Normalization Engine
                  </span>
                  <p className="text-sm font-bold text-white mt-0.5">
                    Strict Boundary Regex + Synonyms
                  </p>
                </div>
                <Badge variant="cyan" size="sm">
                  45 Canonical Skills
                </Badge>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800 flex items-center justify-between">
                <div>
                  <span className="text-slate-400 text-[10px] uppercase font-bold tracking-wider">
                    Offline Resilience Mode
                  </span>
                  <p className="text-sm font-bold text-white mt-0.5">
                    Fully Capable (Sublinear TF-IDF Projection)
                  </p>
                </div>
                <Badge variant="success" size="sm">
                  100% Offline
                </Badge>
              </div>
            </div>
          </Card>

          {/* College Viva Explanation Note */}
          <Card
            title="NLP Theory & Formula Explanation"
            subtitle="Key points for college project presentation & viva"
          >
            <div className="space-y-2.5 text-xs text-slate-300 leading-relaxed">
              <p>
                <b>1. Explainability & Non-fabrication:</b> Unlike generative black boxes, the system
                separately calculates semantic similarity and discrete skill coverage.
              </p>
              <p>
                <b>2. Missing Category Normalization:</b> If an evaluation dimension (e.g. experience or education) cannot be extracted from a job description, the engine does not penalize with 0. Instead, it re-normalizes the active weights so they strictly sum to 1.0:
              </p>
              <div className="p-2 rounded-lg bg-slate-950 font-mono text-[11px] text-cyan-300 border border-slate-800">
                W_active = W_category / &Sigma; W_available
              </div>
              <p>
                <b>3. Strict Skill Disambiguation:</b> Non-alphanumeric token boundaries protect against
                false positives (e.g., preventing 'Java' from matching 'JavaScript', or 'C' from matching 'C++').
              </p>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};
