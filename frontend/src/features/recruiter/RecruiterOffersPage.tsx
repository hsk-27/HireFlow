import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { recruiterApi } from '../../services/apiServices';
import { Offer, Application } from '../../types';
import Button from '../../components/common/Button';
import Modal from '../../components/common/Modal';
import StatusBadge from '../../components/common/StatusBadge';
import { Award, Plus, DollarSign, Calendar, FileText, AlertCircle, Ban } from 'lucide-react';

export default function RecruiterOffersPage() {
  const queryClient = useQueryClient();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const [offerForm, setOfferForm] = useState({
    applicationId: '',
    salary: '',
    currency: 'USD',
    startDate: '',
    expirationDate: '',
    terms: 'Full medical, 401(k) matching, 20 days PTO, and standard company equity vesting.',
  });

  const { data: offersData, isLoading, error } = useQuery({
    queryKey: ['recruiter-offers'],
    queryFn: async () => {
      const res = await recruiterApi.getCompanyOffers();
      return res.data.data;
    },
  });

  const offers: Offer[] = Array.isArray(offersData)
    ? offersData
    : (offersData as any)?.content || [];

  const { data: eligibleApps } = useQuery({
    queryKey: ['recruiter-offer-eligible-apps'],
    queryFn: async () => {
      const res = await recruiterApi.getApplications({ page: 0, size: 100 });
      return (
        res.data.data.content?.filter((a: Application) =>
          ['INTERVIEW', 'SHORTLISTED', 'UNDER_REVIEW'].includes(a.status)
        ) || []
      );
    },
  });

  const createOfferMutation = useMutation({
    mutationFn: (payload: any) => recruiterApi.createOffer(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['recruiter-offers'] });
      setIsCreateModalOpen(false);
      setOfferForm({
        applicationId: '',
        salary: '',
        currency: 'USD',
        startDate: '',
        expirationDate: '',
        terms: '',
      });
      setFormError(null);
    },
    onError: (err: any) => {
      setFormError(err.response?.data?.message || 'Failed to create offer');
    },
  });

  const withdrawMutation = useMutation({
    mutationFn: ({ offerId, reason }: { offerId: string; reason: string }) =>
      recruiterApi.withdrawOffer(offerId, reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['recruiter-offers'] });
    },
    onError: (err: any) => {
      alert(err.response?.data?.message || 'Failed to withdraw offer');
    },
  });

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!offerForm.applicationId || !offerForm.salary || !offerForm.startDate) {
      setFormError('Please fill in candidate, salary, and start date');
      return;
    }

    createOfferMutation.mutate({
      applicationId: offerForm.applicationId,
      salary: Number(offerForm.salary),
      currency: offerForm.currency,
      startDate: offerForm.startDate,
      expirationDate: offerForm.expirationDate || null,
      terms: offerForm.terms,
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b border-gray-200 pb-5 gap-4">
        <div>
          <h1 className="text-2xl font-bold leading-7 text-gray-900 sm:truncate sm:text-3xl">
            Offer Management
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Extend official offers of employment, track candidate acceptances, and audit negotiations.
          </p>
        </div>
        <div>
          <Button variant="primary" onClick={() => setIsCreateModalOpen(true)}>
            <Plus className="mr-2 h-4 w-4" /> Issue Job Offer
          </Button>
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary-600 border-t-transparent" />
        </div>
      ) : error ? (
        <div className="rounded-md bg-red-50 p-4 text-sm text-red-700">Failed to load offers.</div>
      ) : !offers || offers.length === 0 ? (
        <div className="rounded-lg border-2 border-dashed border-gray-300 p-12 text-center bg-white">
          <Award className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-semibold text-gray-900">No offers issued</h3>
          <p className="mt-1 text-sm text-gray-500">
            Ready to hire? Issue an employment offer to a successful candidate.
          </p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
          <table className="min-w-full divide-y divide-gray-200 text-left text-sm">
            <thead className="bg-gray-50 text-xs font-semibold uppercase tracking-wider text-gray-500">
              <tr>
                <th className="px-6 py-3">Candidate / Role</th>
                <th className="px-6 py-3">Compensation</th>
                <th className="px-6 py-3">Start Date</th>
                <th className="px-6 py-3">Status</th>
                <th className="px-6 py-3">Issued Date</th>
                <th className="px-6 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white">
              {offers.map((offer) => (
                <tr key={offer.id} className="hover:bg-gray-50/70 transition">
                  <td className="px-6 py-4">
                    <div className="font-bold text-gray-900">{offer.candidateName}</div>
                    <div className="text-xs text-gray-500">{offer.jobTitle}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="font-semibold text-gray-900">
                      {offer.currency} {Number(offer.salary).toLocaleString()}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-700">
                    {new Date(offer.startDate).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4">
                    <StatusBadge status={offer.status} />
                  </td>
                  <td className="px-6 py-4 text-xs text-gray-500">
                    {offer.issuedAt ? new Date(offer.issuedAt).toLocaleDateString() : 'Draft'}
                  </td>
                  <td className="px-6 py-4 text-right">
                    {(offer.status === 'DRAFT' || offer.status === 'ISSUED') && (
                      <button
                        onClick={() => {
                          const reason = prompt('Reason for withdrawing offer:');
                          if (reason) {
                            withdrawMutation.mutate({ offerId: offer.id, reason });
                          }
                        }}
                        className="inline-flex items-center rounded bg-rose-50 px-2 py-1 text-xs font-medium text-rose-700 hover:bg-rose-100"
                      >
                        <Ban className="mr-1 h-3 w-3" /> Withdraw
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Create Offer Modal */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => {
          setIsCreateModalOpen(false);
          setFormError(null);
        }}
        title="Issue Employment Offer"
        size="md"
      >
        <form onSubmit={handleCreateSubmit} className="space-y-4">
          {formError && (
            <div className="rounded-md bg-red-50 p-3 text-sm text-red-700 flex items-center">
              <AlertCircle className="mr-2 h-4 w-4 shrink-0" />
              <span>{formError}</span>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-gray-700 uppercase">
              Candidate Application *
            </label>
            <select
              required
              className="mt-1 block w-full rounded-md border border-gray-300 p-2 text-sm shadow-sm"
              value={offerForm.applicationId}
              onChange={(e) => setOfferForm({ ...offerForm, applicationId: e.target.value })}
            >
              <option value="">Select candidate to extend offer to...</option>
              {eligibleApps?.map((a: Application) => (
                <option key={a.id} value={a.id}>
                  {a.candidateName} — {a.jobTitle} ({a.status})
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-700 uppercase">
                Base Salary *
              </label>
              <input
                type="number"
                required
                placeholder="120000"
                className="mt-1 block w-full rounded-md border border-gray-300 p-2 text-sm shadow-sm"
                value={offerForm.salary}
                onChange={(e) => setOfferForm({ ...offerForm, salary: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-700 uppercase">
                Currency
              </label>
              <input
                type="text"
                className="mt-1 block w-full rounded-md border border-gray-300 p-2 text-sm shadow-sm"
                value={offerForm.currency}
                onChange={(e) => setOfferForm({ ...offerForm, currency: e.target.value })}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-700 uppercase">
                Anticipated Start Date *
              </label>
              <input
                type="date"
                required
                className="mt-1 block w-full rounded-md border border-gray-300 p-2 text-sm shadow-sm"
                value={offerForm.startDate}
                onChange={(e) => setOfferForm({ ...offerForm, startDate: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-700 uppercase">
                Offer Expiration Date
              </label>
              <input
                type="date"
                className="mt-1 block w-full rounded-md border border-gray-300 p-2 text-sm shadow-sm"
                value={offerForm.expirationDate}
                onChange={(e) => setOfferForm({ ...offerForm, expirationDate: e.target.value })}
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 uppercase">
              Terms & Equity / Benefits
            </label>
            <textarea
              rows={3}
              className="mt-1 block w-full rounded-md border border-gray-300 p-2 text-sm shadow-sm"
              value={offerForm.terms}
              onChange={(e) => setOfferForm({ ...offerForm, terms: e.target.value })}
            />
          </div>

          <div className="mt-5 flex justify-end space-x-3 pt-3 border-t border-gray-200">
            <Button type="button" variant="outline" onClick={() => setIsCreateModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" loading={createOfferMutation.isPending}>
              Issue Offer
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
