import React, { useState } from "react";
import {
  History as HistoryIcon,
  Search,
  Download,
  Trash2,
  ExternalLink,
  GitCompare,
  Database,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  X
} from "lucide-react";
import { Card } from "../components/Card";
import { Badge } from "../components/Badge";
import { Modal } from "../components/Modal";
import { MatchResponse } from "../types";
import { api } from "../services/api";

interface HistoryProps {
  history: MatchResponse[];
  onSelectAnalysis: (analysis: MatchResponse) => void;
  onRefreshHistory: () => void;
  onNavigateToJob: () => void;
}

export const History: React.FC<HistoryProps> = ({
  history,
  onSelectAnalysis,
  onRefreshHistory,
  onNavigateToJob,
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedForCompare, setSelectedForCompare] = useState<string[]>([]);
  const [isCompareModalOpen, setIsCompareModalOpen] = useState(false);

  const filteredHistory = history.filter(
    (item) =>
      item.target_job_title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.candidate_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.resume_filename.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleDelete = async (id: string, title: string) => {
    if (confirm(`Delete analysis record for "${title}" from SQLite database?`)) {
      await api.deleteHistoryById(id);
      onRefreshHistory();
    }
  };

  const handleClearAll = async () => {
    if (confirm("Permanently delete ALL saved analysis records from the SQLite database? This cannot be undone.")) {
      await api.clearAllHistory();
      onRefreshHistory();
    }
  };

  const toggleSelectForCompare = (id: string) => {
    if (selectedForCompare.includes(id)) {
      setSelectedForCompare(selectedForCompare.filter((item) => item !== id));
    } else {
      if (selectedForCompare.length >= 2) {
        // Keep last one and add new one
        setSelectedForCompare([selectedForCompare[1], id]);
      } else {
        setSelectedForCompare([...selectedForCompare, id]);
      }
    }
  };

  const compareItemA = history.find((h) => h.id === selectedForCompare[0]);
  const compareItemB = history.find((h) => h.id === selectedForCompare[1]);

  return (
    <div className="space-y-8 animate-fade-in pb-16">
      {/* Header Banner */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-slate-900 via-indigo-950/60 to-slate-900 border border-slate-800 shadow-xl flex flex-wrap items-center justify-between gap-4">
        <div>
          <Badge variant="cyan" size="sm" className="mb-2">
            Local SQLite Persistence
          </Badge>
          <h2 className="text-xl font-bold text-white tracking-tight">
            Analysis History & Comparison Vault
          </h2>
          <p className="text-xs text-slate-300 mt-1 max-w-2xl leading-relaxed">
            All evaluated resumes and job matches are persisted locally in <code className="text-cyan-300 font-mono">./careermatch.db</code>.
            Review past scores, generate exportable PDF reports, or compare multiple roles side-by-side.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {selectedForCompare.length === 2 && (
            <button
              onClick={() => setIsCompareModalOpen(true)}
              className="px-4 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs flex items-center gap-2 shadow-lg shadow-cyan-500/20 transition-all"
            >
              <GitCompare size={14} />
              Compare Selected (2)
            </button>
          )}

          {history.length > 0 && (
            <button
              onClick={handleClearAll}
              className="px-3.5 py-2.5 rounded-xl bg-slate-800 hover:bg-rose-500/20 hover:text-rose-300 text-slate-400 border border-slate-700 text-xs font-semibold flex items-center gap-1.5 transition-colors"
            >
              <Trash2 size={14} />
              Clear All Data
            </button>
          )}
        </div>
      </div>

      {/* Search and Table */}
      <Card
        title="Saved Match Records"
        subtitle={`Showing ${filteredHistory.length} of ${history.length} records`}
        action={
          <div className="relative w-64">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by role or candidate..."
              className="w-full pl-8 pr-3 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-xs text-slate-200 focus:outline-none focus:border-cyan-500/60"
            />
          </div>
        }
      >
        {filteredHistory.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950/80 text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-800">
                <tr>
                  <th className="py-3 px-3 w-10 text-center">Compare</th>
                  <th className="py-3 px-4 font-semibold">Target Job Role</th>
                  <th className="py-3 px-4 font-semibold">Candidate</th>
                  <th className="py-3 px-4 font-semibold">Match Score</th>
                  <th className="py-3 px-4 font-semibold">Evaluated On</th>
                  <th className="py-3 px-4 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-slate-300">
                {filteredHistory.map((item) => {
                  const isSelected = selectedForCompare.includes(item.id);
                  const scoreVariant =
                    item.overall_score >= 85
                      ? "success"
                      : item.overall_score >= 70
                      ? "cyan"
                      : item.overall_score >= 50
                      ? "warning"
                      : "danger";

                  return (
                    <tr
                      key={item.id}
                      className="hover:bg-slate-800/30 transition-colors group cursor-pointer"
                      onClick={() => onSelectAnalysis(item)}
                    >
                      <td
                        className="py-3 px-3 text-center"
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleSelectForCompare(item.id);
                        }}
                      >
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => {}}
                          className="rounded border-slate-700 bg-slate-900 text-cyan-500 focus:ring-0 cursor-pointer"
                        />
                      </td>

                      <td className="py-3 px-4 font-bold text-slate-100 group-hover:text-cyan-300 transition-colors">
                        {item.target_job_title}
                      </td>

                      <td className="py-3 px-4 text-slate-300">
                        {item.candidate_name}
                      </td>

                      <td className="py-3 px-4">
                        <Badge variant={scoreVariant} size="sm">
                          {item.overall_score}% ({item.compatibility_category})
                        </Badge>
                      </td>

                      <td className="py-3 px-4 text-slate-400">
                        {item.created_at ? item.created_at.slice(0, 10) : "Recent"}
                      </td>

                      <td className="py-3 px-4 text-right whitespace-nowrap">
                        <div
                          className="flex items-center justify-end gap-2"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <a
                            href={api.getDownloadPdfUrl(item.id)}
                            download
                            className="p-1.5 rounded-lg bg-slate-800 text-slate-300 hover:text-cyan-300 hover:bg-slate-700 transition-colors"
                            title="Download PDF Report"
                          >
                            <Download size={14} />
                          </a>

                          <button
                            onClick={() => handleDelete(item.id, item.target_job_title)}
                            className="p-1.5 rounded-lg bg-slate-800 text-slate-400 hover:text-rose-400 hover:bg-slate-700 transition-colors"
                            title="Delete Record"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="py-16 text-center text-xs text-slate-400">
            <HistoryIcon size={28} className="mx-auto text-slate-600 mb-2" />
            <p className="font-semibold text-slate-300">No match records found</p>
            <p className="mt-1 text-slate-500">
              Run a resume-to-job match to see your evaluation records persisted here.
            </p>
          </div>
        )}
      </Card>

      {/* Comparison Modal */}
      {compareItemA && compareItemB && (
        <Modal
          isOpen={isCompareModalOpen}
          onClose={() => setIsCompareModalOpen(false)}
          title="Side-by-Side Match Comparison"
          maxWidth="2xl"
        >
          <div className="space-y-6 text-xs text-slate-200">
            <p className="text-slate-400">
              Comparing two evaluated job descriptions against candidate profile:
            </p>

            <div className="grid grid-cols-2 gap-4">
              {/* Role A */}
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
                <div className="border-b border-slate-800 pb-2">
                  <span className="text-[10px] uppercase font-bold text-slate-400">Role A</span>
                  <h4 className="text-sm font-bold text-white mt-0.5">{compareItemA.target_job_title}</h4>
                  <Badge variant="cyan" size="sm" className="mt-1">
                    {compareItemA.overall_score}% Match
                  </Badge>
                </div>

                <div>
                  <span className="font-semibold text-slate-300 block mb-1">Matching Skills:</span>
                  <div className="flex flex-wrap gap-1">
                    {compareItemA.skills_analysis.matching_skills.map((s) => (
                      <Badge key={s} variant="success" size="sm">{s}</Badge>
                    ))}
                  </div>
                </div>

                <div>
                  <span className="font-semibold text-rose-300 block mb-1">Missing Required:</span>
                  <div className="flex flex-wrap gap-1">
                    {compareItemA.skills_analysis.missing_required.map((s) => (
                      <Badge key={s} variant="danger" size="sm">{s}</Badge>
                    ))}
                  </div>
                </div>
              </div>

              {/* Role B */}
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
                <div className="border-b border-slate-800 pb-2">
                  <span className="text-[10px] uppercase font-bold text-slate-400">Role B</span>
                  <h4 className="text-sm font-bold text-white mt-0.5">{compareItemB.target_job_title}</h4>
                  <Badge variant="cyan" size="sm" className="mt-1">
                    {compareItemB.overall_score}% Match
                  </Badge>
                </div>

                <div>
                  <span className="font-semibold text-slate-300 block mb-1">Matching Skills:</span>
                  <div className="flex flex-wrap gap-1">
                    {compareItemB.skills_analysis.matching_skills.map((s) => (
                      <Badge key={s} variant="success" size="sm">{s}</Badge>
                    ))}
                  </div>
                </div>

                <div>
                  <span className="font-semibold text-rose-300 block mb-1">Missing Required:</span>
                  <div className="flex flex-wrap gap-1">
                    {compareItemB.skills_analysis.missing_required.map((s) => (
                      <Badge key={s} variant="danger" size="sm">{s}</Badge>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setIsCompareModalOpen(false)}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs"
              >
                Close Comparison
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
