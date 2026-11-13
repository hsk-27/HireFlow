import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { applicationService } from '@/services/apiServices';
import { Application, ApplicationStatusHistory, ApplicationStatus } from '@/types';
import { StatusBadge } from '@/components/common/Badge';
import { Button } from '@/components/common/Button';
import { Modal } from '@/components/common/Modal';
import {
  Briefcase,
  Building2,
  Calendar,
  Clock,
  History,
  AlertTriangle,
  FileText,
  CheckCircle2,
  Circle,
  XCircle,
  ExternalLink,
} from 'lucide-react';

export const CandidateApplicationsPage: React.FC = () => {
  const queryClient = useQueryClient();
  const [selectedApp, setSelectedApp] = useState<Application | null>(null);
  const [historyModalOpen, setHistoryModalOpen] = useState(false);
  const [withdrawModalOpen, setWithdrawModalOpen] = useState(false);
  const [withdrawReason, setWithdrawReason] = useState('');

  const { data: pagedApps, isLoading } = useQuery({
    queryKey: ['candidateApplications'],
    queryFn: () => applicationService.getCandidateApplications(0, 50),
  });

  const { data: history = [], isLoading: historyLoading } = useQuery({
    queryKey: ['applicationHistory', selectedApp?.id],
    queryFn: () => applicationService.getApplicationHistory(selectedApp!.id, 'candidate'),
    enabled: !!selectedApp && historyModalOpen,
  });

  const withdrawMutation = useMutation({
    mutationFn: () => applicationService.withdrawApplication(selectedApp!.id, withdrawReason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['candidateApplications'] });
      setWithdrawModalOpen(false);
      setSelectedApp(null);
    },
  });

  const applications = pagedApps?.content || [];

  const handleOpenHistory = (app: Application) => {
    setSelectedApp(app);
    setHistoryModalOpen(true);
  };

  const handleOpenWithdraw = (app: Application) => {
    setSelectedApp(app);
    setWithdrawReason('');
    setWithdrawModalOpen(true);
  };

  const stagesInOrder: { status: ApplicationStatus; label: string }[] = [
    { status: 'SUBMITTED', label: 'Submitted' },
    { status: 'UNDER_REVIEW', label: 'Under Review' },
    { status: 'SHORTLISTED', label: 'Shortlisted' },
    { status: 'INTERVIEW', label: 'Interview' },
    { status: 'OFFERED', label: 'Offer Extended' },
    { status: 'HIRED', label: 'Hired' },
  ];

  const getStageIndex = (currentStatus: string): number => {
    switch (currentStatus) {
      case 'SUBMITTED':
        return 0;
      case 'UNDER_REVIEW':
        return 1;
      case 'SHORTLISTED':
        return 2;
      case 'INTERVIEW':
        return 3;
      case 'OFFERED':
        return 4;
      case 'HIRED':
        return 5;
      default:
        return -1;
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200/90 shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">My Applications</h1>
            <span className="px-2 py-0.5 rounded text-xs font-bold uppercase tracking-wider bg-primary-50 text-primary-700 border border-primary-200">
              {applications.length} Active Dossiers
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Real-time pipeline transparency, eligibility screening findings, and interview scheduling statuses.
          </p>
        </div>
      </div>

      {isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((n) => (
            <div key={n} className="h-44 bg-slate-200/60 rounded-xl animate-pulse"></div>
          ))}
        </div>
      ) : applications.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl border border-slate-200 shadow-sm space-y-3">
          <Briefcase className="w-12 h-12 text-slate-300 mx-auto" />
          <h3 className="text-base font-bold text-slate-800">No applications submitted yet</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Browse our open corporate requisitions and submit your credentials for consideration.
          </p>
        </div>
      ) : (
        <div className="space-y-5">
          {applications.map((app) => {
            const currentStageIdx = getStageIndex(app.applicationStatus || app.status || '');
            const isTerminalNegative =
              app.applicationStatus === 'REJECTED' ||
              app.applicationStatus === 'WITHDRAWN' ||
              app.applicationStatus === 'OFFER_DECLINED';

            const canWithdraw =
              !isTerminalNegative && app.applicationStatus !== 'HIRED';

            return (
              <div
                key={app.id}
                className="bg-white p-6 rounded-2xl border border-slate-200/90 shadow-sm hover:border-slate-300 transition space-y-5"
              >
                {/* Header Information */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-100">
                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="font-bold text-lg text-slate-900 tracking-tight">{app.jobTitle}</h3>
                      <span className="text-slate-300">•</span>
                      <span className="text-xs font-bold text-slate-600 flex items-center gap-1.5">
                        <Building2 className="w-3.5 h-3.5 text-primary-600" /> {app.companyName}
                      </span>
                    </div>

                    <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500">
                      <span className="flex items-center gap-1 font-mono text-[11px]">
                        <Calendar className="w-3.5 h-3.5 text-slate-400" /> Applied on{' '}
                        {new Date(app.submittedAt || app.appliedAt || Date.now()).toLocaleDateString()}
                      </span>
                      {app.resumeFilename && (
                        <span className="flex items-center gap-1 text-[11px]">
                          <FileText className="w-3.5 h-3.5 text-slate-400" /> Stored Resume: {app.resumeFilename}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-start md:self-auto">
                    <Button variant="outline" size="sm" onClick={() => handleOpenHistory(app)}>
                      <History className="w-3.5 h-3.5 mr-1" /> View Timeline
                    </Button>
                    {canWithdraw && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleOpenWithdraw(app)}
                        className="text-rose-600 hover:bg-rose-50 hover:text-rose-700 text-xs"
                      >
                        Withdraw
                      </Button>
                    )}
                  </div>
                </div>

                {/* Interactive Horizontal Pipeline Stepper */}
                <div className="py-2">
                  <div className="flex items-center justify-between text-xs font-bold text-slate-400 mb-2">
                    <span className="text-[11px] uppercase tracking-wider text-slate-500">
                      Recruitment Stage Progression
                    </span>
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] text-slate-500">Current Status:</span>
                      <StatusBadge status={app.applicationStatus || app.status} />
                    </div>
                  </div>

                  {isTerminalNegative ? (
                    <div className="rounded-xl border border-rose-200 bg-rose-50/70 p-3.5 flex items-center justify-between">
                      <div className="flex items-center gap-2 text-rose-800 text-xs font-semibold">
                        <XCircle className="w-4 h-4 text-rose-600 shrink-0" />
                        <span>
                          Application concluded as <strong>{app.applicationStatus}</strong>
                        </span>
                      </div>
                      <span className="text-[11px] text-rose-600 font-medium">Review Complete</span>
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 sm:grid-cols-6 gap-2 pt-1">
                      {stagesInOrder.map((stage, idx) => {
                        const isCompleted = currentStageIdx >= idx;
                        const isCurrent = currentStageIdx === idx;

                        return (
                          <div
                            key={stage.status}
                            className={`p-2.5 rounded-lg border text-center transition ${
                              isCurrent
                                ? 'bg-primary-50 border-primary-400 text-primary-900 shadow-xs'
                                : isCompleted
                                ? 'bg-slate-50 border-slate-200 text-slate-700'
                                : 'bg-slate-50/40 border-slate-100 text-slate-400'
                            }`}
                          >
                            <div className="flex items-center justify-center mb-1">
                              {isCompleted ? (
                                <CheckCircle2 className={`w-3.5 h-3.5 ${isCurrent ? 'text-primary-600' : 'text-emerald-500'}`} />
                              ) : (
                                <Circle className="w-3.5 h-3.5 text-slate-300" />
                              )}
                            </div>
                            <span className="text-[11px] font-bold block truncate">
                              {stage.label}
                            </span>
                            <span className="text-[9px] uppercase tracking-wider font-semibold opacity-70 block mt-0.5">
                              {isCurrent ? 'Current' : isCompleted ? 'Completed' : 'Upcoming'}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* Eligibility Screening Findings Box */}
                {app.eligibilityReasons && (
                  <div className="text-xs bg-slate-50 p-3 rounded-xl border border-slate-200/70 text-slate-600 flex items-start gap-2.5">
                    <span className="font-bold text-slate-800 shrink-0">Automated Screening Findings:</span>
                    <span className="text-slate-600 leading-relaxed">{app.eligibilityReasons}</span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* History Timeline Modal */}
      <Modal
        isOpen={historyModalOpen}
        onClose={() => setHistoryModalOpen(false)}
        title={`Application History: ${selectedApp?.jobTitle}`}
        maxWidth="lg"
      >
        <div className="space-y-4">
          {historyLoading ? (
            <div className="p-8 text-center text-xs text-slate-500">Loading audit history timeline...</div>
          ) : history.length === 0 ? (
            <div className="p-4 text-center text-xs text-slate-500">No status changes recorded yet.</div>
          ) : (
            <div className="relative border-l-2 border-slate-200 ml-4 pl-4 space-y-6">
              {history.map((h) => (
                <div key={h.id} className="relative">
                  <div className="absolute -left-[25px] top-1 w-3.5 h-3.5 bg-primary-600 rounded-full border-2 border-white shadow-xs"></div>
                  <div>
                    <div className="flex items-center gap-2">
                      <StatusBadge status={h.newStatus} />
                      <span className="text-xs text-slate-500">by {h.changedByName || 'System'}</span>
                    </div>
                    <p className="text-xs text-slate-700 mt-1">{h.changeReason || 'Stage transitioned'}</p>
                    <span className="text-[11px] text-slate-400 font-mono mt-0.5 block">
                      {new Date(h.createdAt || h.changedAt || Date.now()).toLocaleString()}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </Modal>

      {/* Withdraw Modal */}
      <Modal
        isOpen={withdrawModalOpen}
        onClose={() => setWithdrawModalOpen(false)}
        title="Withdraw Application"
      >
        <div className="space-y-4 text-xs">
          <div className="p-3 bg-amber-50 text-amber-800 rounded-xl text-xs flex items-center gap-2 border border-amber-200">
            <AlertTriangle className="w-5 h-5 shrink-0 text-amber-600" />
            <span>
              Withdrawing your application will terminate active review for this position. This action cannot be undone.
            </span>
          </div>

          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-600 mb-1">
              Reason for Withdrawal (Optional)
            </label>
            <textarea
              rows={3}
              value={withdrawReason}
              onChange={(e) => setWithdrawReason(e.target.value)}
              placeholder="e.g. Accepted another offer, relocation, etc."
              className="w-full p-2.5 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
            <Button variant="outline" size="sm" onClick={() => setWithdrawModalOpen(false)}>
              Keep Application
            </Button>
            <Button
              variant="danger"
              size="sm"
              onClick={() => withdrawMutation.mutate()}
              isLoading={withdrawMutation.isPending}
            >
              Confirm Withdrawal
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default CandidateApplicationsPage;
