import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { adminApi } from '../../services/apiServices';
import { AuditLog } from '../../types';
import Pagination from '../../components/common/Pagination';
import Modal from '../../components/common/Modal';
import { Shield, Clock, User, Filter, Eye } from 'lucide-react';

export default function AdminAuditLogsPage() {
  const [page, setPage] = useState(0);
  const [actionFilter, setActionFilter] = useState('');
  const [entityTypeFilter, setEntityTypeFilter] = useState('');
  const [selectedLog, setSelectedLog] = useState<AuditLog | null>(null);

  const { data: logsResponse, isLoading, error } = useQuery({
    queryKey: ['admin-audit-logs', page, actionFilter, entityTypeFilter],
    queryFn: async () => {
      const res = await adminApi.getAuditLogs({
        page,
        size: 15,
        action: actionFilter || undefined,
        entityType: entityTypeFilter || undefined,
      });
      return res.data.data;
    },
  });

  const logs = logsResponse?.content || [];
  const totalPages = logsResponse?.totalPages || 0;

  return (
    <div className="space-y-6">
      <div className="border-b border-gray-200 pb-5">
        <h1 className="text-2xl font-bold leading-7 text-gray-900 sm:truncate sm:text-3xl">
          System Audit & Security Logs
        </h1>
        <p className="mt-1 text-sm text-gray-500">
          Immutable audit trail recording state mutations, role access events, and administrative actions.
        </p>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4 bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
        <div className="flex-1">
          <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">
            Filter by Action
          </label>
          <input
            type="text"
            placeholder="e.g., COMPANY_APPROVED, APPLICATION_SUBMITTED..."
            className="w-full rounded-md border border-gray-300 p-2 text-sm focus:border-primary-500 focus:ring-primary-500"
            value={actionFilter}
            onChange={(e) => {
              setActionFilter(e.target.value);
              setPage(0);
            }}
          />
        </div>
        <div className="flex-1">
          <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">
            Filter by Entity Type
          </label>
          <select
            className="w-full rounded-md border border-gray-300 p-2 text-sm focus:border-primary-500 focus:ring-primary-500"
            value={entityTypeFilter}
            onChange={(e) => {
              setEntityTypeFilter(e.target.value);
              setPage(0);
            }}
          >
            <option value="">All Entities</option>
            <option value="USER">USER</option>
            <option value="COMPANY">COMPANY</option>
            <option value="JOB">JOB</option>
            <option value="APPLICATION">APPLICATION</option>
            <option value="INTERVIEW">INTERVIEW</option>
            <option value="OFFER">OFFER</option>
            <option value="TALENT_LEAD">TALENT_LEAD</option>
          </select>
        </div>
      </div>

      {/* Audit Log Table */}
      {isLoading ? (
        <div className="flex justify-center py-12">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary-600 border-t-transparent" />
        </div>
      ) : error ? (
        <div className="rounded-md bg-red-50 p-4 text-sm text-red-700">
          Failed to load audit logs.
        </div>
      ) : logs.length === 0 ? (
        <div className="rounded-lg border-2 border-dashed border-gray-300 p-12 text-center bg-white">
          <Shield className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-semibold text-gray-900">No audit events found</h3>
          <p className="mt-1 text-sm text-gray-500">No events match the specified filter criteria.</p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
          <table className="min-w-full divide-y divide-gray-200 text-left text-sm font-mono text-xs">
            <thead className="bg-gray-50 text-[11px] font-semibold uppercase tracking-wider text-gray-500 font-sans">
              <tr>
                <th className="px-6 py-3">Timestamp (UTC)</th>
                <th className="px-6 py-3">Action</th>
                <th className="px-6 py-3">Entity</th>
                <th className="px-6 py-3">Actor</th>
                <th className="px-6 py-3">IP Address</th>
                <th className="px-6 py-3 text-right font-sans">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white">
              {logs.map((log) => (
                <tr key={log.id} className="hover:bg-gray-50/70 transition">
                  <td className="px-6 py-3 text-gray-500">
                    {new Date(log.performedAt).toISOString().replace('T', ' ').substring(0, 19)}
                  </td>
                  <td className="px-6 py-3 font-semibold text-primary-700">{log.action}</td>
                  <td className="px-6 py-3 text-gray-900">
                    <span className="rounded bg-gray-100 px-1.5 py-0.5 text-gray-700 font-sans font-medium text-[11px]">
                      {log.entityType}
                    </span>
                    <span className="text-gray-400 ml-1.5">#{log.entityId?.slice(0, 8)}</span>
                  </td>
                  <td className="px-6 py-3 text-gray-800 font-sans">
                    {log.performedByEmail || 'System'}
                  </td>
                  <td className="px-6 py-3 text-gray-500">{log.ipAddress || '127.0.0.1'}</td>
                  <td className="px-6 py-3 text-right font-sans">
                    {log.details ? (
                      <button
                        onClick={() => setSelectedLog(log)}
                        className="inline-flex items-center text-xs text-primary-600 hover:text-primary-800"
                      >
                        <Eye className="mr-1 h-3.5 w-3.5" /> View Payload
                      </button>
                    ) : (
                      <span className="text-gray-300">—</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <Pagination currentPage={page} totalPages={totalPages} onPageChange={(p) => setPage(p)} />
        </div>
      )}

      {/* Payload Modal */}
      <Modal
        isOpen={selectedLog !== null}
        onClose={() => setSelectedLog(null)}
        title={`Audit Event: ${selectedLog?.action}`}
      >
        <div className="space-y-4 font-sans">
          <div className="grid grid-cols-2 gap-2 text-xs bg-gray-50 p-3 rounded">
            <div>
              <strong>Entity:</strong> {selectedLog?.entityType} #{selectedLog?.entityId}
            </div>
            <div>
              <strong>Actor:</strong> {selectedLog?.performedByEmail}
            </div>
            <div>
              <strong>Timestamp:</strong> {selectedLog?.performedAt}
            </div>
            <div>
              <strong>IP:</strong> {selectedLog?.ipAddress}
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">
              Event Details / JSON Payload
            </label>
            <pre className="overflow-x-auto rounded bg-gray-900 p-3 text-xs text-emerald-400 font-mono">
              {(() => {
                try {
                  return JSON.stringify(JSON.parse(selectedLog?.details || '{}'), null, 2);
                } catch {
                  return selectedLog?.details;
                }
              })()}
            </pre>
          </div>
        </div>
      </Modal>
    </div>
  );
}
