import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { adminApi } from '../../services/apiServices';
import { Shield, Building2, Users, FileCheck2, Clock, CheckCircle2, AlertTriangle, ArrowRight } from 'lucide-react';
import StatusBadge from '../../components/common/StatusBadge';

export default function AdminDashboard() {
  const { data: companiesData, isLoading: companiesLoading } = useQuery({
    queryKey: ['admin-companies'],
    queryFn: async () => {
      const res = await adminApi.getCompanies({ page: 0, size: 50 });
      return res.data.data;
    },
  });

  const { data: auditData } = useQuery({
    queryKey: ['admin-audit-logs-summary'],
    queryFn: async () => {
      const res = await adminApi.getAuditLogs({ page: 0, size: 5 });
      return res.data.data;
    },
  });

  const companies = companiesData?.content || [];
  const pendingCompanies = companies.filter((c) => c.status === 'PENDING');
  const approvedCompanies = companies.filter((c) => c.status === 'APPROVED');
  const auditLogs = auditData?.content || [];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl">
          Platform Administration Console
        </h1>
        <p className="mt-1 text-sm text-gray-500">
          Manage corporate employer onboarding, tenant verification, and audit event logs across HireFlow.
        </p>
      </div>

      {/* Admin Stat Cards */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">
                Pending Approvals
              </p>
              <p className="mt-2 text-3xl font-extrabold text-amber-600">
                {pendingCompanies.length}
              </p>
            </div>
            <div className="rounded-xl bg-amber-50 p-3 text-amber-600">
              <Clock className="h-6 w-6" />
            </div>
          </div>
          <div className="mt-4">
            <Link
              to="/admin/companies?status=PENDING"
              className="text-xs font-semibold text-primary-600 hover:text-primary-700 flex items-center"
            >
              Review pending companies <ArrowRight className="ml-1 h-3.5 w-3.5" />
            </Link>
          </div>
        </div>

        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">
                Verified Companies
              </p>
              <p className="mt-2 text-3xl font-extrabold text-emerald-600">
                {approvedCompanies.length}
              </p>
            </div>
            <div className="rounded-xl bg-emerald-50 p-3 text-emerald-600">
              <Building2 className="h-6 w-6" />
            </div>
          </div>
          <div className="mt-4">
            <Link
              to="/admin/companies"
              className="text-xs font-semibold text-primary-600 hover:text-primary-700 flex items-center"
            >
              Browse all companies <ArrowRight className="ml-1 h-3.5 w-3.5" />
            </Link>
          </div>
        </div>

        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">
                System Security & Audit
              </p>
              <p className="mt-2 text-3xl font-extrabold text-gray-900">
                {auditData?.totalElements ?? 0}
              </p>
            </div>
            <div className="rounded-xl bg-purple-50 p-3 text-purple-600">
              <Shield className="h-6 w-6" />
            </div>
          </div>
          <div className="mt-4">
            <Link
              to="/admin/audit-logs"
              className="text-xs font-semibold text-primary-600 hover:text-primary-700 flex items-center"
            >
              Inspect audit stream <ArrowRight className="ml-1 h-3.5 w-3.5" />
            </Link>
          </div>
        </div>
      </div>

      {/* Pending Approvals Spotlight */}
      <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
        <div className="flex items-center justify-between border-b border-gray-100 pb-4">
          <div className="flex items-center space-x-2">
            <AlertTriangle className="h-5 w-5 text-amber-500" />
            <h3 className="text-base font-bold text-gray-900">
              Companies Awaiting Verification ({pendingCompanies.length})
            </h3>
          </div>
          <Link
            to="/admin/companies"
            className="text-xs font-semibold text-primary-600 hover:text-primary-700"
          >
            Manage Directory &rarr;
          </Link>
        </div>

        <div className="mt-4 divide-y divide-gray-100">
          {pendingCompanies.length === 0 ? (
            <div className="py-6 text-center text-sm text-gray-500">
              No companies currently pending verification. All registrations are up to date!
            </div>
          ) : (
            pendingCompanies.map((c) => (
              <div key={c.id} className="py-4 flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-bold text-gray-900">{c.name}</h4>
                  <p className="text-xs text-gray-500">{c.website || 'No website provided'} • {c.industry || 'Domain unlisted'}</p>
                </div>
                <div className="flex items-center space-x-3">
                  <StatusBadge status={c.status} />
                  <Link
                    to="/admin/companies"
                    className="rounded-md bg-primary-50 px-3 py-1.5 text-xs font-semibold text-primary-700 hover:bg-primary-100"
                  >
                    Review Decision
                  </Link>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Recent Audit Stream */}
      <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
        <div className="flex items-center justify-between border-b border-gray-100 pb-4">
          <h3 className="text-base font-bold text-gray-900">Recent System Activity</h3>
          <Link
            to="/admin/audit-logs"
            className="text-xs font-semibold text-primary-600 hover:text-primary-700"
          >
            View full log
          </Link>
        </div>
        <div className="mt-4 divide-y divide-gray-100">
          {auditLogs.length === 0 ? (
            <div className="py-6 text-center text-sm text-gray-500">No recent audit events.</div>
          ) : (
            auditLogs.map((log) => (
              <div key={log.id} className="py-3 flex items-center justify-between text-xs">
                <div>
                  <span className="font-bold text-gray-900">{log.action}</span>
                  <span className="text-gray-500 ml-2">[{log.entityType} #{log.entityId?.slice(0, 8)}]</span>
                  <div className="text-gray-400 mt-0.5">By {log.performedByEmail || 'System'}</div>
                </div>
                <div className="text-gray-400">
                  {new Date(log.performedAt).toLocaleString()}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
