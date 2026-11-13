import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useSearchParams } from 'react-router-dom';
import { recruiterApi } from '../../services/apiServices';
import { Application, ApplicationStatus, EligibilityStatus } from '../../types';
import StatusBadge from '../../components/common/StatusBadge';
import Button from '../../components/common/Button';
import Modal from '../../components/common/Modal';
import Pagination from '../../components/common/Pagination';
import {
  Users,
  Search,
  Filter,
  Eye,
  CheckCircle,
  XCircle,
  Clock,
  Calendar,
  FileText,
  UserCheck,
  Award,
  ChevronRight,
  ExternalLink,
  Download,
  LayoutGrid,
  List as ListIcon,
  ArrowRight,
  AlertCircle,
  Briefcase,
} from 'lucide-react';

export default function RecruiterApplicationsPage() {
  const queryClient = useQueryClient();
  const [searchParams, setSearchParams] = useSearchParams();
  const initialJobId = searchParams.get('jobId') || '';

  const [page, setPage] = useState(0);
  const [viewMode, setViewMode] = useState<'list' | 'board'>('list');
  const [selectedJobId, setSelectedJobId] = useState<string>(initialJobId);
  const [selectedStatus, setSelectedStatus] = useState<string>('');
  const [selectedEligibility, setSelectedEligibility] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedApp, setSelectedApp] = useState<Application | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

  // Transition / Action Modal state
  const [transitionAction, setTransitionAction] = useState<{
    targetStatus: ApplicationStatus;
    notes?: string;
  } | null>(null);
  const [transitionNotes, setTransitionNotes] = useState('');
  const [transitionError, setTransitionError] = useState<string | null>(null);

  // Jobs for dropdown filter
  const { data: jobsData } = useQuery({
    queryKey: ['recruiter-jobs-filter'],
    queryFn: async () => {
      const res = await recruiterApi.getCompanyJobs({ page: 0, size: 100 });
      return res.data.data.content;
    },
  });

  // Fetch applications
  const { data: appsResponse, isLoading, error } = useQuery({
    queryKey: ['recruiter-applications', page, selectedJobId, selectedStatus, selectedEligibility, searchQuery, viewMode],
    queryFn: async () => {
      const res = await recruiterApi.getApplications({
        page: viewMode === 'board' ? 0 : page,
        size: viewMode === 'board' ? 100 : 10,
        jobId: selectedJobId || undefined,
        status: (selectedStatus as ApplicationStatus) || undefined,
        eligibilityStatus: (selectedEligibility as EligibilityStatus) || undefined,
        search: searchQuery || undefined,
      });
      return res.data.data;
    },
  });

  const updateStatusMutation = useMutation({
    mutationFn: ({
      appId,
      status,
      notes,
    }: {
      appId: string;
      status: ApplicationStatus;
      notes?: string;
    }) => recruiterApi.updateApplicationStatus(appId, status, notes),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['recruiter-applications'] });
      setTransitionAction(null);
      setTransitionNotes('');
      setIsDetailModalOpen(false);
      setSelectedApp(null);
    },
    onError: (err: any) => {
      setTransitionError(err.response?.data?.message || 'Failed to update application status');
    },
  });

  const handleExecuteTransition = () => {
    if (!selectedApp || !transitionAction) return;
    setTransitionError(null);
    updateStatusMutation.mutate({
      appId: selectedApp.id,
      status: transitionAction.targetStatus,
      notes: transitionNotes || undefined,
    });
  };

  const applications = appsResponse?.content || [];
  const totalPages = appsResponse?.totalPages || 0;

  // Filter applications in memory for quick board search if needed
  const filteredApps = applications.filter((app) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    const nameMatch = (app.candidateName || '').toLowerCase().includes(q);
    const emailMatch = (app.candidateEmail || '').toLowerCase().includes(q);
    const jobMatch = (app.jobTitle || '').toLowerCase().includes(q);
    return nameMatch || emailMatch || jobMatch;
  });

  // Export filtered applications to CSV
  const handleExportCSV = () => {
    if (filteredApps.length === 0) return;
    const headers = ['Candidate Name', 'Candidate Email', 'Job Title', 'Company', 'Stage', 'Eligibility Status', 'Applied Date'];
    const rows = filteredApps.map((a) => [
      `"${a.candidateName || 'Candidate'}"`,
      `"${a.candidateEmail || ''}"`,
      `"${a.jobTitle || ''}"`,
      `"${a.companyName || ''}"`,
      `"${a.status || ''}"`,
      `"${a.eligibilityStatus || ''}"`,
      `"${new Date(a.appliedAt || Date.now()).toISOString().split('T')[0]}"`,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `hireflow-candidates-${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Pipeline board stage definitions
  const pipelineStages: { status: ApplicationStatus; label: string; color: string }[] = [
    { status: 'SUBMITTED', label: 'Submitted', color: 'border-t-blue-500' },
    { status: 'UNDER_REVIEW', label: 'Under Review', color: 'border-t-amber-500' },
    { status: 'SHORTLISTED', label: 'Shortlisted', color: 'border-t-primary-500' },
    { status: 'INTERVIEW', label: 'Interview', color: 'border-t-purple-500' },
    { status: 'OFFERED', label: 'Offered', color: 'border-t-copper-500' },
    { status: 'HIRED', label: 'Hired', color: 'border-t-emerald-500' },
  ];

  return (
    <div className="space-y-6">
      {/* Page Header with Action Bar */}
      <div className="border-b border-slate-200 pb-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
              Candidate Pipeline
            </h1>
            <span className="px-2 py-0.5 rounded text-xs font-bold uppercase tracking-wider bg-primary-50 text-primary-700 border border-primary-200">
              {appsResponse?.totalElements ?? filteredApps.length} Applicants
            </span>
          </div>
          <p className="mt-1 text-xs text-slate-500">
            Screen candidates, inspect academic eligibility checks, schedule rounds, and progress pipeline stages.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start md:self-auto">
          {/* View Mode Switcher */}
          <div className="flex rounded-lg border border-slate-200 bg-white p-1 shadow-sm">
            <button
              onClick={() => setViewMode('list')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-bold transition ${
                viewMode === 'list'
                  ? 'bg-slate-900 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <ListIcon className="w-3.5 h-3.5" /> List
            </button>
            <button
              onClick={() => setViewMode('board')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-bold transition ${
                viewMode === 'board'
                  ? 'bg-slate-900 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <LayoutGrid className="w-3.5 h-3.5" /> Pipeline Board
            </button>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 text-xs font-semibold"
          >
            <Download className="w-3.5 h-3.5" /> Export CSV
          </Button>
        </div>
      </div>

      {/* Filter Controls Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
        {/* Search Input */}
        <div>
          <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1">
            Search Candidate
          </label>
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              placeholder="Candidate name or email..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setPage(0);
              }}
              className="w-full pl-9 pr-3 py-1.5 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>
        </div>

        {/* Job Requisition Filter */}
        <div>
          <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1">
            Job Requisition
          </label>
          <select
            className="w-full rounded-lg border border-slate-300 p-1.5 text-xs focus:ring-primary-500 bg-white"
            value={selectedJobId}
            onChange={(e) => {
              setSelectedJobId(e.target.value);
              setPage(0);
            }}
          >
            <option value="">All Requisitions ({jobsData?.length || 0})</option>
            {jobsData?.map((j) => (
              <option key={j.id} value={j.id}>
                {j.title} ({j.department || 'General'})
              </option>
            ))}
          </select>
        </div>

        {/* Pipeline Stage Filter (only on list view) */}
        <div>
          <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1">
            Pipeline Stage
          </label>
          <select
            className="w-full rounded-lg border border-slate-300 p-1.5 text-xs focus:ring-primary-500 bg-white"
            value={selectedStatus}
            onChange={(e) => {
              setSelectedStatus(e.target.value);
              setPage(0);
            }}
          >
            <option value="">All Stages</option>
            <option value="SUBMITTED">Submitted</option>
            <option value="UNDER_REVIEW">Under Review</option>
            <option value="SHORTLISTED">Shortlisted</option>
            <option value="INTERVIEW">Interview</option>
            <option value="OFFERED">Offered</option>
            <option value="HIRED">Hired</option>
            <option value="REJECTED">Rejected</option>
            <option value="WITHDRAWN">Withdrawn</option>
          </select>
        </div>

        {/* Eligibility Status Filter */}
        <div>
          <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1">
            Automated Eligibility
          </label>
          <select
            className="w-full rounded-lg border border-slate-300 p-1.5 text-xs focus:ring-primary-500 bg-white"
            value={selectedEligibility}
            onChange={(e) => {
              setSelectedEligibility(e.target.value);
              setPage(0);
            }}
          >
            <option value="">All Outcomes</option>
            <option value="ELIGIBLE">Eligible</option>
            <option value="REVIEW_REQUIRED">Review Required</option>
            <option value="INELIGIBLE">Ineligible</option>
          </select>
        </div>
      </div>

      {/* Main Content Area */}
      {isLoading ? (
        <div className="flex justify-center py-16">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary-600 border-t-transparent" />
        </div>
      ) : error ? (
        <div className="rounded-xl bg-rose-50 border border-rose-200 p-4 text-xs font-semibold text-rose-700">
          Failed to load candidate applications.
        </div>
      ) : filteredApps.length === 0 ? (
        <div className="rounded-xl border-2 border-dashed border-slate-200 p-16 text-center bg-white space-y-2">
          <Users className="mx-auto h-12 w-12 text-slate-300" />
          <h3 className="text-sm font-bold text-slate-800">No applicants matching criteria</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Try adjusting your search query, selecting another job opening, or resetting filters.
          </p>
        </div>
      ) : viewMode === 'board' ? (
        /* ================= PIPELINE KANBAN BOARD VIEW ================= */
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-6 gap-4 overflow-x-auto pb-4">
          {pipelineStages.map((stage) => {
            const stageApps = filteredApps.filter((a) => a.status === stage.status);

            return (
              <div
                key={stage.status}
                className={`bg-slate-100/70 rounded-xl p-3 border border-slate-200 border-t-4 ${stage.color} flex flex-col min-h-[500px]`}
              >
                {/* Column Header */}
                <div className="flex items-center justify-between pb-2 mb-3 border-b border-slate-200/80">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-700">
                    {stage.label}
                  </span>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-white text-slate-700 border border-slate-200 shadow-xs">
                    {stageApps.length}
                  </span>
                </div>

                {/* Candidate Cards in Stage */}
                <div className="space-y-2.5 flex-1">
                  {stageApps.map((app) => (
                    <div
                      key={app.id}
                      className="bg-white rounded-lg p-3.5 border border-slate-200/90 shadow-xs hover:shadow-md hover:border-primary-400/50 transition cursor-pointer flex flex-col justify-between space-y-2.5"
                      onClick={() => {
                        setSelectedApp(app);
                        setIsDetailModalOpen(true);
                      }}
                    >
                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <StatusBadge status={app.eligibilityStatus} />
                          <span className="text-[10px] text-slate-400 font-mono">
                            {new Date(app.appliedAt).toLocaleDateString()}
                          </span>
                        </div>
                        <h4 className="text-xs font-bold text-slate-900 truncate">
                          {app.candidateName || 'Candidate'}
                        </h4>
                        <p className="text-[11px] text-slate-500 truncate mt-0.5">
                          {app.candidateEmail}
                        </p>
                        <p className="text-[11px] font-medium text-primary-700 truncate mt-1 flex items-center gap-1">
                          <Briefcase className="w-3 h-3 text-slate-400" /> {app.jobTitle}
                        </p>
                      </div>

                      {/* Quick Progression Button on Card */}
                      <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                        <span className="text-[10px] text-slate-400">Review</span>
                        <ChevronRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-primary-600" />
                      </div>
                    </div>
                  ))}

                  {stageApps.length === 0 && (
                    <div className="h-28 rounded-lg border border-dashed border-slate-200 flex items-center justify-center text-[11px] text-slate-400 italic">
                      No candidates in {stage.label}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* ================= HIGH-DENSITY LIST VIEW ================= */
        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
          <table className="min-w-full divide-y divide-slate-200 text-left text-xs">
            <thead className="bg-slate-50 text-[11px] font-bold uppercase tracking-wider text-slate-500">
              <tr>
                <th className="px-5 py-3">Candidate</th>
                <th className="px-5 py-3">Requisition</th>
                <th className="px-5 py-3">Eligibility</th>
                <th className="px-5 py-3">Stage</th>
                <th className="px-5 py-3">Applied On</th>
                <th className="px-5 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {filteredApps.map((app) => (
                <tr key={app.id} className="hover:bg-slate-50/80 transition">
                  <td className="px-5 py-3.5">
                    <div className="font-bold text-slate-900">
                      {app.candidateName || 'Candidate'}
                    </div>
                    <div className="text-[11px] text-slate-500 font-mono">{app.candidateEmail}</div>
                  </td>
                  <td className="px-5 py-3.5">
                    <div className="font-semibold text-slate-900">{app.jobTitle}</div>
                    <div className="text-[11px] text-slate-500">{app.companyName}</div>
                  </td>
                  <td className="px-5 py-3.5">
                    <StatusBadge status={app.eligibilityStatus} />
                  </td>
                  <td className="px-5 py-3.5">
                    <StatusBadge status={app.status} />
                  </td>
                  <td className="px-5 py-3.5 text-slate-500 font-mono">
                    {new Date(app.appliedAt).toLocaleDateString()}
                  </td>
                  <td className="px-5 py-3.5 text-right">
                    <button
                      onClick={() => {
                        setSelectedApp(app);
                        setIsDetailModalOpen(true);
                      }}
                      className="inline-flex items-center rounded-md border border-slate-300 bg-white px-2.5 py-1 text-xs font-semibold text-slate-700 shadow-xs hover:bg-slate-50 hover:text-primary-700 transition"
                    >
                      <Eye className="mr-1 h-3.5 w-3.5 text-slate-500" /> Review
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <Pagination currentPage={page} totalPages={totalPages} onPageChange={(p) => setPage(p)} />
        </div>
      )}

      {/* Candidate Application Detail & Action Modal */}
      <Modal
        isOpen={isDetailModalOpen && selectedApp !== null}
        onClose={() => {
          setIsDetailModalOpen(false);
          setSelectedApp(null);
        }}
        title={`Candidate Review: ${selectedApp?.candidateName}`}
        size="lg"
      >
        {selectedApp && (
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4 rounded-xl bg-slate-50 border border-slate-200/80 p-4 text-xs">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">Candidate Email</span>
                <span className="font-semibold text-slate-900 font-mono">{selectedApp.candidateEmail}</span>
              </div>
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">Target Requisition</span>
                <span className="font-semibold text-slate-900">{selectedApp.jobTitle}</span>
              </div>
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">Current Stage</span>
                <div className="mt-1">
                  <StatusBadge status={selectedApp.status} />
                </div>
              </div>
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">Automated Eligibility</span>
                <div className="mt-1">
                  <StatusBadge status={selectedApp.eligibilityStatus} />
                </div>
              </div>
            </div>

            {selectedApp.eligibilityReason && (
              <div className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-xs text-amber-900 space-y-1">
                <span className="font-bold flex items-center gap-1.5 text-amber-800">
                  <AlertCircle className="w-3.5 h-3.5 text-amber-600" /> Eligibility Evaluation Findings:
                </span>
                <p className="text-[11px] leading-relaxed">{selectedApp.eligibilityReason}</p>
              </div>
            )}

            {selectedApp.resumeUrl && (
              <div className="flex items-center justify-between rounded-xl border border-slate-200 p-3 bg-white">
                <div className="flex items-center space-x-2.5">
                  <div className="w-8 h-8 rounded-lg bg-primary-50 text-primary-700 flex items-center justify-center border border-primary-200">
                    <FileText className="h-4 w-4" />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-slate-900 block">Candidate Resume Document</span>
                    <span className="text-[10px] text-slate-400">PDF / Verified SHA-256 Checksum</span>
                  </div>
                </div>
                <a
                  href={selectedApp.resumeUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center px-3 py-1.5 rounded-md bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold shadow-xs transition"
                >
                  Download Resume <ExternalLink className="ml-1.5 h-3 w-3" />
                </a>
              </div>
            )}

            {/* Stage Progression Actions */}
            <div className="border-t border-slate-200 pt-4">
              <h4 className="text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-3">
                Advance Pipeline Stage
              </h4>

              <div className="flex flex-wrap gap-2">
                {selectedApp.status === 'SUBMITTED' && (
                  <Button
                    variant="outline"
                    onClick={() =>
                      setTransitionAction({
                        targetStatus: 'UNDER_REVIEW',
                        notes: 'Recruiter commenced candidate dossier evaluation',
                      })
                    }
                  >
                    Commence Under Review
                  </Button>
                )}

                {(selectedApp.status === 'SUBMITTED' || selectedApp.status === 'UNDER_REVIEW') && (
                  <Button
                    variant="primary"
                    onClick={() =>
                      setTransitionAction({
                        targetStatus: 'SHORTLISTED',
                        notes: 'Qualified candidate shortlisted for technical interviews',
                      })
                    }
                  >
                    Shortlist Candidate
                  </Button>
                )}

                {selectedApp.status === 'SHORTLISTED' && (
                  <Button
                    variant="primary"
                    onClick={() =>
                      setTransitionAction({
                        targetStatus: 'INTERVIEW',
                        notes: 'Advanced candidate to structured interview scheduling',
                      })
                    }
                  >
                    Advance to Interview Stage
                  </Button>
                )}

                {selectedApp.status !== 'REJECTED' &&
                  selectedApp.status !== 'HIRED' &&
                  selectedApp.status !== 'WITHDRAWN' && (
                    <Button
                      variant="danger"
                      onClick={() =>
                        setTransitionAction({
                          targetStatus: 'REJECTED',
                          notes: 'Candidate did not meet criteria for this opening',
                        })
                      }
                    >
                      Reject Application
                    </Button>
                  )}
              </div>
            </div>

            {/* Application Audit / Status History */}
            {selectedApp.statusHistory && selectedApp.statusHistory.length > 0 && (
              <div className="border-t border-slate-200 pt-4">
                <h4 className="text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-3">
                  Stage Audit History Trail
                </h4>
                <div className="space-y-3">
                  {selectedApp.statusHistory.map((hist, idx) => (
                    <div key={idx} className="flex items-start text-xs text-slate-600">
                      <Clock className="mr-2 h-3.5 w-3.5 text-slate-400 mt-0.5 shrink-0" />
                      <div>
                        <span className="font-semibold text-slate-900">
                          {hist.fromStatus ? `${hist.fromStatus} → ` : ''}
                          {hist.toStatus}
                        </span>{' '}
                        by <span className="text-slate-700 font-medium">{hist.changedByName || 'System'}</span> on{' '}
                        <span className="font-mono text-[11px] text-slate-500">{new Date(hist.changedAt).toLocaleString()}</span>
                        {hist.notes && <div className="text-slate-500 italic mt-0.5">"{hist.notes}"</div>}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </Modal>

      {/* Confirmation of Status Transition */}
      <Modal
        isOpen={transitionAction !== null}
        onClose={() => {
          setTransitionAction(null);
          setTransitionNotes('');
          setTransitionError(null);
        }}
        title={`Change Stage to ${transitionAction?.targetStatus}`}
      >
        <div className="space-y-4 text-xs">
          {transitionError && (
            <div className="rounded-lg bg-rose-50 border border-rose-200 p-3 text-rose-700 font-semibold">
              {transitionError}
            </div>
          )}

          <p className="text-slate-600 leading-relaxed">
            Are you sure you want to transition candidate{' '}
            <strong className="text-slate-900">{selectedApp?.candidateName}</strong> to{' '}
            <strong className="text-slate-900">{transitionAction?.targetStatus}</strong>?
          </p>

          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1">
              Internal Transition Notes / Feedback (Audit Logged)
            </label>
            <textarea
              rows={3}
              className="w-full rounded-lg border border-slate-300 p-2 text-xs focus:ring-primary-500 focus:outline-none"
              placeholder="e.g. Cleared round 1 technical screen, proceeding to system design..."
              value={transitionNotes}
              onChange={(e) => setTransitionNotes(e.target.value)}
            />
          </div>

          <div className="mt-4 flex justify-end space-x-2 pt-2 border-t border-slate-100">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setTransitionAction(null);
                setTransitionNotes('');
              }}
            >
              Cancel
            </Button>
            <Button
              variant={transitionAction?.targetStatus === 'REJECTED' ? 'danger' : 'primary'}
              size="sm"
              loading={updateStatusMutation.isPending}
              onClick={handleExecuteTransition}
            >
              Confirm Transition
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
