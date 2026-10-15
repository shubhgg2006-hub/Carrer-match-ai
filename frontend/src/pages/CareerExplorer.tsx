import React, { useEffect, useState } from "react";
import {
  Compass,
  CheckCircle,
  AlertCircle,
  Briefcase,
  ArrowRight,
  Sparkles,
  Info
} from "lucide-react";
import { Card } from "../components/Card";
import { Badge } from "../components/Badge";
import { CareerRoleTemplate, CareerMatchItem, ParsedResume } from "../types";
import { api } from "../services/api";

interface CareerExplorerProps {
  currentResume: ParsedResume | null;
  onSelectRoleForMatching: (role: CareerRoleTemplate) => void;
  onNavigateToResume: () => void;
}

export const CareerExplorer: React.FC<CareerExplorerProps> = ({
  currentResume,
  onSelectRoleForMatching,
  onNavigateToResume,
}) => {
  const [roles, setRoles] = useState<CareerRoleTemplate[]>([]);
  const [careerMatches, setCareerMatches] = useState<CareerMatchItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    setIsLoading(true);
    if (currentResume) {
      api
        .matchCareerRoles(currentResume)
        .then((matches) => {
          setCareerMatches(matches);
          setRoles(matches.map((m) => m.role));
        })
        .catch(() => loadBaseRoles())
        .finally(() => setIsLoading(false));
    } else {
      loadBaseRoles();
    }
  }, [currentResume]);

  const loadBaseRoles = () => {
    setIsLoading(true);
    api
      .getCareerRoles()
      .then((data) => setRoles(data))
      .catch((err) => console.error(err))
      .finally(() => setIsLoading(false));
  };

  return (
    <div className="space-y-8 animate-fade-in pb-16">
      {/* Header Banner */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-slate-900 via-indigo-950/60 to-slate-900 border border-slate-800 shadow-xl flex flex-wrap items-center justify-between gap-4">
        <div>
          <Badge variant="cyan" size="sm" className="mb-2">
            Skill-Based Career Pathing
          </Badge>
          <h2 className="text-xl font-bold text-white tracking-tight">
            Career Role Explorer & Readiness Catalog
          </h2>
          <p className="text-xs text-slate-300 mt-1 max-w-2xl leading-relaxed">
            Discover how well candidate skills align across multiple software engineering, AI, and data
            specializations. Compare existing competencies against industry baseline templates.
          </p>
        </div>

        <div className="flex items-center gap-2 p-2 rounded-xl bg-slate-950 border border-slate-800 text-[11px] text-slate-400">
          <Info size={14} className="text-cyan-400 flex-shrink-0" />
          <span>Demonstration catalog of roles for exploration, not live vacancies.</span>
        </div>
      </div>

      {!currentResume && (
        <div className="p-4 rounded-xl bg-indigo-950/20 border border-indigo-500/30 text-indigo-200 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Sparkles size={20} className="text-indigo-400 flex-shrink-0" />
            <div className="text-xs">
              <p className="font-bold">Personalized Compatibility Scores Available</p>
              <p className="text-slate-300">
                Upload or analyze your resume to automatically score and rank these 9 career roles!
              </p>
            </div>
          </div>
          <button
            onClick={onNavigateToResume}
            className="px-3.5 py-1.5 rounded-lg bg-indigo-500 hover:bg-indigo-400 text-slate-950 font-bold text-xs shadow-md transition-all whitespace-nowrap"
          >
            Load Resume
          </button>
        </div>
      )}

      {/* Role Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {(careerMatches.length > 0 ? careerMatches : roles.map((r) => ({ role: r, match_score: 0, matching_skills: [], skills_to_develop: r.core_skills, fit_rationale: "Upload a resume to evaluate compatibility." }))).map((item, idx) => {
          const role = item.role;
          const score = item.match_score;
          const scoreVariant =
            score >= 75
              ? "success"
              : score >= 50
              ? "cyan"
              : score >= 30
              ? "warning"
              : "neutral";

          return (
            <Card key={role.id || idx} className="flex flex-col justify-between hover:border-slate-700 transition-all">
              <div>
                <div className="flex items-start justify-between gap-3 mb-2">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-cyan-400 tracking-wider">
                      {role.category}
                    </span>
                    <h3 className="text-base font-bold text-slate-100 mt-0.5">{role.title}</h3>
                  </div>

                  {currentResume && (
                    <Badge variant={scoreVariant} size="md">
                      {score}% Fit
                    </Badge>
                  )}
                </div>

                <p className="text-xs text-slate-400 line-clamp-3 leading-relaxed mb-4">
                  {role.description}
                </p>

                {/* Match Rationale if resume loaded */}
                {currentResume && item.fit_rationale && (
                  <div className="p-3 rounded-lg bg-slate-950/60 border border-slate-800 text-xs mb-4 text-slate-300">
                    <p className="leading-relaxed">{item.fit_rationale}</p>
                  </div>
                )}

                {/* Existing Matching Skills */}
                <div className="space-y-3 pt-2 border-t border-slate-800/80 text-xs">
                  <div>
                    <span className="font-semibold text-emerald-400 text-[11px] block mb-1">
                      {currentResume ? `Matching Skills (${item.matching_skills.length}):` : "Core Role Skills:"}
                    </span>
                    <div className="flex flex-wrap gap-1">
                      {(currentResume ? item.matching_skills : role.core_skills).slice(0, 5).map((s) => (
                        <Badge key={s} variant="success" size="sm">
                          {s}
                        </Badge>
                      ))}
                      {(currentResume ? item.matching_skills : role.core_skills).length === 0 && (
                        <span className="text-slate-500 text-[11px]">No exact matches detected.</span>
                      )}
                    </div>
                  </div>

                  {/* Skills to Develop */}
                  <div>
                    <span className="font-semibold text-amber-400 text-[11px] block mb-1">
                      {currentResume ? `Skills to Develop (${item.skills_to_develop.length}):` : "Preferred Skills:"}
                    </span>
                    <div className="flex flex-wrap gap-1">
                      {(currentResume ? item.skills_to_develop : role.preferred_skills).slice(0, 5).map((s) => (
                        <Badge key={s} variant="warning" size="sm">
                          {s}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Direct Match CTA Button */}
              <div className="mt-5 pt-3 border-t border-slate-800">
                <button
                  onClick={() => onSelectRoleForMatching(role)}
                  className="w-full py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 hover:border-cyan-500/40 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors group"
                >
                  <Briefcase size={13} className="text-cyan-400 group-hover:scale-110 transition-transform" />
                  Evaluate Against This Role
                  <ArrowRight size={13} />
                </button>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
};
