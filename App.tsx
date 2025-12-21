
import React, { useState, useEffect } from 'react';
import { 
  Briefcase, 
  Users, 
  FileText, 
  Play, 
  Plus, 
  Trash2, 
  Loader2, 
  CheckCircle2, 
  AlertCircle,
  Search,
  History as HistoryIcon,
  LogOut,
  ChevronLeft,
  Settings,
  Bell,
  X,
  RefreshCcw,
  Info
} from 'lucide-react';
import { RoleType, ResumeInput, ScreenerOutput, User, HistoryItem } from './types';
import { screenResumes } from './geminiService';
import Dashboard from './components/Dashboard';
import Auth from './components/Auth';
import History from './components/History';

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(() => {
    const savedUser = localStorage.getItem('resu_user');
    return savedUser ? JSON.parse(savedUser) : null;
  });
  
  const [history, setHistory] = useState<HistoryItem[]>(() => {
    const savedHistory = localStorage.getItem('resu_history');
    return savedHistory ? JSON.parse(savedHistory) : [];
  });

  const [view, setView] = useState<'screen' | 'result' | 'history'>('screen');
  const [roleType, setRoleType] = useState<RoleType>(RoleType.Tech);
  const [jobDescription, setJobDescription] = useState('');
  const [resumes, setResumes] = useState<ResumeInput[]>([{ id: '1', text: '' }]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingStep, setProcessingStep] = useState('');
  const [result, setResult] = useState<ScreenerOutput | null>(null);
  const [error, setError] = useState<{ message: string; details?: string } | null>(null);

  useEffect(() => {
    localStorage.setItem('resu_history', JSON.stringify(history));
  }, [history]);

  useEffect(() => {
    if (user) {
      localStorage.setItem('resu_user', JSON.stringify(user));
    } else {
      localStorage.removeItem('resu_user');
    }
  }, [user]);

  const handleAddResume = () => {
    setResumes([...resumes, { id: Date.now().toString(), text: '' }]);
    if (error) setError(null);
  };

  const handleRemoveResume = (id: string) => {
    if (resumes.length > 1) {
      setResumes(resumes.filter(r => r.id !== id));
    }
  };

  const handleResumeChange = (id: string, text: string) => {
    setResumes(resumes.map(r => r.id === id ? { ...r, text } : r));
    if (error) setError(null);
  };

  const handleProcess = async () => {
    // Basic Input Validation
    if (!jobDescription.trim()) {
      setError({ message: 'Missing Job Description', details: 'The analysis engine requires a job description to cross-reference against resumes.' });
      return;
    }

    const filledResumes = resumes.filter(r => r.text.trim().length > 10);
    if (filledResumes.length === 0) {
      setError({ message: 'No Resumes Found', details: 'Please paste at least one candidate resume with meaningful content (minimum 10 characters).' });
      return;
    }

    setIsProcessing(true);
    setProcessingStep('Analyzing Job Description...');
    setError(null);

    try {
      // Small simulated delay for UX feel
      await new Promise(r => setTimeout(r, 800));
      setProcessingStep('Cross-referencing candidates...');
      
      const data = await screenResumes(
        roleType, 
        jobDescription, 
        filledResumes.map(r => r.text)
      );
      
      setProcessingStep('Finalizing rankings...');
      
      const newHistoryItem: HistoryItem = {
        id: Date.now().toString(),
        timestamp: Date.now(),
        role: roleType,
        candidateCount: filledResumes.length,
        data: data
      };
      
      setHistory([newHistoryItem, ...history]);
      setResult(data);
      setView('result');
    } catch (err: any) {
      setError({ 
        message: 'Analysis Failed', 
        details: err.message || 'An unexpected error occurred during processing.' 
      });
    } finally {
      setIsProcessing(false);
      setProcessingStep('');
    }
  };

  const handleSelectHistoryItem = (item: HistoryItem) => {
    setResult(item.data);
    setView('result');
  };

  const handleDeleteHistoryItem = (id: string) => {
    setHistory(history.filter(h => h.id !== id));
  };

  const handleLogout = () => {
    setUser(null);
    setView('screen');
    setError(null);
  };

  const dismissError = () => setError(null);

  if (!user) {
    return <Auth onLogin={setUser} />;
  }

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-900 font-sans">
      {/* Navbar */}
      <nav className="bg-white border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-8">
              <div 
                className="flex items-center space-x-2 cursor-pointer group" 
                onClick={() => {
                  setView('screen');
                  setError(null);
                }}
              >
                <div className="bg-blue-600 p-2 rounded-lg group-hover:scale-105 transition-transform">
                  <Search className="w-5 h-5 text-white" />
                </div>
                <span className="text-xl font-bold tracking-tight text-slate-800 hidden sm:block">
                  ResuMatch <span className="text-blue-600">Pro</span>
                </span>
              </div>

              <div className="hidden md:flex items-center space-x-1">
                <button 
                  onClick={() => { setView('screen'); setError(null); }}
                  className={`px-4 py-2 text-sm font-bold rounded-xl transition-all ${view === 'screen' ? 'bg-blue-50 text-blue-600' : 'text-slate-500 hover:bg-slate-50'}`}
                >
                  Screening
                </button>
                <button 
                  onClick={() => { setView('history'); setError(null); }}
                  className={`px-4 py-2 text-sm font-bold rounded-xl flex items-center space-x-2 transition-all ${view === 'history' ? 'bg-blue-50 text-blue-600' : 'text-slate-500 hover:bg-slate-50'}`}
                >
                  <HistoryIcon className="w-4 h-4" />
                  <span>History</span>
                </button>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <div className="hidden sm:flex flex-col items-end">
                <span className="text-sm font-bold text-slate-800">{user.name}</span>
                <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Enterprise Plan</span>
              </div>
              
              <div className="relative group">
                <img 
                  src={user.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.email}`} 
                  alt="Avatar" 
                  className="w-10 h-10 rounded-full border-2 border-white ring-2 ring-blue-50 cursor-pointer"
                />
                <div className="absolute right-0 mt-2 w-48 bg-white border border-slate-200 rounded-2xl shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all p-2 z-50">
                  <div className="px-3 py-2 border-b border-slate-50 mb-1 sm:hidden">
                    <p className="text-sm font-bold text-slate-800 truncate">{user.name}</p>
                    <p className="text-[10px] text-slate-400">{user.email}</p>
                  </div>
                  <button className="w-full flex items-center space-x-2 px-3 py-2 text-sm text-slate-600 hover:bg-slate-50 rounded-lg transition-colors">
                    <Settings className="w-4 h-4" />
                    <span>Settings</span>
                  </button>
                  <button className="w-full flex items-center space-x-2 px-3 py-2 text-sm text-slate-600 hover:bg-slate-50 rounded-lg transition-colors">
                    <Bell className="w-4 h-4" />
                    <span>Notifications</span>
                  </button>
                  <button 
                    onClick={handleLogout}
                    className="w-full flex items-center space-x-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors mt-1"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Log Out</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        {/* Persistent Error Alert */}
        {error && (
          <div className="mb-8 p-5 bg-red-50 border border-red-200 rounded-2xl shadow-sm flex items-start justify-between animate-in slide-in-from-top-4">
            <div className="flex items-start space-x-4">
              <div className="p-2 bg-red-100 text-red-600 rounded-xl">
                <AlertCircle className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-sm font-black text-red-800 uppercase tracking-wider">{error.message}</h3>
                <p className="text-sm text-red-600 mt-1 leading-relaxed max-w-2xl">{error.details}</p>
                <div className="mt-3 flex items-center space-x-4">
                  <button 
                    onClick={handleProcess}
                    className="flex items-center space-x-1.5 text-xs font-bold text-red-700 hover:underline"
                  >
                    <RefreshCcw className="w-3.5 h-3.5" />
                    <span>Retry Analysis</span>
                  </button>
                  <div className="flex items-center space-x-1.5 text-xs font-bold text-red-400">
                    <Info className="w-3.5 h-3.5" />
                    <span>Check your inputs for special characters or length</span>
                  </div>
                </div>
              </div>
            </div>
            <button 
              onClick={dismissError}
              className="p-1.5 text-red-300 hover:text-red-500 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        )}

        {view === 'history' ? (
          <History 
            items={history} 
            onSelectItem={handleSelectHistoryItem} 
            onDeleteItem={handleDeleteHistoryItem} 
          />
        ) : view === 'result' && result ? (
          <Dashboard 
            data={result} 
            onReset={() => {
              setView('screen');
              setError(null);
            }} 
          />
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Left Column: Job & Config */}
            <div className="lg:col-span-5 space-y-6">
              <section className="bg-white rounded-3xl shadow-sm border border-slate-200 p-8">
                <div className="flex items-center space-x-3 mb-6">
                  <div className="p-2 bg-blue-50 rounded-xl">
                    <Briefcase className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-slate-800">Job Specification</h2>
                    <p className="text-slate-400 text-xs">Define the criteria for AI analysis</p>
                  </div>
                </div>
                
                <div className="space-y-6">
                  <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">
                      Role Category
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                      {Object.values(RoleType).map((type) => (
                        <button
                          key={type}
                          onClick={() => setRoleType(type)}
                          className={`py-2.5 px-3 text-sm font-bold rounded-xl transition-all ${
                            roleType === type
                              ? 'bg-blue-600 text-white shadow-lg shadow-blue-200'
                              : 'bg-slate-50 text-slate-500 hover:bg-slate-100 border border-slate-200'
                          }`}
                        >
                          {type}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">
                      Job Description
                    </label>
                    <textarea
                      value={jobDescription}
                      onChange={(e) => {
                        setJobDescription(e.target.value);
                        if (error) setError(null);
                      }}
                      placeholder="Paste the full job description here (min 50 chars recommended)..."
                      className={`w-full h-80 p-5 text-sm border rounded-3xl focus:ring-4 outline-none resize-none bg-slate-50/50 transition-all leading-relaxed ${
                        error?.message === 'Missing Job Description' ? 'border-red-300 ring-red-100' : 'border-slate-200 focus:ring-blue-500/10 focus:border-blue-500'
                      }`}
                    />
                  </div>
                </div>
              </section>

              <section className="bg-slate-900 rounded-3xl shadow-2xl p-8 text-white relative overflow-hidden group">
                <div className="relative z-10">
                  <h3 className="text-xl font-bold mb-3 flex items-center">
                    <CheckCircle2 className="w-6 h-6 mr-2 text-blue-400" />
                    Deep Analysis Ready
                  </h3>
                  <p className="text-slate-400 text-sm mb-8 leading-relaxed">
                    Our AI engine will perform cross-referencing between the JD and candidate resumes in parallel.
                  </p>
                  <button
                    disabled={isProcessing}
                    onClick={handleProcess}
                    className="w-full py-4 bg-blue-600 text-white font-black rounded-2xl flex flex-col items-center justify-center hover:bg-blue-500 transition-all disabled:opacity-80 disabled:cursor-not-allowed shadow-xl shadow-blue-900/40 group/btn"
                  >
                    {isProcessing ? (
                      <div className="flex flex-col items-center space-y-2">
                        <div className="flex items-center space-x-3">
                          <Loader2 className="w-5 h-5 animate-spin" />
                          <span>Processing Batch...</span>
                        </div>
                        <span className="text-[10px] font-bold text-blue-200 uppercase tracking-widest animate-pulse">
                          {processingStep}
                        </span>
                      </div>
                    ) : (
                      <div className="flex items-center space-x-3">
                        <Play className="w-5 h-5 fill-current group-hover/btn:scale-110 transition-transform" />
                        <span>Run Batch Screening</span>
                      </div>
                    )}
                  </button>
                </div>
                <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600 rounded-full blur-[100px] opacity-20 -mr-32 -mt-32"></div>
              </section>
            </div>

            {/* Right Column: Resumes */}
            <div className="lg:col-span-7">
              <div className="bg-white rounded-3xl shadow-sm border border-slate-200 p-8 h-full flex flex-col">
                <div className="flex items-center justify-between mb-8">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-purple-50 rounded-xl">
                      <Users className="w-6 h-6 text-purple-600" />
                    </div>
                    <div>
                      <h2 className="text-xl font-bold text-slate-800">Candidate Pipeline</h2>
                      <p className="text-slate-400 text-xs">Bulk upload resumes for ranking ({resumes.length})</p>
                    </div>
                  </div>
                  <button
                    onClick={handleAddResume}
                    className="flex items-center space-x-2 text-sm font-bold text-blue-600 hover:text-blue-700 bg-blue-50 hover:bg-blue-100 px-5 py-2.5 rounded-xl transition-all"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Add Candidate</span>
                  </button>
                </div>

                <div className="space-y-6 flex-grow overflow-y-auto max-h-[800px] pr-2 custom-scrollbar">
                  {resumes.map((resume, index) => (
                    <div 
                      key={resume.id} 
                      className={`relative group border rounded-3xl p-6 transition-all hover:border-blue-400 hover:bg-blue-50/10 ${
                        error?.message === 'No Resumes Found' ? 'border-red-200 bg-red-50/5' : 'border-slate-200'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center space-x-2">
                          <span className={`w-6 h-6 rounded-lg flex items-center justify-center text-[10px] font-black ${
                            resume.text.trim().length > 10 ? 'bg-emerald-100 text-emerald-600' : 'bg-slate-100 text-slate-500'
                          }`}>
                            {index + 1}
                          </span>
                          <span className="text-xs font-black text-slate-400 uppercase tracking-widest">
                            Candidate Profile
                          </span>
                          {resume.text.trim().length > 10 && (
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-600 border border-emerald-100">
                              Content Detected
                            </span>
                          )}
                        </div>
                        {resumes.length > 1 && (
                          <button
                            onClick={() => handleRemoveResume(resume.id)}
                            className="p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all opacity-0 group-hover:opacity-100"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                      <textarea
                        value={resume.text}
                        onChange={(e) => handleResumeChange(resume.id, e.target.value)}
                        placeholder="Paste full resume text content here (Experience, Skills, Projects)..."
                        className="w-full h-44 p-0 bg-transparent border-none focus:ring-0 outline-none text-sm leading-relaxed text-slate-600 placeholder:text-slate-300 resize-none"
                      />
                    </div>
                  ))}
                  
                  {resumes.length === 0 && (
                    <div className="flex flex-col items-center justify-center py-20 bg-slate-50 rounded-3xl border-2 border-dashed border-slate-200">
                      <FileText className="w-16 h-16 text-slate-200 mb-4" />
                      <p className="text-slate-400 font-bold">No candidates found</p>
                      <button
                        onClick={handleAddResume}
                        className="mt-4 text-blue-600 font-black hover:text-blue-700 underline underline-offset-4"
                      >
                        Add your first candidate
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
      
      <footer className="py-12 border-t border-slate-100 bg-white">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <Search className="w-5 h-5 text-slate-300" />
            <span className="text-sm font-black text-slate-300 uppercase tracking-[0.2em]">ResuMatch Pro</span>
          </div>
          <p className="text-slate-400 text-xs">
            &copy; 2024 ResuMatch Pro. Secure Enterprise-Grade Recruitment Intelligence.
          </p>
        </div>
      </footer>
      
      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #f1f5f9;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #cbd5e1;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #94a3b8;
        }
      `}</style>
    </div>
  );
};

export default App;
