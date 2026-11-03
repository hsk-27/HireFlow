import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { candidateService } from '@/services/apiServices';
import {
  User,
  GraduationCap,
  Briefcase,
  Wrench,
  FileText,
  Upload,
  Plus,
  Trash2,
  Download,
  AlertCircle,
  CheckCircle,
} from 'lucide-react';
import { Button } from '@/components/common/Button';
import { Modal } from '@/components/common/Modal';

export const CandidateProfilePage: React.FC = () => {
  const queryClient = useQueryClient();

  // Queries
  const { data: profile, isLoading: profileLoading } = useQuery({
    queryKey: ['candidateProfile'],
    queryFn: () => candidateService.getProfile(),
  });

  const { data: educations = [] } = useQuery({
    queryKey: ['candidateEducation'],
    queryFn: () => candidateService.getEducation(),
  });

  const { data: experiences = [] } = useQuery({
    queryKey: ['candidateExperience'],
    queryFn: () => candidateService.getExperience(),
  });

  const { data: skills = [] } = useQuery({
    queryKey: ['candidateSkills'],
    queryFn: () => candidateService.getSkills(),
  });

  // State: Modals & Inputs
  const [eduModalOpen, setEduModalOpen] = useState(false);
  const [expModalOpen, setExpModalOpen] = useState(false);
  const [summaryEditOpen, setSummaryEditOpen] = useState(false);

  const [summary, setSummary] = useState('');
  const [location, setLocation] = useState('');
  const [portfolio, setPortfolio] = useState('');
  const [linkedin, setLinkedin] = useState('');
  const [github, setGithub] = useState('');

  // New Education State
  const [institution, setInstitution] = useState('');
  const [degree, setDegree] = useState('');
  const [branch, setBranch] = useState('');
  const [graduationYear, setGraduationYear] = useState<number>(new Date().getFullYear());
  const [score, setScore] = useState('');
  const [scoreScale, setScoreScale] = useState('4.0');
  const [isPrimary, setIsPrimary] = useState(true);

  // New Experience State
  const [companyName, setCompanyName] = useState('');
  const [jobTitle, setJobTitle] = useState('');
  const [employmentType, setEmploymentType] = useState('Full-time');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [currentlyWorking, setCurrentlyWorking] = useState(true);
  const [expDescription, setExpDescription] = useState('');

  // Skill Input State
  const [newSkillName, setNewSkillName] = useState('');
  const [newSkillYears, setNewSkillYears] = useState('2.0');

  // Resume File Upload State
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [feedbackMsg, setFeedbackMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Mutations
  const updateProfileMutation = useMutation({
    mutationFn: (data: any) => candidateService.updateProfile(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['candidateProfile'] });
      setSummaryEditOpen(false);
      setFeedbackMsg({ type: 'success', text: 'Profile updated successfully' });
    },
  });

  const addEduMutation = useMutation({
    mutationFn: (data: any) => candidateService.addEducation(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['candidateEducation'] });
      queryClient.invalidateQueries({ queryKey: ['candidateProfile'] });
      setEduModalOpen(false);
      resetEduForm();
    },
  });

  const deleteEduMutation = useMutation({
    mutationFn: (id: string) => candidateService.deleteEducation(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['candidateEducation'] });
      queryClient.invalidateQueries({ queryKey: ['candidateProfile'] });
    },
  });

  const addExpMutation = useMutation({
    mutationFn: (data: any) => candidateService.addExperience(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['candidateExperience'] });
      queryClient.invalidateQueries({ queryKey: ['candidateProfile'] });
      setExpModalOpen(false);
      resetExpForm();
    },
  });

  const deleteExpMutation = useMutation({
    mutationFn: (id: string) => candidateService.deleteExperience(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['candidateExperience'] });
      queryClient.invalidateQueries({ queryKey: ['candidateProfile'] });
    },
  });

  const addSkillMutation = useMutation({
    mutationFn: () => candidateService.addSkill(newSkillName, parseFloat(newSkillYears) || 0),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['candidateSkills'] });
      queryClient.invalidateQueries({ queryKey: ['candidateProfile'] });
      setNewSkillName('');
    },
    onError: (err: any) => {
      setFeedbackMsg({ type: 'error', text: err.response?.data?.message || 'Failed to add skill' });
    },
  });

  const deleteSkillMutation = useMutation({
    mutationFn: (id: string) => candidateService.deleteSkill(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['candidateSkills'] });
      queryClient.invalidateQueries({ queryKey: ['candidateProfile'] });
    },
  });

  const uploadResumeMutation = useMutation({
    mutationFn: (file: File) => candidateService.uploadResume(file),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['candidateProfile'] });
      setResumeFile(null);
      setFeedbackMsg({ type: 'success', text: 'Resume uploaded successfully' });
    },
    onError: (err: any) => {
      setFeedbackMsg({ type: 'error', text: err.response?.data?.message || 'Failed to upload resume' });
    },
  });

  const deleteResumeMutation = useMutation({
    mutationFn: () => candidateService.deleteResume(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['candidateProfile'] });
      setFeedbackMsg({ type: 'success', text: 'Resume removed' });
    },
  });

  const resetEduForm = () => {
    setInstitution('');
    setDegree('');
    setBranch('');
    setGraduationYear(new Date().getFullYear());
    setScore('');
    setScoreScale('4.0');
    setIsPrimary(true);
  };

  const resetExpForm = () => {
    setCompanyName('');
    setJobTitle('');
    setEmploymentType('Full-time');
    setStartDate('');
    setEndDate('');
    setCurrentlyWorking(true);
    setExpDescription('');
  };

  const handleOpenSummaryModal = () => {
    if (profile) {
      setSummary(profile.professionalSummary || '');
      setLocation(profile.currentLocation || '');
      setPortfolio(profile.portfolioUrl || '');
      setLinkedin(profile.linkedinUrl || '');
      setGithub(profile.githubUrl || '');
    }
    setSummaryEditOpen(true);
  };

  const handleSaveSummary = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfileMutation.mutate({
      professionalSummary: summary,
      currentLocation: location,
      portfolioUrl: portfolio,
      linkedinUrl: linkedin,
      githubUrl: github,
    });
  };

  if (profileLoading) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-16">
        <div className="h-64 bg-slate-200 rounded-xl animate-pulse"></div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Page Title & Profile Completion */}
      <div className="bg-white p-6 sm:p-8 rounded-xl border border-slate-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Candidate Profile</h1>
          <p className="text-sm text-slate-500 mt-1">
            Keep your profile comprehensive and up-to-date for automated eligibility screening.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-right">
            <span className="text-xs text-slate-500">Profile Completion</span>
            <p className="font-bold text-lg text-primary-600">{profile?.profileCompletionPercentage}%</p>
          </div>
          <div className="w-16 bg-slate-200 rounded-full h-3 overflow-hidden">
            <div
              className="bg-primary-600 h-3 rounded-full"
              style={{ width: `${profile?.profileCompletionPercentage}%` }}
            ></div>
          </div>
        </div>
      </div>

      {feedbackMsg && (
        <div
          className={`p-4 rounded-xl border flex items-center justify-between text-sm ${
            feedbackMsg.type === 'success'
              ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
              : 'bg-rose-50 text-rose-800 border-rose-200'
          }`}
        >
          <span>{feedbackMsg.text}</span>
          <button onClick={() => setFeedbackMsg(null)} className="text-xs underline font-medium">
            Dismiss
          </button>
        </div>
      )}

      {/* 1. Personal & Professional Summary */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-4">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <User className="w-5 h-5 text-primary-600" />
            <h2 className="text-lg font-bold text-slate-900">Personal & Professional Summary</h2>
          </div>
          <Button variant="outline" size="sm" onClick={handleOpenSummaryModal}>
            Edit Summary
          </Button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs pt-2">
          <div>
            <span className="text-slate-500">Full Name</span>
            <p className="font-semibold text-slate-800 text-sm mt-0.5">
              {profile?.firstName} {profile?.lastName}
            </p>
          </div>
          <div>
            <span className="text-slate-500">Email Address</span>
            <p className="font-semibold text-slate-800 text-sm mt-0.5">{profile?.email}</p>
          </div>
          <div>
            <span className="text-slate-500">Phone Number</span>
            <p className="font-semibold text-slate-800 text-sm mt-0.5">{profile?.phoneNumber || 'Not provided'}</p>
          </div>
          <div>
            <span className="text-slate-500">Current Location</span>
            <p className="font-semibold text-slate-800 text-sm mt-0.5">{profile?.currentLocation || 'Not provided'}</p>
          </div>
        </div>

        <div className="pt-4 border-t border-slate-100">
          <span className="text-xs text-slate-500">Professional Summary</span>
          <p className="text-sm text-slate-700 mt-1 whitespace-pre-line leading-relaxed">
            {profile?.professionalSummary || 'No professional summary added yet.'}
          </p>
        </div>

        {(profile?.linkedinUrl || profile?.githubUrl || profile?.portfolioUrl) && (
          <div className="flex flex-wrap gap-4 pt-3 border-t border-slate-100 text-xs">
            {profile?.linkedinUrl && (
              <a href={profile.linkedinUrl} target="_blank" rel="noreferrer" className="text-primary-600 hover:underline">
                LinkedIn Profile
              </a>
            )}
            {profile?.githubUrl && (
              <a href={profile.githubUrl} target="_blank" rel="noreferrer" className="text-primary-600 hover:underline">
                GitHub Profile
              </a>
            )}
            {profile?.portfolioUrl && (
              <a href={profile.portfolioUrl} target="_blank" rel="noreferrer" className="text-primary-600 hover:underline">
                Portfolio Website
              </a>
            )}
          </div>
        )}
      </div>

      {/* 2. Resume Document */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-4">
        <div className="flex items-center gap-2">
          <FileText className="w-5 h-5 text-primary-600" />
          <h2 className="text-lg font-bold text-slate-900">Current Resume (PDF / DOCX)</h2>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-200 gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white border border-slate-200 rounded-lg flex items-center justify-center text-primary-600">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <p className="text-sm font-bold text-slate-900">
                {profile?.currentResumeName || 'No resume currently uploaded'}
              </p>
              <p className="text-xs text-slate-500">Used as default application snapshot document</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {profile?.currentResumeId && (
              <>
                <a
                  href={`http://localhost:8080/api/v1/candidate/resume/${profile.currentResumeId}/download`}
                  target="_blank"
                  rel="noreferrer"
                  download
                >
                  <Button variant="outline" size="sm">
                    <Download className="w-4 h-4 mr-1" /> Download
                  </Button>
                </a>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => deleteResumeMutation.mutate()}
                  isLoading={deleteResumeMutation.isPending}
                >
                  <Trash2 className="w-4 h-4 text-rose-500" />
                </Button>
              </>
            )}

            <label className="cursor-pointer">
              <input
                type="file"
                accept=".pdf,.docx,.doc"
                className="hidden"
                onChange={(e) => {
                  if (e.target.files?.[0]) {
                    uploadResumeMutation.mutate(e.target.files[0]);
                  }
                }}
              />
              <span className="inline-flex items-center px-3 py-1.5 bg-primary-600 text-white rounded-lg text-xs font-semibold hover:bg-primary-700 transition">
                <Upload className="w-4 h-4 mr-1" /> {profile?.currentResumeId ? 'Replace Resume' : 'Upload Resume'}
              </span>
            </label>
          </div>
        </div>
      </div>

      {/* 3. Education */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-4">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <GraduationCap className="w-5 h-5 text-primary-600" />
            <h2 className="text-lg font-bold text-slate-900">Education History</h2>
          </div>
          <Button size="sm" onClick={() => setEduModalOpen(true)}>
            <Plus className="w-4 h-4 mr-1" /> Add Education
          </Button>
        </div>

        {educations.length === 0 ? (
          <p className="text-sm text-slate-500 py-4 text-center">No education records added yet.</p>
        ) : (
          <div className="space-y-3">
            {educations.map((edu) => (
              <div
                key={edu.id}
                className="p-4 rounded-xl border border-slate-200 bg-slate-50 flex items-center justify-between"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-sm text-slate-900">
                      {edu.degree} in {edu.branch}
                    </h3>
                    {edu.isPrimary && (
                      <span className="px-2 py-0.5 text-[10px] font-bold rounded bg-primary-100 text-primary-800">
                        Primary
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-600">{edu.institution}</p>
                  <p className="text-xs text-slate-500 mt-1">
                    Graduated: {edu.graduationYear} • Score: {edu.score}/{edu.scoreScale} scale
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => deleteEduMutation.mutate(edu.id)}
                  title="Delete"
                >
                  <Trash2 className="w-4 h-4 text-rose-500" />
                </Button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 4. Experience */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-4">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Briefcase className="w-5 h-5 text-primary-600" />
            <h2 className="text-lg font-bold text-slate-900">Work Experience</h2>
          </div>
          <Button size="sm" onClick={() => setExpModalOpen(true)}>
            <Plus className="w-4 h-4 mr-1" /> Add Experience
          </Button>
        </div>

        {experiences.length === 0 ? (
          <p className="text-sm text-slate-500 py-4 text-center">No experience records added yet.</p>
        ) : (
          <div className="space-y-3">
            {experiences.map((exp) => (
              <div
                key={exp.id}
                className="p-4 rounded-xl border border-slate-200 bg-slate-50 flex items-start justify-between"
              >
                <div>
                  <h3 className="font-bold text-sm text-slate-900">{exp.jobTitle}</h3>
                  <p className="text-xs font-semibold text-slate-600">{exp.companyName} • {exp.employmentType}</p>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    {exp.startDate} - {exp.currentlyWorking ? 'Present' : exp.endDate}
                  </p>
                  {exp.description && (
                    <p className="text-xs text-slate-600 mt-2 whitespace-pre-line leading-relaxed">
                      {exp.description}
                    </p>
                  )}
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => deleteExpMutation.mutate(exp.id)}
                  title="Delete"
                >
                  <Trash2 className="w-4 h-4 text-rose-500" />
                </Button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 5. Skills */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-4">
        <div className="flex items-center gap-2">
          <Wrench className="w-5 h-5 text-primary-600" />
          <h2 className="text-lg font-bold text-slate-900">Skills & Proficiencies</h2>
        </div>

        <div className="flex flex-wrap gap-2 pt-2">
          {skills.map((skill) => (
            <span
              key={skill.id}
              className="inline-flex items-center gap-1.5 px-3 py-1 bg-slate-100 text-slate-800 rounded-lg text-xs font-medium border border-slate-200"
            >
              <span>{skill.name}</span>
              {skill.yearsOfExperience !== undefined && (
                <span className="text-slate-400 text-[10px]">({skill.yearsOfExperience}y)</span>
              )}
              <button
                type="button"
                onClick={() => deleteSkillMutation.mutate(skill.id)}
                className="text-slate-400 hover:text-rose-600 ml-1"
              >
                &times;
              </button>
            </span>
          ))}
        </div>

        {/* Add Skill Form */}
        <div className="flex gap-2 pt-3 border-t border-slate-100 max-w-md">
          <input
            type="text"
            placeholder="Skill name (e.g. Java, React, SQL)"
            value={newSkillName}
            onChange={(e) => setNewSkillName(e.target.value)}
            className="flex-1 px-3 py-1.5 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
          <input
            type="number"
            step="0.5"
            placeholder="Years"
            value={newSkillYears}
            onChange={(e) => setNewSkillYears(e.target.value)}
            className="w-20 px-3 py-1.5 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
          <Button
            size="sm"
            onClick={() => addSkillMutation.mutate()}
            isLoading={addSkillMutation.isPending}
            disabled={!newSkillName.trim()}
          >
            Add
          </Button>
        </div>
      </div>

      {/* Edit Summary Modal */}
      <Modal isOpen={summaryEditOpen} onClose={() => setSummaryEditOpen(false)} title="Edit Profile Details">
        <form onSubmit={handleSaveSummary} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Current Location</label>
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Professional Summary</label>
            <textarea
              rows={4}
              value={summary}
              onChange={(e) => setSummary(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            <div>
              <label className="block text-[11px] font-semibold text-slate-700 mb-1">LinkedIn URL</label>
              <input
                type="url"
                value={linkedin}
                onChange={(e) => setLinkedin(e.target.value)}
                className="w-full px-2 py-1.5 text-xs border border-slate-200 rounded-lg"
              />
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-slate-700 mb-1">GitHub URL</label>
              <input
                type="url"
                value={github}
                onChange={(e) => setGithub(e.target.value)}
                className="w-full px-2 py-1.5 text-xs border border-slate-200 rounded-lg"
              />
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-slate-700 mb-1">Portfolio URL</label>
              <input
                type="url"
                value={portfolio}
                onChange={(e) => setPortfolio(e.target.value)}
                className="w-full px-2 py-1.5 text-xs border border-slate-200 rounded-lg"
              />
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
            <Button variant="outline" type="button" onClick={() => setSummaryEditOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" isLoading={updateProfileMutation.isPending}>
              Save Changes
            </Button>
          </div>
        </form>
      </Modal>

      {/* Add Education Modal */}
      <Modal isOpen={eduModalOpen} onClose={() => setEduModalOpen(false)} title="Add Education Record">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            addEduMutation.mutate({
              institution,
              degree,
              branch,
              graduationYear,
              score: parseFloat(score) || 0,
              scoreScale: parseFloat(scoreScale) || 4.0,
              isPrimary,
            });
          }}
          className="space-y-4"
        >
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Institution *</label>
            <input
              type="text"
              required
              value={institution}
              onChange={(e) => setInstitution(e.target.value)}
              placeholder="e.g. University of California, Berkeley"
              className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Degree *</label>
              <input
                type="text"
                required
                value={degree}
                onChange={(e) => setDegree(e.target.value)}
                placeholder="e.g. B.S., M.S., B.Tech"
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Branch / Major *</label>
              <input
                type="text"
                required
                value={branch}
                onChange={(e) => setBranch(e.target.value)}
                placeholder="e.g. Computer Science"
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Graduation Year *</label>
              <input
                type="number"
                required
                value={graduationYear}
                onChange={(e) => setGraduationYear(parseInt(e.target.value) || 2024)}
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Score / GPA *</label>
              <input
                type="number"
                step="0.01"
                required
                value={score}
                onChange={(e) => setScore(e.target.value)}
                placeholder="3.85"
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Score Scale *</label>
              <input
                type="number"
                step="0.1"
                required
                value={scoreScale}
                onChange={(e) => setScoreScale(e.target.value)}
                placeholder="4.0 or 10.0"
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
          </div>
          <div className="flex items-center gap-2 pt-2">
            <input
              type="checkbox"
              id="isPrimary"
              checked={isPrimary}
              onChange={(e) => setIsPrimary(e.target.checked)}
              className="rounded text-primary-600 focus:ring-primary-500"
            />
            <label htmlFor="isPrimary" className="text-xs text-slate-700 font-medium">
              Set as primary qualification for default eligibility screening
            </label>
          </div>
          <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
            <Button variant="outline" type="button" onClick={() => setEduModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" isLoading={addEduMutation.isPending}>
              Save Education
            </Button>
          </div>
        </form>
      </Modal>

      {/* Add Experience Modal */}
      <Modal isOpen={expModalOpen} onClose={() => setExpModalOpen(false)} title="Add Work Experience">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            addExpMutation.mutate({
              companyName,
              jobTitle,
              employmentType,
              startDate,
              endDate: currentlyWorking ? null : endDate,
              currentlyWorking,
              description: expDescription,
            });
          }}
          className="space-y-4"
        >
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Company Name *</label>
              <input
                type="text"
                required
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Job Title *</label>
              <input
                type="text"
                required
                value={jobTitle}
                onChange={(e) => setJobTitle(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Start Date *</label>
              <input
                type="date"
                required
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">End Date</label>
              <input
                type="date"
                disabled={currentlyWorking}
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg disabled:bg-slate-100"
              />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="currWork"
              checked={currentlyWorking}
              onChange={(e) => setCurrentlyWorking(e.target.checked)}
              className="rounded text-primary-600 focus:ring-primary-500"
            />
            <label htmlFor="currWork" className="text-xs text-slate-700 font-medium">
              I am currently working here
            </label>
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Description & Achievements</label>
            <textarea
              rows={3}
              value={expDescription}
              onChange={(e) => setExpDescription(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>
          <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
            <Button variant="outline" type="button" onClick={() => setExpModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" isLoading={addExpMutation.isPending}>
              Save Experience
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default CandidateProfilePage;

