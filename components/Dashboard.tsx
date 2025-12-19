
import React, { useState } from 'react';
import { 
  ArrowLeft, 
  Trophy, 
  BarChart2, 
  CheckCircle2, 
  XCircle, 
  AlertTriangle,
  ChevronRight,
  ChevronDown,
  Target,
  Clock,
  Briefcase,
  GraduationCap,
  Award,
  Zap,
  Users,
  Info,
  Calculator
} from 'lucide-react';
import { ScreenerOutput, CandidateResult, ScoreBreakdown } from '../types';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, Cell } from 'recharts';

interface DashboardProps {
  data: ScreenerOutput;
  onReset: () => void;
}

const Dashboard: React.FC<DashboardProps> = ({ data, onReset }) => {
  const [selectedCandidateId, setSelectedCandidateId] = useState<string | null>(
    data.candidates[0]?.candidate_id || null
  );
  const [showBreakdown, setShowBreakdown] = useState(false);

  const selectedCandidate = data.candidates.find(c => c.candidate_id === selectedCandidateId);

  const getRecColor = (rec: string) => {
    switch (rec) {
      case 'Strong Fit': return 'text-emerald-600 bg-emerald-50 border-emerald-100';
      case 'Potential Fit': return 'text-amber-600 bg-amber-50 border-amber-100';
      default: return 'text-rose-600 bg-rose-50 border-rose-100';
    }
  };

  const getRecIcon = (rec: string) => {
    switch (rec) {
      case 'Strong Fit': return <CheckCircle2 className="w-5 h-5" />;
      case 'Potential Fit': return <AlertTriangle className="w-5 h-5" />;
      default: return <XCircle className="w-5 h-5" />;
    }
  };

  const chartData = selectedCandidate ? [
    { name: 'ATS Match', score: selectedCandidate.score_breakdown?.ats_match || 0, weight: '35%', color: '#3b82f6' },
    { name: 'Experience', score: selectedCandidate.score_breakdown?.experience || 0, weight: '25%', color: '#6366f1' },
    { name: 'Skills', score: selectedCandidate.score_breakdown?.skills || 0, weight: '20%', color: '#8b5cf6' },
    { name: 'Seniority', score: selectedCandidate.score_breakdown?.seniority || 0, weight: '10%', color: '#a855f7' },
    { name: 'Education', score: selectedCandidate.score_breakdown?.education || 0, weight: '10%', color: '#d946ef' },
  ] : [];

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Header Actions */}
      <div className="flex items-center justify-between">
        <button
          onClick={onReset}
          className="flex items-center space-x-2 text-slate-500 hover:text-slate-800 font-medium transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>New Analysis</span>
        </button>
        <div className="flex items-center space-x-2 px-4 py-2 bg-blue-50 text-blue-700 rounded-full border border-blue-100 text-sm font-semibold">
          <Target className="w-4 h-4" />
          <span>{data.job_analysis.role_type} Role Analysis</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Job Summary & Rankings */}
        <div className="lg:col-span-4 space-y-6">
          <section className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 overflow-hidden">
            <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center">
              <Trophy className="w-5 h-5 text-amber-500 mr-2" />
              Final Ranking
            </h3>
            <div className="space-y-3">
              {data.final_ranking.map((rank) => {
                const cand = data.candidates.find(c => c.candidate_id === rank.candidate_id);
                const isSelected = selectedCandidateId === rank.candidate_id;
                return (
                  <button
                    key={rank.candidate_id}
                    onClick={() => {
                      setSelectedCandidateId(rank.candidate_id);
                      setShowBreakdown(false);
                    }}
                    className={`w-full flex items-center justify-between p-4 rounded-xl border transition-all ${
                      isSelected 
                        ? 'border-blue-500 bg-blue-50 ring-2 ring-blue-100 shadow-md' 
                        : 'border-slate-100 bg-slate-50/50 hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <span className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${
                        rank.rank === 1 ? 'bg-amber-100 text-amber-700' :
                        rank.rank === 2 ? 'bg-slate-200 text-slate-700' :
                        'bg-slate-100 text-slate-500'
                      }`}>
                        {rank.rank}
                      </span>
                      <div className="text-left">
                        <div className="font-bold text-slate-800 text-sm">{rank.candidate_id}</div>
                        <div className="text-xs text-slate-500">{cand?.recommendation}</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-black text-blue-600">{rank.fit_score}%</div>
                    </div>
                  </button>
                );
              })}
            </div>
          </section>

          <section className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
            <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center">
              <BarChart2 className="w-5 h-5 text-blue-500 mr-2" />
              JD Analysis
            </h3>
            <div className="space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-400 uppercase tracking-widest block mb-2">Required Keywords</label>
                <div className="flex flex-wrap gap-1.5">
                  {data.job_analysis.required_keywords.map((kw, i) => (
                    <span key={i} className="px-2.5 py-1 bg-slate-100 text-slate-700 text-xs font-medium rounded-md border border-slate-200">
                      {kw}
                    </span>
                  ))}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4 pt-4 border-t border-slate-100">
                <div>
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-widest block mb-1">Seniority</label>
                  <p className="text-sm font-semibold text-slate-700">{data.job_analysis.seniority_level}</p>
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-widest block mb-1">Target Exp</label>
                  <p className="text-sm font-semibold text-slate-700">{data.job_analysis.experience_required}</p>
                </div>
              </div>
            </div>
          </section>
        </div>

        {/* Right Column: Detail View */}
        <div className="lg:col-span-8 space-y-6">
          {selectedCandidate ? (
            <>
              <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
                  <div className="flex items-center space-x-6">
                    <div className="relative">
                      <svg className="w-24 h-24 transform -rotate-90">
                        <circle
                          cx="48"
                          cy="48"
                          r="42"
                          stroke="currentColor"
                          strokeWidth="8"
                          fill="transparent"
                          className="text-slate-100"
                        />
                        <circle
                          cx="48"
                          cy="48"
                          r="42"
                          stroke="currentColor"
                          strokeWidth="8"
                          strokeDasharray={2 * Math.PI * 42}
                          strokeDashoffset={2 * Math.PI * 42 * (1 - selectedCandidate.fit_score / 100)}
                          strokeLinecap="round"
                          fill="transparent"
                          className="text-blue-600 transition-all duration-1000 ease-out"
                        />
                      </svg>
                      <div className="absolute inset-0 flex items-center justify-center flex-col">
                        <span className="text-2xl font-black text-slate-800 leading-none">{selectedCandidate.fit_score}</span>
                        <span className="text-[10px] font-bold text-slate-400 uppercase">Score</span>
                      </div>
                    </div>
                    <div>
                      <h2 className="text-2xl font-black text-slate-900 mb-1">{selectedCandidate.candidate_id}</h2>
                      <div className={`inline-flex items-center space-x-1.5 px-3 py-1 rounded-full border text-sm font-bold ${getRecColor(selectedCandidate.recommendation)}`}>
                        {getRecIcon(selectedCandidate.recommendation)}
                        <span>{selectedCandidate.recommendation}</span>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 flex-grow max-w-lg">
                    <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                      <Clock className="w-4 h-4 text-slate-400 mb-1" />
                      <div className="text-[10px] font-bold text-slate-400 uppercase">Experience</div>
                      <div className="text-sm font-bold text-slate-700">{selectedCandidate.experience_years}</div>
                    </div>
                    <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                      <Target className="w-4 h-4 text-slate-400 mb-1" />
                      <div className="text-[10px] font-bold text-slate-400 uppercase">ATS Match</div>
                      <div className="text-sm font-bold text-slate-700">{selectedCandidate.ats_keyword_match_score}%</div>
                    </div>
                    <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                      <Zap className="w-4 h-4 text-slate-400 mb-1" />
                      <div className="text-[10px] font-bold text-slate-400 uppercase">Strengths</div>
                      <div className="text-sm font-bold text-slate-700">{selectedCandidate.strengths.length}</div>
                    </div>
                    <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                      <AlertTriangle className="w-4 h-4 text-slate-400 mb-1" />
                      <div className="text-[10px] font-bold text-slate-400 uppercase">Gaps</div>
                      <div className="text-sm font-bold text-slate-700">{selectedCandidate.gaps.length}</div>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-6">
                    <div>
                      <h4 className="flex items-center text-sm font-bold text-slate-800 mb-3">
                        <CheckCircle2 className="w-4 h-4 text-emerald-500 mr-2" />
                        Key Strengths
                      </h4>
                      <ul className="space-y-2">
                        {selectedCandidate.strengths.map((s, i) => (
                          <li key={i} className="flex items-start text-sm text-slate-600">
                            <ChevronRight className="w-3.5 h-3.5 text-slate-300 mt-0.5 mr-1" />
                            {s}
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div>
                      <h4 className="flex items-center text-sm font-bold text-slate-800 mb-3">
                        <AlertTriangle className="w-4 h-4 text-amber-500 mr-2" />
                        Areas of Concern / Gaps
                      </h4>
                      <ul className="space-y-2">
                        {selectedCandidate.gaps.map((g, i) => (
                          <li key={i} className="flex items-start text-sm text-slate-600">
                            <ChevronRight className="w-3.5 h-3.5 text-slate-300 mt-0.5 mr-1" />
                            {g}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  <div className="space-y-6">
                    <div className="bg-slate-50 rounded-xl p-5 border border-slate-100">
                      <h4 className="text-sm font-bold text-slate-800 mb-4 flex items-center">
                        <Award className="w-4 h-4 text-blue-500 mr-2" />
                        Hiring Justification
                      </h4>
                      <div className="space-y-3">
                        {selectedCandidate.justification.map((j, i) => (
                          <p key={i} className="text-xs text-slate-600 leading-relaxed italic border-l-2 border-slate-200 pl-3">
                            "{j}"
                          </p>
                        ))}
                      </div>
                    </div>

                    <div>
                      <h4 className="text-sm font-bold text-slate-800 mb-3">Missing Critical Keywords</h4>
                      <div className="flex flex-wrap gap-1.5">
                        {selectedCandidate.missing_keywords.length > 0 ? (
                          selectedCandidate.missing_keywords.map((kw, i) => (
                            <span key={i} className="px-2 py-1 bg-red-50 text-red-600 text-[10px] font-bold rounded uppercase border border-red-100">
                              {kw}
                            </span>
                          ))
                        ) : (
                          <span className="text-xs text-slate-400 italic">No critical keywords missing</span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Score Breakdown Section */}
                <div className="mt-10 pt-8 border-t border-slate-100">
                  <button 
                    onClick={() => setShowBreakdown(!showBreakdown)}
                    className="w-full flex items-center justify-between p-4 bg-slate-50 rounded-xl hover:bg-slate-100 transition-colors border border-slate-200"
                  >
                    <div className="flex items-center space-x-2">
                      <Calculator className="w-5 h-5 text-blue-600" />
                      <span className="font-bold text-slate-800">Scoring Methodology Breakdown</span>
                    </div>
                    {showBreakdown ? <ChevronDown className="w-5 h-5 text-slate-400" /> : <ChevronRight className="w-5 h-5 text-slate-400" />}
                  </button>

                  {showBreakdown && selectedCandidate.score_breakdown && (
                    <div className="mt-4 p-6 bg-white border border-slate-200 rounded-xl shadow-inner space-y-6 animate-in slide-in-from-top-2">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="space-y-4">
                          <p className="text-sm text-slate-500 leading-relaxed">
                            The final score of <span className="font-bold text-slate-800">{selectedCandidate.fit_score}</span> is calculated using a weighted average of individual category scores:
                          </p>
                          <div className="space-y-3 text-xs">
                            <div className="flex justify-between items-center py-2 border-b border-slate-50">
                              <span className="text-slate-600">ATS Keyword Match (35%)</span>
                              <span className="font-mono font-bold text-blue-600">{(selectedCandidate.score_breakdown.ats_match * 0.35).toFixed(1)} pts</span>
                            </div>
                            <div className="flex justify-between items-center py-2 border-b border-slate-50">
                              <span className="text-slate-600">Role Experience (25%)</span>
                              <span className="font-mono font-bold text-blue-600">{(selectedCandidate.score_breakdown.experience * 0.25).toFixed(1)} pts</span>
                            </div>
                            <div className="flex justify-between items-center py-2 border-b border-slate-50">
                              <span className="text-slate-600">Skills Alignment (20%)</span>
                              <span className="font-mono font-bold text-blue-600">{(selectedCandidate.score_breakdown.skills * 0.20).toFixed(1)} pts</span>
                            </div>
                            <div className="flex justify-between items-center py-2 border-b border-slate-50">
                              <span className="text-slate-600">Seniority & Scope (10%)</span>
                              <span className="font-mono font-bold text-blue-600">{(selectedCandidate.score_breakdown.seniority * 0.10).toFixed(1)} pts</span>
                            </div>
                            <div className="flex justify-between items-center py-2 border-b border-slate-50">
                              <span className="text-slate-600">Education & Certs (10%)</span>
                              <span className="font-mono font-bold text-blue-600">{(selectedCandidate.score_breakdown.education * 0.10).toFixed(1)} pts</span>
                            </div>
                            <div className="flex justify-between items-center py-3 bg-blue-50 px-3 rounded-lg mt-2">
                              <span className="font-bold text-blue-800 uppercase tracking-widest text-[10px]">Total Weighted Fit</span>
                              <span className="font-black text-blue-700 text-sm">{selectedCandidate.fit_score}%</span>
                            </div>
                          </div>
                        </div>

                        <div className="h-64">
                          <ResponsiveContainer width="100%" height="100%">
                            <BarChart 
                              layout="vertical" 
                              data={chartData} 
                              margin={{ left: 20, right: 30 }}
                            >
                              <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                              <XAxis type="number" domain={[0, 100]} hide />
                              <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 600, fill: '#64748b' }} width={80} />
                              <Tooltip 
                                cursor={{ fill: '#f8fafc' }}
                                content={({ active, payload }) => {
                                  if (active && payload && payload.length) {
                                    const data = payload[0].payload;
                                    return (
                                      <div className="bg-white p-3 rounded-xl shadow-xl border border-slate-100">
                                        <p className="text-xs font-bold text-slate-800 mb-1">{data.name}</p>
                                        <p className="text-[10px] text-slate-500">Score: {data.score}/100</p>
                                        <p className="text-[10px] text-blue-600 font-bold">Weight: {data.weight}</p>
                                      </div>
                                    );
                                  }
                                  return null;
                                }}
                              />
                              <Bar dataKey="score" radius={[0, 4, 4, 0]} barSize={20}>
                                {chartData.map((entry, index) => (
                                  <Cell key={`cell-${index}`} fill={entry.color} />
                                ))}
                              </Bar>
                            </BarChart>
                          </ResponsiveContainer>
                          <div className="text-[10px] text-center text-slate-400 font-bold uppercase tracking-widest mt-2">
                             Raw Category Performance (0-100)
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Summary Stats Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white rounded-2xl p-6 border border-slate-200 flex items-center space-x-4">
                  <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
                    <Briefcase className="w-6 h-6" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-slate-400 uppercase tracking-widest">Experience</div>
                    <div className="text-lg font-bold text-slate-800">{selectedCandidate.experience_years}</div>
                  </div>
                </div>
                <div className="bg-white rounded-2xl p-6 border border-slate-200 flex items-center space-x-4">
                  <div className="p-3 bg-purple-50 text-purple-600 rounded-xl">
                    <GraduationCap className="w-6 h-6" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-slate-400 uppercase tracking-widest">Education Match</div>
                    <div className="text-lg font-bold text-slate-800">{selectedCandidate.score_breakdown?.education || 0}%</div>
                  </div>
                </div>
                <div className="bg-white rounded-2xl p-6 border border-slate-200 flex items-center space-x-4">
                  <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
                    <Target className="w-6 h-6" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-slate-400 uppercase tracking-widest">Seniority Fit</div>
                    <div className="text-lg font-bold text-slate-800">{selectedCandidate.score_breakdown?.seniority || 0}%</div>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-slate-400 bg-white rounded-2xl border border-dashed border-slate-200 p-12 min-h-[400px]">
              <Users className="w-12 h-12 mb-4 opacity-20" />
              <p className="font-medium">Select a candidate from the ranking list to view deep-dive analysis</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
