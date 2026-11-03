package com.hireflow.job;

import com.hireflow.audit.AuditService;
import com.hireflow.common.exception.BadRequestException;
import com.hireflow.common.exception.ForbiddenException;
import com.hireflow.common.exception.ResourceNotFoundException;
import com.hireflow.company.Company;
import com.hireflow.company.CompanyService;
import com.hireflow.company.CompanyStatus;
import com.hireflow.user.User;
import com.hireflow.user.UserRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.Collections;
import java.util.List;
import java.util.UUID;

@Service
public class JobService {

    private final JobRepository jobRepository;
    private final JobEligibilityCriteriaRepository eligibilityCriteriaRepository;
    private final JobEligibleBranchRepository branchRepository;
    private final JobEligibleDegreeRepository degreeRepository;
    private final CompanyService companyService;
    private final UserRepository userRepository;
    private final AuditService auditService;

    public JobService(JobRepository jobRepository,
                      JobEligibilityCriteriaRepository eligibilityCriteriaRepository,
                      JobEligibleBranchRepository branchRepository,
                      JobEligibleDegreeRepository degreeRepository,
                      CompanyService companyService,
                      UserRepository userRepository,
                      AuditService auditService) {
        this.jobRepository = jobRepository;
        this.eligibilityCriteriaRepository = eligibilityCriteriaRepository;
        this.branchRepository = branchRepository;
        this.degreeRepository = degreeRepository;
        this.companyService = companyService;
        this.userRepository = userRepository;
        this.auditService = auditService;
    }

    @Transactional
    public JobDto createJob(UUID recruiterUserId, CreateJobRequest req) {
        Company company = companyService.getCompanyForRecruiter(recruiterUserId);
        User recruiter = userRepository.findById(recruiterUserId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", recruiterUserId));

        if (req.salaryMin() != null && req.salaryMax() != null && req.salaryMin().compareTo(req.salaryMax()) > 0) {
            throw new BadRequestException("Minimum salary cannot exceed maximum salary");
        }

        Job job = new Job();
        job.setCompany(company);
        job.setCreatedBy(recruiter);
        job.setTitle(req.title().trim());
        job.setDescription(req.description());
        job.setResponsibilities(req.responsibilities());
        job.setRequiredQualifications(req.requiredQualifications());
        job.setPreferredQualifications(req.preferredQualifications());
        job.setEmploymentType(req.employmentType());
        job.setWorkplaceType(req.workplaceType());
        job.setLocation(req.location().trim());
        job.setSalaryMin(req.salaryMin());
        job.setSalaryMax(req.salaryMax());
        if (req.salaryCurrency() != null) job.setSalaryCurrency(req.salaryCurrency());
        job.setExperienceMin(req.experienceMin() != null ? req.experienceMin() : 0);
        job.setExperienceMax(req.experienceMax());
        job.setApplicationDeadline(req.applicationDeadline());
        job.setStatus(JobStatus.DRAFT);

        Job saved = jobRepository.save(job);

        JobEligibilityDto eligibilityDto = null;
        if (req.eligibility() != null) {
            eligibilityDto = updateEligibilityCriteria(saved.getId(), company.getId(), req.eligibility());
        }

        auditService.logEvent(recruiterUserId, company.getId(), "JOB_CREATED", "Job", saved.getId(),
                "Created job opening: " + saved.getTitle());

        return JobDto.from(saved, eligibilityDto);
    }

    @Transactional
    public JobDto updateJob(UUID jobId, UUID recruiterUserId, UpdateJobRequest req) {
        Company company = companyService.getCompanyForRecruiter(recruiterUserId);
        Job job = jobRepository.findByIdAndCompanyId(jobId, company.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Job not found or access denied"));

        if (req.title() != null) job.setTitle(req.title().trim());
        if (req.description() != null) job.setDescription(req.description());
        if (req.responsibilities() != null) job.setResponsibilities(req.responsibilities());
        if (req.requiredQualifications() != null) job.setRequiredQualifications(req.requiredQualifications());
        if (req.preferredQualifications() != null) job.setPreferredQualifications(req.preferredQualifications());
        if (req.employmentType() != null) job.setEmploymentType(req.employmentType());
        if (req.workplaceType() != null) job.setWorkplaceType(req.workplaceType());
        if (req.location() != null) job.setLocation(req.location().trim());
        if (req.salaryMin() != null) job.setSalaryMin(req.salaryMin());
        if (req.salaryMax() != null) job.setSalaryMax(req.salaryMax());
        if (req.salaryCurrency() != null) job.setSalaryCurrency(req.salaryCurrency());
        if (req.experienceMin() != null) job.setExperienceMin(req.experienceMin());
        if (req.experienceMax() != null) job.setExperienceMax(req.experienceMax());
        if (req.applicationDeadline() != null) job.setApplicationDeadline(req.applicationDeadline());

        if (job.getSalaryMin() != null && job.getSalaryMax() != null && job.getSalaryMin().compareTo(job.getSalaryMax()) > 0) {
            throw new BadRequestException("Minimum salary cannot exceed maximum salary");
        }

        Job saved = jobRepository.save(job);

        JobEligibilityDto eligibilityDto;
        if (req.eligibility() != null) {
            eligibilityDto = updateEligibilityCriteria(saved.getId(), company.getId(), req.eligibility());
        } else {
            eligibilityDto = getEligibilityDto(saved.getId());
        }

        auditService.logEvent(recruiterUserId, company.getId(), "JOB_UPDATED", "Job", saved.getId(),
                "Updated job opening: " + saved.getTitle());

        return JobDto.from(saved, eligibilityDto);
    }

    @Transactional
    public JobDto publishJob(UUID jobId, UUID recruiterUserId) {
        Company company = companyService.getCompanyForRecruiter(recruiterUserId);

        // Core business rule: Company must be approved before publishing jobs!
        if (company.getCompanyStatus() != CompanyStatus.APPROVED) {
            throw new BadRequestException("Your company (" + company.getName() + ") must be approved by an administrator before publishing jobs. Current status: " + company.getCompanyStatus());
        }

        Job job = jobRepository.findByIdAndCompanyId(jobId, company.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Job not found or access denied"));

        if (job.getApplicationDeadline() != null && job.getApplicationDeadline().isBefore(Instant.now())) {
            throw new BadRequestException("Application deadline must be in the future to publish this job");
        }

        job.setStatus(JobStatus.PUBLISHED);
        job.setPublishedAt(Instant.now());
        Job saved = jobRepository.save(job);

        auditService.logEvent(recruiterUserId, company.getId(), "JOB_PUBLISHED", "Job", saved.getId(),
                "Published job opening: " + saved.getTitle());

        return JobDto.from(saved, getEligibilityDto(saved.getId()));
    }

    @Transactional
    public JobDto closeJob(UUID jobId, UUID recruiterUserId) {
        Company company = companyService.getCompanyForRecruiter(recruiterUserId);
        Job job = jobRepository.findByIdAndCompanyId(jobId, company.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Job not found or access denied"));

        job.setStatus(JobStatus.CLOSED);
        Job saved = jobRepository.save(job);

        auditService.logEvent(recruiterUserId, company.getId(), "JOB_CLOSED", "Job", saved.getId(),
                "Closed job opening: " + saved.getTitle());

        return JobDto.from(saved, getEligibilityDto(saved.getId()));
    }

    @Transactional
    public JobDto archiveJob(UUID jobId, UUID recruiterUserId) {
        Company company = companyService.getCompanyForRecruiter(recruiterUserId);
        Job job = jobRepository.findByIdAndCompanyId(jobId, company.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Job not found or access denied"));

        job.setStatus(JobStatus.ARCHIVED);
        Job saved = jobRepository.save(job);

        auditService.logEvent(recruiterUserId, company.getId(), "JOB_ARCHIVED", "Job", saved.getId(),
                "Archived job opening: " + saved.getTitle());

        return JobDto.from(saved, getEligibilityDto(saved.getId()));
    }

    @Transactional
    public JobDto updateJobStatus(UUID jobId, UUID recruiterUserId, JobStatus newStatus) {
        Company company = companyService.getCompanyForRecruiter(recruiterUserId);
        Job job = jobRepository.findByIdAndCompanyId(jobId, company.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Job not found or access denied"));

        if (newStatus == JobStatus.PUBLISHED && company.getCompanyStatus() != CompanyStatus.APPROVED) {
            throw new BadRequestException("Your company (" + company.getName() + ") must be approved by an administrator before publishing jobs. Current status: " + company.getCompanyStatus());
        }

        job.setStatus(newStatus);
        if (newStatus == JobStatus.PUBLISHED && job.getPublishedAt() == null) {
            job.setPublishedAt(Instant.now());
        }
        Job saved = jobRepository.save(job);

        auditService.logEvent(recruiterUserId, company.getId(), "JOB_STATUS_UPDATED", "Job", saved.getId(),
                "Updated job status to: " + newStatus);

        return JobDto.from(saved, getEligibilityDto(saved.getId()));
    }

    @Transactional(readOnly = true)
    public Page<JobDto> getRecruiterJobs(UUID recruiterUserId, Pageable pageable) {
        Company company = companyService.getCompanyForRecruiter(recruiterUserId);
        return jobRepository.findByCompanyId(company.getId(), pageable)
                .map(j -> JobDto.from(j, getEligibilityDto(j.getId())));
    }

    @Transactional(readOnly = true)
    public JobDto getRecruiterJobById(UUID jobId, UUID recruiterUserId) {
        Company company = companyService.getCompanyForRecruiter(recruiterUserId);
        Job job = jobRepository.findByIdAndCompanyId(jobId, company.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Job not found or access denied"));
        return JobDto.from(job, getEligibilityDto(job.getId()));
    }

    @Transactional(readOnly = true)
    public Page<JobDto> searchPublicJobs(String keyword, String location, EmploymentType employmentType,
                                         WorkplaceType workplaceType, UUID companyId, Pageable pageable) {
        return jobRepository.searchPublicJobs(keyword, location, employmentType, workplaceType, companyId, Instant.now(), pageable)
                .map(j -> JobDto.from(j, getEligibilityDto(j.getId())));
    }

    @Transactional(readOnly = true)
    public JobDto getPublicJobById(UUID jobId) {
        Job job = jobRepository.findById(jobId)
                .orElseThrow(() -> new ResourceNotFoundException("Job", "id", jobId));

        // Public users can only see published jobs from approved companies
        if (job.getStatus() != JobStatus.PUBLISHED || job.getCompany().getCompanyStatus() != CompanyStatus.APPROVED) {
            throw new ResourceNotFoundException("Job is not currently published or available");
        }

        return JobDto.from(job, getEligibilityDto(job.getId()));
    }

    @Transactional(readOnly = true)
    public Job getEntityById(UUID jobId) {
        return jobRepository.findById(jobId)
                .orElseThrow(() -> new ResourceNotFoundException("Job", "id", jobId));
    }

    @Transactional
    public JobEligibilityDto updateEligibilityCriteria(UUID jobId, UUID companyId, UpdateEligibilityRequest req) {
        Job job = jobRepository.findByIdAndCompanyId(jobId, companyId)
                .orElseThrow(() -> new ResourceNotFoundException("Job not found or unauthorized"));

        JobEligibilityCriteria criteria = eligibilityCriteriaRepository.findByJobId(jobId)
                .orElseGet(() -> new JobEligibilityCriteria(job));

        criteria.setMinimumGraduationYear(req.minimumGraduationYear());
        criteria.setMaximumGraduationYear(req.maximumGraduationYear());
        criteria.setMinimumScore(req.minimumScore());
        criteria.setScoreScale(req.scoreScale());
        criteria.setMinimumExperienceYears(req.minimumExperienceYears());

        JobEligibilityCriteria savedCriteria = eligibilityCriteriaRepository.save(criteria);

        branchRepository.deleteByJobId(jobId);
        if (req.eligibleBranches() != null) {
            for (String branch : req.eligibleBranches()) {
                if (branch != null && !branch.isBlank()) {
                    branchRepository.save(new JobEligibleBranch(jobId, branch.trim()));
                }
            }
        }

        degreeRepository.deleteByJobId(jobId);
        if (req.eligibleDegrees() != null) {
            for (String degree : req.eligibleDegrees()) {
                if (degree != null && !degree.isBlank()) {
                    degreeRepository.save(new JobEligibleDegree(jobId, degree.trim()));
                }
            }
        }

        return getEligibilityDto(jobId);
    }

    @Transactional(readOnly = true)
    public JobEligibilityDto getEligibilityDto(UUID jobId) {
        JobEligibilityCriteria criteria = eligibilityCriteriaRepository.findByJobId(jobId).orElse(null);
        List<String> branches = branchRepository.findByJobId(jobId).stream().map(JobEligibleBranch::getBranch).toList();
        List<String> degrees = degreeRepository.findByJobId(jobId).stream().map(JobEligibleDegree::getDegree).toList();
        return JobEligibilityDto.from(criteria, branches, degrees);
    }
}
