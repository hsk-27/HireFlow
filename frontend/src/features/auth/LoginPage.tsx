import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/app/providers/AuthContext';
import { Button } from '@/components/common/Button';
import { LogIn, AlertCircle } from 'lucide-react';

export const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

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
      setError(err.response?.data?.message || 'Invalid email or password');
    } finally {
      setIsLoading(false);
    }
  };

  const fillDemoAccount = (demoEmail: string, demoPass: string) => {
    setEmail(demoEmail);
    setPassword(demoPass);
    setError('');
  };

  return (
    <div className="min-h-[80vh] flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center space-y-2">
        <div className="w-12 h-12 bg-primary-600 rounded-xl mx-auto flex items-center justify-center text-white font-bold text-xl shadow-md">
          HF
        </div>
        <h2 className="text-2xl font-bold tracking-tight text-slate-900">Sign in to HireFlow</h2>
        <p className="text-sm text-slate-500">
          Or{' '}
          <Link to="/auth/register" className="font-semibold text-primary-600 hover:underline">
            create a new candidate or company account
          </Link>
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow-sm border border-slate-200 sm:rounded-xl sm:px-10 space-y-6">
          {error && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg flex items-center gap-2 text-rose-700 text-xs font-medium">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Email address</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Password</label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>

            <Button type="submit" className="w-full" isLoading={isLoading}>
              <LogIn className="w-4 h-4 mr-1.5" /> Sign in
            </Button>
          </form>

          {/* Quick Demo Credentials */}
          <div className="pt-6 border-t border-slate-100">
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 text-center">
              One-Click Demo Accounts
            </p>
            <div className="grid grid-cols-1 gap-2">
              <button
                type="button"
                onClick={() => fillDemoAccount('jane.candidate@example.com', 'CandidatePass123!')}
                className="text-left p-2.5 rounded-lg border border-slate-200 hover:bg-slate-50 transition text-xs"
              >
                <div className="font-semibold text-slate-800">Candidate (Jane Doe)</div>
                <div className="text-slate-500 text-[11px]">jane.candidate@example.com</div>
              </button>

              <button
                type="button"
                onClick={() => fillDemoAccount('recruiter@techcorp.com', 'RecruiterPass123!')}
                className="text-left p-2.5 rounded-lg border border-slate-200 hover:bg-slate-50 transition text-xs"
              >
                <div className="font-semibold text-slate-800">Recruiter (TechCorp - Approved)</div>
                <div className="text-slate-500 text-[11px]">recruiter@techcorp.com</div>
              </button>

              <button
                type="button"
                onClick={() => fillDemoAccount('admin@hireflow.dev', 'AdminPass123!')}
                className="text-left p-2.5 rounded-lg border border-slate-200 hover:bg-slate-50 transition text-xs"
              >
                <div className="font-semibold text-slate-800">Platform Administrator</div>
                <div className="text-slate-500 text-[11px]">admin@hireflow.dev</div>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;

