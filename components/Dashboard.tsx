
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
  HelpCircle
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

                      {/* Score Tooltip */}
                      {hoveredScore && selectedCandidate.score_breakdown && (
                        <div className="absolute top-full left-1/2 -translate-x-1/2 mt-4 z-50 w-64 bg-slate-900 text-white rounded-xl shadow-2xl p-4 text-xs animate-in fade-in zoom-in-95">
                          <div className="flex items-center space-x-2 mb-3 border-b border-white/10 pb-2">
                            <Calculator className="w-3.5 h-3.5 text-blue-400" />
                            <span className="font-bold uppercase tracking-widest">Weighted Breakdown</span>
                          </div>
                          <div className="space-y-2">
                            <div className="flex justify-between">
                              <span className="text-slate-400">ATS Match (35%)</span>
                              <span className="font-bold">{(selectedCandidate.score_breakdown.ats_match * 0.35).toFixed(1)}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-slate-400">Experience (25%)</span>
                              <span className="font-bold">{(selectedCandidate.score_breakdown.experience * 0.25).toFixed(1)}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-slate-400">Skills Alignment (20%)</span>
                              <span className="font-bold">{(selectedCandidate.score_breakdown.skills * 0.20).toFixed(1)}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-slate-400">Seniority/Scope (10%)</span>
                              <span className="font-bold">{(selectedCandidate.score_breakdown.seniority * 0.10).toFixed(1)}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-slate-400">Education (10%)</span>
                              <span className="font-bold">{(selectedCandidate.score_breakdown.education * 0.10).toFixed(1)}</span>
                            </div>
                          </div>
                          <div className="mt-3 pt-2 border-t border-white/10 text-center font-black text-blue-400 uppercase tracking-tighter">
                            Total Fit Score: {selectedCandidate.fit_score}%
                          </div>
                          <div className="absolute -top-1.5 left-1/2 -translate-x-1/2 w-3 h-3 bg-slate-900 rotate-45"></div>
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

                {/* Score Breakdown Section */}
                <div className="mt-10 pt-8 border-t border-slate-100">
                  <button 
                    onClick={() => setShowBreakdown(!showBreakdown)}
                    className="w-full flex items-center justify-between p-4 bg-slate-50 rounded-xl hover:bg-slate-100 transition-all border border-slate-200 group"
                  >
                    <div className="flex items-center space-x-2">
                      <Calculator className="w-5 h-5 text-blue-600 group-hover:scale-110 transition-transform" />
                      <div className="text-left">
                        <span className="font-bold text-slate-800 block">Explainable AI: Scoring Methodology</span>
                        <span className="text-[10px] text-slate-400 uppercase font-black tracking-widest">Click to toggle mathematical breakdown</span>
                      </div>
                    </div>
                    {showBreakdown ? <ChevronDown className="w-5 h-5 text-slate-400" /> : <ChevronRight className="w-5 h-5 text-slate-400" />}
                  </button>

                  {showBreakdown && selectedCandidate.score_breakdown && (
                    <div className="mt-4 p-8 bg-white border border-slate-200 rounded-2xl shadow-inner space-y-8 animate-in slide-in-from-top-2">
                      
                      {/* Visual Formula Display */}
                      <div className="bg-blue-50/50 rounded-2xl p-6 border border-blue-100">
                        <div className="flex items-center space-x-2 mb-4 text-blue-800">
                          <HelpCircle className="w-4 h-4" />
                          <h4 className="font-bold text-xs uppercase tracking-wider">Calculation Formula</h4>
                        </div>
                        <div className="flex flex-wrap items-center gap-2 text-[11px] font-mono leading-loose">
                          <div className="bg-white px-3 py-1.5 rounded-lg border border-blue-200 shadow-sm flex flex-col">
                            <span className="text-[9px] text-slate-400 font-bold uppercase tracking-tighter">ATS Match</span>
                            <span className="font-black text-blue-600">({selectedCandidate.score_breakdown.ats_match} × 0.35)</span>
                          </div>
                          <span className="text-blue-300 font-bold text-lg">+</span>
                          <div className="bg-white px-3 py-1.5 rounded-lg border border-blue-200 shadow-sm flex flex-col">
                            <span className="text-[9px] text-slate-400 font-bold uppercase tracking-tighter">Experience</span>
                            <span className="font-black text-blue-600">({selectedCandidate.score_breakdown.experience} × 0.25)</span>
                          </div>
                          <span className="text-blue-300 font-bold text-lg">+</span>
                          <div className="bg-white px-3 py-1.5 rounded-lg border border-blue-200 shadow-sm flex flex-col">
                            <span className="text-[9px] text-slate-400 font-bold uppercase tracking-tighter">Skills</span>
                            <span className="font-black text-blue-600">({selectedCandidate.score_breakdown.skills} × 0.20)</span>
                          </div>
                          <span className="text-blue-300 font-bold text-lg">+</span>
                          <div className="bg-white px-3 py-1.5 rounded-lg border border-blue-200 shadow-sm flex flex-col">
                            <span className="text-[9px] text-slate-400 font-bold uppercase tracking-tighter">Seniority</span>
                            <span className="font-black text-blue-600">({selectedCandidate.score_breakdown.seniority} × 0.10)</span>
                          </div>
                          <span className="text-blue-300 font-bold text-lg">+</span>
                          <div className="bg-white px-3 py-1.5 rounded-lg border border-blue-200 shadow-sm flex flex-col">
                            <span className="text-[9px] text-slate-400 font-bold uppercase tracking-tighter">Education</span>
                            <span className="font-black text-blue-600">({selectedCandidate.score_breakdown.education} × 0.10)</span>
                          </div>
                          <span className="text-slate-400 font-bold text-lg">=</span>
                          <div className="bg-blue-600 px-4 py-2 rounded-lg text-white shadow-lg shadow-blue-200">
                             <span className="font-black text-base">{selectedCandidate.fit_score}%</span>
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="space-y-4">
                          <p className="text-sm text-slate-500 leading-relaxed">
                            Individual category scores are normalized on a scale of 0-100 based on the job requirements defined in the specification phase.
                          </p>
                          <div className="space-y-3 text-xs">
                            <div className="flex justify-between items-center py-2 border-b border-slate-50 group hover:bg-slate-50 rounded px-2 transition-colors">
                              <span className="text-slate-600">ATS Keyword Match</span>
                              <div className="text-right">
                                <span className="font-bold text-slate-800 block">{selectedCandidate.score_breakdown.ats_match}/100</span>
                                <span className="text-[9px] text-blue-500 font-bold uppercase">Weight 35%</span>
                              </div>
                            </div>
                            <div className="flex justify-between items-center py-2 border-b border-slate-50 group hover:bg-slate-50 rounded px-2 transition-colors">
                              <span className="text-slate-600">Role-Relevant Experience</span>
                              <div className="text-right">
                                <span className="font-bold text-slate-800 block">{selectedCandidate.score_breakdown.experience}/100</span>
                                <span className="text-[9px] text-blue-500 font-bold uppercase">Weight 25%</span>
                              </div>
                            </div>
                            <div className="flex justify-between items-center py-2 border-b border-slate-50 group hover:bg-slate-50 rounded px-2 transition-colors">
                              <span className="text-slate-600">Skills & Tools Alignment</span>
                              <div className="text-right">
                                <span className="font-bold text-slate-800 block">{selectedCandidate.score_breakdown.skills}/100</span>
                                <span className="text-[9px] text-blue-500 font-bold uppercase">Weight 20%</span>
                              </div>
                            </div>
                            <div className="flex justify-between items-center py-2 border-b border-slate-50 group hover:bg-slate-50 rounded px-2 transition-colors">
                              <span className="text-slate-600">Seniority fit / Scope</span>
                              <div className="text-right">
                                <span className="font-bold text-slate-800 block">{selectedCandidate.score_breakdown.seniority}/100</span>
                                <span className="text-[9px] text-blue-500 font-bold uppercase">Weight 10%</span>
                              </div>
                            </div>
                            <div className="flex justify-between items-center py-2 border-b border-slate-50 group hover:bg-slate-50 rounded px-2 transition-colors">
                              <span className="text-slate-600">Education & Certifications</span>
                              <div className="text-right">
                                <span className="font-bold text-slate-800 block">{selectedCandidate.score_breakdown.education}/100</span>
                                <span className="text-[9px] text-blue-500 font-bold uppercase">Weight 10%</span>
                              </div>
                            </div>
                          </div>
                        </div>

                        <div className="h-72">
                          <ResponsiveContainer width="100%" height="100%">
                            <BarChart 
                              layout="vertical" 
                              data={chartData} 
                              margin={{ left: 20, right: 30 }}
                            >
                              <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                              <XAxis type="number" domain={[0, 100]} hide />
                              <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 700, fill: '#64748b' }} width={80} />
                              <Tooltip 
                                cursor={{ fill: '#f8fafc' }}
                                content={({ active, payload }) => {
                                  if (active && payload && payload.length) {
                                    const data = payload[0].payload;
                                    return (
                                      <div className="bg-white p-3 rounded-xl shadow-xl border border-slate-100">
                                        <p className="text-xs font-bold text-slate-800 mb-1">{data.name}</p>
                                        <p className="text-[10px] text-slate-500 font-medium">Performance: {data.score}/100</p>
                                        <p className="text-[10px] text-blue-600 font-black">Impact: {data.weight} total</p>
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
                          <div className="text-[10px] text-center text-slate-400 font-bold uppercase tracking-widest mt-4">
                             Categorized Performance Markers
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
