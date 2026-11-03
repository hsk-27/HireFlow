import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { recruiterApi } from '../../services/apiServices';
import { TalentLead, LeadStatus } from '../../types';
import Button from '../../components/common/Button';
import Modal from '../../components/common/Modal';
import StatusBadge from '../../components/common/StatusBadge';
import { Users, Plus, Upload, Mail, Phone, Building, Briefcase, AlertCircle, CheckCircle2 } from 'lucide-react';

export default function RecruiterTalentPoolPage() {
  const queryClient = useQueryClient();
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [csvFile, setCsvFile] = useState<File | null>(null);
  const [importSummary, setImportSummary] = useState<any | null>(null);
  const [formError, setFormError] = useState<string | null>(null);

  const [leadForm, setLeadForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phoneNumber: '',
    currentCompany: '',
    currentTitle: '',
    yearsExperience: '3',
    skills: 'Java, Spring Boot, React',
    source: 'SOURCING',
    notes: '',
  });

  const { data: leadsData, isLoading, error } = useQuery({
    queryKey: ['recruiter-talent-pool'],
    queryFn: async () => {
      const res = await recruiterApi.getTalentLeads();
      return res.data.data;
    },
  });

  const leads: TalentLead[] = Array.isArray(leadsData)
    ? leadsData
    : (leadsData as any)?.content || [];

  const addLeadMutation = useMutation({
    mutationFn: (payload: any) => recruiterApi.addTalentLead(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['recruiter-talent-pool'] });
      setIsAddModalOpen(false);
      resetLeadForm();
    },
    onError: (err: any) => {
      setFormError(err.response?.data?.message || 'Failed to add candidate lead');
    },
  });

  const importMutation = useMutation({
    mutationFn: (file: File) => recruiterApi.bulkImportTalentLeads(file),
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ['recruiter-talent-pool'] });
      setImportSummary(res.data.data);
    },
    onError: (err: any) => {
      setFormError(err.response?.data?.message || 'Failed to import CSV file');
    },
  });

  const updateStatusMutation = useMutation({
    mutationFn: ({ leadId, status }: { leadId: string; status: LeadStatus }) =>
      recruiterApi.updateLeadStatus(leadId, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['recruiter-talent-pool'] });
    },
  });

  const resetLeadForm = () => {
    setLeadForm({
      firstName: '',
      lastName: '',
      email: '',
      phoneNumber: '',
      currentCompany: '',
      currentTitle: '',
      yearsExperience: '3',
      skills: 'Java, Spring Boot, React',
      source: 'SOURCING',
      notes: '',
    });
    setFormError(null);
  };

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!leadForm.firstName || !leadForm.lastName || !leadForm.email) {
      setFormError('First name, last name, and email are required');
      return;
    }

    addLeadMutation.mutate({
      firstName: leadForm.firstName,
      lastName: leadForm.lastName,
      email: leadForm.email,
      phoneNumber: leadForm.phoneNumber,
      currentCompany: leadForm.currentCompany,
      currentTitle: leadForm.currentTitle,
      yearsExperience: Number(leadForm.yearsExperience) || 0,
      skills: leadForm.skills
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean),
      source: leadForm.source,
      notes: leadForm.notes,
    });
  };

  const handleImportSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!csvFile) {
      setFormError('Please select a CSV file');
      return;
    }
    setFormError(null);
    importMutation.mutate(csvFile);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b border-gray-200 pb-5 gap-4">
        <div>
          <h1 className="text-2xl font-bold leading-7 text-gray-900 sm:truncate sm:text-3xl">
            Talent Pool & Sourced Leads
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Build passive talent pipelines, import prospect lists, and nurture future candidate relationships.
          </p>
        </div>
        <div className="flex space-x-3">
          <Button variant="outline" onClick={() => setIsImportModalOpen(true)}>
            <Upload className="mr-2 h-4 w-4" /> Bulk Import CSV
          </Button>
          <Button variant="primary" onClick={() => setIsAddModalOpen(true)}>
            <Plus className="mr-2 h-4 w-4" /> Add Prospect Lead
          </Button>
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary-600 border-t-transparent" />
        </div>
      ) : error ? (
        <div className="rounded-md bg-red-50 p-4 text-sm text-red-700">
          Failed to load talent pool.
        </div>
      ) : !leads || leads.length === 0 ? (
        <div className="rounded-lg border-2 border-dashed border-gray-300 p-12 text-center bg-white">
          <Users className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-semibold text-gray-900">Your talent pool is empty</h3>
          <p className="mt-1 text-sm text-gray-500">
            Add candidates discovered on LinkedIn, campus drives, or upload a bulk CSV.
          </p>
          <div className="mt-6 flex justify-center space-x-3">
            <Button variant="outline" onClick={() => setIsImportModalOpen(true)}>
              <Upload className="mr-2 h-4 w-4" /> Bulk Import
            </Button>
            <Button variant="primary" onClick={() => setIsAddModalOpen(true)}>
              <Plus className="mr-2 h-4 w-4" /> Add Prospect
            </Button>
          </div>
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
          <table className="min-w-full divide-y divide-gray-200 text-left text-sm">
            <thead className="bg-gray-50 text-xs font-semibold uppercase tracking-wider text-gray-500">
              <tr>
                <th className="px-6 py-3">Lead Name</th>
                <th className="px-6 py-3">Contact</th>
                <th className="px-6 py-3">Current Role & Co.</th>
                <th className="px-6 py-3">Experience & Skills</th>
                <th className="px-6 py-3">Status</th>
                <th className="px-6 py-3 text-right">Update Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white">
              {leads.map((lead) => (
                <tr key={lead.id} className="hover:bg-gray-50/70 transition">
                  <td className="px-6 py-4">
                    <div className="font-bold text-gray-900">
                      {lead.firstName} {lead.lastName}
                    </div>
                    <div className="text-xs text-gray-400">Source: {lead.source || 'Direct'}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-xs text-gray-900 flex items-center">
                      <Mail className="mr-1 h-3 w-3 text-gray-400" /> {lead.email}
                    </div>
                    {lead.phoneNumber && (
                      <div className="text-xs text-gray-500 flex items-center mt-0.5">
                        <Phone className="mr-1 h-3 w-3 text-gray-400" /> {lead.phoneNumber}
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-xs font-medium text-gray-900 flex items-center">
                      <Briefcase className="mr-1 h-3.5 w-3.5 text-gray-400" />{' '}
                      {lead.currentTitle || 'Not specified'}
                    </div>
                    <div className="text-xs text-gray-500 flex items-center mt-0.5">
                      <Building className="mr-1 h-3.5 w-3.5 text-gray-400" />{' '}
                      {lead.currentCompany || 'Not specified'}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-xs font-semibold text-gray-900">
                      {lead.yearsExperience ?? 0} yrs experience
                    </div>
                    {(() => {
                      const skillsList = Array.isArray(lead.skills)
                        ? lead.skills
                        : typeof lead.skills === 'string'
                        ? lead.skills.split(',').map((s) => s.trim())
                        : [];
                      return skillsList.length > 0 ? (
                        <div className="mt-1 flex flex-wrap gap-1">
                          {skillsList.slice(0, 3).map((s: string, idx: number) => (
                            <span
                              key={idx}
                              className="inline-flex items-center rounded bg-gray-100 px-1.5 py-0.5 text-[10px] text-gray-600"
                            >
                              {s}
                            </span>
                          ))}
                        </div>
                      ) : null;
                    })()}
                  </td>
                  <td className="px-6 py-4">
                    <StatusBadge status={lead.status} />
                  </td>
                  <td className="px-6 py-4 text-right">
                    <select
                      className="rounded border border-gray-300 p-1 text-xs"
                      value={lead.status}
                      onChange={(e) =>
                        updateStatusMutation.mutate({
                          leadId: lead.id,
                          status: e.target.value as LeadStatus,
                        })
                      }
                    >
                      <option value="SOURCED">SOURCED</option>
                      <option value="CONTACTED">CONTACTED</option>
                      <option value="RESPONDED">RESPONDED</option>
                      <option value="CONVERTED">CONVERTED</option>
                      <option value="ARCHIVED">ARCHIVED</option>
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Add Single Lead Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => {
          setIsAddModalOpen(false);
          resetLeadForm();
        }}
        title="Add Candidate Prospect"
        size="md"
      >
        <form onSubmit={handleAddSubmit} className="space-y-4">
          {formError && (
            <div className="rounded-md bg-red-50 p-3 text-sm text-red-700 flex items-center">
              <AlertCircle className="mr-2 h-4 w-4 shrink-0" />
              <span>{formError}</span>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-700 uppercase">First Name *</label>
              <input
                type="text"
                required
                className="mt-1 block w-full rounded-md border border-gray-300 p-2 text-sm"
                value={leadForm.firstName}
                onChange={(e) => setLeadForm({ ...leadForm, firstName: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-700 uppercase">Last Name *</label>
              <input
                type="text"
                required
                className="mt-1 block w-full rounded-md border border-gray-300 p-2 text-sm"
                value={leadForm.lastName}
                onChange={(e) => setLeadForm({ ...leadForm, lastName: e.target.value })}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-700 uppercase">Email *</label>
              <input
                type="email"
                required
                className="mt-1 block w-full rounded-md border border-gray-300 p-2 text-sm"
                value={leadForm.email}
                onChange={(e) => setLeadForm({ ...leadForm, email: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-700 uppercase">Phone</label>
              <input
                type="text"
                className="mt-1 block w-full rounded-md border border-gray-300 p-2 text-sm"
                value={leadForm.phoneNumber}
                onChange={(e) => setLeadForm({ ...leadForm, phoneNumber: e.target.value })}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-700 uppercase">Current Title</label>
              <input
                type="text"
                placeholder="Software Engineer"
                className="mt-1 block w-full rounded-md border border-gray-300 p-2 text-sm"
                value={leadForm.currentTitle}
                onChange={(e) => setLeadForm({ ...leadForm, currentTitle: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-700 uppercase">Current Employer</label>
              <input
                type="text"
                placeholder="Acme Inc"
                className="mt-1 block w-full rounded-md border border-gray-300 p-2 text-sm"
                value={leadForm.currentCompany}
                onChange={(e) => setLeadForm({ ...leadForm, currentCompany: e.target.value })}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-700 uppercase">Years of Exp</label>
              <input
                type="number"
                className="mt-1 block w-full rounded-md border border-gray-300 p-2 text-sm"
                value={leadForm.yearsExperience}
                onChange={(e) => setLeadForm({ ...leadForm, yearsExperience: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-700 uppercase">Lead Source</label>
              <input
                type="text"
                className="mt-1 block w-full rounded-md border border-gray-300 p-2 text-sm"
                value={leadForm.source}
                onChange={(e) => setLeadForm({ ...leadForm, source: e.target.value })}
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 uppercase">
              Skills (comma-separated)
            </label>
            <input
              type="text"
              className="mt-1 block w-full rounded-md border border-gray-300 p-2 text-sm"
              value={leadForm.skills}
              onChange={(e) => setLeadForm({ ...leadForm, skills: e.target.value })}
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 uppercase">Notes</label>
            <textarea
              rows={2}
              className="mt-1 block w-full rounded-md border border-gray-300 p-2 text-sm"
              value={leadForm.notes}
              onChange={(e) => setLeadForm({ ...leadForm, notes: e.target.value })}
            />
          </div>

          <div className="mt-5 flex justify-end space-x-3 pt-3 border-t border-gray-200">
            <Button type="button" variant="outline" onClick={() => setIsAddModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" loading={addLeadMutation.isPending}>
              Save Candidate Lead
            </Button>
          </div>
        </form>
      </Modal>

      {/* Bulk Import CSV Modal */}
      <Modal
        isOpen={isImportModalOpen}
        onClose={() => {
          setIsImportModalOpen(false);
          setCsvFile(null);
          setImportSummary(null);
          setFormError(null);
        }}
        title="Bulk Import Candidate Leads"
        size="md"
      >
        {importSummary ? (
          <div className="space-y-4">
            <div className="rounded-lg bg-emerald-50 p-4 border border-emerald-200">
              <div className="flex items-center text-emerald-800 font-bold mb-2">
                <CheckCircle2 className="mr-2 h-5 w-5" /> Import Complete!
              </div>
              <ul className="text-sm text-emerald-700 space-y-1">
                <li>Total rows processed: {importSummary.totalProcessed}</li>
                <li>Successfully imported: {importSummary.successfulImports}</li>
                <li>Duplicates or skipped: {importSummary.skippedCount || 0}</li>
              </ul>
            </div>
            <div className="flex justify-end">
              <Button
                variant="primary"
                onClick={() => {
                  setIsImportModalOpen(false);
                  setImportSummary(null);
                }}
              >
                Done
              </Button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleImportSubmit} className="space-y-4">
            {formError && (
              <div className="rounded-md bg-red-50 p-3 text-sm text-red-700 flex items-center">
                <AlertCircle className="mr-2 h-4 w-4 shrink-0" />
                <span>{formError}</span>
              </div>
            )}

            <p className="text-sm text-gray-600">
              Upload a UTF-8 encoded CSV file. The CSV header row should include:
              <br />
              <code className="text-xs bg-gray-100 p-1 rounded font-mono block mt-1">
                first_name,last_name,email,phone_number,current_company,current_title,years_experience,skills
              </code>
            </p>

            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
              <Upload className="mx-auto h-8 w-8 text-gray-400" />
              <input
                type="file"
                accept=".csv"
                required
                onChange={(e) => setCsvFile(e.target.files?.[0] || null)}
                className="mt-2 block w-full text-xs text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-primary-50 file:text-primary-700 hover:file:bg-primary-100"
              />
            </div>

            <div className="mt-5 flex justify-end space-x-3 pt-3 border-t border-gray-200">
              <Button type="button" variant="outline" onClick={() => setIsImportModalOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" variant="primary" loading={importMutation.isPending}>
                Upload & Process CSV
              </Button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
}
