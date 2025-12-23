
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
  Calculator,
  Search,
  HelpCircle,
  Percent,
  TrendingUp,
  Scale
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
  const [hoveredScore, setHoveredScore] = useState(false);

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

  const highlightKeywords = (text: string, keywords: string[]) => {
    if (!keywords.length) return text;
    
    const sortedKeywords = [...keywords]
      .filter(kw => kw.trim().length > 0)
      .sort((a, b) => b.length - a.length);

    const escapedKeywords = sortedKeywords
      .map(kw => kw.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));
      
    if (escapedKeywords.length === 0) return text;

    const regex = new RegExp(`(\\b${escapedKeywords.join('\\b|\\b')}\\b)`, 'gi');
    const parts = text.split(regex);
    
    return parts.map((part, i) => {
      const isMatch = keywords.some(kw => kw.toLowerCase() === part.toLowerCase());
      if (isMatch) {
        return (
          <span 
            key={i} 
            className="inline-flex items-center bg-amber-100 text-amber-900 font-extrabold px-1.5 py-0.5 rounded-md border border-amber-200 shadow-sm text-[0.92em] mx-0.5 ring-1 ring-amber-400/20"
            title="Matched JD Keyword"
          >
            <Search className="w-2.5 h-2.5 mr-1 text-amber-600 stroke-[3px]" />
            {part}
          </span>
        );
      }
      return part;
    });
  };

  const weights = {
    ats_match: 0.35,
    experience: 0.25,
    skills: 0.20,
    seniority: 0.10,
    education: 0.10
  };

  const chartData = selectedCandidate ? [
    { name: 'ATS Match', score: selectedCandidate.score_breakdown?.ats_match || 0, weight: '35%', color: '#3b82f6', key: 'ats_match' },
    { name: 'Experience', score: selectedCandidate.score_breakdown?.experience || 0, weight: '25%', color: '#6366f1', key: 'experience' },
    { name: 'Skills', score: selectedCandidate.score_breakdown?.skills || 0, weight: '20%', color: '#8b5cf6', key: 'skills' },
    { name: 'Seniority', score: selectedCandidate.score_breakdown?.seniority || 0, weight: '10%', color: '#a855f7', key: 'seniority' },
    { name: 'Education', score: selectedCandidate.score_breakdown?.education || 0, weight: '10%', color: '#d946ef', key: 'education' },
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
        <div className="flex items-center space-x-2 px-4 py-2 bg-blue-50 text-blue-700 rounded-full border border-blue-100 text-sm font-semibold shadow-sm">
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
                    <div 
                      className="relative cursor-help"
                      onMouseEnter={() => setHoveredScore(true)}
                      onMouseLeave={() => setHoveredScore(false)}
                    >
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

                      {/* Score Tooltip Mini Breakdown */}
                      {hoveredScore && selectedCandidate.score_breakdown && (
                        <div className="absolute top-full left-1/2 -translate-x-1/2 mt-4 z-50 w-72 bg-slate-900 text-white rounded-2xl shadow-2xl p-5 text-xs animate-in fade-in zoom-in-95">
                          <div className="flex items-center space-x-2 mb-4 border-b border-white/10 pb-2">
                            <Calculator className="w-4 h-4 text-blue-400" />
                            <span className="font-bold uppercase tracking-widest text-[10px]">Calculation Logic</span>
                          </div>
                          <div className="space-y-2.5">
                            {chartData.map(item => (
                              <div key={item.key} className="flex justify-between items-center">
                                <span className="text-slate-400">{item.name} <span className="text-[9px] opacity-60">({item.weight})</span></span>
                                <span className="font-mono font-bold text-blue-300">
                                  +{(selectedCandidate.score_breakdown[item.key as keyof ScoreBreakdown] * weights[item.key as keyof typeof weights]).toFixed(1)}
                                </span>
                              </div>
                            ))}
                          </div>
                          <div className="mt-4 pt-3 border-t border-white/10 flex justify-between items-center">
                             <span className="font-black text-[11px] uppercase tracking-tighter text-slate-300">Total Fit Score</span>
                             <span className="text-lg font-black text-blue-400">{selectedCandidate.fit_score}%</span>
                          </div>
                          <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-4 h-4 bg-slate-900 rotate-45"></div>
                        </div>
                      )}
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
                      <h4 className="flex items-center text-sm font-bold text-slate-800 mb-3 uppercase tracking-wider">
                        <CheckCircle2 className="w-4 h-4 text-emerald-500 mr-2" />
                        Key Strengths & Alignment
                      </h4>
                      <ul className="space-y-4">
                        {selectedCandidate.strengths.map((s, i) => (
                          <li key={i} className="flex items-start text-sm text-slate-600 leading-relaxed group">
                            <ChevronRight className="w-3.5 h-3.5 text-slate-300 mt-1 mr-1.5 flex-shrink-0 group-hover:text-blue-400 transition-colors" />
                            <span className="flex flex-wrap">{highlightKeywords(s, data.job_analysis.required_keywords)}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div>
                      <h4 className="flex items-center text-sm font-bold text-slate-800 mb-3 uppercase tracking-wider">
                        <AlertTriangle className="w-4 h-4 text-amber-500 mr-2" />
                        Gap Analysis
                      </h4>
                      <ul className="space-y-3">
                        {selectedCandidate.gaps.map((g, i) => (
                          <li key={i} className="flex items-start text-sm text-slate-600 leading-relaxed">
                            <ChevronRight className="w-3.5 h-3.5 text-slate-300 mt-1 mr-1.5 flex-shrink-0" />
                            {g}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  <div className="space-y-6">
                    <div className="bg-slate-50 rounded-xl p-5 border border-slate-100 relative overflow-hidden group">
                      <div className="absolute top-0 right-0 w-24 h-24 bg-blue-100 rounded-full blur-3xl opacity-20 -mr-8 -mt-8 group-hover:opacity-40 transition-opacity"></div>
                      <h4 className="text-sm font-bold text-slate-800 mb-4 flex items-center uppercase tracking-wider relative z-10">
                        <Award className="w-4 h-4 text-blue-500 mr-2" />
                        Hiring Justification
                      </h4>
                      <div className="space-y-5 relative z-10">
                        {selectedCandidate.justification.map((j, i) => (
                          <div key={i} className="text-[13px] text-slate-600 leading-relaxed italic border-l-2 border-blue-200 pl-4 py-1">
                            "{highlightKeywords(j, data.job_analysis.required_keywords)}"
                          </div>
                        ))}
                      </div>
                    </div>

                    <div>
                      <h4 className="text-sm font-bold text-slate-800 mb-3 uppercase tracking-wider">Missing Critical Keywords</h4>
                      <div className="flex flex-wrap gap-2">
                        {selectedCandidate.missing_keywords.length > 0 ? (
                          selectedCandidate.missing_keywords.map((kw, i) => (
                            <span key={i} className="px-2.5 py-1 bg-red-50 text-red-600 text-[10px] font-black rounded-lg uppercase border border-red-100 shadow-sm">
                              {kw}
                            </span>
                          ))
                        ) : (
                          <span className="text-xs text-slate-400 italic bg-emerald-50 text-emerald-600 px-3 py-1 rounded-full border border-emerald-100">All critical keywords identified</span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Detailed Score Breakdown Section */}
                <div className="mt-10 pt-8 border-t border-slate-100">
                  <button 
                    onClick={() => setShowBreakdown(!showBreakdown)}
                    className="w-full flex items-center justify-between p-4 bg-slate-50 rounded-2xl hover:bg-slate-100 transition-all border border-slate-200 group"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-blue-600 text-white rounded-xl shadow-lg shadow-blue-200 group-hover:scale-110 transition-transform">
                        <Scale className="w-5 h-5" />
                      </div>
                      <div className="text-left">
                        <span className="font-bold text-slate-800 block">Analysis Methodology & Fit Proof</span>
                        <span className="text-[10px] text-slate-400 uppercase font-black tracking-widest">Weighted contribution & detailed calculation</span>
                      </div>
                    </div>
                    {showBreakdown ? <ChevronDown className="w-5 h-5 text-slate-400" /> : <ChevronRight className="w-5 h-5 text-slate-400" />}
                  </button>

                  {showBreakdown && selectedCandidate.score_breakdown && (
                    <div className="mt-6 p-8 bg-slate-50/40 border border-slate-200 rounded-[2.5rem] shadow-inner space-y-12 animate-in slide-in-from-top-2 duration-400">
                      
                      {/* Interactive Header for Breakdown */}
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-slate-200 pb-8">
                        <div>
                          <h4 className="text-lg font-black text-slate-900 mb-2">How this score was reached</h4>
                          <p className="text-sm text-slate-500 max-w-xl">
                            Each category is scored by the AI on a scale of 0-100 and then multiplied by its importance weight to calculate the candidate's final Fit Score.
                          </p>
                        </div>
                        <div className="bg-white px-6 py-4 rounded-3xl border border-slate-200 shadow-sm flex flex-col items-center">
                          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Total Result</span>
                          <span className="text-3xl font-black text-blue-600 leading-none">{selectedCandidate.fit_score}%</span>
                        </div>
                      </div>

                      {/* Weighted Contribution Table */}
                      <div className="bg-white rounded-[2rem] border border-slate-200 shadow-xl overflow-hidden">
                        <table className="w-full text-left border-collapse">
                          <thead>
                            <tr className="bg-slate-900 text-white">
                              <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] border-r border-white/5">Weighted Category</th>
                              <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-center border-r border-white/5">Raw Score</th>
                              <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-center border-r border-white/5">Category Weight</th>
                              <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-right">Contribution</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100">
                            {chartData.map((item) => {
                              const rawScore = selectedCandidate.score_breakdown[item.key as keyof ScoreBreakdown];
                              const weightVal = weights[item.key as keyof typeof weights];
                              const points = (rawScore * weightVal).toFixed(1);
                              return (
                                <tr key={item.key} className="hover:bg-blue-50/40 transition-all duration-200 group">
                                  <td className="px-8 py-5 border-r border-slate-100">
                                    <div className="flex items-center space-x-3">
                                      <div className="w-3 h-3 rounded-full shadow-sm" style={{ backgroundColor: item.color }}></div>
                                      <div>
                                        <span className="text-sm font-black text-slate-800 block">{item.name}</span>
                                        <span className="text-[10px] text-slate-400 font-bold uppercase">{item.key.replace('_', ' ')} logic applied</span>
                                      </div>
                                    </div>
                                  </td>
                                  <td className="px-8 py-5 text-center border-r border-slate-100">
                                    <div className="inline-flex items-center space-x-2">
                                      <span className="text-sm font-mono font-black text-slate-700">{rawScore}</span>
                                      <span className="text-[10px] text-slate-300 font-bold">/100</span>
                                    </div>
                                  </td>
                                  <td className="px-8 py-5 text-center border-r border-slate-100">
                                    <span className="inline-flex items-center px-3 py-1 bg-slate-50 text-slate-500 text-[10px] font-black rounded-full border border-slate-200 group-hover:bg-white transition-colors">
                                      {item.weight}
                                    </span>
                                  </td>
                                  <td className="px-8 py-5 text-right bg-blue-50/20 group-hover:bg-blue-100/30 transition-colors">
                                    <span className="text-base font-black text-blue-600">+{points}</span>
                                  </td>
                                </tr>
                              );
                            })}
                            <tr className="bg-blue-600 text-white">
                              <td colSpan={3} className="px-8 py-6 text-sm font-black uppercase tracking-[0.3em]">Final Aggregate Score</td>
                              <td className="px-8 py-6 text-right font-black text-2xl shadow-inner">{selectedCandidate.fit_score}%</td>
                            </tr>
                          </tbody>
                        </table>
                      </div>

                      {/* Visual & Formula Proof */}
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                        {/* Distribution Chart */}
                        <div className="space-y-6">
                           <div className="flex items-center space-x-3">
                              <div className="p-2.5 bg-blue-100 text-blue-600 rounded-2xl">
                                <TrendingUp className="w-5 h-5" />
                              </div>
                              <h4 className="text-sm font-black text-slate-800 uppercase tracking-widest">Performance Visualizer</h4>
                           </div>
                           <div className="h-64 bg-white rounded-[2rem] border border-slate-200 p-8 shadow-sm">
                            <ResponsiveContainer width="100%" height="100%">
                              <BarChart layout="vertical" data={chartData} margin={{ left: 10, right: 20 }}>
                                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                                <XAxis type="number" domain={[0, 100]} hide />
                                <YAxis 
                                  dataKey="name" 
                                  type="category" 
                                  axisLine={false} 
                                  tickLine={false} 
                                  tick={{ fontSize: 10, fontWeight: 900, fill: '#64748b', textAnchor: 'start' }} 
                                  width={80} 
                                />
                                <Tooltip 
                                  cursor={{ fill: '#f8fafc' }}
                                  content={({ active, payload }) => {
                                    if (active && payload && payload.length) {
                                      const data = payload[0].payload;
                                      return (
                                        <div className="bg-slate-900 text-white p-4 rounded-2xl shadow-2xl border border-white/10 animate-in zoom-in-95 duration-150">
                                          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-400 mb-2">{data.name}</p>
                                          <div className="flex items-center justify-between space-x-8">
                                            <span className="text-xs font-bold text-slate-300">Raw Performance</span>
                                            <span className="text-lg font-black">{data.score}/100</span>
                                          </div>
                                          <div className="mt-3 pt-3 border-t border-white/5 text-[10px] text-slate-500 font-bold italic">
                                            Impact Weight: {data.weight}
                                          </div>
                                        </div>
                                      );
                                    }
                                    return null;
                                  }}
                                />
                                <Bar dataKey="score" radius={[0, 6, 6, 0]} barSize={20}>
                                  {chartData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={entry.color} />
                                  ))}
                                </Bar>
                              </BarChart>
                            </ResponsiveContainer>
                          </div>
                        </div>

                        {/* Visual Logic Proof */}
                        <div className="space-y-6">
                           <div className="flex items-center space-x-3">
                              <div className="p-2.5 bg-amber-100 text-amber-600 rounded-2xl">
                                <HelpCircle className="w-5 h-5" />
                              </div>
                              <h4 className="text-sm font-black text-slate-800 uppercase tracking-widest">Mathematical Proof</h4>
                           </div>
                           <div className="bg-slate-900 rounded-[2.5rem] p-10 text-white relative overflow-hidden group border border-white/10 shadow-2xl">
                            <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600 rounded-full blur-[100px] opacity-20 -mr-32 -mt-32 transition-opacity group-hover:opacity-30"></div>
                            <div className="relative z-10">
                              <div className="flex flex-wrap items-center gap-x-3 gap-y-6 font-mono leading-relaxed">
                                {chartData.map((item, idx) => (
                                  <React.Fragment key={item.key}>
                                    <div className="flex flex-col bg-white/5 border border-white/10 rounded-2xl px-5 py-4 transition-all hover:bg-white/10 hover:-translate-y-1">
                                      <span className="text-[9px] font-black text-slate-500 uppercase tracking-[0.1em] mb-2">{item.name}</span>
                                      <span className="text-sm font-black text-blue-300">
                                        ({selectedCandidate.score_breakdown[item.key as keyof ScoreBreakdown]} × {weights[item.key as keyof typeof weights]})
                                      </span>
                                    </div>
                                    {idx < chartData.length - 1 && <span className="text-slate-600 font-black text-2xl mx-1">+</span>}
                                  </React.Fragment>
                                ))}
                                <span className="text-slate-600 font-black text-3xl mx-2">=</span>
                                <div className="bg-blue-600 text-white rounded-2xl px-8 py-5 shadow-2xl shadow-blue-900/50 flex flex-col items-center">
                                  <span className="text-[10px] font-black uppercase tracking-widest text-blue-200 mb-1">Final Score</span>
                                  <span className="text-3xl font-black">{selectedCandidate.fit_score}%</span>
                                </div>
                              </div>
                              <div className="mt-12 flex items-start space-x-3 text-[10px] text-slate-500 font-bold leading-relaxed uppercase tracking-widest italic">
                                <Info className="w-4 h-4 text-slate-700 flex-shrink-0" />
                                <span>All raw scores are generated via contextual semantic analysis relative to the provided Job Description. Demographics and non-professional data are excluded from calculation logic.</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Summary Stats Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white rounded-2xl p-6 border border-slate-200 flex items-center space-x-4 shadow-sm hover:shadow-md transition-shadow group">
                  <div className="p-3 bg-blue-50 text-blue-600 rounded-xl group-hover:scale-110 transition-transform">
                    <Briefcase className="w-6 h-6" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-slate-400 uppercase tracking-widest">Experience</div>
                    <div className="text-lg font-black text-slate-800">{selectedCandidate.experience_years}</div>
                  </div>
                </div>
                <div className="bg-white rounded-2xl p-6 border border-slate-200 flex items-center space-x-4 shadow-sm hover:shadow-md transition-shadow group">
                  <div className="p-3 bg-purple-50 text-purple-600 rounded-xl group-hover:scale-110 transition-transform">
                    <GraduationCap className="w-6 h-6" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-slate-400 uppercase tracking-widest">Education Match</div>
                    <div className="text-lg font-black text-slate-800">{selectedCandidate.score_breakdown?.education || 0}%</div>
                  </div>
                </div>
                <div className="bg-white rounded-2xl p-6 border border-slate-200 flex items-center space-x-4 shadow-sm hover:shadow-md transition-shadow group">
                  <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl group-hover:scale-110 transition-transform">
                    <Target className="w-6 h-6" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-slate-400 uppercase tracking-widest">Seniority Fit</div>
                    <div className="text-lg font-black text-slate-800">{selectedCandidate.score_breakdown?.seniority || 0}%</div>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-slate-400 bg-white rounded-2xl border border-dashed border-slate-200 p-12 min-h-[400px] animate-pulse">
              <Users className="w-12 h-12 mb-4 opacity-20" />
              <p className="font-bold tracking-tight">Select a candidate from the ranking list to view deep-dive analysis</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
