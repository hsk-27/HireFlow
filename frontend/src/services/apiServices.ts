import { api, setAuthTokens } from '@/lib/api';
import {
  ApiResponse,
  PagedResponse,
  AuthResponseData,
  User,
  Company,
  CompanyStatus,
  Job,
  JobStatus,
  JobEligibility,
  CandidateProfile,
  CandidateEducation,
  CandidateExperience,
  Skill,
  Document,
  Application,
  ApplicationStatus,
  EligibilityStatus,
  ApplicationStatusHistory,
  Interview,
  InterviewFeedback,
  Offer,
  Notification,
  RecruiterDashboard,
  AdminDashboard,
  TalentLead,
  LeadStatus,
  AuditLog,
} from '@/types';

// ================= AUTH SERVICE =================
export const authService = {
  async registerCandidate(data: any): Promise<AuthResponseData> {
    const res = await api.post<ApiResponse<AuthResponseData>>('/auth/register/candidate', data);
    const authData = res.data.data;
    setAuthTokens(authData.accessToken, authData.refreshToken);
    return authData;
  },

  async registerRecruiter(data: any): Promise<AuthResponseData> {
    const res = await api.post<ApiResponse<AuthResponseData>>('/auth/register/recruiter', data);
    const authData = res.data.data;
    setAuthTokens(authData.accessToken, authData.refreshToken);
    return authData;
  },

  async login(credentials: { email: string; password: string }): Promise<AuthResponseData> {
    const res = await api.post<ApiResponse<AuthResponseData>>('/auth/login', credentials);
    const authData = res.data.data;
    setAuthTokens(authData.accessToken, authData.refreshToken);
    return authData;
  },

  async logout(): Promise<void> {
    try {
      await api.post('/auth/logout');
    } finally {
      setAuthTokens(null, null);
    }
  },

  async getMe(): Promise<User> {
    const res = await api.get<ApiResponse<User>>('/auth/me');
    return res.data.data;
  },

  async changePassword(data: { currentPassword: string; newPassword: string }): Promise<void> {
    await api.post('/auth/change-password', data);
  },
};

// ================= JOB SERVICE =================
export const jobService = {
  async searchPublicJobs(params: {
    keyword?: string;
    location?: string;
    employmentType?: string;
    workplaceType?: string;
    companyId?: string;
    page?: number;
    size?: number;
  }): Promise<PagedResponse<Job>> {
    const res = await api.get<ApiResponse<PagedResponse<Job>>>('/jobs', { params });
    return res.data.data;
  },

  async getPublicJobById(id: string): Promise<Job> {
    const res = await api.get<ApiResponse<Job>>(`/jobs/${id}`);
    return res.data.data;
  },

  async getRecruiterJobs(page = 0, size = 20): Promise<PagedResponse<Job>> {
    const res = await api.get<ApiResponse<PagedResponse<Job>>>('/recruiter/jobs', { params: { page, size } });
    return res.data.data;
  },

  async getRecruiterJobById(id: string): Promise<Job> {
    const res = await api.get<ApiResponse<Job>>(`/recruiter/jobs/${id}`);
    return res.data.data;
  },

  async createJob(jobData: any): Promise<Job> {
    const res = await api.post<ApiResponse<Job>>('/recruiter/jobs', jobData);
    return res.data.data;
  },

  async updateJob(id: string, jobData: any): Promise<Job> {
    const res = await api.put<ApiResponse<Job>>(`/recruiter/jobs/${id}`, jobData);
    return res.data.data;
  },

  async publishJob(id: string): Promise<Job> {
    const res = await api.post<ApiResponse<Job>>(`/recruiter/jobs/${id}/publish`);
    return res.data.data;
  },

  async closeJob(id: string): Promise<Job> {
    const res = await api.post<ApiResponse<Job>>(`/recruiter/jobs/${id}/close`);
    return res.data.data;
  },

  async archiveJob(id: string): Promise<Job> {
    const res = await api.post<ApiResponse<Job>>(`/recruiter/jobs/${id}/archive`);
    return res.data.data;
  },

  async updateEligibility(id: string, eligibilityData: any): Promise<JobEligibility> {
    const res = await api.put<ApiResponse<JobEligibility>>(`/recruiter/jobs/${id}/eligibility`, eligibilityData);
    return res.data.data;
  },
};

// ================= CANDIDATE SERVICE =================
export const candidateService = {
  async getProfile(): Promise<CandidateProfile> {
    const res = await api.get<ApiResponse<CandidateProfile>>('/candidate/profile');
    return res.data.data;
  },

  async updateProfile(data: any): Promise<CandidateProfile> {
    const res = await api.put<ApiResponse<CandidateProfile>>('/candidate/profile', data);
    return res.data.data;
  },

  async getEducation(): Promise<CandidateEducation[]> {
    const res = await api.get<ApiResponse<CandidateEducation[]>>('/candidate/education');
    return res.data.data;
  },

  async addEducation(edu: any): Promise<CandidateEducation> {
    const res = await api.post<ApiResponse<CandidateEducation>>('/candidate/education', edu);
    return res.data.data;
  },

  async deleteEducation(id: string): Promise<void> {
    await api.delete(`/candidate/education/${id}`);
  },

  async getExperience(): Promise<CandidateExperience[]> {
    const res = await api.get<ApiResponse<CandidateExperience[]>>('/candidate/experience');
    return res.data.data;
  },

  async addExperience(exp: any): Promise<CandidateExperience> {
    const res = await api.post<ApiResponse<CandidateExperience>>('/candidate/experience', exp);
    return res.data.data;
  },

  async deleteExperience(id: string): Promise<void> {
    await api.delete(`/candidate/experience/${id}`);
  },

  async getSkills(): Promise<Skill[]> {
    const res = await api.get<ApiResponse<Skill[]>>('/candidate/skills');
    return res.data.data;
  },

  async addSkill(skillName: string, yearsOfExperience?: number): Promise<Skill> {
    const res = await api.post<ApiResponse<Skill>>('/candidate/skills', { skillName, yearsOfExperience });
    return res.data.data;
  },

  async deleteSkill(id: string): Promise<void> {
    await api.delete(`/candidate/skills/${id}`);
  },

  async uploadResume(file: File): Promise<Document> {
    const formData = new FormData();
    formData.append('file', file);
    const res = await api.post<ApiResponse<Document>>('/candidate/resume', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return res.data.data;
  },

  async getCurrentResume(): Promise<Document> {
    const res = await api.get<ApiResponse<Document>>('/candidate/resume');
    return res.data.data;
  },

  async deleteResume(): Promise<void> {
    await api.delete('/candidate/resume');
  },
};

// ================= APPLICATION SERVICE =================
export const applicationService = {
  async applyForJob(jobId: string, coverLetter?: string): Promise<Application> {
    const res = await api.post<ApiResponse<Application>>(`/candidate/jobs/${jobId}/apply`, { coverLetter });
    return res.data.data;
  },

  async getCandidateApplications(page = 0, size = 15): Promise<PagedResponse<Application>> {
    const res = await api.get<ApiResponse<PagedResponse<Application>>>('/candidate/applications', {
      params: { page, size },
    });
    return res.data.data;
  },

  async getCandidateApplicationDetail(id: string): Promise<Application> {
    const res = await api.get<ApiResponse<Application>>(`/candidate/applications/${id}`);
    return res.data.data;
  },

  async withdrawApplication(id: string, reason?: string): Promise<Application> {
    const res = await api.post<ApiResponse<Application>>(`/candidate/applications/${id}/withdraw`, { reason });
    return res.data.data;
  },

  async getRecruiterApplications(params: {
    jobId?: string;
    status?: ApplicationStatus;
    eligibilityStatus?: EligibilityStatus;
    search?: string;
    page?: number;
    size?: number;
  }): Promise<PagedResponse<Application>> {
    const res = await api.get<ApiResponse<PagedResponse<Application>>>('/recruiter/applications', { params });
    return res.data.data;
  },

  async getRecruiterApplicationDetail(id: string): Promise<Application> {
    const res = await api.get<ApiResponse<Application>>(`/recruiter/applications/${id}`);
    return res.data.data;
  },

  async transitionStatus(id: string, newStatus: ApplicationStatus, reason?: string): Promise<Application> {
    const res = await api.post<ApiResponse<Application>>(`/recruiter/applications/${id}/transition`, {
      newStatus,
      reason,
    });
    return res.data.data;
  },

  async getApplicationHistory(id: string, role: 'candidate' | 'recruiter'): Promise<ApplicationStatusHistory[]> {
    const res = await api.get<ApiResponse<ApplicationStatusHistory[]>>(`/${role}/applications/${id}/history`);
    return res.data.data;
  },
};

// ================= INTERVIEW SERVICE =================
export const interviewService = {
  async getCandidateInterviews(page = 0, size = 20): Promise<PagedResponse<Interview>> {
    const res = await api.get<ApiResponse<PagedResponse<Interview>>>('/candidate/interviews', {
      params: { page, size },
    });
    return res.data.data;
  },

  async getRecruiterInterviews(page = 0, size = 20): Promise<PagedResponse<Interview>> {
    const res = await api.get<ApiResponse<PagedResponse<Interview>>>('/recruiter/interviews', {
      params: { page, size },
    });
    return res.data.data;
  },

  async getRecruiterInterviewById(id: string): Promise<Interview> {
    const res = await api.get<ApiResponse<Interview>>(`/recruiter/interviews/${id}`);
    return res.data.data;
  },

  async scheduleInterview(data: any): Promise<Interview> {
    const res = await api.post<ApiResponse<Interview>>('/recruiter/interviews', data);
    return res.data.data;
  },

  async rescheduleInterview(id: string, data: any): Promise<Interview> {
    const res = await api.put<ApiResponse<Interview>>(`/recruiter/interviews/${id}`, data);
    return res.data.data;
  },

  async cancelInterview(id: string, reason?: string): Promise<Interview> {
    const res = await api.post<ApiResponse<Interview>>(`/recruiter/interviews/${id}/cancel`, { reason });
    return res.data.data;
  },

  async submitFeedback(id: string, feedbackData: any): Promise<InterviewFeedback> {
    const res = await api.post<ApiResponse<InterviewFeedback>>(`/recruiter/interviews/${id}/feedback`, feedbackData);
    return res.data.data;
  },
};

// ================= OFFER SERVICE =================
export const offerService = {
  async getCandidateOffers(page = 0, size = 15): Promise<PagedResponse<Offer>> {
    const res = await api.get<ApiResponse<PagedResponse<Offer>>>('/candidate/offers', { params: { page, size } });
    return res.data.data;
  },

  async getCandidateOfferById(id: string): Promise<Offer> {
    const res = await api.get<ApiResponse<Offer>>(`/candidate/offers/${id}`);
    return res.data.data;
  },

  async acceptOffer(id: string): Promise<Offer> {
    const res = await api.post<ApiResponse<Offer>>(`/candidate/offers/${id}/accept`);
    return res.data.data;
  },

  async declineOffer(id: string, reason?: string): Promise<Offer> {
    const res = await api.post<ApiResponse<Offer>>(`/candidate/offers/${id}/decline`, { reason });
    return res.data.data;
  },

  async getRecruiterOffers(page = 0, size = 20): Promise<PagedResponse<Offer>> {
    const res = await api.get<ApiResponse<PagedResponse<Offer>>>('/recruiter/offers', { params: { page, size } });
    return res.data.data;
  },

  async createDraftOffer(applicationId: string, offerData: any): Promise<Offer> {
    const res = await api.post<ApiResponse<Offer>>(`/recruiter/applications/${applicationId}/offers`, offerData);
    return res.data.data;
  },

  async issueOffer(id: string): Promise<Offer> {
    const res = await api.post<ApiResponse<Offer>>(`/recruiter/offers/${id}/issue`);
    return res.data.data;
  },

  async withdrawOffer(id: string, reason?: string): Promise<Offer> {
    const res = await api.post<ApiResponse<Offer>>(`/recruiter/offers/${id}/withdraw`, { reason });
    return res.data.data;
  },
};

// ================= NOTIFICATION SERVICE =================
export const notificationService = {
  async getNotifications(page = 0, size = 20): Promise<PagedResponse<Notification>> {
    const res = await api.get<ApiResponse<PagedResponse<Notification>>>('/notifications', { params: { page, size } });
    return res.data.data;
  },

  async getUnreadCount(): Promise<number> {
    const res = await api.get<ApiResponse<{ unreadCount: number }>>('/notifications/unread-count');
    return res.data.data.unreadCount;
  },

  async markAsRead(id: string): Promise<void> {
    await api.post(`/notifications/${id}/read`);
  },

  async markAllAsRead(): Promise<void> {
    await api.post('/notifications/read-all');
  },
};

// ================= ANALYTICS SERVICE =================
export const analyticsService = {
  async getRecruiterDashboard(): Promise<RecruiterDashboard> {
    const res = await api.get<ApiResponse<RecruiterDashboard>>('/recruiter/analytics/dashboard');
    return res.data.data;
  },

  async getAdminDashboard(): Promise<AdminDashboard> {
    const res = await api.get<ApiResponse<AdminDashboard>>('/admin/analytics/dashboard');
    return res.data.data;
  },
};

// ================= TALENT POOL SERVICE =================
export const talentPoolService = {
  async getLeads(params?: { status?: LeadStatus; search?: string; page?: number; size?: number }): Promise<PagedResponse<TalentLead>> {
    const res = await api.get<ApiResponse<PagedResponse<TalentLead>>>('/recruiter/talent-pool', { params });
    return res.data.data;
  },

  async createLead(data: any): Promise<TalentLead> {
    const res = await api.post<ApiResponse<TalentLead>>('/recruiter/talent-pool', data);
    return res.data.data;
  },

  async updateLead(id: string, data: any): Promise<TalentLead> {
    const res = await api.put<ApiResponse<TalentLead>>(`/recruiter/talent-pool/${id}`, data);
    return res.data.data;
  },

  async deleteLead(id: string): Promise<void> {
    await api.delete(`/recruiter/talent-pool/${id}`);
  },

  async bulkImport(leads: any[]): Promise<any> {
    const res = await api.post<ApiResponse<any>>('/recruiter/talent-pool/import', {
      leads,
      confirmedAuthorization: true,
    });
    return res.data.data;
  },
};

// ================= ADMIN SERVICE =================
export const adminService = {
  async getCompanies(status?: string, page = 0, size = 20): Promise<PagedResponse<Company>> {
    const res = await api.get<ApiResponse<PagedResponse<Company>>>('/admin/companies', {
      params: { status, page, size },
    });
    return res.data.data;
  },

  async approveCompany(id: string): Promise<Company> {
    const res = await api.post<ApiResponse<Company>>(`/admin/companies/${id}/approve`);
    return res.data.data;
  },

  async rejectCompany(id: string, reason?: string): Promise<Company> {
    const res = await api.post<ApiResponse<Company>>(`/admin/companies/${id}/reject`, { reason });
    return res.data.data;
  },

  async suspendCompany(id: string, reason?: string): Promise<Company> {
    const res = await api.post<ApiResponse<Company>>(`/admin/companies/${id}/suspend`, { reason });
    return res.data.data;
  },

  async getAuditLogs(params?: any): Promise<PagedResponse<any>> {
    const res = await api.get<ApiResponse<PagedResponse<any>>>('/admin/audit-logs', { params });
    return res.data.data;
  },
};

// ================= COMPANY SERVICE =================
export const companyService = {
  async getMyCompany(): Promise<Company> {
    const res = await api.get<ApiResponse<Company>>('/companies/me');
    return res.data.data;
  },

  async updateMyCompany(data: any): Promise<Company> {
    const res = await api.put<ApiResponse<Company>>('/companies/me', data);
    return res.data.data;
  },

  async getMyCompanyStatus(): Promise<{ status: CompanyStatus; isApproved: boolean; reviewReason: string }> {
    const res = await api.get<ApiResponse<any>>('/companies/me/status');
    return res.data.data;
  },
};

// ================= RECRUITER API =================
export const recruiterApi = {
  getCompanyJobs: (params?: any) =>
    api.get<ApiResponse<PagedResponse<Job>>>('/recruiter/jobs', { params }),
  createJob: (payload: any) =>
    api.post<ApiResponse<Job>>('/recruiter/jobs', payload),
  updateJobStatus: (jobId: string, status: JobStatus) =>
    api.patch<ApiResponse<Job>>(`/recruiter/jobs/${jobId}/status?status=${status}`),
  getApplications: (params?: any) =>
    api.get<ApiResponse<PagedResponse<Application>>>('/recruiter/applications', { params }),
  updateApplicationStatus: (appId: string, status: ApplicationStatus, notes?: string) =>
    api.patch<ApiResponse<Application>>(
      `/recruiter/applications/${appId}/status?status=${status}${notes ? `&notes=${encodeURIComponent(notes)}` : ''}`
    ),
  getCompanyInterviews: () =>
    api.get<ApiResponse<Interview[]>>('/recruiter/interviews'),
  scheduleInterview: (payload: any) =>
    api.post<ApiResponse<Interview>>('/recruiter/interviews', payload),
  submitInterviewFeedback: (interviewId: string, feedback: any) =>
    api.post<ApiResponse<InterviewFeedback>>(`/recruiter/interviews/${interviewId}/feedback`, feedback),
  cancelInterview: (interviewId: string, reason?: string) =>
    api.post<ApiResponse<Interview>>(
      `/recruiter/interviews/${interviewId}/cancel${reason ? `?reason=${encodeURIComponent(reason)}` : ''}`
    ),
  getCompanyOffers: () =>
    api.get<ApiResponse<Offer[]>>('/recruiter/offers'),
  createOffer: (payload: any) =>
    api.post<ApiResponse<Offer>>('/recruiter/offers', payload),
  withdrawOffer: (offerId: string, reason?: string) =>
    api.post<ApiResponse<Offer>>(
      `/recruiter/offers/${offerId}/withdraw${reason ? `?reason=${encodeURIComponent(reason)}` : ''}`
    ),
  getTalentLeads: () =>
    api.get<ApiResponse<TalentLead[]>>('/recruiter/talent-pool/leads'),
  addTalentLead: (payload: any) =>
    api.post<ApiResponse<TalentLead>>('/recruiter/talent-pool/leads', payload),
  bulkImportTalentLeads: (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    return api.post<ApiResponse<any>>('/recruiter/talent-pool/import', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
  updateLeadStatus: (leadId: string, status: LeadStatus) =>
    api.patch<ApiResponse<TalentLead>>(`/recruiter/talent-pool/leads/${leadId}/status?status=${status}`),
  getCompanyProfile: () =>
    api.get<ApiResponse<Company>>('/companies/me'),
  updateCompanyProfile: (payload: any) =>
    api.put<ApiResponse<Company>>('/companies/me', payload),
};

// ================= ADMIN API =================
export const adminApi = {
  getCompanies: (params?: any) =>
    api.get<ApiResponse<PagedResponse<Company>>>('/admin/companies', { params }),
  approveCompany: (id: string) =>
    api.post<ApiResponse<Company>>(`/admin/companies/${id}/approve`),
  rejectCompany: (id: string, reason?: string) =>
    api.post<ApiResponse<Company>>(`/admin/companies/${id}/reject`, { reason }),
  suspendCompany: (id: string, reason?: string) =>
    api.post<ApiResponse<Company>>(`/admin/companies/${id}/suspend`, { reason }),
  getAuditLogs: (params?: any) =>
    api.get<ApiResponse<PagedResponse<AuditLog>>>('/admin/audit-logs', { params }),
};

// ================= CANDIDATE API =================
export const candidateApi = {
  getProfile: () => api.get<ApiResponse<CandidateProfile>>('/candidate/profile'),
  getOffers: () => api.get<ApiResponse<Offer[]>>('/candidate/offers'),
  acceptOffer: (offerId: string) =>
    api.post<ApiResponse<Offer>>(`/candidate/offers/${offerId}/accept`),
  declineOffer: (offerId: string, reason?: string) =>
    api.post<ApiResponse<Offer>>(`/candidate/offers/${offerId}/decline`, { reason }),
};

// ================= NOTIFICATION API =================
export const notificationApi = {
  getNotifications: (unreadOnly?: boolean) =>
    api.get<ApiResponse<Notification[]>>(`/notifications${unreadOnly ? '?unreadOnly=true' : ''}`),
  markAsRead: (id: string) =>
    api.patch<ApiResponse<Notification>>(`/notifications/${id}/read`),
  markAllAsRead: () =>
    api.patch<ApiResponse<void>>('/notifications/read-all'),
};

