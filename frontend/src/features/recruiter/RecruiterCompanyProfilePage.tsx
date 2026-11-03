import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { recruiterApi } from '../../services/apiServices';
import StatusBadge from '../../components/common/StatusBadge';
import Button from '../../components/common/Button';
import { Building2, Globe, ShieldCheck, AlertCircle, CheckCircle, Info } from 'lucide-react';

export default function RecruiterCompanyProfilePage() {
  const queryClient = useQueryClient();
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const { data: company, isLoading, error } = useQuery({
    queryKey: ['recruiter-company-profile'],
    queryFn: async () => {
      const res = await recruiterApi.getCompanyProfile();
      return res.data.data;
    },
  });

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    website: '',
    industry: '',
    companySize: '',
    logoUrl: '',
  });

  useEffect(() => {
    if (company) {
      setFormData({
        name: company.name || '',
        description: company.description || '',
        website: company.website || '',
        industry: company.industry || '',
        companySize: company.companySize || '',
        logoUrl: company.logoUrl || '',
      });
    }
  }, [company]);

  const updateMutation = useMutation({
    mutationFn: (payload: any) => recruiterApi.updateCompanyProfile(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['recruiter-company-profile'] });
      setSuccessMsg('Company profile updated successfully.');
      setTimeout(() => setSuccessMsg(null), 4000);
    },
    onError: (err: any) => {
      setErrorMsg(err.response?.data?.message || 'Failed to update company profile');
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSuccessMsg(null);
    setErrorMsg(null);
    updateMutation.mutate(formData);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary-600 border-t-transparent" />
      </div>
    );
  }

  if (error || !company) {
    return (
      <div className="rounded-md bg-red-50 p-4 text-sm text-red-700">
        Failed to load company profile. Please ensure you are associated with an active company.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="border-b border-gray-200 pb-5">
        <h1 className="text-2xl font-bold leading-7 text-gray-900 sm:truncate sm:text-3xl">
          Company Profile & Verification
        </h1>
        <p className="mt-1 text-sm text-gray-500">
          Manage your organization's public branding, corporate details, and verification status.
        </p>
      </div>

      {company.status === 'PENDING' && (
        <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 flex items-start space-x-3">
          <AlertCircle className="h-5 w-5 text-amber-600 mt-0.5 shrink-0" />
          <div className="text-sm text-amber-800">
            <h4 className="font-bold">Pending Platform Administrator Verification</h4>
            <p className="mt-1">
              Your company registration has been submitted and is awaiting administrative approval.
              Job requisitions can be drafted now, but will only become publicly discoverable once
              verification is finalized.
            </p>
          </div>
        </div>
      )}

      {company.status === 'APPROVED' && (
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 flex items-center space-x-3">
          <ShieldCheck className="h-5 w-5 text-emerald-600 shrink-0" />
          <div className="text-sm text-emerald-800">
            <span className="font-bold">Verified Organization:</span> Your company is approved and
            authorized to publish open requisitions to candidate boards.
          </div>
        </div>
      )}

      {successMsg && (
        <div className="rounded-md bg-emerald-50 p-3 text-sm text-emerald-700 flex items-center">
          <CheckCircle className="mr-2 h-4 w-4" />
          <span>{successMsg}</span>
        </div>
      )}

      {errorMsg && (
        <div className="rounded-md bg-red-50 p-3 text-sm text-red-700 flex items-center">
          <AlertCircle className="mr-2 h-4 w-4" />
          <span>{errorMsg}</span>
        </div>
      )}

      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="flex items-center space-x-4 border-b border-gray-100 pb-6">
            <div className="h-16 w-16 rounded-xl bg-primary-100 flex items-center justify-center text-primary-700 font-black text-2xl">
              {formData.name ? formData.name.charAt(0) : <Building2 className="h-8 w-8" />}
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">{company.name}</h2>
              <div className="mt-1 flex items-center space-x-3">
                <StatusBadge status={company.status} />
                <span className="text-xs text-gray-500">ID: {company.id}</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            <div>
              <label className="block text-xs font-semibold text-gray-700 uppercase">
                Company Legal Name
              </label>
              <input
                type="text"
                disabled
                className="mt-1 block w-full rounded-md border border-gray-200 bg-gray-100 p-2 text-sm text-gray-500 cursor-not-allowed"
                value={formData.name}
              />
              <span className="text-[11px] text-gray-400 mt-1 block">
                Company name changes require admin approval.
              </span>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 uppercase">
                Official Website
              </label>
              <input
                type="url"
                placeholder="https://example.com"
                className="mt-1 block w-full rounded-md border border-gray-300 p-2 text-sm focus:border-primary-500 focus:ring-primary-500"
                value={formData.website}
                onChange={(e) => setFormData({ ...formData, website: e.target.value })}
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 uppercase">
                Industry Domain
              </label>
              <input
                type="text"
                placeholder="Enterprise Software, FinTech, AI..."
                className="mt-1 block w-full rounded-md border border-gray-300 p-2 text-sm focus:border-primary-500 focus:ring-primary-500"
                value={formData.industry}
                onChange={(e) => setFormData({ ...formData, industry: e.target.value })}
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 uppercase">
                Company Size
              </label>
              <input
                type="text"
                placeholder="100-500 employees"
                className="mt-1 block w-full rounded-md border border-gray-300 p-2 text-sm focus:border-primary-500 focus:ring-primary-500"
                value={formData.companySize}
                onChange={(e) => setFormData({ ...formData, companySize: e.target.value })}
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 uppercase">
              Logo Image URL
            </label>
            <input
              type="url"
              placeholder="https://example.com/logo.png"
              className="mt-1 block w-full rounded-md border border-gray-300 p-2 text-sm focus:border-primary-500 focus:ring-primary-500"
              value={formData.logoUrl}
              onChange={(e) => setFormData({ ...formData, logoUrl: e.target.value })}
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 uppercase">
              About the Company / Overview
            </label>
            <textarea
              rows={4}
              placeholder="Tell candidates about your company mission, culture, and products..."
              className="mt-1 block w-full rounded-md border border-gray-300 p-2 text-sm focus:border-primary-500 focus:ring-primary-500"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            />
          </div>

          <div className="flex justify-end pt-4 border-t border-gray-100">
            <Button type="submit" variant="primary" loading={updateMutation.isPending}>
              Save Profile Changes
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
