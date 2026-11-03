import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useSearchParams } from 'react-router-dom';
import { recruiterApi } from '../../services/apiServices';
import { Application, ApplicationStatus } from '../../types';
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
} from 'lucide-react';

export default function RecruiterApplicationsPage() {
  const queryClient = useQueryClient();
  const [searchParams, setSearchParams] = useSearchParams();
  const initialJobId = searchParams.get('jobId') || '';

  const [page, setPage] = useState(0);
  const [selectedJobId, setSelectedJobId] = useState<string>(initialJobId);
  const [selectedStatus, setSelectedStatus] = useState<string>('');
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
    queryKey: ['recruiter-applications', page, selectedJobId, selectedStatus],
    queryFn: async () => {
      const res = await recruiterApi.getApplications({
        page,
        size: 10,
        jobId: selectedJobId || undefined,
        status: selectedStatus || undefined,
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

  return (
    <div className="space-y-6">
      <div className="border-b border-gray-200 pb-5">
        <h1 className="text-2xl font-bold leading-7 text-gray-900 sm:truncate sm:text-3xl">
          Candidate Pipeline & Applications
        </h1>
        <p className="mt-1 text-sm text-gray-500">
          Review submissions, inspect candidate credentials, evaluate eligibility, and progress stages.
        </p>
      </div>

      {/* Filter Controls */}
      <div className="flex flex-col sm:flex-row gap-4 bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
        <div className="flex-1">
          <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">
            Filter by Job Requisition
          </label>
          <select
            className="w-full rounded-md border border-gray-300 p-2 text-sm focus:border-primary-500 focus:ring-primary-500"
            value={selectedJobId}
            onChange={(e) => {
              setSelectedJobId(e.target.value);
              setPage(0);
            }}
          >
            <option value="">All Job Requisitions</option>
            {jobsData?.map((j) => (
              <option key={j.id} value={j.id}>
                {j.title} ({j.department || 'General'})
              </option>
            ))}
          </select>
        </div>

        <div className="flex-1">
          <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">
            Filter by Stage
          </label>
          <select
            className="w-full rounded-md border border-gray-300 p-2 text-sm focus:border-primary-500 focus:ring-primary-500"
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
      </div>

      {/* Applications Table */}
      {isLoading ? (
        <div className="flex justify-center py-12">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary-600 border-t-transparent" />
        </div>
      ) : error ? (
        <div className="rounded-md bg-red-50 p-4 text-sm text-red-700">
          Failed to load applications.
        </div>
      ) : applications.length === 0 ? (
        <div className="rounded-lg border-2 border-dashed border-gray-300 p-12 text-center bg-white">
          <Users className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-semibold text-gray-900">No applications found</h3>
          <p className="mt-1 text-sm text-gray-500">
            No candidate submissions match your current filters.
          </p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
          <table className="min-w-full divide-y divide-gray-200 text-left text-sm">
            <thead className="bg-gray-50 text-xs font-semibold uppercase tracking-wider text-gray-500">
              <tr>
                <th className="px-6 py-3">Candidate</th>
                <th className="px-6 py-3">Applied Job</th>
                <th className="px-6 py-3">Eligibility</th>
                <th className="px-6 py-3">Stage</th>
                <th className="px-6 py-3">Applied On</th>
                <th className="px-6 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white">
              {applications.map((app) => (
                <tr key={app.id} className="hover:bg-gray-50/70 transition">
                  <td className="px-6 py-4">
                    <div className="font-bold text-gray-900">
                      {app.candidateName || 'Candidate'}
                    </div>
                    <div className="text-xs text-gray-500">{app.candidateEmail}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="font-medium text-gray-900">{app.jobTitle}</div>
                    <div className="text-xs text-gray-500">{app.companyName}</div>
                  </td>
                  <td className="px-6 py-4">
                    <StatusBadge status={app.eligibilityStatus} />
                  </td>
                  <td className="px-6 py-4">
                    <StatusBadge status={app.status} />
                  </td>
                  <td className="px-6 py-4 text-xs text-gray-500">
                    {new Date(app.appliedAt).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button
                      onClick={() => {
                        setSelectedApp(app);
                        setIsDetailModalOpen(true);
                      }}
                      className="inline-flex items-center rounded-md border border-gray-300 bg-white px-2.5 py-1.5 text-xs font-medium text-gray-700 shadow-sm hover:bg-gray-50"
                    >
                      <Eye className="mr-1 h-3.5 w-3.5" />
                      Inspect & Review
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
        title={`Application Review: ${selectedApp?.candidateName}`}
        size="lg"
      >
        {selectedApp && (
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4 rounded-lg bg-gray-50 p-4 text-sm">
              <div>
                <span className="text-xs text-gray-500 block">Candidate Email</span>
                <span className="font-semibold text-gray-900">{selectedApp.candidateEmail}</span>
              </div>
              <div>
                <span className="text-xs text-gray-500 block">Target Job</span>
                <span className="font-semibold text-gray-900">{selectedApp.jobTitle}</span>
              </div>
              <div>
                <span className="text-xs text-gray-500 block">Current Stage</span>
                <div className="mt-1">
                  <StatusBadge status={selectedApp.status} />
                </div>
              </div>
              <div>
                <span className="text-xs text-gray-500 block">System Eligibility Check</span>
                <div className="mt-1">
                  <StatusBadge status={selectedApp.eligibilityStatus} />
                </div>
              </div>
            </div>

            {selectedApp.eligibilityReason && (
              <div className="rounded-md border border-amber-200 bg-amber-50 p-3 text-xs text-amber-900">
                <strong>Eligibility Evaluation Notes:</strong> {selectedApp.eligibilityReason}
              </div>
            )}

            {selectedApp.resumeUrl && (
              <div className="flex items-center justify-between rounded-lg border border-gray-200 p-3">
                <div className="flex items-center space-x-2">
                  <FileText className="h-5 w-5 text-primary-600" />
                  <span className="text-sm font-medium text-gray-900">Attached Resume File</span>
                </div>
                <a
                  href={selectedApp.resumeUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center text-xs font-semibold text-primary-600 hover:text-primary-800"
                >
                  Download / View <ExternalLink className="ml-1 h-3.5 w-3.5" />
                </a>
              </div>
            )}

            {/* Stage Progression Actions */}
            <div className="border-t border-gray-200 pt-4">
              <h4 className="text-xs font-bold uppercase tracking-wider text-gray-700 mb-3">
                Progress Application Stage
              </h4>

              <div className="flex flex-wrap gap-2">
                {selectedApp.status === 'SUBMITTED' && (
                  <Button
                    variant="outline"
                    onClick={() =>
                      setTransitionAction({
                        targetStatus: 'UNDER_REVIEW',
                        notes: 'Recruiter started reviewing application',
                      })
                    }
                  >
                    Move to Under Review
                  </Button>
                )}

                {(selectedApp.status === 'SUBMITTED' || selectedApp.status === 'UNDER_REVIEW') && (
                  <Button
                    variant="primary"
                    onClick={() =>
                      setTransitionAction({
                        targetStatus: 'SHORTLISTED',
                        notes: 'Shortlisted for interview rounds',
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
                        notes: 'Advanced to interview stage',
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
                          notes: 'Candidate did not meet current role expectations',
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
              <div className="border-t border-gray-200 pt-4">
                <h4 className="text-xs font-bold uppercase tracking-wider text-gray-700 mb-3">
                  Stage Transition Audit History
                </h4>
                <div className="space-y-3">
                  {selectedApp.statusHistory.map((hist, idx) => (
                    <div key={idx} className="flex items-start text-xs text-gray-600">
                      <Clock className="mr-2 h-3.5 w-3.5 text-gray-400 mt-0.5 shrink-0" />
                      <div>
                        <span className="font-semibold text-gray-900">
                          {hist.fromStatus ? `${hist.fromStatus} → ` : ''}
                          {hist.toStatus}
                        </span>{' '}
                        by {hist.changedByName || 'System'} on{' '}
                        {new Date(hist.changedAt).toLocaleString()}
                        {hist.notes && <div className="text-gray-500 italic mt-0.5">"{hist.notes}"</div>}
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
        <div className="space-y-4">
          {transitionError && (
            <div className="rounded-md bg-red-50 p-3 text-sm text-red-700">{transitionError}</div>
          )}

          <p className="text-sm text-gray-600">
            Are you sure you want to transition candidate{' '}
            <strong>{selectedApp?.candidateName}</strong> to{' '}
            <strong>{transitionAction?.targetStatus}</strong>?
          </p>

          <div>
            <label className="block text-xs font-semibold text-gray-700 uppercase">
              Transition Notes / Feedback (Optional)
            </label>
            <textarea
              rows={3}
              className="mt-1 block w-full rounded-md border border-gray-300 p-2 text-sm shadow-sm focus:border-primary-500 focus:ring-primary-500"
              placeholder="Internal reasoning or notes for the audit trail..."
              value={transitionNotes}
              onChange={(e) => setTransitionNotes(e.target.value)}
            />
          </div>

          <div className="mt-5 flex justify-end space-x-3">
            <Button
              variant="outline"
              onClick={() => {
                setTransitionAction(null);
                setTransitionNotes('');
              }}
            >
              Cancel
            </Button>
            <Button
              variant={transitionAction?.targetStatus === 'REJECTED' ? 'danger' : 'primary'}
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
