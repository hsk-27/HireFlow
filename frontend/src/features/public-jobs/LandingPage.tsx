import React from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { jobService } from '@/services/apiServices';
import {
  Briefcase,
  Building2,
  CheckCircle2,
  Search,
  ArrowRight,
  ShieldCheck,
  Users,
  Target,
  Sparkles,
  Zap,
  Lock,
  Layers,
  Award,
  CalendarCheck,
} from 'lucide-react';
import { StatusBadge } from '@/components/common/Badge';

export const LandingPage: React.FC = () => {
  const { data: pagedJobs, isLoading } = useQuery({
    queryKey: ['publicJobs', 'featured'],
    queryFn: () => jobService.searchPublicJobs({ size: 6 }),
  });

  const jobs = pagedJobs?.content || [];

  return (
    <div className="space-y-20 py-4">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-slate-900 via-obsidian-900 to-obsidian-950 text-white rounded-2xl border border-obsidian-800 shadow-2xl p-8 sm:p-14 lg:p-20">
        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-96 h-96 bg-primary-600/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-96 h-96 bg-copper-600/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="relative max-w-4xl mx-auto text-center space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary-950/80 border border-primary-700/60 text-primary-300 text-xs font-bold tracking-wider uppercase">
            <Sparkles className="w-3.5 h-3.5 text-primary-400" />
            Enterprise Recruitment & ATS Infrastructure
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight leading-[1.15]">
            Architected for High-Velocity <br className="hidden sm:inline" />
            <span className="bg-gradient-to-r from-primary-400 via-teal-300 to-copper-400 bg-clip-text text-transparent">
              Enterprise Talent Acquisition
            </span>
          </h1>

          <p className="text-base sm:text-lg text-slate-300 max-w-2xl mx-auto leading-relaxed">
            HireFlow unifies candidate sourcing, automated eligibility screening, multi-round interview calibrations, and formal offer management in a single high-performance platform.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <Link
              to="/jobs"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-lg bg-primary-600 hover:bg-primary-500 text-white font-bold text-sm shadow-lg shadow-primary-900/40 transition border border-primary-400/30"
            >
              <Search className="w-4 h-4" /> Explore Open Requisitions
            </Link>
            <Link
              to="/register"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-lg bg-obsidian-850 hover:bg-obsidian-800 border border-obsidian-700 text-slate-200 font-bold text-sm transition"
            >
              Employer Registration <ArrowRight className="w-4 h-4 text-primary-400" />
            </Link>
          </div>

          {/* Institutional Metric Indicators */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 pt-12 border-t border-obsidian-800 max-w-3xl mx-auto text-center">
            <div className="p-3 rounded-xl bg-obsidian-850/50 border border-obsidian-800">
              <p className="text-2xl font-extrabold text-white font-mono">99.98%</p>
              <p className="text-[11px] text-slate-400 font-semibold tracking-wide uppercase mt-0.5">Platform SLA</p>
            </div>
            <div className="p-3 rounded-xl bg-obsidian-850/50 border border-obsidian-800">
              <p className="text-2xl font-extrabold text-primary-400 font-mono">4.8x</p>
              <p className="text-[11px] text-slate-400 font-semibold tracking-wide uppercase mt-0.5">Cycle Velocity</p>
            </div>
            <div className="p-3 rounded-xl bg-obsidian-850/50 border border-obsidian-800">
              <p className="text-2xl font-extrabold text-emerald-400 font-mono">100%</p>
              <p className="text-[11px] text-slate-400 font-semibold tracking-wide uppercase mt-0.5">Tenant Isolation</p>
            </div>
            <div className="p-3 rounded-xl bg-obsidian-850/50 border border-obsidian-800">
              <p className="text-2xl font-extrabold text-copper-400 font-mono">50,000+</p>
              <p className="text-[11px] text-slate-400 font-semibold tracking-wide uppercase mt-0.5">Screened Leads</p>
            </div>
          </div>
        </div>
      </section>

      {/* Corporate Trust Banner */}
      <section className="border-y border-slate-200/80 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-4">
          <p className="text-xs font-bold uppercase tracking-widest text-slate-600">
            Deployed by Technical Hiring Teams & Enterprise Organizations
          </p>
          <div className="flex flex-wrap items-center justify-center gap-8 sm:gap-14 text-slate-700 font-bold text-sm tracking-wider">
            <span className="flex items-center gap-1.5 hover:text-slate-900 transition"><Building2 className="w-4 h-4 text-primary-700" /> TECHCORP GLOBAL</span>
            <span className="flex items-center gap-1.5 hover:text-slate-900 transition"><Zap className="w-4 h-4 text-primary-700" /> INNOSOFT LABS</span>
            <span className="flex items-center gap-1.5 hover:text-slate-900 transition"><Layers className="w-4 h-4 text-primary-700" /> CLOUDSCALE INC</span>
            <span className="flex items-center gap-1.5 hover:text-slate-900 transition"><Target className="w-4 h-4 text-primary-700" /> VELOCE SYSTEMS</span>
            <span className="flex items-center gap-1.5 hover:text-slate-900 transition"><ShieldCheck className="w-4 h-4 text-primary-700" /> AXIOM BIO</span>
          </div>
        </div>
      </section>

      {/* Featured Requisitions Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-2 pb-2 border-b border-slate-200">
          <div>
            <h2 className="text-xl font-extrabold text-slate-900 tracking-tight sm:text-2xl">
              Published Corporate Openings
            </h2>
            <p className="text-xs text-slate-600 mt-1">
              Active engineering, architecture, and product positions published by verified employers.
            </p>
          </div>
          <Link
            to="/jobs"
            className="text-xs font-bold text-primary-700 hover:text-primary-800 flex items-center gap-1"
          >
            View all open requisitions <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {[1, 2, 3].map((n) => (
              <div key={n} className="h-44 bg-slate-200/60 rounded-xl animate-pulse"></div>
            ))}
          </div>
        ) : jobs.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-xl border border-slate-200 shadow-sm">
            <Briefcase className="w-10 h-10 text-slate-400 mx-auto mb-2" />
            <p className="text-slate-700 font-semibold text-sm">No published requisitions currently open.</p>
            <p className="text-xs text-slate-500 mt-1">Sign in as an approved employer to publish a new job opening.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {jobs.map((job) => (
              <Link
                key={job.id}
                to={`/jobs/${job.id}`}
                className="group bg-white p-5 rounded-xl border border-slate-200/90 shadow-sm hover:shadow-md hover:border-primary-600/40 transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-slate-500 flex items-center gap-1.5">
                      <Building2 className="w-3.5 h-3.5 text-primary-700" />
                      {job.companyName}
                    </span>
                    <StatusBadge status={job.workplaceType} />
                  </div>
                  <h3 className="font-bold text-base text-slate-900 group-hover:text-primary-700 transition line-clamp-1 mb-1.5">
                    {job.title}
                  </h3>
                  <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed mb-4">
                    {job.description}
                  </p>
                </div>
                <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                  <span className="font-medium">{job.location}</span>
                  {job.salaryMin && job.salaryMax ? (
                    <span className="font-mono font-bold text-slate-800">
                      ${job.salaryMin.toLocaleString()} - ${job.salaryMax.toLocaleString()}
                    </span>
                  ) : (
                    <span className="text-slate-400">Competitive Package</span>
                  )}
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>

      {/* Institutional Architecture Highlights */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <p className="text-xs font-bold uppercase tracking-wider text-primary-700 mb-1">
            Core Enterprise Capabilities
          </p>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
            Engineered for High-Stakes Technical Hiring
          </h2>
          <p className="text-sm text-slate-600 mt-2">
            Every layer of the recruitment workflow is enforced by deterministic backend business logic and cryptographic data isolation.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-7 rounded-xl border border-slate-200/90 shadow-sm hover:border-slate-300 transition">
            <div className="w-10 h-10 bg-primary-50 text-primary-700 rounded-lg flex items-center justify-center mb-5 border border-primary-200/50">
              <Target className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-slate-900 mb-2">Automated Eligibility Engine</h3>
            <p className="text-xs text-slate-600 leading-relaxed mb-4">
              Real-time evaluation against academic thresholds, backlogs, accredited degrees, and branches. Flags applicants with deterministic status badges.
            </p>
            <div className="flex items-center gap-2 text-xs font-bold text-primary-700">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Zero False-Positive Screening
            </div>
          </div>

          <div className="bg-white p-7 rounded-xl border border-slate-200/90 shadow-sm hover:border-slate-300 transition">
            <div className="w-10 h-10 bg-copper-50 text-copper-700 rounded-lg flex items-center justify-center mb-5 border border-copper-200/50">
              <CalendarCheck className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-slate-900 mb-2">5-Point Calibrated Scorecards</h3>
            <p className="text-xs text-slate-600 leading-relaxed mb-4">
              Conflict-free round scheduling with meeting integrations. Quantitative scorecards across technical, problem-solving, and communication proficiencies.
            </p>
            <div className="flex items-center gap-2 text-xs font-bold text-copper-700">
              <Award className="w-3.5 h-3.5" /> Structured Interview Intelligence
            </div>
          </div>

          <div className="bg-white p-7 rounded-xl border border-slate-200/90 shadow-sm hover:border-slate-300 transition">
            <div className="w-10 h-10 bg-emerald-50 text-emerald-700 rounded-lg flex items-center justify-center mb-5 border border-emerald-200/50">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-slate-900 mb-2">Multi-Tenant Governance</h3>
            <p className="text-xs text-slate-600 leading-relaxed mb-4">
              Mandatory administrator verification before company job publication. Strict tenant isolation, SHA-256 document integrity, and immutable audit logs.
            </p>
            <div className="flex items-center gap-2 text-xs font-bold text-emerald-700">
              <Lock className="w-3.5 h-3.5" /> Enterprise RBAC Controls
            </div>
          </div>
        </div>
      </section>

      {/* Bottom Conversion Banner */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gradient-to-r from-obsidian-900 to-slate-900 text-white rounded-2xl p-8 sm:p-12 border border-obsidian-800 flex flex-col md:flex-row items-center justify-between gap-6 shadow-xl">
          <div className="space-y-2 text-center md:text-left">
            <h3 className="text-2xl font-bold tracking-tight">Deploy HireFlow for Your Enterprise</h3>
            <p className="text-sm text-slate-400 max-w-xl">
              Equip your recruiters and engineering hiring managers with structured evaluation workflows and real-time pipeline clarity.
            </p>
          </div>
          <div className="flex gap-3">
            <Link
              to="/register"
              className="px-5 py-2.5 rounded-lg bg-primary-600 hover:bg-primary-500 text-white font-bold text-xs tracking-wide transition shadow"
            >
              Get Started
            </Link>
            <Link
              to="/login"
              className="px-5 py-2.5 rounded-lg bg-obsidian-800 hover:bg-obsidian-750 text-slate-200 font-bold text-xs tracking-wide border border-obsidian-700 transition"
            >
              Console Sign-In
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default LandingPage;
