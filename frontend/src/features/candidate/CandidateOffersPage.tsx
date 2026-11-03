import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { candidateApi } from '../../services/apiServices';
import { Offer } from '../../types';
import StatusBadge from '../../components/common/StatusBadge';
import Button from '../../components/common/Button';
import Modal from '../../components/common/Modal';
import { Award, DollarSign, Calendar, FileText, CheckCircle2, XCircle, AlertCircle } from 'lucide-react';

export default function CandidateOffersPage() {
  const queryClient = useQueryClient();
  const [selectedOffer, setSelectedOffer] = useState<Offer | null>(null);
  const [modalAction, setModalAction] = useState<'accept' | 'decline' | null>(null);
  const [declineReason, setDeclineReason] = useState('');
  const [actionError, setActionError] = useState<string | null>(null);

  const { data: offersData, isLoading, error } = useQuery({
    queryKey: ['candidate-offers'],
    queryFn: async () => {
      const res = await candidateApi.getOffers();
      return res.data.data;
    },
  });

  const offers: Offer[] = Array.isArray(offersData)
    ? offersData
    : (offersData as any)?.content || [];

  const acceptMutation = useMutation({
    mutationFn: (offerId: string) => candidateApi.acceptOffer(offerId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['candidate-offers'] });
      setModalAction(null);
      setSelectedOffer(null);
    },
    onError: (err: any) => {
      setActionError(err.response?.data?.message || 'Failed to accept offer');
    },
  });

  const declineMutation = useMutation({
    mutationFn: ({ offerId, reason }: { offerId: string; reason: string }) =>
      candidateApi.declineOffer(offerId, reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['candidate-offers'] });
      setModalAction(null);
      setSelectedOffer(null);
      setDeclineReason('');
    },
    onError: (err: any) => {
      setActionError(err.response?.data?.message || 'Failed to decline offer');
    },
  });

  const handleConfirmAction = () => {
    if (!selectedOffer) return;
    setActionError(null);
    if (modalAction === 'accept') {
      acceptMutation.mutate(selectedOffer.id);
    } else if (modalAction === 'decline') {
      if (!declineReason.trim()) {
        setActionError('Please provide a reason for declining.');
        return;
      }
      declineMutation.mutate({ offerId: selectedOffer.id, reason: declineReason });
    }
  };

  return (
    <div className="space-y-6">
      <div className="border-b border-gray-200 pb-5">
        <h1 className="text-2xl font-bold leading-7 text-gray-900 sm:truncate sm:text-3xl">
          Job Offers
        </h1>
        <p className="mt-1 text-sm text-gray-500">
          Review, accept, or decline employment offers extended by recruiting companies.
        </p>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary-600 border-t-transparent" />
        </div>
      ) : error ? (
        <div className="rounded-md bg-red-50 p-4 text-sm text-red-700">
          Failed to load offers. Please try again.
        </div>
      ) : !offers || offers.length === 0 ? (
        <div className="rounded-lg border-2 border-dashed border-gray-300 p-12 text-center">
          <Award className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-semibold text-gray-900">No job offers yet</h3>
          <p className="mt-1 text-sm text-gray-500">
            When a company decides to make you an official job offer, it will appear here.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {offers.map((offer) => {
            const isIssued = offer.status === 'ISSUED';
            const isExpired = offer.expirationDate && new Date(offer.expirationDate) < new Date();

            return (
              <div
                key={offer.id}
                className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm transition hover:shadow-md"
              >
                <div className="border-b border-gray-100 bg-gray-50/50 px-6 py-4 flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-bold text-gray-900">{offer.jobTitle}</h3>
                    <p className="text-sm font-medium text-primary-700">{offer.companyName}</p>
                  </div>
                  <StatusBadge status={offer.status} />
                </div>

                <div className="p-6 space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="rounded-lg bg-emerald-50 p-3">
                      <div className="flex items-center text-xs font-semibold text-emerald-800 uppercase tracking-wider">
                        <DollarSign className="mr-1 h-4 w-4" /> Compensation
                      </div>
                      <div className="mt-1 text-xl font-bold text-emerald-900">
                        {offer.currency} {Number(offer.salary).toLocaleString()}
                      </div>
                    </div>

                    <div className="rounded-lg bg-blue-50 p-3">
                      <div className="flex items-center text-xs font-semibold text-blue-800 uppercase tracking-wider">
                        <Calendar className="mr-1 h-4 w-4" /> Start Date
                      </div>
                      <div className="mt-1 text-sm font-bold text-blue-900">
                        {new Date(offer.startDate).toLocaleDateString(undefined, {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                        })}
                      </div>
                    </div>
                  </div>

                  {offer.expirationDate && (
                    <div className="flex items-center text-xs text-gray-500">
                      <AlertCircle className="mr-1.5 h-4 w-4 text-amber-500" />
                      <span>
                        Offer valid until:{' '}
                        <strong>
                          {new Date(offer.expirationDate).toLocaleDateString(undefined, {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric',
                          })}
                        </strong>
                      </span>
                    </div>
                  )}

                  {offer.terms && (
                    <div className="rounded-md border border-gray-100 bg-gray-50 p-3 text-xs text-gray-600">
                      <div className="font-semibold text-gray-700 mb-1 flex items-center">
                        <FileText className="mr-1 h-3.5 w-3.5" /> Terms & Conditions:
                      </div>
                      <p className="line-clamp-3 whitespace-pre-line">{offer.terms}</p>
                    </div>
                  )}

                  {offer.candidateNotes && (
                    <div className="text-xs text-gray-500 italic">
                      Response notes: "{offer.candidateNotes}"
                    </div>
                  )}

                  {isIssued && !isExpired && (
                    <div className="flex space-x-3 pt-2">
                      <Button
                        variant="primary"
                        className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white"
                        onClick={() => {
                          setSelectedOffer(offer);
                          setModalAction('accept');
                        }}
                      >
                        <CheckCircle2 className="mr-2 h-4 w-4" /> Accept Offer
                      </Button>
                      <Button
                        variant="danger"
                        className="flex-1"
                        onClick={() => {
                          setSelectedOffer(offer);
                          setModalAction('decline');
                        }}
                      >
                        <XCircle className="mr-2 h-4 w-4" /> Decline
                      </Button>
                    </div>
                  )}

                  {isIssued && isExpired && (
                    <div className="rounded-md bg-amber-50 p-3 text-xs font-medium text-amber-800 text-center">
                      This offer has expired.
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Confirmation Modal */}
      <Modal
        isOpen={modalAction !== null}
        onClose={() => {
          setModalAction(null);
          setSelectedOffer(null);
          setActionError(null);
        }}
        title={modalAction === 'accept' ? 'Accept Job Offer' : 'Decline Job Offer'}
      >
        <div className="space-y-4">
          {actionError && (
            <div className="rounded-md bg-red-50 p-3 text-sm text-red-700">{actionError}</div>
          )}

          {modalAction === 'accept' ? (
            <div>
              <p className="text-sm text-gray-600">
                You are about to accept the offer for <strong>{selectedOffer?.jobTitle}</strong> at{' '}
                <strong>{selectedOffer?.companyName}</strong> with an annual compensation of{' '}
                <strong>
                  {selectedOffer?.currency} {Number(selectedOffer?.salary).toLocaleString()}
                </strong>
                .
              </p>
              <p className="mt-3 text-xs text-gray-500">
                Once accepted, your status will become <strong>HIRED</strong> and all other active
                applications for this position will be formalized.
              </p>
            </div>
          ) : (
            <div>
              <p className="text-sm text-gray-600">
                Are you sure you want to decline this offer from{' '}
                <strong>{selectedOffer?.companyName}</strong>?
              </p>
              <div className="mt-4">
                <label className="block text-xs font-semibold text-gray-700 uppercase">
                  Reason for Declining *
                </label>
                <textarea
                  rows={3}
                  className="mt-1 block w-full rounded-md border border-gray-300 p-2 text-sm shadow-sm focus:border-primary-500 focus:ring-primary-500"
                  placeholder="e.g., Accepted another offer, compensation expectations not met, etc."
                  value={declineReason}
                  onChange={(e) => setDeclineReason(e.target.value)}
                />
              </div>
            </div>
          )}

          <div className="mt-5 flex justify-end space-x-3">
            <Button
              variant="outline"
              onClick={() => {
                setModalAction(null);
                setSelectedOffer(null);
              }}
            >
              Cancel
            </Button>
            <Button
              variant={modalAction === 'accept' ? 'primary' : 'danger'}
              loading={acceptMutation.isPending || declineMutation.isPending}
              onClick={handleConfirmAction}
            >
              {modalAction === 'accept' ? 'Confirm Acceptance' : 'Decline Offer'}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
