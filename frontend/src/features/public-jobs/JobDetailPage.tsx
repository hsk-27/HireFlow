import React, { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { jobService, applicationService, candidateService } from '@/services/apiServices';
import { useAuth } from '@/app/providers/AuthContext';
import {
  Building2,
  MapPin,
  Briefcase,
  Calendar,
  DollarSign,
  GraduationCap,
  CheckCircle,
  FileText,
  AlertCircle,
  ArrowLeft,
} from 'lucide-react';
import { StatusBadge } from '@/components/common/Badge';
import { Button } from '@/components/common/Button';
import { Modal } from '@/components/common/Modal';

export const JobDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { user, role, isAuthenticated } = useAuth();

  const [applyModalOpen, setApplyModalOpen] = useState(false);
  const [coverLetter, setCoverLetter] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // 1. Fetch Job Details
  const { data: job, isLoading, isError } = useQuery({
    queryKey: ['publicJob', id],
    queryFn: () => jobService.getPublicJobById(id!),
    enabled: !!id,
  });

  // 2. If Candidate, check resume & existing applications
  const { data: profile } = useQuery({
    queryKey: ['candidateProfile'],
    queryFn: () => candidateService.getProfile(),
    enabled: isAuthenticated && role === 'CANDIDATE',
  });

  const { data: candidateApps } = useQuery({
    queryKey: ['candidateApplications'],
    queryFn: () => applicationService.getCandidateApplications(0, 50),
    enabled: isAuthenticated && role === 'CANDIDATE',
  });

  const hasAlreadyApplied = candidateApps?.content?.some((app) => app.jobId === id);

  // Apply Mutation
  const applyMutation = useMutation({
    mutationFn: () => applicationService.applyForJob(id!, coverLetter),
    onSuccess: () => {
      setSuccessMessage('Your application was submitted successfully!');
      queryClient.invalidateQueries({ queryKey: ['candidateApplications'] });
      setTimeout(() => {
        setApplyModalOpen(false);
        navigate('/candidate/applications');
      }, 1500);
    },
    onError: (err: any) => {
      const msg = err.response?.data?.message || err.message || 'Failed to submit application';
      setErrorMessage(msg);
    },
  });

  const handleApplyClick = () => {
    if (!isAuthenticated) {
      navigate('/auth/login', { state: { from: `/jobs/${id}` } });
      return;
    }
    setErrorMessage('');
    setSuccessMessage('');
    setApplyModalOpen(true);
  };

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16">
        <div className="h-64 bg-slate-200 rounded-xl animate-pulse"></div>
      </div>
    );
  }

  if (isError || !job) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center space-y-4">
        <AlertCircle className="w-12 h-12 text-rose-500 mx-auto" />
        <h2 className="text-xl font-bold text-slate-800">Job Not Found or Unavailable</h2>
        <p className="text-sm text-slate-500">This job posting may have expired, been closed, or removed.</p>
        <Link to="/jobs">
          <Button variant="outline">Back to Job Listings</Button>
        </Link>
      </div>
    );
  }

  const eligibility = job.eligibility;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <Link to="/jobs" className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-slate-800 transition">
        <ArrowLeft className="w-4 h-4" /> Back to open jobs
      </Link>

      {/* Header Banner */}
      <div className="bg-white p-8 rounded-xl border border-slate-200 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-sm font-semibold text-slate-600 flex items-center gap-1">
                <Building2 className="w-4 h-4 text-slate-400" /> {job.companyName}
              </span>
              <span>•</span>
              <StatusBadge status={job.workplaceType} />
            </div>
            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">{job.title}</h1>
          </div>

          <div>
            {role === 'RECRUITER' || role === 'ADMIN' ? (
              <span className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-slate-100 text-slate-600">
                Viewing as {role}
              </span>
            ) : hasAlreadyApplied ? (
              <div className="flex items-center gap-2 text-emerald-600 bg-emerald-50 px-4 py-2 rounded-lg text-sm font-semibold border border-emerald-200">
                <CheckCircle className="w-4 h-4" /> Already Applied
              </div>
            ) : (
              <Button size="lg" onClick={handleApplyClick}>
                Apply Now
              </Button>
            )}
          </div>
        </div>

        {/* Quick Meta */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-6 border-t border-slate-100 text-xs text-slate-600">
          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4 text-slate-400" />
            <span>{job.location}</span>
          </div>
          <div className="flex items-center gap-2">
            <Briefcase className="w-4 h-4 text-slate-400" />
            <span>{job.employmentType.replace('_', ' ')}</span>
          </div>
          {job.salaryMin && job.salaryMax && (
            <div className="flex items-center gap-2">
              <DollarSign className="w-4 h-4 text-slate-400" />
              <span>${job.salaryMin.toLocaleString()} - ${job.salaryMax.toLocaleString()} {job.salaryCurrency}</span>
            </div>
          )}
          {job.applicationDeadline && (
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-slate-400" />
              <span>Deadline: {new Date(job.applicationDeadline).toLocaleDateString()}</span>
            </div>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-2 space-y-8 bg-white p-8 rounded-xl border border-slate-200 shadow-sm">
          {/* Description */}
          <section className="space-y-3">
            <h2 className="text-lg font-bold text-slate-900">About the Role</h2>
            <p className="text-sm text-slate-600 whitespace-pre-line leading-relaxed">{job.description}</p>
          </section>

          {/* Responsibilities */}
          {job.responsibilities && (
            <section className="space-y-3 pt-6 border-t border-slate-100">
              <h2 className="text-lg font-bold text-slate-900">Key Responsibilities</h2>
              <p className="text-sm text-slate-600 whitespace-pre-line leading-relaxed">{job.responsibilities}</p>
            </section>
          )}

          {/* Qualifications */}
          {job.requiredQualifications && (
            <section className="space-y-3 pt-6 border-t border-slate-100">
              <h2 className="text-lg font-bold text-slate-900">Required Qualifications</h2>
              <p className="text-sm text-slate-600 whitespace-pre-line leading-relaxed">{job.requiredQualifications}</p>
            </section>
          )}

          {/* Preferred */}
          {job.preferredQualifications && (
            <section className="space-y-3 pt-6 border-t border-slate-100">
              <h2 className="text-lg font-bold text-slate-900">Preferred Qualifications & Skills</h2>
              <p className="text-sm text-slate-600 whitespace-pre-line leading-relaxed">{job.preferredQualifications}</p>
            </section>
          )}
        </div>

        {/* Sidebar: Eligibility & Company Info */}
        <div className="space-y-6">
          {/* Automated Eligibility Criteria */}
          {eligibility && (
            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-4">
              <div className="flex items-center gap-2">
                <GraduationCap className="w-5 h-5 text-primary-600" />
                <h3 className="font-bold text-slate-900 text-sm">Eligibility Criteria</h3>
              </div>
              <ul className="space-y-2 text-xs text-slate-600">
                {eligibility.minimumGraduationYear && (
                  <li>
                    <span className="font-semibold text-slate-700">Graduation:</span>{' '}
                    {eligibility.minimumGraduationYear}
                    {eligibility.maximumGraduationYear ? ` - ${eligibility.maximumGraduationYear}` : ' onwards'}
                  </li>
                )}
                {eligibility.minimumScore && eligibility.scoreScale && (
                  <li>
                    <span className="font-semibold text-slate-700">Minimum Score:</span>{' '}
                    {eligibility.minimumScore} / {eligibility.scoreScale} scale
                  </li>
                )}
                {eligibility.minimumExperienceYears !== undefined && eligibility.minimumExperienceYears > 0 && (
                  <li>
                    <span className="font-semibold text-slate-700">Min Experience:</span>{' '}
                    {eligibility.minimumExperienceYears} year(s)
                  </li>
                )}
                {(eligibility.eligibleDegrees?.length ?? 0) > 0 && (
                  <li>
                    <span className="font-semibold text-slate-700">Degrees:</span>{' '}
                    {eligibility.eligibleDegrees?.join(', ')}
                  </li>
                )}
                {(eligibility.eligibleBranches?.length ?? 0) > 0 && (
                  <li>
                    <span className="font-semibold text-slate-700">Branches:</span>{' '}
                    {eligibility.eligibleBranches?.join(', ')}
                  </li>
                )}
              </ul>
              <p className="text-[11px] text-slate-400 border-t border-slate-100 pt-3">
                HireFlow automatically verifies education, skills, and experience against these criteria upon application.
              </p>
            </div>
          )}

          {/* Company Details */}
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-3">
            <h3 className="font-bold text-slate-900 text-sm">Company Information</h3>
            <p className="font-semibold text-slate-800 text-sm">{job.companyName}</p>
            {job.companyWebsite && (
              <a
                href={job.companyWebsite}
                target="_blank"
                rel="noreferrer"
                className="text-xs text-primary-600 hover:underline block truncate"
              >
                {job.companyWebsite}
              </a>
            )}
          </div>
        </div>
      </div>

      {/* Apply Modal */}
      <Modal isOpen={applyModalOpen} onClose={() => setApplyModalOpen(false)} title={`Apply: ${job.title}`}>
        <div className="space-y-5">
          {errorMessage && (
            <div className="p-3 bg-rose-50 text-rose-700 rounded-lg text-xs font-medium border border-rose-200">
              {errorMessage}
            </div>
          )}
          {successMessage && (
            <div className="p-3 bg-emerald-50 text-emerald-700 rounded-lg text-xs font-medium border border-emerald-200">
              {successMessage}
            </div>
          )}

          {/* Resume Snapshot Notification */}
          <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
                <FileText className="w-4 h-4 text-slate-500" /> Submitted Resume:
              </span>
              {profile?.currentResumeName ? (
                <span className="text-xs font-medium text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                  {profile.currentResumeName}
                </span>
              ) : (
                <span className="text-xs font-medium text-rose-600">No resume uploaded</span>
              )}
            </div>
            {!profile?.currentResumeName && (
              <p className="text-xs text-rose-600">
                You must upload a PDF/DOCX resume to your candidate profile before submitting an application.
                <Link to="/candidate/profile" className="font-bold underline ml-1">
                  Upload Resume
                </Link>
              </p>
            )}
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Cover Letter (Optional)</label>
            <textarea
              rows={4}
              value={coverLetter}
              onChange={(e) => setCoverLetter(e.target.value)}
              placeholder="Introduce yourself and explain why you're a great fit for this position..."
              className="w-full p-3 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>

          <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
            <Button variant="outline" onClick={() => setApplyModalOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={() => applyMutation.mutate()}
              isLoading={applyMutation.isPending}
              disabled={!profile?.currentResumeName || !!successMessage}
            >
              Submit Application
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default JobDetailPage;

