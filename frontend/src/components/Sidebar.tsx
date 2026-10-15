import React from "react";
import {
  LayoutDashboard,
  FileText,
  Briefcase,
  Target,
  Compass,
  History,
  Settings,
  Sparkles,
  Cpu
} from "lucide-react";

export type NavTab =
  | "overview"
  | "resume"
  | "job"
  | "results"
  | "gaps"
  | "improve"
  | "careers"
  | "history"
  | "settings";

interface SidebarProps {
  activeTab: NavTab;
  setActiveTab: (tab: NavTab) => void;
  nlpMode?: string;
  hasActiveMatch?: boolean;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  setActiveTab,
  nlpMode = "NLP Pipeline Active",
  hasActiveMatch = false,
}) => {
  const navItems = [
    { id: "overview", label: "Overview", icon: LayoutDashboard },
    { id: "resume", label: "Resume Analyzer", icon: FileText },
    { id: "job", label: "Job Matcher", icon: Briefcase },
    ...(hasActiveMatch ? [{ id: "results", label: "Match Results", icon: Sparkles, badge: "Active" }] : []),
    { id: "gaps", label: "Skill Gap Analysis", icon: Target },
    { id: "improve", label: "Resume Improvement", icon: Sparkles },
    { id: "careers", label: "Career Explorer", icon: Compass },
    { id: "history", label: "Analysis History", icon: History },
    { id: "settings", label: "Settings", icon: Settings },
  ];

  return (
    <aside className="w-64 flex-shrink-0 bg-[#0c1322] border-r border-slate-800/80 flex flex-col justify-between h-screen sticky top-0 z-40 select-none">
      <div>
        {/* Brand Header */}
        <div className="p-6 border-b border-slate-800/80 flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-cyan-600 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-cyan-500/20">
            <Cpu size={20} className="text-cyan-200" />
          </div>
          <div>
            <h1 className="text-base font-bold tracking-tight text-white flex items-center gap-1.5">
              CareerMatch <span className="text-cyan-400 font-extrabold text-xs px-1.5 py-0.5 rounded bg-cyan-950/80 border border-cyan-800/60">AI</span>
            </h1>
            <p className="text-[11px] text-slate-400 font-medium tracking-wide">Intelligent Matching System</p>
          </div>
        </div>

        {/* Navigation Items */}
        <nav className="p-3 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id as NavTab)}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                  isActive
                    ? "bg-gradient-to-r from-cyan-500/20 to-indigo-500/10 text-cyan-300 border border-cyan-500/30 shadow-sm shadow-cyan-950"
                    : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/50 border border-transparent"
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon
                    size={17}
                    className={isActive ? "text-cyan-400" : "text-slate-400"}
                  />
                  <span>{item.label}</span>
                </div>
                {item.badge && (
                  <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/40">
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* NLP Engine Status Pill */}
      <div className="p-4 border-t border-slate-800/80 m-3 rounded-xl bg-slate-900/60 border border-slate-800">
        <div className="flex items-center gap-2 mb-1.5">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
          <span className="text-[11px] font-semibold text-slate-300">NLP Engine Active</span>
        </div>
        <p className="text-[10px] text-slate-400 truncate" title={nlpMode}>
          {nlpMode}
        </p>
      </div>
    </aside>
  );
};
