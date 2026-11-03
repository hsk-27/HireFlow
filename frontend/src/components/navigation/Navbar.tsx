import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
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
} from 'lucide-react';
import { Badge } from '@/components/common/Badge';

export const Navbar: React.FC = () => {
  const { user, role, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
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

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-slate-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          {/* Logo & Brand */}
          <div className="flex items-center gap-8">
            <Link to="/" className="flex items-center gap-2 group">
              <div className="w-10 h-10 rounded-xl bg-primary-600 flex items-center justify-center text-white font-black text-xl shadow-md group-hover:bg-primary-700 transition">
                H
              </div>
              <div>
                <span className="text-xl font-black tracking-tight text-slate-900 group-hover:text-primary-600 transition">
                  Hire<span className="text-primary-600">Flow</span>
                </span>
                <span className="block text-[10px] uppercase font-bold tracking-widest text-slate-400 -mt-1">
                  Enterprise ATS
                </span>
              </div>
            </Link>

            {/* Main Navigation Links */}
            <nav className="hidden md:flex items-center gap-1">
              <Link
                to="/jobs"
                className="px-3 py-2 text-sm font-medium text-slate-600 hover:text-primary-600 hover:bg-slate-50 rounded-lg transition"
              >
                Browse Jobs
              </Link>

              {isAuthenticated && (
                <>
                  <Link
                    to={getDashboardPath()}
                    className="px-3 py-2 text-sm font-medium text-slate-600 hover:text-primary-600 hover:bg-slate-50 rounded-lg transition flex items-center gap-1.5"
                  >
                    <Layers className="w-4 h-4" />
                    Dashboard
                  </Link>

                  {(role === 'CANDIDATE' || role === 'ROLE_CANDIDATE') && (
                    <>
                      <Link
                        to="/candidate/applications"
                        className="px-3 py-2 text-sm font-medium text-slate-600 hover:text-primary-600 hover:bg-slate-50 rounded-lg transition"
                      >
                        Applications
                      </Link>
                      <Link
                        to="/candidate/interviews"
                        className="px-3 py-2 text-sm font-medium text-slate-600 hover:text-primary-600 hover:bg-slate-50 rounded-lg transition"
                      >
                        Interviews
                      </Link>
                      <Link
                        to="/candidate/offers"
                        className="px-3 py-2 text-sm font-medium text-slate-600 hover:text-primary-600 hover:bg-slate-50 rounded-lg transition"
                      >
                        Offers
                      </Link>
                    </>
                  )}

                  {(role === 'RECRUITER' || role === 'ROLE_RECRUITER') && (
                    <>
                      <Link
                        to="/recruiter/jobs"
                        className="px-3 py-2 text-sm font-medium text-slate-600 hover:text-primary-600 hover:bg-slate-50 rounded-lg transition"
                      >
                        Job Requisitions
                      </Link>
                      <Link
                        to="/recruiter/applications"
                        className="px-3 py-2 text-sm font-medium text-slate-600 hover:text-primary-600 hover:bg-slate-50 rounded-lg transition"
                      >
                        Candidate Pipeline
                      </Link>
                      <Link
                        to="/recruiter/interviews"
                        className="px-3 py-2 text-sm font-medium text-slate-600 hover:text-primary-600 hover:bg-slate-50 rounded-lg transition"
                      >
                        Interviews
                      </Link>
                      <Link
                        to="/recruiter/talent-pool"
                        className="px-3 py-2 text-sm font-medium text-slate-600 hover:text-primary-600 hover:bg-slate-50 rounded-lg transition"
                      >
                        Talent Pool
                      </Link>
                    </>
                  )}

                  {(role === 'ADMIN' || role === 'ROLE_ADMIN') && (
                    <>
                      <Link
                        to="/admin/companies"
                        className="px-3 py-2 text-sm font-medium text-slate-600 hover:text-primary-600 hover:bg-slate-50 rounded-lg transition flex items-center gap-1.5"
                      >
                        <Building2 className="w-4 h-4" />
                        Companies
                      </Link>
                      <Link
                        to="/admin/audit-logs"
                        className="px-3 py-2 text-sm font-medium text-slate-600 hover:text-primary-600 hover:bg-slate-50 rounded-lg transition flex items-center gap-1.5"
                      >
                        <Shield className="w-4 h-4" />
                        Audit Logs
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
                  className="relative p-2 text-slate-600 hover:text-primary-600 hover:bg-slate-100 rounded-lg transition"
                  title="Notifications"
                >
                  <Bell className="w-5 h-5" />
                  {unreadCount > 0 && (
                    <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-rose-500 text-[10px] font-bold text-white ring-2 ring-white">
                      {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                  )}
                </Link>

                {/* User Menu */}
                <div className="relative">
                  <button
                    onClick={() => setMenuOpen(!menuOpen)}
                    className="flex items-center gap-2 pl-2 pr-3 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 transition text-sm font-medium text-slate-700"
                  >
                    <div className="w-7 h-7 rounded-full bg-primary-100 text-primary-700 font-bold flex items-center justify-center text-xs">
                      {user?.firstName?.charAt(0) || 'U'}
                    </div>
                    <span className="hidden sm:inline max-w-[120px] truncate">
                      {user?.firstName}
                    </span>
                    <ChevronDown className="w-4 h-4 text-slate-400" />
                  </button>

                  {/* Dropdown Menu */}
                  {menuOpen && (
                    <div
                      className="absolute right-0 mt-2 w-56 rounded-xl bg-white shadow-lg ring-1 ring-black ring-opacity-5 py-1 z-50 divide-y divide-slate-100"
                      onMouseLeave={() => setMenuOpen(false)}
                    >
                      <div className="px-4 py-3">
                        <p className="text-sm font-semibold text-slate-900 truncate">
                          {user?.firstName} {user?.lastName}
                        </p>
                        <p className="text-xs text-slate-500 truncate">{user?.email}</p>
                        <div className="mt-2">
                          <Badge variant="primary">{role?.replace('ROLE_', '')}</Badge>
                        </div>
                      </div>

                      <div className="py-1">
                        {(role === 'CANDIDATE' || role === 'ROLE_CANDIDATE') && (
                          <Link
                            to="/candidate/profile"
                            className="block px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50"
                            onClick={() => setMenuOpen(false)}
                          >
                            My Profile & Resume
                          </Link>
                        )}
                        {(role === 'RECRUITER' || role === 'ROLE_RECRUITER') && (
                          <Link
                            to="/recruiter/company"
                            className="block px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50"
                            onClick={() => setMenuOpen(false)}
                          >
                            Company Profile
                          </Link>
                        )}
                      </div>

                      <div className="py-1">
                        <button
                          onClick={handleLogout}
                          className="w-full text-left flex items-center gap-2 px-4 py-2 text-xs font-medium text-rose-600 hover:bg-rose-50"
                        >
                          <LogOut className="w-4 h-4" />
                          Sign Out
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
                  className="px-4 py-2 text-sm font-semibold text-slate-700 hover:text-primary-600 transition"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className="px-4 py-2 text-sm font-semibold text-white bg-primary-600 hover:bg-primary-700 rounded-lg shadow-sm transition"
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
