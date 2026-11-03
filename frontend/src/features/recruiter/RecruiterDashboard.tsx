import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { recruiterApi } from '../../services/apiServices';
import { Interview, Offer } from '../../types';
import { Briefcase, Users, Calendar, Award, ArrowUpRight, TrendingUp, CheckCircle, Clock } from 'lucide-react';
import StatusBadge from '../../components/common/StatusBadge';

export default function RecruiterDashboard() {
  const { data: jobsData, isLoading: jobsLoading } = useQuery({
    queryKey: ['recruiter-jobs'],
    queryFn: async () => {
      const res = await recruiterApi.getCompanyJobs({ page: 0, size: 50 });
      return res.data.data;
    },
  });

  const { data: appsData, isLoading: appsLoading } = useQuery({
    queryKey: ['recruiter-applications'],
    queryFn: async () => {
      const res = await recruiterApi.getApplications({ page: 0, size: 100 });
      return res.data.data;
    },
  });

  const { data: interviewsData } = useQuery({
    queryKey: ['recruiter-interviews'],
    queryFn: async () => {
      const res = await recruiterApi.getCompanyInterviews();
      return res.data.data;
    },
  });

  const { data: offersData } = useQuery({
    queryKey: ['recruiter-offers'],
    queryFn: async () => {
      const res = await recruiterApi.getCompanyOffers();
      return res.data.data;
    },
  });

  const jobs = jobsData?.content || [];
  const applications = appsData?.content || [];
  const interviews: Interview[] = Array.isArray(interviewsData) ? interviewsData : (interviewsData as any)?.content || [];
  const offers: Offer[] = Array.isArray(offersData) ? offersData : (offersData as any)?.content || [];

  const activeJobsCount = jobs.filter((j) => j.status === 'PUBLISHED').length;
  const pendingInterviews = interviews.filter((i) => i.status === 'SCHEDULED').length;
  const pendingOffers = offers.filter((o) => o.status === 'ISSUED').length;

  // Pipeline distribution counts
  const stageCounts = {
    SUBMITTED: applications.filter((a) => a.status === 'SUBMITTED').length,
    UNDER_REVIEW: applications.filter((a) => a.status === 'UNDER_REVIEW').length,
    SHORTLISTED: applications.filter((a) => a.status === 'SHORTLISTED').length,
    INTERVIEW: applications.filter((a) => a.status === 'INTERVIEW').length,
    OFFERED: applications.filter((a) => a.status === 'OFFERED').length,
    HIRED: applications.filter((a) => a.status === 'HIRED').length,
    REJECTED: applications.filter((a) => a.status === 'REJECTED').length,
  };

  const statCards = [
    {
      label: 'Active Published Jobs',
      value: activeJobsCount,
      icon: Briefcase,
      color: 'text-primary-600 bg-primary-50',
      link: '/recruiter/jobs',
    },
    {
      label: 'Total Applications',
      value: applications.length,
      icon: Users,
      color: 'text-blue-600 bg-blue-50',
      link: '/recruiter/applications',
    },
    {
      label: 'Upcoming Interviews',
      value: pendingInterviews,
      icon: Calendar,
      color: 'text-purple-600 bg-purple-50',
      link: '/recruiter/interviews',
    },
    {
      label: 'Outstanding Offers',
      value: pendingOffers,
      icon: Award,
      color: 'text-emerald-600 bg-emerald-50',
      link: '/recruiter/offers',
    },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl">
          Recruitment Operations Dashboard
        </h1>
        <p className="mt-1 text-sm text-gray-500">
          Monitor your recruitment pipeline, applicant throughput, and upcoming hiring milestones.
        </p>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {statCards.map((stat) => {
          const Icon = stat.icon;
          return (
            <Link
              key={stat.label}
              to={stat.link}
              className="relative overflow-hidden rounded-xl border border-gray-200 bg-white p-5 shadow-sm hover:border-primary-300 transition hover:shadow-md"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">
                    {stat.label}
                  </p>
                  <p className="mt-2 text-3xl font-extrabold text-gray-900">{stat.value}</p>
                </div>
                <div className={`rounded-xl p-3 ${stat.color}`}>
                  <Icon className="h-6 w-6" />
                </div>
              </div>
              <div className="mt-4 flex items-center text-xs font-medium text-primary-600 hover:text-primary-700">
                <span>View details</span>
                <ArrowUpRight className="ml-1 h-3.5 w-3.5" />
              </div>
            </Link>
          );
        })}
      </div>

      {/* Recruitment Funnel Progress */}
      <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
        <div className="flex items-center justify-between border-b border-gray-100 pb-4">
          <div className="flex items-center space-x-2">
            <TrendingUp className="h-5 w-5 text-primary-600" />
            <h2 className="text-lg font-bold text-gray-900">Application Pipeline Funnel</h2>
          </div>
          <Link
            to="/recruiter/applications"
            className="text-xs font-semibold text-primary-600 hover:text-primary-700"
          >
            Manage Applicants &rarr;
          </Link>
        </div>

        <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-4 lg:grid-cols-7">
          {[
            { label: 'Submitted', count: stageCounts.SUBMITTED, color: 'bg-blue-500' },
            { label: 'Reviewing', count: stageCounts.UNDER_REVIEW, color: 'bg-yellow-500' },
            { label: 'Shortlisted', count: stageCounts.SHORTLISTED, color: 'bg-indigo-500' },
            { label: 'Interview', count: stageCounts.INTERVIEW, color: 'bg-purple-500' },
            { label: 'Offered', count: stageCounts.OFFERED, color: 'bg-amber-500' },
            { label: 'Hired', count: stageCounts.HIRED, color: 'bg-emerald-500' },
            { label: 'Rejected', count: stageCounts.REJECTED, color: 'bg-rose-500' },
          ].map((stage) => {
            const pct =
              applications.length > 0 ? Math.round((stage.count / applications.length) * 100) : 0;
            return (
              <div
                key={stage.label}
                className="rounded-lg border border-gray-100 bg-gray-50/50 p-4 text-center transition hover:bg-gray-50"
              >
                <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                  {stage.label}
                </div>
                <div className="mt-2 text-2xl font-black text-gray-900">{stage.count}</div>
                <div className="mt-2 flex items-center justify-center space-x-1.5">
                  <span className={`inline-block h-2 w-2 rounded-full ${stage.color}`} />
                  <span className="text-xs text-gray-500">{pct}%</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
        {/* Recent Applications */}
        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between border-b border-gray-100 pb-4">
            <h3 className="text-base font-bold text-gray-900">Recent Applications</h3>
            <Link
              to="/recruiter/applications"
              className="text-xs font-semibold text-primary-600 hover:text-primary-700"
            >
              View all
            </Link>
          </div>
          <div className="mt-4 divide-y divide-gray-100">
            {appsLoading ? (
              <div className="py-6 text-center text-sm text-gray-500">Loading applicants...</div>
            ) : applications.length === 0 ? (
              <div className="py-6 text-center text-sm text-gray-500">No applications received yet.</div>
            ) : (
              applications.slice(0, 5).map((app) => (
                <div key={app.id} className="py-3 flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold text-gray-900">
                      {app.candidateName || 'Candidate'}
                    </p>
                    <p className="text-xs text-gray-500">{app.jobTitle}</p>
                  </div>
                  <div className="flex items-center space-x-3">
                    <StatusBadge status={app.status} />
                    <span className="text-xs text-gray-400">
                      {new Date(app.appliedAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Upcoming Interviews */}
        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between border-b border-gray-100 pb-4">
            <h3 className="text-base font-bold text-gray-900">Upcoming Interviews</h3>
            <Link
              to="/recruiter/interviews"
              className="text-xs font-semibold text-primary-600 hover:text-primary-700"
            >
              View calendar
            </Link>
          </div>
          <div className="mt-4 divide-y divide-gray-100">
            {interviews.length === 0 ? (
              <div className="py-6 text-center text-sm text-gray-500">
                No upcoming interviews scheduled.
              </div>
            ) : (
              interviews
                .filter((i) => i.status === 'SCHEDULED')
                .slice(0, 5)
                .map((interview) => (
                  <div key={interview.id} className="py-3 flex items-center justify-between">
                    <div>
                      <p className="text-sm font-semibold text-gray-900">
                        {interview.candidateName} — {interview.jobTitle}
                      </p>
                      <div className="flex items-center space-x-2 text-xs text-gray-500 mt-0.5">
                        <Clock className="h-3.5 w-3.5" />
                        <span>{new Date(interview.scheduledStartTime).toLocaleString()}</span>
                        <span>•</span>
                        <span>Round {interview.roundNumber} ({interview.interviewType})</span>
                      </div>
                    </div>
                    <Link
                      to="/recruiter/interviews"
                      className="rounded-md border border-gray-200 px-2.5 py-1 text-xs font-medium text-gray-700 hover:bg-gray-50"
                    >
                      Manage
                    </Link>
                  </div>
                ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
