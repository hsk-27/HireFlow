import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { recruiterApi } from '../../services/apiServices';
import { Job, JobStatus } from '../../types';
import Button from '../../components/common/Button';
import Modal from '../../components/common/Modal';
import StatusBadge from '../../components/common/StatusBadge';
import Pagination from '../../components/common/Pagination';
import { Plus, Briefcase, MapPin, DollarSign, Users, CheckCircle, XCircle, Archive, AlertCircle } from 'lucide-react';

export default function RecruiterJobsPage() {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(0);
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  // Form state for creating a job
  const [formData, setFormData] = useState({
    title: '',
    department: 'Engineering',
    location: '',
    workplaceType: 'HYBRID',
    employmentType: 'FULL_TIME',
    description: '',
    requirements: '',
    responsibilities: '',
    salaryMin: '',
    salaryMax: '',
    currency: 'USD',
    applicationDeadline: '',
    // Eligibility Criteria
    minCgpa: '',
    min10thPercent: '',
    min12thPercent: '',
    maxBacklogs: '0',
    allowedDegrees: 'B.Tech, B.E., M.Tech, MCA',
    allowedBranches: 'Computer Science, Information Technology, Electronics',
    graduationYears: '2024, 2025, 2026',
    strictEnforcement: true,
  });

  const { data: jobsResponse, isLoading, error } = useQuery({
    queryKey: ['recruiter-jobs', page, statusFilter],
    queryFn: async () => {
      const res = await recruiterApi.getCompanyJobs({
        page,
        size: 10,
        status: statusFilter || undefined,
      });
      return res.data.data;
    },
  });

  const createJobMutation = useMutation({
    mutationFn: (payload: any) => recruiterApi.createJob(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['recruiter-jobs'] });
      setIsCreateModalOpen(false);
      resetForm();
    },
    onError: (err: any) => {
      setFormError(err.response?.data?.message || 'Failed to create job posting');
    },
  });

  const updateStatusMutation = useMutation({
    mutationFn: ({ jobId, status }: { jobId: string; status: JobStatus }) =>
      recruiterApi.updateJobStatus(jobId, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['recruiter-jobs'] });
    },
    onError: (err: any) => {
      alert(err.response?.data?.message || 'Failed to update status');
    },
  });

  const resetForm = () => {
    setFormData({
      title: '',
      department: 'Engineering',
      location: '',
      workplaceType: 'HYBRID',
      employmentType: 'FULL_TIME',
      description: '',
      requirements: '',
      responsibilities: '',
      salaryMin: '',
      salaryMax: '',
      currency: 'USD',
      applicationDeadline: '',
      minCgpa: '',
      min10thPercent: '',
      min12thPercent: '',
      maxBacklogs: '0',
      allowedDegrees: 'B.Tech, B.E., M.Tech, MCA',
      allowedBranches: 'Computer Science, Information Technology, Electronics',
      graduationYears: '2024, 2025, 2026',
      strictEnforcement: true,
    });
    setFormError(null);
  };

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!formData.title || !formData.location || !formData.description) {
      setFormError('Please fill in title, location, and description');
      return;
    }

    const payload = {
      title: formData.title,
      department: formData.department,
      location: formData.location,
      workplaceType: formData.workplaceType,
      employmentType: formData.employmentType,
      description: formData.description,
      requirements: formData.requirements,
      responsibilities: formData.responsibilities,
      salaryMin: formData.salaryMin ? Number(formData.salaryMin) : null,
      salaryMax: formData.salaryMax ? Number(formData.salaryMax) : null,
      currency: formData.currency,
      applicationDeadline: formData.applicationDeadline ? formData.applicationDeadline + 'T23:59:59Z' : null,
      eligibilityCriteria: {
        minCgpa: formData.minCgpa ? Number(formData.minCgpa) : null,
        min10thPercent: formData.min10thPercent ? Number(formData.min10thPercent) : null,
        min12thPercent: formData.min12thPercent ? Number(formData.min12thPercent) : null,
        maxBacklogs: formData.maxBacklogs ? Number(formData.maxBacklogs) : 0,
        allowedDegrees: formData.allowedDegrees
          .split(',')
          .map((d) => d.trim())
          .filter(Boolean),
        allowedBranches: formData.allowedBranches
          .split(',')
          .map((b) => b.trim())
          .filter(Boolean),
        graduationYears: formData.graduationYears
          .split(',')
          .map((y) => Number(y.trim()))
          .filter((y) => !isNaN(y)),
        strictEnforcement: formData.strictEnforcement,
      },
    };

    createJobMutation.mutate(payload);
  };

  const jobs = jobsResponse?.content || [];
  const totalPages = jobsResponse?.totalPages || 0;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b border-gray-200 pb-5 gap-4">
        <div>
          <h1 className="text-2xl font-bold leading-7 text-gray-900 sm:truncate sm:text-3xl">
            Job Requisitions
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Publish openings, configure academic and experience eligibility criteria, and manage lifecycle.
          </p>
        </div>
        <div>
          <Button variant="primary" onClick={() => setIsCreateModalOpen(true)}>
            <Plus className="mr-2 h-4 w-4" /> Post New Job
          </Button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2">
        {['', 'PUBLISHED', 'DRAFT', 'CLOSED', 'ARCHIVED'].map((st) => (
          <button
            key={st}
            onClick={() => {
              setStatusFilter(st);
              setPage(0);
            }}
            className={`rounded-full px-3 py-1.5 text-xs font-medium transition ${
              statusFilter === st
                ? 'bg-primary-700 text-white shadow-sm'
                : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
            }`}
          >
            {st === '' ? 'All Statuses' : st}
          </button>
        ))}
      </div>

      {/* Jobs List */}
      {isLoading ? (
        <div className="flex justify-center py-12">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary-600 border-t-transparent" />
        </div>
      ) : error ? (
        <div className="rounded-md bg-red-50 p-4 text-sm text-red-700">
          Failed to load job postings.
        </div>
      ) : jobs.length === 0 ? (
        <div className="rounded-lg border-2 border-dashed border-gray-300 p-12 text-center bg-white">
          <Briefcase className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-semibold text-gray-900">No job postings found</h3>
          <p className="mt-1 text-sm text-gray-500">
            Get started by creating your first job requisition.
          </p>
          <div className="mt-6">
            <Button variant="primary" onClick={() => setIsCreateModalOpen(true)}>
              <Plus className="mr-2 h-4 w-4" /> Create Requisition
            </Button>
          </div>
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
          <table className="min-w-full divide-y divide-gray-200 text-left text-sm">
            <thead className="bg-gray-50 text-xs font-semibold uppercase tracking-wider text-gray-500">
              <tr>
                <th className="px-6 py-3">Role / Dept</th>
                <th className="px-6 py-3">Location & Type</th>
                <th className="px-6 py-3">Status</th>
                <th className="px-6 py-3">Applicants</th>
                <th className="px-6 py-3">Created</th>
                <th className="px-6 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white">
              {jobs.map((job) => (
                <tr key={job.id} className="hover:bg-gray-50/70 transition">
                  <td className="px-6 py-4">
                    <div className="font-bold text-gray-900">{job.title}</div>
                    <div className="text-xs text-gray-500">{job.department || 'General'}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-900 flex items-center">
                      <MapPin className="mr-1 h-3.5 w-3.5 text-gray-400" /> {job.location}
                    </div>
                    <div className="text-xs text-gray-500">
                      {job.workplaceType} • {job.employmentType}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <StatusBadge status={job.status} />
                  </td>
                  <td className="px-6 py-4">
                    <Link
                      to={`/recruiter/applications?jobId=${job.id}`}
                      className="inline-flex items-center text-xs font-semibold text-primary-700 hover:text-primary-900"
                    >
                      <Users className="mr-1 h-3.5 w-3.5" />
                      View applicants
                    </Link>
                  </td>
                  <td className="px-6 py-4 text-xs text-gray-500">
                    {new Date(job.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 text-right space-x-2">
                    {job.status === 'DRAFT' && (
                      <button
                        onClick={() => updateStatusMutation.mutate({ jobId: job.id, status: 'PUBLISHED' })}
                        className="rounded bg-emerald-50 px-2 py-1 text-xs font-medium text-emerald-700 hover:bg-emerald-100"
                        title="Publish Job"
                      >
                        Publish
                      </button>
                    )}
                    {job.status === 'PUBLISHED' && (
                      <button
                        onClick={() => updateStatusMutation.mutate({ jobId: job.id, status: 'CLOSED' })}
                        className="rounded bg-amber-50 px-2 py-1 text-xs font-medium text-amber-700 hover:bg-amber-100"
                        title="Close Job"
                      >
                        Close
                      </button>
                    )}
                    {job.status !== 'ARCHIVED' && (
                      <button
                        onClick={() => updateStatusMutation.mutate({ jobId: job.id, status: 'ARCHIVED' })}
                        className="rounded bg-gray-100 px-2 py-1 text-xs font-medium text-gray-600 hover:bg-gray-200"
                        title="Archive Job"
                      >
                        Archive
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <Pagination
            currentPage={page}
            totalPages={totalPages}
            onPageChange={(p) => setPage(p)}
          />
        </div>
      )}

      {/* Create Job Modal */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => {
          setIsCreateModalOpen(false);
          resetForm();
        }}
        title="Create Job Requisition"
        size="xl"
      >
        <form onSubmit={handleCreateSubmit} className="space-y-6">
          {formError && (
            <div className="rounded-md bg-red-50 p-3 text-sm text-red-700 flex items-center">
              <AlertCircle className="mr-2 h-4 w-4 shrink-0" />
              <span>{formError}</span>
            </div>
          )}

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-xs font-semibold text-gray-700 uppercase">Job Title *</label>
              <input
                type="text"
                required
                className="mt-1 block w-full rounded-md border border-gray-300 p-2 text-sm shadow-sm focus:border-primary-500 focus:ring-primary-500"
                placeholder="Senior Backend Engineer"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-700 uppercase">Department</label>
              <input
                type="text"
                className="mt-1 block w-full rounded-md border border-gray-300 p-2 text-sm shadow-sm focus:border-primary-500 focus:ring-primary-500"
                placeholder="Engineering"
                value={formData.department}
                onChange={(e) => setFormData({ ...formData, department: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-700 uppercase">Location *</label>
              <input
                type="text"
                required
                className="mt-1 block w-full rounded-md border border-gray-300 p-2 text-sm shadow-sm focus:border-primary-500 focus:ring-primary-500"
                placeholder="San Francisco, CA or Remote"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-700 uppercase">Workplace Type</label>
              <select
                className="mt-1 block w-full rounded-md border border-gray-300 p-2 text-sm shadow-sm focus:border-primary-500 focus:ring-primary-500"
                value={formData.workplaceType}
                onChange={(e) => setFormData({ ...formData, workplaceType: e.target.value })}
              >
                <option value="ON_SITE">On-Site</option>
                <option value="HYBRID">Hybrid</option>
                <option value="REMOTE">Remote</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-700 uppercase">Employment Type</label>
              <select
                className="mt-1 block w-full rounded-md border border-gray-300 p-2 text-sm shadow-sm focus:border-primary-500 focus:ring-primary-500"
                value={formData.employmentType}
                onChange={(e) => setFormData({ ...formData, employmentType: e.target.value })}
              >
                <option value="FULL_TIME">Full Time</option>
                <option value="PART_TIME">Part Time</option>
                <option value="CONTRACT">Contract</option>
                <option value="INTERNSHIP">Internship</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-700 uppercase">Application Deadline</label>
              <input
                type="date"
                className="mt-1 block w-full rounded-md border border-gray-300 p-2 text-sm shadow-sm focus:border-primary-500 focus:ring-primary-500"
                value={formData.applicationDeadline}
                onChange={(e) => setFormData({ ...formData, applicationDeadline: e.target.value })}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div>
              <label className="block text-xs font-semibold text-gray-700 uppercase">Min Salary</label>
              <input
                type="number"
                placeholder="80000"
                className="mt-1 block w-full rounded-md border border-gray-300 p-2 text-sm shadow-sm focus:border-primary-500 focus:ring-primary-500"
                value={formData.salaryMin}
                onChange={(e) => setFormData({ ...formData, salaryMin: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-700 uppercase">Max Salary</label>
              <input
                type="number"
                placeholder="130000"
                className="mt-1 block w-full rounded-md border border-gray-300 p-2 text-sm shadow-sm focus:border-primary-500 focus:ring-primary-500"
                value={formData.salaryMax}
                onChange={(e) => setFormData({ ...formData, salaryMax: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-700 uppercase">Currency</label>
              <input
                type="text"
                className="mt-1 block w-full rounded-md border border-gray-300 p-2 text-sm shadow-sm focus:border-primary-500 focus:ring-primary-500"
                value={formData.currency}
                onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 uppercase">Job Description *</label>
            <textarea
              rows={4}
              required
              placeholder="Overview of the position, team mission, and opportunity..."
              className="mt-1 block w-full rounded-md border border-gray-300 p-2 text-sm shadow-sm focus:border-primary-500 focus:ring-primary-500"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-xs font-semibold text-gray-700 uppercase">Responsibilities</label>
              <textarea
                rows={3}
                placeholder="Key duties and deliverables..."
                className="mt-1 block w-full rounded-md border border-gray-300 p-2 text-sm shadow-sm focus:border-primary-500 focus:ring-primary-500"
                value={formData.responsibilities}
                onChange={(e) => setFormData({ ...formData, responsibilities: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-700 uppercase">Requirements</label>
              <textarea
                rows={3}
                placeholder="Skills, qualifications, and background needed..."
                className="mt-1 block w-full rounded-md border border-gray-300 p-2 text-sm shadow-sm focus:border-primary-500 focus:ring-primary-500"
                value={formData.requirements}
                onChange={(e) => setFormData({ ...formData, requirements: e.target.value })}
              />
            </div>
          </div>

          {/* Academic & Experience Eligibility Criteria */}
          <div className="rounded-lg border border-primary-200 bg-primary-50/40 p-4 space-y-4">
            <h4 className="text-sm font-bold text-primary-950 flex items-center">
              Automated Eligibility Evaluation Rules
            </h4>
            <p className="text-xs text-primary-800">
              Applications will be automatically evaluated against these thresholds when submitted.
            </p>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-4">
              <div>
                <label className="block text-xs font-medium text-gray-700">Min CGPA (out of 10)</label>
                <input
                  type="number"
                  step="0.01"
                  placeholder="7.0"
                  className="mt-1 block w-full rounded-md border border-gray-300 bg-white p-2 text-xs shadow-sm"
                  value={formData.minCgpa}
                  onChange={(e) => setFormData({ ...formData, minCgpa: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700">Min 10th %</label>
                <input
                  type="number"
                  step="0.1"
                  placeholder="60.0"
                  className="mt-1 block w-full rounded-md border border-gray-300 bg-white p-2 text-xs shadow-sm"
                  value={formData.min10thPercent}
                  onChange={(e) => setFormData({ ...formData, min10thPercent: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700">Min 12th %</label>
                <input
                  type="number"
                  step="0.1"
                  placeholder="60.0"
                  className="mt-1 block w-full rounded-md border border-gray-300 bg-white p-2 text-xs shadow-sm"
                  value={formData.min12thPercent}
                  onChange={(e) => setFormData({ ...formData, min12thPercent: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700">Max Active Backlogs</label>
                <input
                  type="number"
                  placeholder="0"
                  className="mt-1 block w-full rounded-md border border-gray-300 bg-white p-2 text-xs shadow-sm"
                  value={formData.maxBacklogs}
                  onChange={(e) => setFormData({ ...formData, maxBacklogs: e.target.value })}
                />
              </div>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-gray-700">
                  Allowed Degrees (comma-separated)
                </label>
                <input
                  type="text"
                  className="mt-1 block w-full rounded-md border border-gray-300 bg-white p-2 text-xs shadow-sm"
                  value={formData.allowedDegrees}
                  onChange={(e) => setFormData({ ...formData, allowedDegrees: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700">
                  Allowed Branches (comma-separated)
                </label>
                <input
                  type="text"
                  className="mt-1 block w-full rounded-md border border-gray-300 bg-white p-2 text-xs shadow-sm"
                  value={formData.allowedBranches}
                  onChange={(e) => setFormData({ ...formData, allowedBranches: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700">
                  Graduation Years (comma-separated)
                </label>
                <input
                  type="text"
                  className="mt-1 block w-full rounded-md border border-gray-300 bg-white p-2 text-xs shadow-sm"
                  value={formData.graduationYears}
                  onChange={(e) => setFormData({ ...formData, graduationYears: e.target.value })}
                />
              </div>
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="strictEnforcement"
                  checked={formData.strictEnforcement}
                  onChange={(e) => setFormData({ ...formData, strictEnforcement: e.target.checked })}
                  className="h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                />
                <label htmlFor="strictEnforcement" className="ml-2 text-xs font-medium text-gray-700">
                  Strict Enforcement (Reject candidates automatically if criteria are not met)
                </label>
              </div>
            </div>
          </div>

          <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setIsCreateModalOpen(false);
                resetForm();
              }}
            >
              Cancel
            </Button>
            <Button type="submit" variant="primary" loading={createJobMutation.isPending}>
              Create Job Requisition
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
