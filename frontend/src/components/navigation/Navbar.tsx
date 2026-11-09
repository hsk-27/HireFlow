import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/app/providers/AuthContext';
import { notificationService } from '@/services/apiServices';
import { useQuery } from '@tanstack/react-query';
import {
  Briefcase,
  Bell,
  User as UserIcon,
  LogOut,
  Building2,
  Shield,
  Layers,
  ChevronDown,
  Sparkles,
} from 'lucide-react';
import { Badge } from '@/components/common/Badge';

export const Navbar: React.FC = () => {
  const { user, role, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);

  // Poll notifications unread count if authenticated
  const { data: unreadCount = 0 } = useQuery({
    queryKey: ['notifications', 'unreadCount'],
    queryFn: () => notificationService.getUnreadCount(),
    enabled: isAuthenticated,
    refetchInterval: 30000,
  });

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  const getDashboardPath = () => {
    if (role === 'ADMIN' || role === 'ROLE_ADMIN') return '/admin/dashboard';
    if (role === 'RECRUITER' || role === 'ROLE_RECRUITER') return '/recruiter/dashboard';
    return '/candidate/dashboard';
  };

  const isActive = (path: string) => location.pathname === path || location.pathname.startsWith(path + '/');

  return (
    <header className="sticky top-0 z-40 bg-obsidian-900 border-b border-obsidian-800/90 shadow-md backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          {/* Logo & Brand Identity */}
          <div className="flex items-center gap-8">
            <Link to="/" className="flex items-center gap-3 group">
              <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center text-white font-black text-lg shadow-sm border border-primary-400/20 group-hover:scale-105 transition-transform">
                HF
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="text-lg font-bold tracking-tight text-white">
                    HIRE<span className="text-primary-400">FLOW</span>
                  </span>
                  <span className="px-1.5 py-0.5 rounded text-[9px] font-bold tracking-wider uppercase bg-primary-950 text-primary-300 border border-primary-800/60">
                    ENTERPRISE
                  </span>
                </div>
              </div>
            </Link>

            {/* Main Navigation Links */}
            <nav className="hidden md:flex items-center gap-1">
              <Link
                to="/jobs"
                className={`px-3 py-1.5 text-xs font-semibold rounded-md transition ${
                  isActive('/jobs')
                    ? 'text-white bg-obsidian-800 border border-obsidian-700'
                    : 'text-slate-300 hover:text-white hover:bg-obsidian-850'
                }`}
              >
                Public Requisitions
              </Link>

              {isAuthenticated && (
                <>
                  <Link
                    to={getDashboardPath()}
                    className={`px-3 py-1.5 text-xs font-semibold rounded-md transition flex items-center gap-1.5 ${
                      isActive('/candidate/dashboard') || isActive('/recruiter/dashboard') || isActive('/admin/dashboard')
                        ? 'text-white bg-obsidian-800 border border-obsidian-700'
                        : 'text-slate-300 hover:text-white hover:bg-obsidian-850'
                    }`}
                  >
                    <Layers className="w-3.5 h-3.5 text-primary-400" />
                    Overview
                  </Link>

                  {(role === 'CANDIDATE' || role === 'ROLE_CANDIDATE') && (
                    <>
                      <Link
                        to="/candidate/applications"
                        className={`px-3 py-1.5 text-xs font-semibold rounded-md transition ${
                          isActive('/candidate/applications')
                            ? 'text-white bg-obsidian-800 border border-obsidian-700'
                            : 'text-slate-300 hover:text-white hover:bg-obsidian-850'
                        }`}
                      >
                        Applications
                      </Link>
                      <Link
                        to="/candidate/interviews"
                        className={`px-3 py-1.5 text-xs font-semibold rounded-md transition ${
                          isActive('/candidate/interviews')
                            ? 'text-white bg-obsidian-800 border border-obsidian-700'
                            : 'text-slate-300 hover:text-white hover:bg-obsidian-850'
                        }`}
                      >
                        Interviews
                      </Link>
                      <Link
                        to="/candidate/offers"
                        className={`px-3 py-1.5 text-xs font-semibold rounded-md transition ${
                          isActive('/candidate/offers')
                            ? 'text-white bg-obsidian-800 border border-obsidian-700'
                            : 'text-slate-300 hover:text-white hover:bg-obsidian-850'
                        }`}
                      >
                        Offers
                      </Link>
                    </>
                  )}

                  {(role === 'RECRUITER' || role === 'ROLE_RECRUITER') && (
                    <>
                      <Link
                        to="/recruiter/jobs"
                        className={`px-3 py-1.5 text-xs font-semibold rounded-md transition ${
                          isActive('/recruiter/jobs')
                            ? 'text-white bg-obsidian-800 border border-obsidian-700'
                            : 'text-slate-300 hover:text-white hover:bg-obsidian-850'
                        }`}
                      >
                        Requisitions
                      </Link>
                      <Link
                        to="/recruiter/applications"
                        className={`px-3 py-1.5 text-xs font-semibold rounded-md transition ${
                          isActive('/recruiter/applications')
                            ? 'text-white bg-obsidian-800 border border-obsidian-700'
                            : 'text-slate-300 hover:text-white hover:bg-obsidian-850'
                        }`}
                      >
                        Applicant Pipeline
                      </Link>
                      <Link
                        to="/recruiter/interviews"
                        className={`px-3 py-1.5 text-xs font-semibold rounded-md transition ${
                          isActive('/recruiter/interviews')
                            ? 'text-white bg-obsidian-800 border border-obsidian-700'
                            : 'text-slate-300 hover:text-white hover:bg-obsidian-850'
                        }`}
                      >
                        Interviews
                      </Link>
                      <Link
                        to="/recruiter/talent-pool"
                        className={`px-3 py-1.5 text-xs font-semibold rounded-md transition ${
                          isActive('/recruiter/talent-pool')
                            ? 'text-white bg-obsidian-800 border border-obsidian-700'
                            : 'text-slate-300 hover:text-white hover:bg-obsidian-850'
                        }`}
                      >
                        Talent Pool
                      </Link>
                      <Link
                        to="/recruiter/offers"
                        className={`px-3 py-1.5 text-xs font-semibold rounded-md transition ${
                          isActive('/recruiter/offers')
                            ? 'text-white bg-obsidian-800 border border-obsidian-700'
                            : 'text-slate-300 hover:text-white hover:bg-obsidian-850'
                        }`}
                      >
                        Offers
                      </Link>
                    </>
                  )}

                  {(role === 'ADMIN' || role === 'ROLE_ADMIN') && (
                    <>
                      <Link
                        to="/admin/companies"
                        className={`px-3 py-1.5 text-xs font-semibold rounded-md transition flex items-center gap-1.5 ${
                          isActive('/admin/companies')
                            ? 'text-white bg-obsidian-800 border border-obsidian-700'
                            : 'text-slate-300 hover:text-white hover:bg-obsidian-850'
                        }`}
                      >
                        <Building2 className="w-3.5 h-3.5 text-primary-400" />
                        Organizations
                      </Link>
                      <Link
                        to="/admin/audit-logs"
                        className={`px-3 py-1.5 text-xs font-semibold rounded-md transition flex items-center gap-1.5 ${
                          isActive('/admin/audit-logs')
                            ? 'text-white bg-obsidian-800 border border-obsidian-700'
                            : 'text-slate-300 hover:text-white hover:bg-obsidian-850'
                        }`}
                      >
                        <Shield className="w-3.5 h-3.5 text-primary-400" />
                        Security Audit
                      </Link>
                    </>
                  )}
                </>
              )}
            </nav>
          </div>

          {/* Right Section: Auth & Notifications */}
          <div className="flex items-center gap-3">
            {isAuthenticated ? (
              <>
                {/* Notifications Button */}
                <Link
                  to="/notifications"
                  className="relative p-2 text-slate-300 hover:text-white hover:bg-obsidian-800 rounded-lg transition"
                  title="System Notifications"
                >
                  <Bell className="w-4 h-4" />
                  {unreadCount > 0 && (
                    <span className="absolute top-1 right-1 flex h-4 min-w-[16px] px-1 items-center justify-center rounded-full bg-rose-500 text-[9px] font-bold text-white ring-2 ring-obsidian-900">
                      {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                  )}
                </Link>

                {/* User Menu */}
                <div className="relative">
                  <button
                    onClick={() => setMenuOpen(!menuOpen)}
                    className="flex items-center gap-2 pl-2 pr-3 py-1.5 rounded-lg border border-obsidian-700 bg-obsidian-850 hover:bg-obsidian-800 transition text-xs font-medium text-slate-200"
                  >
                    <div className="w-6 h-6 rounded bg-primary-900 text-primary-300 border border-primary-700/60 font-bold flex items-center justify-center text-[11px]">
                      {user?.firstName?.charAt(0) || 'U'}
                    </div>
                    <span className="hidden sm:inline max-w-[120px] truncate font-semibold">
                      {user?.firstName}
                    </span>
                    <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                  </button>

                  {/* Dropdown Menu */}
                  {menuOpen && (
                    <div
                      className="absolute right-0 mt-2 w-60 rounded-xl bg-obsidian-900 border border-obsidian-700 shadow-2xl py-1 z-50 divide-y divide-obsidian-800"
                      onMouseLeave={() => setMenuOpen(false)}
                    >
                      <div className="px-4 py-3">
                        <p className="text-xs font-bold text-white truncate">
                          {user?.firstName} {user?.lastName}
                        </p>
                        <p className="text-[11px] text-slate-400 truncate mt-0.5">{user?.email}</p>
                        <div className="mt-2.5 flex items-center gap-1.5">
                          <span className="inline-block w-2 h-2 rounded-full bg-emerald-400"></span>
                          <span className="text-[10px] font-bold tracking-wider uppercase text-slate-300">
                            {role?.replace('ROLE_', '')}
                          </span>
                        </div>
                      </div>

                      <div className="py-1">
                        {(role === 'CANDIDATE' || role === 'ROLE_CANDIDATE') && (
                          <Link
                            to="/candidate/profile"
                            className="block px-4 py-2 text-xs font-medium text-slate-200 hover:bg-obsidian-800 transition"
                            onClick={() => setMenuOpen(false)}
                          >
                            Profile & Resume Vault
                          </Link>
                        )}
                        {(role === 'RECRUITER' || role === 'ROLE_RECRUITER') && (
                          <Link
                            to="/recruiter/company"
                            className="block px-4 py-2 text-xs font-medium text-slate-200 hover:bg-obsidian-800 transition"
                            onClick={() => setMenuOpen(false)}
                          >
                            Organization Profile
                          </Link>
                        )}
                      </div>

                      <div className="py-1">
                        <button
                          onClick={handleLogout}
                          className="w-full text-left flex items-center gap-2 px-4 py-2 text-xs font-semibold text-rose-400 hover:bg-obsidian-800 transition"
                        >
                          <LogOut className="w-3.5 h-3.5" />
                          Sign Out of HireFlow
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  to="/login"
                  className="px-3.5 py-1.5 text-xs font-semibold text-slate-200 hover:text-white transition"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className="px-3.5 py-1.5 text-xs font-semibold text-white bg-primary-600 hover:bg-primary-500 rounded-md shadow-sm transition border border-primary-500/30"
                >
                  Create Account
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
