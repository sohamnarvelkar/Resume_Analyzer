
import React, { useState, useEffect } from 'react';
import { Mail, Lock, User as UserIcon, LogIn, Github, Search, CheckCircle2, ArrowRight, AlertCircle } from 'lucide-react';
import { User } from '../types';

interface AuthProps {
  onLogin: (user: User) => void;
}

const Auth: React.FC<AuthProps> = ({ onLogin }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Basic form validation
    if (!email || !password || (!isLogin && !name)) {
      setError("Please fill in all required fields.");
      return;
    }

    setIsLoading(true);
    
    // Simulate network delay for a more realistic feel
    setTimeout(() => {
      const mockUser: User = {
        id: Math.random().toString(36).substr(2, 9),
        name: isLogin ? (email.split('@')[0] || 'User') : name,
        email: email,
        avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${email}`
      };
      onLogin(mockUser);
    }, 800);
  };

  const handleGoogleLogin = () => {
    setError(null);
    setIsLoading(true);
    setTimeout(() => {
      const mockUser: User = {
        id: 'google-user-123',
        name: 'Google User',
        email: 'google@example.com',
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=google'
      };
      onLogin(mockUser);
    }, 600);
  };

  const handleGithubLogin = () => {
    setError(null);
    setIsLoading(true);
    setTimeout(() => {
      const mockUser: User = {
        id: 'github-user-456',
        name: 'GitHub Contributor',
        email: 'github-dev@example.com',
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=github'
      };
      onLogin(mockUser);
    }, 600);
  };

  return (
    <div className={`min-h-screen flex items-center justify-center p-6 bg-slate-50 transition-opacity duration-700 ${isVisible ? 'opacity-100' : 'opacity-0'}`}>
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-100/50 rounded-full blur-[120px]"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-100/50 rounded-full blur-[120px]"></div>
      </div>

      <div className="w-full max-w-[1000px] grid grid-cols-1 lg:grid-cols-2 bg-white rounded-[2.5rem] shadow-2xl shadow-blue-900/10 overflow-hidden relative z-10 border border-slate-100">
        
        {/* Left Side: Brand & Social Proof */}
        <div className="hidden lg:flex flex-col justify-between p-12 bg-blue-600 text-white relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-600 to-indigo-700"></div>
          <div className="absolute top-0 left-0 w-full h-full opacity-10">
             <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
               <defs>
                 <pattern id="grid" width="10" height="10" patternUnits="userSpaceOnUse">
                   <path d="M 10 0 L 0 0 0 10" fill="none" stroke="white" strokeWidth="0.5"/>
                 </pattern>
               </defs>
               <rect width="100" height="100" fill="url(#grid)" />
             </svg>
          </div>
          
          <div className="relative z-10">
            <div className="inline-flex p-3 bg-white/10 rounded-2xl mb-6 backdrop-blur-md border border-white/20">
              <Search className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-4xl font-black tracking-tight mb-4">
              Unlock the Power <br />of AI Screening
            </h1>
            <p className="text-blue-100 text-lg leading-relaxed max-w-sm">
              Evaluate hundreds of resumes in seconds with our enterprise-grade ATS matching engine.
            </p>
          </div>

          <div className="relative z-10 space-y-6">
            <div className="space-y-4">
              {[
                "Context-aware skill matching",
                "Advanced sentiment analysis",
                "Explainable fit scores"
              ].map((text, i) => (
                <div key={i} className="flex items-center space-x-3 text-sm font-medium">
                  <div className="bg-white/20 p-1 rounded-full backdrop-blur-sm">
                    <CheckCircle2 className="w-4 h-4 text-blue-200" />
                  </div>
                  <span>{text}</span>
                </div>
              ))}
            </div>
            
            <div className="pt-8 border-t border-white/10 flex items-center space-x-4">
              <div className="flex -space-x-2">
                {[1, 2, 3].map(i => (
                  <img 
                    key={i}
                    src={`https://api.dicebear.com/7.x/avataaars/svg?seed=avatar${i}`} 
                    className="w-8 h-8 rounded-full border-2 border-blue-600 bg-blue-400" 
                    alt="user"
                  />
                ))}
              </div>
              <p className="text-xs font-semibold text-blue-100 italic">
                Trusted by 500+ recruitment teams
              </p>
            </div>
          </div>
        </div>

        {/* Right Side: Form */}
        <div className="p-8 md:p-12 lg:p-16 flex flex-col justify-center">
          <div className="mb-10 lg:hidden text-center">
             <div className="inline-flex p-2 bg-blue-600 rounded-xl mb-3">
               <Search className="w-6 h-6 text-white" />
             </div>
             <h2 className="text-2xl font-black text-slate-800">ResuMatch Pro</h2>
          </div>

          <div className="mb-10 text-center lg:text-left">
            <h2 className="text-3xl font-black text-slate-900 mb-2">
              {isLogin ? 'Welcome back' : 'Join the elite'}
            </h2>
            <p className="text-slate-500 font-medium">
              {isLogin ? 'Sign in to access your screening pipeline.' : 'Start your journey towards better hiring.'}
            </p>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-100 rounded-2xl flex items-center space-x-3 text-red-700 animate-in fade-in slide-in-from-top-2">
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
              <p className="text-xs font-bold">{error}</p>
            </div>
          )}

          <div className="flex bg-slate-100 p-1 rounded-2xl mb-8">
            <button 
              onClick={() => { setIsLogin(true); setError(null); }}
              className={`flex-1 py-3 text-sm font-bold rounded-xl transition-all duration-300 ${isLogin ? 'bg-white text-blue-600 shadow-lg shadow-blue-100' : 'text-slate-400 hover:text-slate-600'}`}
            >
              Sign In
            </button>
            <button 
              onClick={() => { setIsLogin(false); setError(null); }}
              className={`flex-1 py-3 text-sm font-bold rounded-xl transition-all duration-300 ${!isLogin ? 'bg-white text-blue-600 shadow-lg shadow-blue-100' : 'text-slate-400 hover:text-slate-600'}`}
            >
              Sign Up
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {!isLogin && (
              <div className="space-y-1 group animate-in slide-in-from-left-2 duration-300">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 transition-colors group-focus-within:text-blue-500">Full Name</label>
                <div className="relative">
                  <UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 transition-colors group-focus-within:text-blue-500" />
                  <input 
                    type="text" 
                    required 
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all text-sm font-medium"
                    placeholder="E.g. Jane Doe"
                  />
                </div>
              </div>
            )}
            
            <div className="space-y-1 group">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 transition-colors group-focus-within:text-blue-500">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 transition-colors group-focus-within:text-blue-500" />
                <input 
                  type="email" 
                  required 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all text-sm font-medium"
                  placeholder="alex@example.com"
                />
              </div>
            </div>

            <div className="space-y-1 group">
              <div className="flex justify-between items-center ml-1">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest transition-colors group-focus-within:text-blue-500">Password</label>
                {isLogin && (
                  <button type="button" className="text-[10px] font-bold text-blue-600 hover:text-blue-700 transition-colors">
                    Forgot Password?
                  </button>
                )}
              </div>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 transition-colors group-focus-within:text-blue-500" />
                <input 
                  type="password" 
                  required 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all text-sm font-medium"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <button 
              type="submit"
              disabled={isLoading}
              className="w-full py-4 bg-blue-600 text-white font-black rounded-2xl hover:bg-blue-700 transition-all shadow-xl shadow-blue-200 flex items-center justify-center space-x-2 mt-6 active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed group"
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              ) : (
                <>
                  <span>{isLogin ? 'Sign In' : 'Create Account'}</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </form>

          <div className="relative my-10">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-100"></div>
            </div>
            <div className="relative flex justify-center text-[10px] font-black uppercase tracking-[0.2em]">
              <span className="bg-white px-4 text-slate-300">Or continue with</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <button 
              onClick={handleGoogleLogin}
              disabled={isLoading}
              className="flex items-center justify-center space-x-3 py-3.5 border border-slate-200 rounded-2xl hover:bg-slate-50 hover:border-slate-300 transition-all text-sm font-bold text-slate-700 active:scale-[0.98]"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
              <span>Google</span>
            </button>
            <button 
              onClick={handleGithubLogin}
              disabled={isLoading}
              className="flex items-center justify-center space-x-3 py-3.5 border border-slate-200 rounded-2xl hover:bg-slate-50 hover:border-slate-300 transition-all text-sm font-bold text-slate-700 active:scale-[0.98]"
            >
              <Github className="w-5 h-5" />
              <span>GitHub</span>
            </button>
          </div>

          <p className="mt-10 text-center text-xs text-slate-400 leading-relaxed">
            By continuing, you agree to ResuMatch Pro's <br className="hidden sm:block" />
            <a href="#" className="underline font-bold hover:text-blue-600 transition-colors">Terms of Service</a> and <a href="#" className="underline font-bold hover:text-blue-600 transition-colors">Privacy Policy</a>.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Auth;
