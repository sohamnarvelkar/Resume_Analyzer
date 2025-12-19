
import React, { useState } from 'react';
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
  BarChart3,
  Search
} from 'lucide-react';
import { RoleType, ResumeInput, ScreenerOutput } from './types';
import { screenResumes } from './geminiService';
import Dashboard from './components/Dashboard';

const App: React.FC = () => {
  const [roleType, setRoleType] = useState<RoleType>(RoleType.Tech);
  const [jobDescription, setJobDescription] = useState('');
  const [resumes, setResumes] = useState<ResumeInput[]>([
    { id: '1', text: '' }
  ]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [result, setResult] = useState<ScreenerOutput | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleAddResume = () => {
    setResumes([...resumes, { id: Date.now().toString(), text: '' }]);
  };

  const handleRemoveResume = (id: string) => {
    if (resumes.length > 1) {
      setResumes(resumes.filter(r => r.id !== id));
    }
  };

  const handleResumeChange = (id: string, text: string) => {
    setResumes(resumes.map(r => r.id === id ? { ...r, text } : r));
  };

  const handleProcess = async () => {
    if (!jobDescription.trim()) {
      setError('Please provide a job description.');
      return;
    }
    const filledResumes = resumes.filter(r => r.text.trim() !== '');
    if (filledResumes.length === 0) {
      setError('Please add at least one candidate resume.');
      return;
    }

    setIsProcessing(true);
    setError(null);
    setResult(null);

    try {
      const data = await screenResumes(
        roleType, 
        jobDescription, 
        filledResumes.map(r => r.text)
      );
      setResult(data);
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans">
      {/* Navbar */}
      <nav className="bg-white border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-2">
              <div className="bg-blue-600 p-2 rounded-lg">
                <Search className="w-6 h-6 text-white" />
              </div>
              <span className="text-xl font-bold tracking-tight text-slate-800">
                ResuMatch <span className="text-blue-600">Pro</span>
              </span>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-xs font-medium bg-blue-50 text-blue-700 px-2.5 py-1 rounded-full border border-blue-100 uppercase tracking-wider">
                Enterprise AI Engine
              </span>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        {!result ? (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Left Column: Job & Config */}
            <div className="lg:col-span-5 space-y-6">
              <section className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
                <div className="flex items-center space-x-2 mb-4">
                  <Briefcase className="w-5 h-5 text-blue-600" />
                  <h2 className="text-lg font-semibold text-slate-800">Job Specification</h2>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">
                      Role Category
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                      {Object.values(RoleType).map((type) => (
                        <button
                          key={type}
                          onClick={() => setRoleType(type)}
                          className={`py-2 px-3 text-sm font-medium rounded-lg transition-all ${
                            roleType === type
                              ? 'bg-blue-600 text-white shadow-md'
                              : 'bg-slate-50 text-slate-600 hover:bg-slate-100 border border-slate-200'
                          }`}
                        >
                          {type}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">
                      Job Description
                    </label>
                    <textarea
                      value={jobDescription}
                      onChange={(e) => setJobDescription(e.target.value)}
                      placeholder="Paste the full job description here..."
                      className="w-full h-64 p-4 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none bg-slate-50/50"
                    />
                  </div>
                </div>
              </section>

              <section className="bg-blue-600 rounded-2xl shadow-lg p-6 text-white overflow-hidden relative group">
                <div className="relative z-10">
                  <h3 className="text-lg font-bold mb-2 flex items-center">
                    <CheckCircle2 className="w-5 h-5 mr-2" />
                    ATS Scoring Ready
                  </h3>
                  <p className="text-blue-100 text-sm mb-6 leading-relaxed">
                    Our AI engine will analyze keywords, semantic alignment, and seniority markers across all resumes in batch mode.
                  </p>
                  <button
                    disabled={isProcessing}
                    onClick={handleProcess}
                    className="w-full py-3.5 bg-white text-blue-600 font-bold rounded-xl flex items-center justify-center space-x-2 hover:bg-blue-50 transition-colors disabled:opacity-70 disabled:cursor-not-allowed shadow-xl shadow-blue-900/20"
                  >
                    {isProcessing ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        <span>Analyzing Batch...</span>
                      </>
                    ) : (
                      <>
                        <Play className="w-5 h-5 fill-current" />
                        <span>Run Batch Screening</span>
                      </>
                    )}
                  </button>
                </div>
                {/* Decorative blobs */}
                <div className="absolute -right-10 -bottom-10 w-40 h-40 bg-blue-500 rounded-full blur-3xl opacity-50 group-hover:opacity-70 transition-opacity"></div>
              </section>
            </div>

            {/* Right Column: Resumes */}
            <div className="lg:col-span-7">
              <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 h-full">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center space-x-2">
                    <Users className="w-5 h-5 text-blue-600" />
                    <h2 className="text-lg font-semibold text-slate-800">Candidate Resumes</h2>
                  </div>
                  <button
                    onClick={handleAddResume}
                    className="flex items-center space-x-1 text-sm font-medium text-blue-600 hover:text-blue-700 bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-lg transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Add Candidate</span>
                  </button>
                </div>

                {error && (
                  <div className="mb-6 p-4 bg-red-50 border border-red-100 rounded-xl flex items-start space-x-3 text-red-700 animate-in fade-in slide-in-from-top-2">
                    <AlertCircle className="w-5 h-5 mt-0.5 flex-shrink-0" />
                    <p className="text-sm font-medium">{error}</p>
                  </div>
                )}

                <div className="space-y-4">
                  {resumes.map((resume, index) => (
                    <div 
                      key={resume.id} 
                      className="relative group border border-slate-200 rounded-xl p-4 transition-all hover:border-blue-200 hover:shadow-md"
                    >
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                          Candidate #{index + 1}
                        </span>
                        {resumes.length > 1 && (
                          <button
                            onClick={() => handleRemoveResume(resume.id)}
                            className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all opacity-0 group-hover:opacity-100"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                      <textarea
                        value={resume.text}
                        onChange={(e) => handleResumeChange(resume.id, e.target.value)}
                        placeholder="Paste resume content here..."
                        className="w-full h-40 p-4 text-sm bg-slate-50 border-none focus:ring-2 focus:ring-blue-500 rounded-lg resize-none"
                      />
                    </div>
                  ))}
                  
                  {resumes.length === 0 && (
                    <div className="text-center py-20 bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200">
                      <FileText className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                      <p className="text-slate-500 font-medium">No candidates added yet.</p>
                      <button
                        onClick={handleAddResume}
                        className="mt-4 text-blue-600 font-bold hover:underline"
                      >
                        Add your first candidate
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        ) : (
          <Dashboard 
            data={result} 
            onReset={() => {
              setResult(null);
              setError(null);
            }} 
          />
        )}
      </main>
      
      <footer className="py-8 border-t border-slate-200 bg-white">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <p className="text-slate-500 text-sm">
            &copy; 2024 ResuMatch Pro. Enterprise-grade AI analysis for recruitment teams.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default App;
