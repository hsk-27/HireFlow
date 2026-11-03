import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { candidateService, applicationService, interviewService, offerService } from '@/services/apiServices';
import { useAuth } from '@/app/providers/AuthContext';
import {
  Briefcase,
  Calendar,
  CheckCircle,
  Clock,
  FileText,
  Award,
  ArrowRight,
  AlertCircle,
} from 'lucide-react';
import { StatusBadge } from '@/components/common/Badge';

export const CandidateDashboard: React.FC = () => {
  const { user } = useAuth();

  const { data: profile } = useQuery({
    queryKey: ['candidateProfile'],
    queryFn: () => candidateService.getProfile(),
  });

  const { data: applicationsData } = useQuery({
    queryKey: ['candidateApplications'],
    queryFn: () => applicationService.getCandidateApplications(0, 5),
  });

  const { data: interviewsData } = useQuery({
    queryKey: ['candidateInterviews'],
    queryFn: () => interviewService.getCandidateInterviews(0, 5),
  });

  const { data: offersData } = useQuery({
    queryKey: ['candidateOffers'],
    queryFn: () => offerService.getCandidateOffers(0, 5),
  });

  const applications = applicationsData?.content || [];
  const interviews = interviewsData?.content || [];
  const offers = offersData?.content || [];

  const completion = profile?.profileCompletionPercentage || 0;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Welcome Banner */}
      <div className="bg-white p-6 sm:p-8 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            Welcome back, {user?.firstName || 'Candidate'}!
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Track your submitted applications, upcoming interview schedules, and job offers.
          </p>
        </div>

        {/* Profile Completion Meter */}
        <div className="w-full md:w-64 bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2">
          <div className="flex justify-between items-center text-xs font-semibold">
            <span className="text-slate-700">Profile Completion</span>
            <span className={completion === 100 ? 'text-emerald-600' : 'text-primary-600'}>
              {completion}%
            </span>
          </div>
          <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
            <div
              className={`h-2 rounded-full transition-all duration-500 ${
                completion === 100 ? 'bg-emerald-500' : 'bg-primary-600'
              }`}
              style={{ width: `${completion}%` }}
            ></div>
          </div>
          {completion < 100 && (
            <Link to="/candidate/profile" className="text-[11px] text-primary-600 hover:underline block font-medium">
              Complete your profile &rarr;
            </Link>
          )}
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Total Applications</p>
            <p className="text-2xl font-bold text-slate-900 mt-1">{applicationsData?.totalElements || 0}</p>
          </div>
          <div className="w-10 h-10 bg-primary-50 text-primary-600 rounded-lg flex items-center justify-center">
            <Briefcase className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Upcoming Interviews</p>
            <p className="text-2xl font-bold text-slate-900 mt-1">
              {interviews.filter((i) => i.interviewStatus === 'SCHEDULED' || i.interviewStatus === 'RESCHEDULED').length}
            </p>
          </div>
          <div className="w-10 h-10 bg-sky-50 text-sky-600 rounded-lg flex items-center justify-center">
            <Calendar className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Active Offers</p>
            <p className="text-2xl font-bold text-slate-900 mt-1">
              {offers.filter((o) => o.offerStatus === 'SENT').length}
            </p>
          </div>
          <div className="w-10 h-10 bg-emerald-50 text-emerald-600 rounded-lg flex items-center justify-center">
            <Award className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Current Resume</p>
            <p className="text-xs font-semibold text-slate-800 mt-1 truncate max-w-[140px]">
              {profile?.currentResumeName || 'No resume'}
            </p>
          </div>
          <div className="w-10 h-10 bg-slate-100 text-slate-600 rounded-lg flex items-center justify-center">
            <FileText className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Recent Applications & Interviews */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Applications List */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-slate-100 flex items-center justify-between">
            <h2 className="font-bold text-slate-900">Recent Applications</h2>
            <Link to="/candidate/applications" className="text-xs font-semibold text-primary-600 hover:underline">
              View all
            </Link>
          </div>

          {applications.length === 0 ? (
            <div className="p-8 text-center text-sm text-slate-500 space-y-2">
              <p>You haven't applied to any positions yet.</p>
              <Link to="/jobs" className="text-xs font-semibold text-primary-600 hover:underline">
                Find published openings &rarr;
              </Link>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {applications.map((app) => (
                <div key={app.id} className="p-5 flex items-center justify-between hover:bg-slate-50 transition">
                  <div className="space-y-1">
                    <p className="font-bold text-sm text-slate-900">{app.jobTitle}</p>
                    <p className="text-xs text-slate-500">{app.companyName}</p>
                    <p className="text-[11px] text-slate-400">
                      Applied on {new Date(app.submittedAt || app.appliedAt || Date.now()).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <StatusBadge status={app.applicationStatus} />
                    <Link
                      to="/candidate/applications"
                      className="p-1 text-slate-400 hover:text-slate-600 rounded"
                    >
                      <ArrowRight className="w-4 h-4" />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Upcoming Interviews & Active Offers */}
        <div className="space-y-6">
          {/* Active Offers Alert Card */}
          {offers.filter((o) => o.offerStatus === 'SENT').length > 0 && (
            <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-5 space-y-3">
              <div className="flex items-center gap-2 text-emerald-800 font-bold text-sm">
                <Award className="w-5 h-5 text-emerald-600" /> Action Required: Offer Extended!
              </div>
              <p className="text-xs text-emerald-700">
                You have received an employment offer. Review compensation and joining terms.
              </p>
              <Link
                to="/candidate/offers"
                className="inline-block px-3 py-1.5 bg-emerald-600 text-white rounded-lg text-xs font-semibold hover:bg-emerald-700 transition"
              >
                View Offer Details
              </Link>
            </div>
          )}

          {/* Upcoming Interviews */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 space-y-4">
            <h3 className="font-bold text-slate-900 text-sm">Upcoming Interviews</h3>
            {interviews.length === 0 ? (
              <p className="text-xs text-slate-500 py-4 text-center">No interviews scheduled yet.</p>
            ) : (
              <div className="space-y-3">
                {interviews.slice(0, 3).map((int) => (
                  <div key={int.id} className="p-3 bg-slate-50 rounded-lg border border-slate-100 space-y-1">
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-bold text-slate-800">{int.interviewType} Interview</span>
                      <StatusBadge status={int.interviewStatus} />
                    </div>
                    <p className="text-xs text-slate-600 truncate">{int.jobTitle}</p>
                    <p className="text-[11px] text-slate-400">
                      {new Date(int.scheduledStart || int.scheduledStartTime || Date.now()).toLocaleString()}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CandidateDashboard;

