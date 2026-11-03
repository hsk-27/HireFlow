import React from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { jobService } from '@/services/apiServices';
import { Briefcase, Building2, CheckCircle2, Search, ArrowRight, ShieldCheck, Users } from 'lucide-react';
import { StatusBadge } from '@/components/common/Badge';

export const LandingPage: React.FC = () => {
  const { data: pagedJobs, isLoading } = useQuery({
    queryKey: ['publicJobs', 'featured'],
    queryFn: () => jobService.searchPublicJobs({ size: 6 }),
  });

  const jobs = pagedJobs?.content || [];

  return (
    <div className="space-y-16 py-8">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-primary-50/50 via-white to-slate-50 border-b border-slate-200/80 -mt-8 py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary-100 text-primary-800 text-xs font-semibold tracking-wide uppercase">
            Enterprise Recruitment Platform
          </div>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-slate-900 tracking-tight leading-tight">
            Streamline your recruitment pipeline from <span className="text-primary-600">lead to hire</span>
          </h1>
          <p className="text-lg sm:text-xl text-slate-600 max-w-2xl mx-auto leading-relaxed">
            HireFlow gives candidates transparent tracking and empowers hiring teams with multi-stage applicant pipelines, automated eligibility screening, conflict-free interview scheduling, and offer management.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <Link
              to="/jobs"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-lg bg-primary-600 text-white font-semibold shadow hover:bg-primary-700 transition"
            >
              <Search className="w-4 h-4" /> Browse Openings
            </Link>
            <Link
              to="/auth/register"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-lg bg-white border border-slate-300 text-slate-700 font-semibold shadow-sm hover:bg-slate-50 transition"
            >
              Post a Job as Recruiter <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 pt-12 border-t border-slate-200/80 max-w-3xl mx-auto text-center">
            <div>
              <p className="text-2xl font-bold text-slate-900">Zero</p>
              <p className="text-xs text-slate-500 font-medium">Mock Data</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-900">100%</p>
              <p className="text-xs text-slate-500 font-medium">Backend Invariants</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-900">Isolated</p>
              <p className="text-xs text-slate-500 font-medium">Tenant Data</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-900">JWT + Cookie</p>
              <p className="text-xs text-slate-500 font-medium">Secure Auth</p>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Jobs Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <div className="flex justify-between items-end">
          <div>
            <h2 className="text-2xl font-bold text-slate-900">Featured Job Openings</h2>
            <p className="text-sm text-slate-500">Explore published opportunities from approved enterprise companies</p>
          </div>
          <Link to="/jobs" className="text-sm font-semibold text-primary-600 hover:text-primary-700 flex items-center gap-1">
            View all jobs <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((n) => (
              <div key={n} className="h-48 bg-slate-200 rounded-xl animate-pulse"></div>
            ))}
          </div>
        ) : jobs.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-xl border border-slate-200">
            <Briefcase className="w-12 h-12 text-slate-400 mx-auto mb-3" />
            <p className="text-slate-600 font-medium">No published jobs currently available.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {jobs.map((job) => (
              <Link
                key={job.id}
                to={`/jobs/${job.id}`}
                className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm hover:shadow-md hover:border-primary-300 transition flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-semibold text-slate-500 flex items-center gap-1">
                      <Building2 className="w-3.5 h-3.5 text-slate-400" /> {job.companyName}
                    </span>
                    <StatusBadge status={job.workplaceType} />
                  </div>
                  <h3 className="font-bold text-lg text-slate-900 line-clamp-1 mb-2">{job.title}</h3>
                  <p className="text-sm text-slate-600 line-clamp-2 mb-4">{job.description}</p>
                </div>
                <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                  <span>{job.location}</span>
                  {job.salaryMin && job.salaryMax && (
                    <span className="font-semibold text-slate-700">
                      ${job.salaryMin.toLocaleString()} - ${job.salaryMax.toLocaleString()} {job.salaryCurrency}
                    </span>
                  )}
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>

      {/* Role Feature Highlights */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-white p-8 rounded-xl border border-slate-200 shadow-sm">
            <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-lg flex items-center justify-center mb-6">
              <Users className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-2">Candidate Experience</h3>
            <p className="text-sm text-slate-600 leading-relaxed mb-4">
              Transparent tracking with real-time status updates, education & skill profiles, resume management, interview invitations, and digital offer response.
            </p>
            <Link to="/auth/register" className="text-sm font-semibold text-primary-600 hover:underline">
              Create Candidate Account &rarr;
            </Link>
          </div>

          <div className="bg-white p-8 rounded-xl border border-slate-200 shadow-sm">
            <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-lg flex items-center justify-center mb-6">
              <Briefcase className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-2">Recruiter Power Tools</h3>
            <p className="text-sm text-slate-600 leading-relaxed mb-4">
              Automated multi-rule eligibility evaluation, visual pipeline state transitions, conflict-free scheduling, feedback scorecards, and talent pool lead management.
            </p>
            <Link to="/auth/register" className="text-sm font-semibold text-primary-600 hover:underline">
              Register as Recruiter &rarr;
            </Link>
          </div>

          <div className="bg-white p-8 rounded-xl border border-slate-200 shadow-sm">
            <div className="w-12 h-12 bg-purple-50 text-purple-600 rounded-lg flex items-center justify-center mb-6">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-2">Platform Governance</h3>
            <p className="text-sm text-slate-600 leading-relaxed mb-4">
              Mandatory administrator company approval before job publishing, strict tenant isolation, immutable audit history, and platform metrics.
            </p>
            <Link to="/auth/login" className="text-sm font-semibold text-primary-600 hover:underline">
              Admin Portal &rarr;
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default LandingPage;

