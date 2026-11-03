import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { applicationService } from '@/services/apiServices';
import { Application, ApplicationStatusHistory } from '@/types';
import { StatusBadge } from '@/components/common/Badge';
import { Button } from '@/components/common/Button';
import { Modal } from '@/components/common/Modal';
import { Briefcase, Building2, Calendar, Clock, History, AlertTriangle, FileText } from 'lucide-react';

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

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <div className="bg-white p-6 sm:p-8 rounded-xl border border-slate-200 shadow-sm flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">My Job Applications</h1>
          <p className="text-sm text-slate-500 mt-1">
            Track real-time candidate review stages, eligibility evaluations, and status timelines.
          </p>
        </div>
      </div>

      {isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((n) => (
            <div key={n} className="h-32 bg-slate-200 rounded-xl animate-pulse"></div>
          ))}
        </div>
      ) : applications.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-xl border border-slate-200 space-y-3">
          <Briefcase className="w-12 h-12 text-slate-400 mx-auto" />
          <h3 className="text-lg font-bold text-slate-800">No applications submitted yet</h3>
          <p className="text-sm text-slate-500 max-w-sm mx-auto">
            Browse our open positions and submit your profile for review.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {applications.map((app) => {
            const canWithdraw =
              app.applicationStatus !== 'HIRED' &&
              app.applicationStatus !== 'REJECTED' &&
              app.applicationStatus !== 'WITHDRAWN' &&
              app.applicationStatus !== 'OFFER_DECLINED';

            return (
              <div
                key={app.id}
                className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6 hover:border-slate-300 transition"
              >
                <div className="space-y-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="font-bold text-lg text-slate-900">{app.jobTitle}</h3>
                    <span>•</span>
                    <span className="text-sm font-semibold text-slate-600 flex items-center gap-1">
                      <Building2 className="w-4 h-4 text-slate-400" /> {app.companyName}
                    </span>
                  </div>

                  <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5 text-slate-400" /> Submitted on{' '}
                      {new Date(app.submittedAt || app.appliedAt || Date.now()).toLocaleDateString()}
                    </span>
                    <span className="flex items-center gap-1">
                      <FileText className="w-3.5 h-3.5 text-slate-400" /> Resume: {app.resumeFilename}
                    </span>
                  </div>

                  {app.eligibilityReasons && (
                    <div className="mt-2 text-xs bg-slate-50 p-2.5 rounded-lg border border-slate-100 text-slate-600 max-w-2xl">
                      <span className="font-semibold text-slate-700">Eligibility Analysis: </span>
                      {app.eligibilityReasons}
                    </div>
                  )}
                </div>

                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 shrink-0">
                  <div className="space-y-1 sm:text-right">
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-slate-400">Eligibility:</span>
                      <StatusBadge status={app.eligibilityStatus} />
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-slate-400">Status:</span>
                      <StatusBadge status={app.applicationStatus} />
                    </div>
                  </div>

                  <div className="flex items-center gap-2 pt-2 sm:pt-0">
                    <Button variant="outline" size="sm" onClick={() => handleOpenHistory(app)}>
                      <History className="w-4 h-4 mr-1" /> History
                    </Button>
                    {canWithdraw && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleOpenWithdraw(app)}
                        className="text-rose-600 hover:bg-rose-50 hover:text-rose-700"
                      >
                        Withdraw
                      </Button>
                    )}
                  </div>
                </div>
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
            <div className="p-8 text-center text-sm text-slate-500">Loading history timeline...</div>
          ) : history.length === 0 ? (
            <div className="p-4 text-center text-sm text-slate-500">No status changes recorded yet.</div>
          ) : (
            <div className="relative border-l-2 border-slate-200 ml-4 pl-4 space-y-6">
              {history.map((h) => (
                <div key={h.id} className="relative">
                  <div className="absolute -left-[25px] top-1 w-3.5 h-3.5 bg-primary-600 rounded-full border-2 border-white"></div>
                  <div>
                    <div className="flex items-center gap-2">
                      <StatusBadge status={h.newStatus} />
                      <span className="text-xs text-slate-400">by {h.changedByName}</span>
                    </div>
                    <p className="text-xs text-slate-600 mt-1">{h.changeReason || 'Status transitioned'}</p>
                    <span className="text-[11px] text-slate-400 mt-1 block">
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
        <div className="space-y-4">
          <div className="p-3 bg-amber-50 text-amber-800 rounded-lg text-xs flex items-center gap-2 border border-amber-200">
            <AlertTriangle className="w-5 h-5 shrink-0" />
            <span>
              Withdrawing your application will terminate active review for this position. This action cannot be undone.
            </span>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Reason for Withdrawal (Optional)</label>
            <textarea
              rows={3}
              value={withdrawReason}
              onChange={(e) => setWithdrawReason(e.target.value)}
              placeholder="e.g. Accepted another offer, relocating, etc."
              className="w-full p-2.5 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
            <Button variant="outline" onClick={() => setWithdrawModalOpen(false)}>
              Keep Application
            </Button>
            <Button
              variant="danger"
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

