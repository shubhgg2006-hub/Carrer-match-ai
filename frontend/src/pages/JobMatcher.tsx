import React, { useState } from "react";
import {
  Briefcase,
  Sparkles,
  Play,
  Plus,
  X,
  FileText,
  AlertCircle,
  Sliders,
  Check
} from "lucide-react";
import { Card } from "../components/Card";
import { Badge } from "../components/Badge";
import { ParsedJob, ParsedResume, MatchWeights, MatchResponse } from "../types";
import { api } from "../services/api";

interface JobMatcherProps {
  currentResume: ParsedResume | null;
  onMatchSuccess: (result: MatchResponse) => void;
  onNavigateToResume: () => void;
  weights: MatchWeights;
}

const SAMPLE_JOB_PYTHON = `Job Title: Senior Python Backend Engineer
Company: NextGen Cloud Technologies
Location: Remote

About the Role:
We are looking for a Senior Python Backend Engineer to build high-concurrency microservices and real-time APIs.

Required Qualifications & Skills:
- 3+ years of experience with Python and SQL.
- Strong experience building REST APIs with FastAPI or Django.
- Experience with relational databases like PostgreSQL.
- Hands-on experience with Docker containerization and Git & GitHub.
- Background in Data Structures & Algorithms and Unit Testing.
- Bachelor's degree in Computer Science or related engineering field.

Preferred Skills:
- Familiarity with distributed caching using Redis.
- Cloud platforms such as Amazon Web Services (AWS).
- Message brokers like Apache Kafka.
- Kubernetes and CI/CD pipelines.
- Agile / Scrum workflow.`;

const SAMPLE_JOB_NLP = `Job Title: NLP & Machine Learning Engineer
Company: DeepText AI Solutions
Location: New York, NY

About the Role:
We are looking for an innovative NLP & Machine Learning Engineer to design and deploy modern language models, semantic similarity retrieval engines, and text analytics pipelines.

Required Skills & Qualifications:
- 2+ years of experience in Machine Learning and Natural Language Processing (NLP).
- Strong proficiency in Python, NumPy, Pandas, and Scikit-Learn.
- Solid experience with deep learning frameworks, specifically PyTorch.
- Experience with transformer libraries such as Hugging Face and Large Language Models (LLMs).
- Master's or Bachelor's degree in Computer Science or related discipline.

Preferred Skills:
- Experience with spaCy for text processing.
- Experience with LangChain or LlamaIndex.
- Cloud deployment with Docker and Amazon Web Services (AWS).`;

export const JobMatcher: React.FC<JobMatcherProps> = ({
  currentResume,
  onMatchSuccess,
  onNavigateToResume,
  weights,
}) => {
  const [jobText, setJobText] = useState(SAMPLE_JOB_PYTHON);
  const [customTitle, setCustomTitle] = useState("");
  const [parsedJob, setParsedJob] = useState<ParsedJob | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isMatching, setIsMatching] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const [newReqSkill, setNewReqSkill] = useState("");
  const [newPrefSkill, setNewPrefSkill] = useState("");

  const handleAnalyzeJob = async () => {
    if (!jobText.trim()) {
      setErrorMessage("Please paste a job description first.");
      return;
    }
    setIsLoading(true);
    setErrorMessage(null);
    try {
      const job = await api.analyzeJobText(jobText, customTitle || undefined);
      setParsedJob(job);
    } catch (err: any) {
      setErrorMessage(err.message || "Failed to analyze job requirements.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleRunMatch = async () => {
    if (!currentResume) {
      setErrorMessage("No active resume detected. Please upload or analyze a resume first.");
      return;
    }
    if (!parsedJob) {
      // Analyze first if not analyzed yet
      try {
        setIsMatching(true);
        const job = await api.analyzeJobText(jobText, customTitle || undefined);
        setParsedJob(job);
        const matchRes = await api.runMatch(currentResume, job, weights);
        onMatchSuccess(matchRes);
      } catch (err: any) {
        setErrorMessage(err.message || "Failed to run match.");
      } finally {
        setIsMatching(false);
      }
      return;
    }

    try {
      setIsMatching(true);
      setErrorMessage(null);
      const matchRes = await api.runMatch(currentResume, parsedJob, weights);
      onMatchSuccess(matchRes);
    } catch (err: any) {
      setErrorMessage(err.message || "Failed to calculate match.");
    } finally {
      setIsMatching(false);
    }
  };

  const handleAddReqSkill = () => {
    if (!newReqSkill.trim() || !parsedJob) return;
    setParsedJob({
      ...parsedJob,
      required_skills: [...parsedJob.required_skills, newReqSkill.trim()],
    });
    setNewReqSkill("");
  };

  const handleRemoveReqSkill = (skill: string) => {
    if (!parsedJob) return;
    setParsedJob({
      ...parsedJob,
      required_skills: parsedJob.required_skills.filter((s) => s !== skill),
    });
  };

  const handleAddPrefSkill = () => {
    if (!newPrefSkill.trim() || !parsedJob) return;
    setParsedJob({
      ...parsedJob,
      preferred_skills: [...parsedJob.preferred_skills, newPrefSkill.trim()],
    });
    setNewPrefSkill("");
  };

  const handleRemovePrefSkill = (skill: string) => {
    if (!parsedJob) return;
    setParsedJob({
      ...parsedJob,
      preferred_skills: parsedJob.preferred_skills.filter((s) => s !== skill),
    });
  };

  return (
    <div className="space-y-8 animate-fade-in pb-12">
      {/* Resume Warning if none loaded */}
      {!currentResume && (
        <div className="p-4 rounded-xl bg-amber-500/15 border border-amber-500/40 text-amber-200 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <AlertCircle size={20} className="text-amber-400 flex-shrink-0" />
            <div className="text-xs">
              <p className="font-bold">No Resume Loaded</p>
              <p className="text-amber-300">
                You need to upload or enter a resume to calculate compatibility scores.
              </p>
            </div>
          </div>
          <button
            onClick={onNavigateToResume}
            className="px-3.5 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-md transition-all whitespace-nowrap"
          >
            Upload Resume
          </button>
        </div>
      )}

      {/* Quick Sample Job Fillers */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-xl bg-slate-900/60 border border-slate-800">
        <div>
          <h4 className="text-xs font-semibold text-slate-200">Load Demonstration Job Descriptions:</h4>
          <p className="text-[11px] text-slate-400">Instantly test with pre-crafted technical job descriptions</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              setJobText(SAMPLE_JOB_PYTHON);
              setCustomTitle("Senior Python Backend Engineer");
              setParsedJob(null);
            }}
            className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 text-xs font-semibold transition-colors"
          >
            Senior Python Engineer JD
          </button>
          <button
            onClick={() => {
              setJobText(SAMPLE_JOB_NLP);
              setCustomTitle("NLP & Machine Learning Engineer");
              setParsedJob(null);
            }}
            className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 text-xs font-semibold transition-colors"
          >
            NLP & ML Engineer JD
          </button>
        </div>
      </div>

      {errorMessage && (
        <div className="p-4 rounded-xl bg-rose-500/15 border border-rose-500/40 text-rose-200 text-xs flex items-center gap-2">
          <AlertCircle size={16} className="text-rose-400 flex-shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Two-Column Editor: Job Input vs Parsed Requirements */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: Input Textarea */}
        <div className="space-y-4">
          <Card title="Target Job Description" subtitle="Paste role posting or paste from career site">
            <div className="space-y-3">
              <div>
                <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                  Custom Job Title (Optional override):
                </label>
                <input
                  type="text"
                  value={customTitle}
                  onChange={(e) => setCustomTitle(e.target.value)}
                  placeholder="e.g. Senior Backend Engineer"
                  className="w-full px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-xs text-slate-200 focus:outline-none focus:border-cyan-500/60"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                  Job Description Content:
                </label>
                <textarea
                  value={jobText}
                  onChange={(e) => setJobText(e.target.value)}
                  placeholder="Paste complete job description requirements here..."
                  className="w-full h-80 p-4 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-200 font-mono focus:outline-none focus:border-cyan-500/60 resize-y"
                />
              </div>

              <div className="flex items-center justify-between pt-2">
                <button
                  type="button"
                  onClick={handleAnalyzeJob}
                  disabled={isLoading}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-semibold text-xs flex items-center gap-2"
                >
                  <Sparkles size={14} className="text-cyan-400" />
                  {isLoading ? "Extracting Requirements..." : "Extract Requirements"}
                </button>

                <button
                  type="button"
                  onClick={handleRunMatch}
                  disabled={isMatching || !currentResume}
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 disabled:opacity-50 text-white font-bold text-xs flex items-center gap-2 shadow-lg shadow-cyan-500/25 transition-all hover:scale-[1.02]"
                >
                  <Play size={14} className="fill-current" />
                  {isMatching ? "Calculating Match..." : "Run Intelligent Match"}
                </button>
              </div>
            </div>
          </Card>
        </div>

        {/* Right: Extracted Requirements Review */}
        <div className="space-y-4">
          <Card
            title="Extracted Job Requirements"
            subtitle="Review & customize before running match evaluation"
          >
            {parsedJob ? (
              <div className="space-y-5 text-xs">
                {/* Title & Experience */}
                <div className="p-3 rounded-lg bg-slate-950/60 border border-slate-800 flex items-center justify-between">
                  <div>
                    <span className="text-slate-400 text-[10px] uppercase font-bold tracking-wider">
                      Target Role
                    </span>
                    <p className="text-sm font-bold text-cyan-300 mt-0.5">{parsedJob.title}</p>
                  </div>
                  {parsedJob.years_of_experience && (
                    <Badge variant="cyan" size="md">
                      {parsedJob.years_of_experience}+ Years Exp.
                    </Badge>
                  )}
                </div>

                {/* Required Skills */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="font-bold text-rose-300">
                      Required Skills ({parsedJob.required_skills.length})
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-1.5 mb-2">
                    {parsedJob.required_skills.map((skill) => (
                      <span
                        key={skill}
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-500/15 text-rose-300 border border-rose-500/30"
                      >
                        {skill}
                        <button
                          onClick={() => handleRemoveReqSkill(skill)}
                          className="hover:text-white"
                        >
                          <X size={12} />
                        </button>
                      </span>
                    ))}
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={newReqSkill}
                      onChange={(e) => setNewReqSkill(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && handleAddReqSkill()}
                      placeholder="Add required skill..."
                      className="flex-1 px-2.5 py-1 rounded-lg bg-slate-950 border border-slate-800 text-xs text-slate-200 focus:outline-none"
                    />
                    <button
                      onClick={handleAddReqSkill}
                      className="p-1 rounded-lg bg-slate-800 text-slate-300 hover:text-white"
                    >
                      <Plus size={14} />
                    </button>
                  </div>
                </div>

                {/* Preferred Skills */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="font-bold text-amber-300">
                      Preferred / Nice-to-Have Skills ({parsedJob.preferred_skills.length})
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-1.5 mb-2">
                    {parsedJob.preferred_skills.map((skill) => (
                      <span
                        key={skill}
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-500/15 text-amber-300 border border-amber-500/30"
                      >
                        {skill}
                        <button
                          onClick={() => handleRemovePrefSkill(skill)}
                          className="hover:text-white"
                        >
                          <X size={12} />
                        </button>
                      </span>
                    ))}
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={newPrefSkill}
                      onChange={(e) => setNewPrefSkill(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && handleAddPrefSkill()}
                      placeholder="Add preferred skill..."
                      className="flex-1 px-2.5 py-1 rounded-lg bg-slate-950 border border-slate-800 text-xs text-slate-200 focus:outline-none"
                    />
                    <button
                      onClick={handleAddPrefSkill}
                      className="p-1 rounded-lg bg-slate-800 text-slate-300 hover:text-white"
                    >
                      <Plus size={14} />
                    </button>
                  </div>
                </div>

                {/* Qualifications & Responsibilities preview */}
                {parsedJob.qualifications.length > 0 && (
                  <div className="pt-2 border-t border-slate-800">
                    <span className="font-bold text-slate-300">Academic & Degree Criteria:</span>
                    <ul className="list-disc list-inside text-slate-400 mt-1 space-y-0.5">
                      {parsedJob.qualifications.map((q, i) => (
                        <li key={i}>{q}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            ) : (
              <div className="py-16 text-center text-slate-500 text-xs">
                <Briefcase size={28} className="mx-auto text-slate-600 mb-2" />
                Click <b>"Extract Requirements"</b> or <b>"Run Intelligent Match"</b> to automatically
                parse skills, experience thresholds, and responsibilities.
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
};
