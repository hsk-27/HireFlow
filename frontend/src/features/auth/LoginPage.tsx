import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/app/providers/AuthContext';
import { Button } from '@/components/common/Button';
import { LogIn, AlertCircle, Shield, Building2, User, KeyRound, ChevronRight } from 'lucide-react';

export const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showSandboxDock, setShowSandboxDock] = useState(true);

  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname || '/';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      await login({ email, password });
      navigate(from, { replace: true });
    } catch (err: any) {
      setError(err.response?.data?.message || 'Invalid work email or password');
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickImpersonation = async (demoEmail: string, demoPass: string) => {
    setEmail(demoEmail);
    setPassword(demoPass);
    setError('');
    setIsLoading(true);
    try {
      await login({ email: demoEmail, password: demoPass });
      navigate(from, { replace: true });
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to authenticate');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex flex-col justify-center py-10 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center space-y-2">
        <div className="w-11 h-11 bg-gradient-to-br from-primary-500 to-primary-700 rounded-xl mx-auto flex items-center justify-center text-white font-black text-lg shadow-md border border-primary-400/30">
          HF
        </div>
        <h2 className="text-2xl font-bold tracking-tight text-slate-900">
          Sign In to HireFlow
        </h2>
        <p className="text-xs text-slate-500">
          Enterprise Applicant Tracking & Recruitment Infrastructure
        </p>
      </div>

      <div className="mt-7 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-6 shadow-sm border border-slate-200/90 rounded-2xl sm:px-10 space-y-5">
          {error && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg flex items-center gap-2 text-rose-700 text-xs font-semibold">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                Work Email Address
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@company.com"
                className="w-full px-3.5 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-600 focus:border-transparent transition bg-slate-50/50"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                  Password
                </label>
                <span className="text-[11px] font-semibold text-primary-600 hover:text-primary-700 cursor-pointer">
                  Forgot password?
                </span>
              </div>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-3.5 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-600 focus:border-transparent transition bg-slate-50/50"
              />
            </div>

            <Button type="submit" className="w-full font-bold text-xs py-2.5" isLoading={isLoading}>
              <LogIn className="w-3.5 h-3.5 mr-1.5" /> Continue to Workspace
            </Button>
          </form>

          {/* Enterprise SSO Divider */}
          <div className="relative pt-2">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-200" />
            </div>
            <div className="relative flex justify-center text-[11px] uppercase tracking-wider font-bold">
              <span className="bg-white px-2 text-slate-400">Enterprise Single Sign-On</span>
            </div>
          </div>

          <button
            type="button"
            onClick={() => alert('SAML 2.0 / Okta integration configured for corporate domains.')}
            className="w-full py-2 px-3 text-xs font-semibold text-slate-700 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg transition flex items-center justify-center gap-2"
          >
            <KeyRound className="w-3.5 h-3.5 text-slate-500" /> Authenticate via SAML 2.0 / Okta
          </button>

          <div className="text-center pt-2">
            <p className="text-xs text-slate-500">
              Need to register your organization?{' '}
              <Link to="/register" className="font-bold text-primary-600 hover:underline">
                Create Account
              </Link>
            </p>
          </div>
        </div>

        {/* Enterprise Staging Sandbox Role Switcher */}
        {showSandboxDock && (
          <div className="mt-6 rounded-xl border border-obsidian-800 bg-obsidian-900 text-slate-200 p-4 shadow-xl">
            <div className="flex items-center justify-between pb-3 border-b border-obsidian-800">
              <div className="flex items-center gap-2">
                <span className="flex h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-300">
                  Staging Sandbox • Fast Role Impersonation
                </span>
              </div>
              <span className="text-[10px] text-slate-400 font-mono">v1.0.0-PROD</span>
            </div>

            <p className="text-[11px] text-slate-400 my-2.5 leading-relaxed">
              Select a pre-seeded enterprise role below for instant workspace evaluation:
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => handleQuickImpersonation('recruiter@techcorp.com', 'RecruiterPass123!')}
                className="p-2.5 rounded-lg border border-obsidian-750 bg-obsidian-850 hover:bg-obsidian-800 hover:border-primary-500/50 transition text-left group"
              >
                <div className="flex items-center justify-between text-xs font-bold text-white group-hover:text-primary-300">
                  <span className="flex items-center gap-1.5"><Building2 className="w-3 h-3 text-primary-400" /> Recruiter</span>
                  <ChevronRight className="w-3 h-3 text-slate-500 group-hover:translate-x-0.5 transition-transform" />
                </div>
                <div className="text-[10px] text-slate-400 truncate mt-0.5">TechCorp Global</div>
              </button>

              <button
                type="button"
                onClick={() => handleQuickImpersonation('jane.candidate@example.com', 'CandidatePass123!')}
                className="p-2.5 rounded-lg border border-obsidian-750 bg-obsidian-850 hover:bg-obsidian-800 hover:border-copper-500/50 transition text-left group"
              >
                <div className="flex items-center justify-between text-xs font-bold text-white group-hover:text-copper-300">
                  <span className="flex items-center gap-1.5"><User className="w-3 h-3 text-copper-400" /> Candidate</span>
                  <ChevronRight className="w-3 h-3 text-slate-500 group-hover:translate-x-0.5 transition-transform" />
                </div>
                <div className="text-[10px] text-slate-400 truncate mt-0.5">Jane Doe (100% profile)</div>
              </button>

              <button
                type="button"
                onClick={() => handleQuickImpersonation('admin@hireflow.dev', 'AdminPass123!')}
                className="p-2.5 rounded-lg border border-obsidian-750 bg-obsidian-850 hover:bg-obsidian-800 hover:border-emerald-500/50 transition text-left group"
              >
                <div className="flex items-center justify-between text-xs font-bold text-white group-hover:text-emerald-300">
                  <span className="flex items-center gap-1.5"><Shield className="w-3 h-3 text-emerald-400" /> Platform Admin</span>
                  <ChevronRight className="w-3 h-3 text-slate-500 group-hover:translate-x-0.5 transition-transform" />
                </div>
                <div className="text-[10px] text-slate-400 truncate mt-0.5">System Governance</div>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default LoginPage;
