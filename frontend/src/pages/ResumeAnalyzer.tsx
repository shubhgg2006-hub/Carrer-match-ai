import React, { useState, useRef } from "react";
import {
  Upload,
  FileText,
  AlertTriangle,
  CheckCircle2,
  Trash2,
  Edit2,
  Plus,
  X,
  FileCode,
  Sparkles,
  ArrowRight
} from "lucide-react";
import { Card } from "../components/Card";
import { Badge } from "../components/Badge";
import { ParsedResume } from "../types";
import { api } from "../services/api";

interface ResumeAnalyzerProps {
  resume: ParsedResume | null;
  setResume: (resume: ParsedResume | null) => void;
  onNavigateToJob: () => void;
}

const DEMO_RESUME_ALEX: ParsedResume = {
  candidate_name: "Alex Morgan",
  email: "alex.morgan@example.com",
  phone: "+1 (555) 234-5678",
  skills: [
    "Python", "JavaScript", "TypeScript", "FastAPI", "React", "Node.js",
    "PostgreSQL", "Docker", "SQL", "Git & GitHub", "Tailwind CSS", "Redis",
    "Amazon Web Services (AWS)", "CI/CD", "Unit Testing", "Agile / Scrum"
  ],
  education: [
    {
      degree: "Bachelor of Science in Computer Science",
      institution: "University of California, Davis",
      year: "2021",
      details: "Major in Software Engineering & Database Systems"
    }
  ],
  work_experience: [
    {
      title: "Full-Stack Software Engineer",
      company: "CloudSphere Solutions",
      duration: "3+ years",
      bullets: [
        "Architected and deployed 12+ REST APIs using FastAPI and PostgreSQL, serving 250,000+ daily active users.",
        "Engineered responsive client-side user interfaces with React and Tailwind CSS, reducing page load latency by 35%.",
        "Implemented asynchronous background task processing using Redis and Celery, cutting turnaround from 14 mins to 45 secs.",
        "Integrated automated CI/CD deployment pipelines using GitHub Actions and Docker, accelerating release cadence."
      ]
    }
  ],
  projects: [
    {
      name: "SmartDoc Parser",
      tech_stack: ["FastAPI", "React", "Docker"],
      description: "Full-stack document processing portal utilizing FastAPI, React, and Docker to parse and search PDF archives.",
      bullets: ["Built search indexing and OCR extraction pipelines servicing multi-format documents."]
    }
  ],
  certifications: ["AWS Certified Solutions Architect - Associate"],
  raw_text: `Alex Morgan\nalex.morgan@example.com | +1 (555) 234-5678\n\nFull-Stack Software Engineer with 3+ years of experience in Python, FastAPI, React, Docker, and PostgreSQL. Built scalable distributed APIs and responsive web apps.`,
  file_name: "alex_morgan_resume.pdf",
  is_scanned_pdf: false,
};

const DEMO_RESUME_PRIYA: ParsedResume = {
  candidate_name: "Priya Sharma",
  email: "priya.sharma@example.edu",
  phone: "+1 (555) 789-0123",
  skills: [
    "Python", "Natural Language Processing (NLP)", "Large Language Models (LLMs)",
    "Machine Learning", "Deep Learning", "PyTorch", "Hugging Face", "Scikit-Learn",
    "spaCy", "LangChain", "SQL", "Docker", "Amazon Web Services (AWS)", "Git & GitHub"
  ],
  education: [
    {
      degree: "Master of Science in Computer Science (NLP)",
      institution: "Columbia University",
      year: "2022",
      details: "Research focus in Transformer architectures and semantic embeddings."
    }
  ],
  work_experience: [
    {
      title: "NLP & Machine Learning Engineer",
      company: "SemanticAI Labs",
      duration: "2+ years",
      bullets: [
        "Fine-tuned open-source Large Language Models (LLMs) and BERT encoders for enterprise Q&A, boosting F1-score by 18.4%.",
        "Developed an automated resume parsing engine using spaCy and token classification, processing 50,000+ candidate profiles monthly.",
        "Engineered high-dimensional vector similarity retrieval utilizing FAISS and sentence embeddings, dropping latency to sub-30ms."
      ]
    }
  ],
  projects: [
    {
      name: "Conversational RAG Assistant",
      tech_stack: ["LangChain", "FastAPI", "PyTorch"],
      description: "Implemented Retrieval-Augmented Generation agent with vector databases and embedding search.",
      bullets: ["Achieved 94% user query retrieval accuracy with custom chunking."]
    }
  ],
  certifications: ["DeepLearning.AI NLP Specialization"],
  raw_text: `Priya Sharma\npriya.sharma@example.edu\n\nNLP Engineer & Machine Learning Specialist with 2+ years experience building transformer models, vector retrieval, and semantic search systems with Python, PyTorch, and Hugging Face.`,
  file_name: "priya_sharma_nlp_resume.pdf",
  is_scanned_pdf: false,
};

export const ResumeAnalyzer: React.FC<ResumeAnalyzerProps> = ({
  resume,
  setResume,
  onNavigateToJob,
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [pastedText, setPastedText] = useState("");
  const [isPasting, setIsPasting] = useState(false);
  const [newSkillInput, setNewSkillInput] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = async (file: File) => {
    setIsLoading(true);
    setErrorMessage(null);

    // Client-side validations
    const ext = file.name.slice(file.name.lastIndexOf(".")).toLowerCase();
    if (![".pdf", ".docx"].includes(ext)) {
      setErrorMessage(`Unsupported file format '${ext}'. Please upload a PDF or DOCX file.`);
      setIsLoading(false);
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setErrorMessage("File exceeds 10MB limit. Please upload a smaller document.");
      setIsLoading(false);
      return;
    }

    try {
      const parsed = await api.uploadResume(file);
      setResume(parsed);
      if (parsed.extraction_warning) {
        setErrorMessage(parsed.extraction_warning);
      }
    } catch (err: any) {
      setErrorMessage(err.message || "Failed to process resume file.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFileUpload(e.dataTransfer.files[0]);
    }
  };

  const handlePasteAnalyze = async () => {
    if (!pastedText.trim()) return;
    setIsLoading(true);
    setErrorMessage(null);
    try {
      const parsed = await api.analyzeResumeText(pastedText, "pasted_resume.txt");
      setResume(parsed);
      setIsPasting(false);
    } catch (err: any) {
      setErrorMessage(err.message || "Failed to analyze pasted text.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddSkill = () => {
    if (!newSkillInput.trim() || !resume) return;
    const clean = newSkillInput.trim();
    if (!resume.skills.includes(clean)) {
      setResume({
        ...resume,
        skills: [...resume.skills, clean],
      });
    }
    setNewSkillInput("");
  };

  const handleRemoveSkill = (skillToRemove: string) => {
    if (!resume) return;
    setResume({
      ...resume,
      skills: resume.skills.filter((s) => s !== skillToRemove),
    });
  };

  return (
    <div className="space-y-8 animate-fade-in pb-12">
      {/* Quick synthetic demo loaders */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-xl bg-slate-900/60 border border-slate-800">
        <div>
          <h4 className="text-xs font-semibold text-slate-200">Test with Synthetic Demo Resumes:</h4>
          <p className="text-[11px] text-slate-400">Instantly test the NLP pipeline with pre-parsed verified data</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              setResume(DEMO_RESUME_ALEX);
              setErrorMessage(null);
            }}
            className="px-3 py-1.5 rounded-lg bg-indigo-600/30 hover:bg-indigo-600/50 text-indigo-300 border border-indigo-500/40 text-xs font-semibold transition-colors flex items-center gap-1.5"
          >
            <Sparkles size={13} />
            Alex Morgan (Full-Stack)
          </button>
          <button
            onClick={() => {
              setResume(DEMO_RESUME_PRIYA);
              setErrorMessage(null);
            }}
            className="px-3 py-1.5 rounded-lg bg-cyan-600/30 hover:bg-cyan-600/50 text-cyan-300 border border-cyan-500/40 text-xs font-semibold transition-colors flex items-center gap-1.5"
          >
            <Sparkles size={13} />
            Priya Sharma (NLP/ML)
          </button>
        </div>
      </div>

      {/* Error or Warning Banner */}
      {errorMessage && (
        <div className="p-4 rounded-xl bg-amber-500/15 border border-amber-500/40 text-amber-200 flex items-start gap-3">
          <AlertTriangle size={18} className="text-amber-400 mt-0.5 flex-shrink-0" />
          <div className="text-xs">
            <p className="font-bold">Extraction Notice / Error</p>
            <p className="mt-0.5 leading-relaxed">{errorMessage}</p>
          </div>
        </div>
      )}

      {/* Upload Zone & Paste Option */}
      {!resume ? (
        <div className="space-y-4">
          {!isPasting ? (
            <div
              onDragOver={(e) => {
                e.preventDefault();
                setIsDragging(true);
              }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-2xl p-12 text-center cursor-pointer transition-all ${
                isDragging
                  ? "border-cyan-400 bg-cyan-500/10 scale-[0.99]"
                  : "border-slate-700/80 hover:border-slate-600 bg-slate-900/40 hover:bg-slate-900/70"
              }`}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,.docx"
                className="hidden"
                onChange={(e) => {
                  if (e.target.files && e.target.files[0]) {
                    handleFileUpload(e.target.files[0]);
                  }
                }}
              />
              <div className="w-16 h-16 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 mx-auto mb-4">
                <Upload size={28} />
              </div>
              <h3 className="text-base font-semibold text-slate-100">
                {isLoading ? "Analyzing Document via NLP..." : "Drag and drop your resume here"}
              </h3>
              <p className="text-xs text-slate-400 mt-1.5 max-w-sm mx-auto">
                Supports standard searchable PDF and Word DOCX formats (up to 10MB).
              </p>
              <div className="mt-5 flex items-center justify-center gap-3">
                <button
                  type="button"
                  disabled={isLoading}
                  className="px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-semibold text-xs transition-all shadow-md shadow-cyan-500/20"
                >
                  {isLoading ? "Parsing..." : "Browse Files"}
                </button>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsPasting(true);
                  }}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs border border-slate-700 transition-all"
                >
                  Paste Plain Text
                </button>
              </div>
            </div>
          ) : (
            <Card title="Paste Resume Content" subtitle="Paste your raw resume text below for token analysis">
              <textarea
                value={pastedText}
                onChange={(e) => setPastedText(e.target.value)}
                placeholder="Paste complete resume text here (including contact info, technical skills, work experience, projects, education)..."
                className="w-full h-64 p-4 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-200 font-mono focus:outline-none focus:border-cyan-500/60 resize-y"
              />
              <div className="flex items-center justify-end gap-3 mt-4">
                <button
                  onClick={() => setIsPasting(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs"
                >
                  Cancel
                </button>
                <button
                  onClick={handlePasteAnalyze}
                  disabled={isLoading || !pastedText.trim()}
                  className="px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 disabled:opacity-50 text-slate-950 font-semibold text-xs flex items-center gap-2 shadow-md shadow-cyan-500/20"
                >
                  <Sparkles size={14} />
                  {isLoading ? "Analyzing..." : "Analyze Pasted Text"}
                </button>
              </div>
            </Card>
          )}
        </div>
      ) : (
        /* Parsed Resume Details & Editable Review */
        <div className="space-y-6">
          <div className="flex items-center justify-between p-4 rounded-xl bg-slate-900 border border-slate-800">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                <CheckCircle2 size={20} />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                  {resume.candidate_name}
                  <span className="text-[11px] font-normal text-slate-400">({resume.file_name})</span>
                </h3>
                <p className="text-xs text-slate-400">
                  {resume.email || "No email"} &bull; {resume.phone || "No phone"}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setResume(null)}
                className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-rose-500/20 hover:text-rose-300 text-slate-300 border border-slate-700 text-xs font-semibold flex items-center gap-1.5 transition-colors"
              >
                <Trash2 size={13} />
                Replace Resume
              </button>
              <button
                onClick={onNavigateToJob}
                className="px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-semibold text-xs flex items-center gap-1.5 shadow-md shadow-cyan-500/20 transition-all"
              >
                Match with Job Description
                <ArrowRight size={14} />
              </button>
            </div>
          </div>

          {/* Structured Fields Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Skills & Candidate Details */}
            <div className="space-y-6">
              <Card title="Extracted Skills" subtitle="Editable taxonomy skills detected">
                <div className="flex flex-wrap gap-1.5 mb-4">
                  {resume.skills.map((skill) => (
                    <span
                      key={skill}
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-cyan-500/15 text-cyan-300 border border-cyan-500/30"
                    >
                      {skill}
                      <button
                        onClick={() => handleRemoveSkill(skill)}
                        className="hover:text-rose-400 transition-colors"
                        title="Remove skill"
                      >
                        <X size={12} />
                      </button>
                    </span>
                  ))}
                </div>

                {/* Add new skill inline */}
                <div className="flex items-center gap-2 pt-2 border-t border-slate-800">
                  <input
                    type="text"
                    value={newSkillInput}
                    onChange={(e) => setNewSkillInput(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleAddSkill()}
                    placeholder="Add verified skill..."
                    className="flex-1 px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-xs text-slate-200 focus:outline-none focus:border-cyan-500/60"
                  />
                  <button
                    onClick={handleAddSkill}
                    className="p-1.5 rounded-lg bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-500/40 text-xs font-semibold"
                    title="Add skill"
                  >
                    <Plus size={15} />
                  </button>
                </div>
              </Card>

              <Card title="Education & Certifications" subtitle="Academic credentials">
                {resume.education.length > 0 ? (
                  <div className="space-y-3">
                    {resume.education.map((edu, idx) => (
                      <div key={idx} className="p-3 rounded-lg bg-slate-950/60 border border-slate-800/80 text-xs">
                        <p className="font-semibold text-slate-200">{edu.degree}</p>
                        <p className="text-slate-400 mt-0.5">{edu.institution} {edu.year && `• ${edu.year}`}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-slate-500">No structured education identified.</p>
                )}

                {resume.certifications.length > 0 && (
                  <div className="mt-4 pt-3 border-t border-slate-800">
                    <p className="text-xs font-semibold text-slate-300 mb-2">Certifications:</p>
                    <ul className="text-xs text-slate-400 space-y-1 list-disc list-inside">
                      {resume.certifications.map((c, i) => (
                        <li key={i}>{c}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </Card>
            </div>

            {/* Experience & Projects */}
            <div className="lg:col-span-2 space-y-6">
              <Card title="Work Experience & Projects" subtitle="Roles, companies, and achievements">
                {resume.work_experience.length > 0 ? (
                  <div className="space-y-4">
                    {resume.work_experience.map((exp, idx) => (
                      <div key={idx} className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 text-xs space-y-2">
                        <div className="flex items-center justify-between">
                          <p className="font-bold text-slate-100">{exp.title}</p>
                          <span className="text-[11px] text-slate-400">{exp.duration}</span>
                        </div>
                        {exp.company && <p className="text-slate-400">{exp.company}</p>}
                        <ul className="space-y-1.5 list-disc list-inside text-slate-300 pt-1">
                          {exp.bullets.map((b, bIdx) => (
                            <li key={bIdx} className="leading-relaxed">{b}</li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-slate-500">No structured work experience identified.</p>
                )}

                {resume.projects.length > 0 && (
                  <div className="mt-6 pt-4 border-t border-slate-800">
                    <h4 className="text-xs font-semibold text-slate-200 mb-3">Key Projects:</h4>
                    <div className="space-y-3">
                      {resume.projects.map((proj, idx) => (
                        <div key={idx} className="p-3 rounded-lg bg-slate-950/40 border border-slate-800 text-xs">
                          <div className="flex items-center justify-between mb-1">
                            <span className="font-semibold text-cyan-300">{proj.name}</span>
                            <div className="flex gap-1">
                              {proj.tech_stack.map((t) => (
                                <span key={t} className="px-1.5 py-0.5 rounded text-[10px] bg-slate-800 text-slate-300">
                                  {t}
                                </span>
                              ))}
                            </div>
                          </div>
                          <p className="text-slate-300 leading-relaxed">{proj.description}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </Card>

              {/* Raw Text Preview */}
              <Card title="Document Text Preview" subtitle="Full extracted plaintext from uploaded document">
                <div className="max-h-48 overflow-y-auto p-3 rounded-lg bg-slate-950 font-mono text-[11px] text-slate-400 leading-relaxed border border-slate-800">
                  {resume.raw_text}
                </div>
              </Card>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
