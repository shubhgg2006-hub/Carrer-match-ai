import React from "react";
import { Moon, Sun, UserCheck, ShieldCheck, CheckCircle2 } from "lucide-react";
import { Badge } from "./Badge";

interface NavbarProps {
  pageTitle: string;
  pageSubtitle: string;
  isDarkMode: boolean;
  toggleDarkMode: () => void;
  candidateName?: string;
  nlpMode?: string;
}

export const Navbar: React.FC<NavbarProps> = ({
  pageTitle,
  pageSubtitle,
  isDarkMode,
  toggleDarkMode,
  candidateName,
  nlpMode = "SentenceTransformer + TF-IDF",
}) => {
  return (
    <header className="h-16 border-b border-slate-800/80 bg-[#0c1322]/80 backdrop-blur-md px-8 flex items-center justify-between sticky top-0 z-30">
      <div>
        <h2 className="text-base font-bold text-slate-100 flex items-center gap-2">
          {pageTitle}
        </h2>
        <p className="text-xs text-slate-400">{pageSubtitle}</p>
      </div>

      <div className="flex items-center gap-4">
        {/* NLP Mode Tag */}
        <Badge variant="cyan" size="sm" className="hidden sm:inline-flex">
          <ShieldCheck size={13} className="text-cyan-400" />
          <span className="truncate max-w-[190px]">{nlpMode}</span>
        </Badge>

        {/* Candidate Profile / Active Status */}
        {candidateName ? (
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-800/70 border border-slate-700/60">
            <UserCheck size={14} className="text-emerald-400" />
            <span className="text-xs font-semibold text-slate-200">{candidateName}</span>
          </div>
        ) : (
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-800/40 border border-slate-700/40 text-slate-400 text-xs font-medium">
            No Resume Loaded
          </div>
        )}

        {/* Theme Toggle (functional) */}
        <button
          onClick={toggleDarkMode}
          className="p-2 rounded-lg bg-slate-800/60 border border-slate-700/60 text-slate-300 hover:text-white hover:bg-slate-700/60 transition-colors"
          title="Toggle Light/Dark Theme"
          aria-label="Toggle theme"
        >
          {isDarkMode ? <Sun size={16} className="text-amber-400" /> : <Moon size={16} className="text-cyan-300" />}
        </button>
      </div>
    </header>
  );
};
