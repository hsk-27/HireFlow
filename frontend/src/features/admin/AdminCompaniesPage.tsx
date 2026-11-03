import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useSearchParams } from 'react-router-dom';
import { adminApi } from '../../services/apiServices';
import { Company, CompanyStatus } from '../../types';
import Button from '../../components/common/Button';
import Modal from '../../components/common/Modal';
import StatusBadge from '../../components/common/StatusBadge';
import Pagination from '../../components/common/Pagination';
import { Building2, CheckCircle2, XCircle, Ban, Globe, ExternalLink, AlertCircle } from 'lucide-react';

export default function AdminCompaniesPage() {
  const queryClient = useQueryClient();
  const [searchParams, setSearchParams] = useSearchParams();
  const initialStatus = searchParams.get('status') || '';

  const [page, setPage] = useState(0);
  const [statusFilter, setStatusFilter] = useState<string>(initialStatus);
  const [rejectingCompany, setRejectingCompany] = useState<Company | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [actionError, setActionError] = useState<string | null>(null);

  const { data: companiesResponse, isLoading, error } = useQuery({
    queryKey: ['admin-companies-list', page, statusFilter],
    queryFn: async () => {
      const res = await adminApi.getCompanies({
        page,
        size: 10,
        status: statusFilter || undefined,
      });
      return res.data.data;
    },
  });

  const approveMutation = useMutation({
    mutationFn: (companyId: string) => adminApi.approveCompany(companyId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-companies-list'] });
    },
    onError: (err: any) => {
      alert(err.response?.data?.message || 'Failed to approve company');
    },
  });

  const rejectMutation = useMutation({
    mutationFn: ({ companyId, reason }: { companyId: string; reason: string }) =>
      adminApi.rejectCompany(companyId, reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-companies-list'] });
      setRejectingCompany(null);
      setRejectionReason('');
    },
    onError: (err: any) => {
      setActionError(err.response?.data?.message || 'Failed to reject company');
    },
  });

  const suspendMutation = useMutation({
    mutationFn: (companyId: string) => adminApi.suspendCompany(companyId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-companies-list'] });
    },
    onError: (err: any) => {
      alert(err.response?.data?.message || 'Failed to suspend company');
    },
  });

  const handleConfirmReject = () => {
    if (!rejectingCompany) return;
    if (!rejectionReason.trim()) {
      setActionError('Please provide a reason for rejection.');
      return;
    }
    setActionError(null);
    rejectMutation.mutate({ companyId: rejectingCompany.id, reason: rejectionReason });
  };

  const companies = companiesResponse?.content || [];
  const totalPages = companiesResponse?.totalPages || 0;

  return (
    <div className="space-y-6">
      <div className="border-b border-gray-200 pb-5">
        <h1 className="text-2xl font-bold leading-7 text-gray-900 sm:truncate sm:text-3xl">
          Employer Organization Directory
        </h1>
        <p className="mt-1 text-sm text-gray-500">
          Verify corporate identities, govern platform hiring rights, and enforce tenant security.
        </p>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap gap-2">
        {['', 'PENDING', 'APPROVED', 'REJECTED', 'SUSPENDED'].map((st) => (
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
            {st === '' ? 'All Organizations' : st}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary-600 border-t-transparent" />
        </div>
      ) : error ? (
        <div className="rounded-md bg-red-50 p-4 text-sm text-red-700">
          Failed to load company directory.
        </div>
      ) : companies.length === 0 ? (
        <div className="rounded-lg border-2 border-dashed border-gray-300 p-12 text-center bg-white">
          <Building2 className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-semibold text-gray-900">No organizations found</h3>
          <p className="mt-1 text-sm text-gray-500">
            No company registrations match the selected status filter.
          </p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
          <table className="min-w-full divide-y divide-gray-200 text-left text-sm">
            <thead className="bg-gray-50 text-xs font-semibold uppercase tracking-wider text-gray-500">
              <tr>
                <th className="px-6 py-3">Company Legal Name</th>
                <th className="px-6 py-3">Website & Domain</th>
                <th className="px-6 py-3">Industry / Size</th>
                <th className="px-6 py-3">Verification Status</th>
                <th className="px-6 py-3">Created</th>
                <th className="px-6 py-3 text-right">Administrative Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white">
              {companies.map((c) => (
                <tr key={c.id} className="hover:bg-gray-50/70 transition">
                  <td className="px-6 py-4">
                    <div className="font-bold text-gray-900">{c.name}</div>
                    <div className="text-xs text-gray-400">ID: {c.id.slice(0, 8)}...</div>
                  </td>
                  <td className="px-6 py-4">
                    {c.website ? (
                      <a
                        href={c.website.startsWith('http') ? c.website : `https://${c.website}`}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center text-xs text-primary-600 hover:text-primary-800"
                      >
                        <Globe className="mr-1 h-3.5 w-3.5" />
                        {c.website.replace(/^https?:\/\//, '')}
                      </a>
                    ) : (
                      <span className="text-xs text-gray-400">None provided</span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-xs font-medium text-gray-900">{c.industry || 'Unspecified'}</div>
                    <div className="text-xs text-gray-500">{c.companySize || 'Size unknown'}</div>
                  </td>
                  <td className="px-6 py-4">
                    <StatusBadge status={c.status} />
                  </td>
                  <td className="px-6 py-4 text-xs text-gray-500">
                    {new Date(c.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 text-right space-x-2">
                    {c.status === 'PENDING' && (
                      <>
                        <button
                          onClick={() => approveMutation.mutate(c.id)}
                          disabled={approveMutation.isPending}
                          className="inline-flex items-center rounded bg-emerald-600 px-2.5 py-1 text-xs font-semibold text-white hover:bg-emerald-700 shadow-sm"
                        >
                          <CheckCircle2 className="mr-1 h-3.5 w-3.5" /> Approve
                        </button>
                        <button
                          onClick={() => setRejectingCompany(c)}
                          className="inline-flex items-center rounded bg-rose-50 px-2 py-1 text-xs font-medium text-rose-700 hover:bg-rose-100"
                        >
                          <XCircle className="mr-1 h-3.5 w-3.5" /> Reject
                        </button>
                      </>
                    )}

                    {c.status === 'APPROVED' && (
                      <button
                        onClick={() => {
                          if (confirm(`Are you sure you want to suspend hiring rights for ${c.name}?`)) {
                            suspendMutation.mutate(c.id);
                          }
                        }}
                        className="inline-flex items-center rounded bg-amber-50 px-2 py-1 text-xs font-medium text-amber-700 hover:bg-amber-100"
                      >
                        <Ban className="mr-1 h-3.5 w-3.5" /> Suspend
                      </button>
                    )}

                    {(c.status === 'SUSPENDED' || c.status === 'REJECTED') && (
                      <button
                        onClick={() => approveMutation.mutate(c.id)}
                        className="inline-flex items-center rounded bg-emerald-50 px-2 py-1 text-xs font-medium text-emerald-700 hover:bg-emerald-100"
                      >
                        Re-Approve
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <Pagination currentPage={page} totalPages={totalPages} onPageChange={(p) => setPage(p)} />
        </div>
      )}

      {/* Reject Modal */}
      <Modal
        isOpen={rejectingCompany !== null}
        onClose={() => {
          setRejectingCompany(null);
          setRejectionReason('');
          setActionError(null);
        }}
        title="Reject Company Application"
      >
        <div className="space-y-4">
          {actionError && (
            <div className="rounded-md bg-red-50 p-3 text-sm text-red-700 flex items-center">
              <AlertCircle className="mr-2 h-4 w-4 shrink-0" />
              <span>{actionError}</span>
            </div>
          )}

          <p className="text-sm text-gray-600">
            You are rejecting the registration for <strong>{rejectingCompany?.name}</strong>. Please
            provide the official reason for the rejection record.
          </p>

          <div>
            <label className="block text-xs font-semibold text-gray-700 uppercase">
              Rejection Reason *
            </label>
            <textarea
              rows={3}
              required
              className="mt-1 block w-full rounded-md border border-gray-300 p-2 text-sm shadow-sm"
              placeholder="e.g., Incomplete business registration documents, unverifiable domain, etc."
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
            />
          </div>

          <div className="mt-5 flex justify-end space-x-3">
            <Button
              variant="outline"
              onClick={() => {
                setRejectingCompany(null);
                setRejectionReason('');
              }}
            >
              Cancel
            </Button>
            <Button
              variant="danger"
              loading={rejectMutation.isPending}
              onClick={handleConfirmReject}
            >
              Confirm Rejection
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
