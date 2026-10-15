import React, { useState, useEffect } from "react";
import { Sidebar, NavTab } from "./components/Sidebar";
import { Navbar } from "./components/Navbar";
import { Overview } from "./pages/Overview";
import { ResumeAnalyzer } from "./pages/ResumeAnalyzer";
import { JobMatcher } from "./pages/JobMatcher";
import { MatchResults } from "./pages/MatchResults";
import { SkillGapAnalysis } from "./pages/SkillGapAnalysis";
import { ResumeImprover } from "./pages/ResumeImprover";
import { CareerExplorer } from "./pages/CareerExplorer";
import { History } from "./pages/History";
import { Settings } from "./pages/Settings";
import { ParsedResume, MatchResponse, MatchWeights, CareerRoleTemplate } from "./types";
import { api } from "./services/api";

export function App() {
  const [activeTab, setActiveTab] = useState<NavTab>("overview");
  const [isDarkMode, setIsDarkMode] = useState<boolean>(true);
  const [currentResume, setCurrentResume] = useState<ParsedResume | null>(null);
  const [currentMatch, setCurrentMatch] = useState<MatchResponse | null>(null);
  const [history, setHistory] = useState<MatchResponse[]>([]);
  const [nlpMode, setNlpMode] = useState<string>("SentenceTransformer (all-MiniLM-L6-v2)");
  const [weights, setWeights] = useState<MatchWeights>({
    semantic_similarity: 0.35,
    required_skills: 0.30,
    preferred_skills: 0.15,
    experience: 0.10,
    education: 0.10,
  });

  const loadHistory = async () => {
    try {
      const records = await api.getHistory();
      setHistory(records);
    } catch (err) {
      console.warn("Could not load history:", err);
    }
  };

  const loadHealth = async () => {
    try {
      const health = await api.getHealth();
      setNlpMode(health.active_nlp_mode);
    } catch (err) {
      console.warn("Could not check health:", err);
    }
  };

  useEffect(() => {
    loadHistory();
    loadHealth();
  }, []);

  const toggleDarkMode = () => {
    setIsDarkMode((prev) => !prev);
    if (!isDarkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  };

  const handleMatchSuccess = (result: MatchResponse) => {
    setCurrentMatch(result);
    setActiveTab("results");
    loadHistory();
  };

  const handleSelectHistoryItem = (item: MatchResponse) => {
    setCurrentMatch(item);
    setActiveTab("results");
  };

  const handleSelectRoleForMatching = (role: CareerRoleTemplate) => {
    setActiveTab("job");
  };

  const pageTitles: Record<NavTab, { title: string; subtitle: string }> = {
    overview: {
      title: "Executive Overview",
      subtitle: "System analytics, verified competencies, and recent matching evaluations",
    },
    resume: {
      title: "Resume Document Analyzer",
      subtitle: "Upload PDF / DOCX documents and extract structured candidate qualifications",
    },
    job: {
      title: "Job Description Matcher",
      subtitle: "Parse job requirements and evaluate compatibility against active candidate profile",
    },
    results: {
      title: "Match Analysis Dashboard",
      subtitle: "Multi-dimensional compatibility score, strengths, gaps, and requirement evidence",
    },
    gaps: {
      title: "Skill Gap & Learning Roadmap",
      subtitle: "Actionable roadmap prioritizing missing technical competencies and mini-projects",
    },
    improve: {
      title: "Resume Improvement Assistant",
      subtitle: "Measurable achievement optimizer, strong action verb suggestions, and revised drafts",
    },
    careers: {
      title: "Career Role Explorer",
      subtitle: "Explore 9 industry role templates and evaluate readiness based on current skills",
    },
    history: {
      title: "Analysis History & Comparisons",
      subtitle: "Stored SQLite evaluations, side-by-side job comparisons, and exportable PDF reports",
    },
    settings: {
      title: "Algorithm Weights & Engine Diagnostics",
      subtitle: "Configurable scoring weights, active transformer status, and theoretical viva notes",
    },
  };

  return (
    <div className={`flex min-h-screen ${isDarkMode ? "dark bg-[#0b1120] text-slate-100" : "bg-slate-50 text-slate-900"}`}>
      {/* Persistent Left Sidebar */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        nlpMode={nlpMode}
        hasActiveMatch={currentMatch !== null}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        <Navbar
          pageTitle={pageTitles[activeTab].title}
          pageSubtitle={pageTitles[activeTab].subtitle}
          isDarkMode={isDarkMode}
          toggleDarkMode={toggleDarkMode}
          candidateName={currentResume?.candidate_name}
          nlpMode={nlpMode}
        />

        <main className="flex-1 p-8 max-w-7xl w-full mx-auto">
          {activeTab === "overview" && (
            <Overview
              history={history}
              currentResume={currentResume}
              onNavigate={(tab) => setActiveTab(tab)}
              onSelectAnalysis={handleSelectHistoryItem}
              onRefreshHistory={loadHistory}
            />
          )}

          {activeTab === "resume" && (
            <ResumeAnalyzer
              resume={currentResume}
              setResume={setCurrentResume}
              onNavigateToJob={() => setActiveTab("job")}
            />
          )}

          {activeTab === "job" && (
            <JobMatcher
              currentResume={currentResume}
              onMatchSuccess={handleMatchSuccess}
              onNavigateToResume={() => setActiveTab("resume")}
              weights={weights}
            />
          )}

          {activeTab === "results" && currentMatch && (
            <MatchResults
              result={currentMatch}
              onNavigateToGaps={() => setActiveTab("gaps")}
              onNavigateToImprove={() => setActiveTab("improve")}
              onNavigateToJob={() => setActiveTab("job")}
            />
          )}

          {activeTab === "gaps" && (
            <SkillGapAnalysis
              currentMatch={currentMatch}
              onNavigateToJob={() => setActiveTab("job")}
            />
          )}

          {activeTab === "improve" && (
            <ResumeImprover
              currentResume={currentResume}
              onNavigateToResume={() => setActiveTab("resume")}
            />
          )}

          {activeTab === "careers" && (
            <CareerExplorer
              currentResume={currentResume}
              onSelectRoleForMatching={handleSelectRoleForMatching}
              onNavigateToResume={() => setActiveTab("resume")}
            />
          )}

          {activeTab === "history" && (
            <History
              history={history}
              onSelectAnalysis={handleSelectHistoryItem}
              onRefreshHistory={loadHistory}
              onNavigateToJob={() => setActiveTab("job")}
            />
          )}

          {activeTab === "settings" && (
            <Settings weights={weights} setWeights={setWeights} />
          )}
        </main>
      </div>
    </div>
  );
}

export default App;
