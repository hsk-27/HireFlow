export type Role =
  | 'CANDIDATE'
  | 'RECRUITER'
  | 'ADMIN'
  | 'ROLE_CANDIDATE'
  | 'ROLE_RECRUITER'
  | 'ROLE_ADMIN';

export type AccountStatus = 'ACTIVE' | 'PENDING' | 'SUSPENDED' | 'DISABLED';

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phoneNumber?: string;
  role: Role;
  accountStatus: AccountStatus;
  emailVerified?: boolean;
  createdAt: string;
  lastLoginAt?: string;
}

export type CompanyStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'SUSPENDED';

export interface Company {
  id: string;
  name: string;
  description?: string;
  website?: string;
  industry?: string;
  companySize?: string;
  headquartersLocation?: string;
  companyStatus?: CompanyStatus;
  status?: CompanyStatus;
  reviewReason?: string;
  logoUrl?: string;
  createdAt: string;
  updatedAt?: string;
}

export type JobStatus = 'DRAFT' | 'PUBLISHED' | 'CLOSED' | 'ARCHIVED';
export type EmploymentType = 'FULL_TIME' | 'PART_TIME' | 'INTERNSHIP' | 'CONTRACT' | 'TEMPORARY';
export type WorkplaceType = 'ONSITE' | 'REMOTE' | 'HYBRID' | 'ON_SITE';

export interface JobEligibility {
  id?: string;
  minCgpa?: number;
  min10thPercent?: number;
  min12thPercent?: number;
  maxBacklogs?: number;
  minimumGraduationYear?: number;
  maximumGraduationYear?: number;
  minimumScore?: number;
  scoreScale?: number;
  minimumExperienceYears?: number;
  allowedDegrees?: string[];
  allowedBranches?: string[];
  graduationYears?: number[];
  eligibleBranches?: string[];
  eligibleDegrees?: string[];
  strictEnforcement?: boolean;
}

export interface Job {
  id: string;
  companyId: string;
  companyName: string;
  companyLogoUrl?: string;
  companyWebsite?: string;
  title: string;
  department?: string;
  description: string;
  requirements?: string;
  responsibilities?: string;
  requiredQualifications?: string;
  preferredQualifications?: string;
  employmentType: EmploymentType | string;
  workplaceType: WorkplaceType | string;
  location: string;
  salaryMin?: number;
  salaryMax?: number;
  salaryCurrency?: string;
  currency?: string;
  experienceMin?: number;
  experienceMax?: number;
  status: JobStatus;
  applicationDeadline?: string;
  publishedAt?: string;
  createdAt: string;
  updatedAt?: string;
  eligibilityCriteria?: JobEligibility;
  eligibility?: JobEligibility;
}

export interface CandidateProfile {
  id: string;
  userId: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber?: string;
  headline?: string;
  summary?: string;
  professionalSummary?: string;
  currentLocation?: string;
  preferredLocation?: string;
  portfolioUrl?: string;
  linkedinUrl?: string;
  githubUrl?: string;
  currentResumeId?: string;
  currentResumeName?: string;
  profileCompletionPercentage?: number;
}

export interface CandidateEducation {
  id: string;
  institution: string;
  degree: string;
  branch?: string;
  fieldOfStudy?: string;
  qualificationLevel?: string;
  graduationYear?: number;
  score?: number;
  scoreScale?: number;
  gradeScore?: number;
  tenthPercent?: number;
  twelfthPercent?: number;
  activeBacklogs?: number;
  startDate?: string;
  endDate?: string;
  startYear?: number;
  endYear?: number;
  isPrimary?: boolean;
}

export interface CandidateExperience {
  id: string;
  companyName: string;
  jobTitle: string;
  employmentType?: string;
  description?: string;
  startDate: string;
  endDate?: string;
  currentlyWorking?: boolean;
}

export interface Skill {
  id: string;
  skillId?: string;
  name: string;
  category?: string;
  yearsOfExperience?: number;
}

export interface Document {
  id: string;
  originalFilename: string;
  documentType: 'RESUME' | 'COMPANY_LOGO' | 'OFFER_DOCUMENT' | 'OTHER' | string;
  contentType?: string;
  fileSize?: number;
  fileSizeBytes?: number;
  storagePath?: string;
  mimeType?: string;
  sha256Checksum?: string;
  createdAt: string;
}

export type ApplicationStatus =
  | 'SUBMITTED'
  | 'UNDER_REVIEW'
  | 'SHORTLISTED'
  | 'INTERVIEW'
  | 'OFFERED'
  | 'HIRED'
  | 'REJECTED'
  | 'WITHDRAWN'
  | 'OFFER_DECLINED';

export type EligibilityStatus = 'ELIGIBLE' | 'INELIGIBLE' | 'REVIEW_REQUIRED' | 'MANUALLY_OVERRIDDEN';

export interface ApplicationStatusHistory {
  id: string;
  applicationId: string;
  fromStatus?: ApplicationStatus;
  previousStatus?: ApplicationStatus;
  toStatus: ApplicationStatus;
  newStatus?: ApplicationStatus;
  changedByName?: string;
  changeReason?: string;
  notes?: string;
  changedAt: string;
  createdAt?: string;
}

export interface Application {
  id: string;
  jobId: string;
  jobTitle: string;
  companyId: string;
  companyName: string;
  candidateId: string;
  candidateName: string;
  candidateEmail: string;
  resumeDocumentId?: string;
  resumeFilename?: string;
  resumeUrl?: string;
  coverLetter?: string;
  status: ApplicationStatus;
  applicationStatus?: ApplicationStatus;
  eligibilityStatus: EligibilityStatus;
  eligibilityReason?: string;
  eligibilityReasons?: string;
  appliedAt: string;
  submittedAt?: string;
  updatedAt?: string;
  statusHistory?: ApplicationStatusHistory[];
}

export type InterviewType =
  | 'TECHNICAL'
  | 'HR'
  | 'MANAGERIAL'
  | 'BEHAVIORAL'
  | 'SCREENING'
  | 'PHONE_SCREEN'
  | 'SYSTEM_DESIGN'
  | 'HIRING_MANAGER'
  | 'FINAL'
  | 'OTHER';

export type InterviewStatus = 'SCHEDULED' | 'COMPLETED' | 'CANCELLED' | 'RESCHEDULED';
export type FeedbackRecommendation =
  | 'STRONG_YES'
  | 'YES'
  | 'NEUTRAL'
  | 'NO'
  | 'STRONG_NO'
  | 'STRONG_HIRE'
  | 'HIRE'
  | 'LEANING_HIRE'
  | 'LEANING_REJECT'
  | 'REJECT';

export interface InterviewFeedback {
  id: string;
  interviewId: string;
  interviewerName?: string;
  technicalRating?: number;
  technicalScore?: number;
  communicationRating?: number;
  communicationScore?: number;
  problemSolvingRating?: number;
  problemSolvingScore?: number;
  culturalFitScore?: number;
  overallRating: number;
  recommendation: FeedbackRecommendation;
  strengths?: string;
  weaknesses?: string;
  feedbackText?: string;
  detailedNotes?: string;
  submittedAt: string;
}

export interface Interview {
  id: string;
  applicationId: string;
  jobId: string;
  jobTitle: string;
  candidateId?: string;
  candidateName: string;
  candidateEmail?: string;
  interviewerId?: string;
  interviewerName?: string;
  roundNumber: number;
  scheduledStartTime: string;
  scheduledEndTime: string;
  scheduledStart?: string;
  scheduledEnd?: string;
  timezone?: string;
  interviewType: InterviewType;
  meetingLocation?: string;
  locationUrl?: string;
  meetingLink?: string;
  status: InterviewStatus;
  interviewStatus?: InterviewStatus;
  notes?: string;
  createdAt: string;
  feedback?: InterviewFeedback;
}

export type OfferStatus =
  | 'DRAFT'
  | 'ISSUED'
  | 'SENT'
  | 'ACCEPTED'
  | 'DECLINED'
  | 'EXPIRED'
  | 'WITHDRAWN';

export interface Offer {
  id: string;
  applicationId: string;
  jobId: string;
  jobTitle: string;
  companyId: string;
  companyName: string;
  candidateId?: string;
  candidateName: string;
  candidateEmail?: string;
  salary: number;
  compensation?: number;
  currency: string;
  employmentType?: string;
  startDate: string;
  joiningDate?: string;
  expirationDate?: string;
  expiresAt?: string;
  status: OfferStatus;
  offerStatus?: OfferStatus;
  terms?: string;
  candidateNotes?: string;
  issuedAt?: string;
  respondedAt?: string;
  createdAt: string;
}

export interface Notification {
  id: string;
  type?: string;
  notificationType?: string;
  title: string;
  message: string;
  resourceType?: string;
  resourceId?: string;
  read: boolean;
  readAt?: string;
  createdAt: string;
}

export interface FunnelStage {
  stage: string;
  count: number;
  conversionPercentage: number;
}

export interface JobApplicationCount {
  jobId: string;
  jobTitle: string;
  applicationCount: number;
}

export interface RecruiterDashboard {
  totalJobs: number;
  activeJobs: number;
  closedJobs: number;
  totalApplications: number;
  applicationsAwaitingReview: number;
  shortlistedCandidates: number;
  interviewsScheduled: number;
  offersIssued: number;
  hiresCount: number;
  statusDistribution: Record<ApplicationStatus, number>;
  topJobs: JobApplicationCount[];
  funnel: FunnelStage[];
}

export interface AdminDashboard {
  totalCandidates: number;
  totalRecruiters: number;
  totalCompanies: number;
  pendingCompanyApprovals: number;
  approvedCompanies: number;
  activeJobs: number;
  totalApplications: number;
  platformStats: Record<string, number>;
}

export type LeadStatus =
  | 'NEW'
  | 'SOURCED'
  | 'CONTACTED'
  | 'RESPONDED'
  | 'INVITED'
  | 'CONVERTED'
  | 'ARCHIVED';

export interface TalentLead {
  id: string;
  companyId?: string;
  firstName?: string;
  lastName?: string;
  fullName?: string;
  email: string;
  phoneNumber?: string;
  phone?: string;
  currentCompany?: string;
  currentTitle?: string;
  currentDesignation?: string;
  yearsExperience?: number;
  yearsOfExperience?: number;
  location?: string;
  skills?: string | string[];
  source?: string;
  status: LeadStatus;
  leadStatus?: LeadStatus;
  notes?: string;
  importedAt?: string;
  createdAt?: string;
}

export interface AuditLog {
  id: string;
  action: string;
  entityType: string;
  entityId: string;
  performedByUserId?: string;
  performedByEmail?: string;
  ipAddress?: string;
  details?: string;
  performedAt: string;
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  errors?: Record<string, string>;
  timestamp: string;
}

export interface PagedResponse<T> {
  content: T[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  last: boolean;
}

export interface AuthResponseData {
  accessToken: string;
  refreshToken: string;
  tokenType: string;
  expiresIn: number;
  user: User;
  company?: Company;
}
