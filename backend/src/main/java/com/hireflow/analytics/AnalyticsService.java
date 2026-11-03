package com.hireflow.analytics;

import com.hireflow.application.ApplicationRepository;
import com.hireflow.application.ApplicationStatus;
import com.hireflow.company.Company;
import com.hireflow.company.CompanyRepository;
import com.hireflow.company.CompanyService;
import com.hireflow.company.CompanyStatus;
import com.hireflow.interview.InterviewRepository;
import com.hireflow.interview.InterviewStatus;
import com.hireflow.job.Job;
import com.hireflow.job.JobRepository;
import com.hireflow.job.JobStatus;
import com.hireflow.offer.OfferRepository;
import com.hireflow.offer.OfferStatus;
import com.hireflow.user.Role;
import com.hireflow.user.UserRepository;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;

@Service
public class AnalyticsService {

    private final JobRepository jobRepository;
    private final ApplicationRepository applicationRepository;
    private final InterviewRepository interviewRepository;
    private final OfferRepository offerRepository;
    private final CompanyRepository companyRepository;
    private final UserRepository userRepository;
    private final CompanyService companyService;

    public AnalyticsService(JobRepository jobRepository,
                            ApplicationRepository applicationRepository,
                            InterviewRepository interviewRepository,
                            OfferRepository offerRepository,
                            CompanyRepository companyRepository,
                            UserRepository userRepository,
                            CompanyService companyService) {
        this.jobRepository = jobRepository;
        this.applicationRepository = applicationRepository;
        this.interviewRepository = interviewRepository;
        this.offerRepository = offerRepository;
        this.companyRepository = companyRepository;
        this.userRepository = userRepository;
        this.companyService = companyService;
    }

    @Transactional(readOnly = true)
    public RecruiterDashboardDto getRecruiterDashboard(UUID recruiterUserId) {
        Company company = companyService.getCompanyForRecruiter(recruiterUserId);
        UUID companyId = company.getId();

        long totalJobs = jobRepository.countByCompanyId(companyId);
        long activeJobs = jobRepository.countByCompanyIdAndStatus(companyId, JobStatus.PUBLISHED);
        long closedJobs = jobRepository.countByCompanyIdAndStatus(companyId, JobStatus.CLOSED);

        long totalApplications = applicationRepository.countByJobCompanyId(companyId);
        long awaitingReview = applicationRepository.countByJobCompanyIdAndApplicationStatus(companyId, ApplicationStatus.SUBMITTED);
        long shortlisted = applicationRepository.countByJobCompanyIdAndApplicationStatus(companyId, ApplicationStatus.SHORTLISTED);
        long interviewsScheduled = interviewRepository.countByApplicationJobCompanyIdAndInterviewStatus(companyId, InterviewStatus.SCHEDULED);
        long offersIssued = offerRepository.countByApplicationJobCompanyIdAndOfferStatus(companyId, OfferStatus.SENT);
        long hiresCount = applicationRepository.countByJobCompanyIdAndApplicationStatus(companyId, ApplicationStatus.HIRED);

        // Status distribution
        Map<ApplicationStatus, Long> distribution = new EnumMap<>(ApplicationStatus.class);
        for (ApplicationStatus status : ApplicationStatus.values()) {
            distribution.put(status, applicationRepository.countByJobCompanyIdAndApplicationStatus(companyId, status));
        }

        // Top jobs by application count
        List<Job> companyJobs = jobRepository.findByCompanyId(companyId, PageRequest.of(0, 10)).getContent();
        List<JobApplicationCountDto> topJobs = companyJobs.stream()
                .map(j -> new JobApplicationCountDto(j.getId(), j.getTitle(), applicationRepository.countByJobId(j.getId())))
                .toList();

        // Funnel
        List<FunnelStageDto> funnel = calculateFunnel(companyId, totalApplications);

        return new RecruiterDashboardDto(
                totalJobs,
                activeJobs,
                closedJobs,
                totalApplications,
                awaitingReview,
                shortlisted,
                interviewsScheduled,
                offersIssued,
                hiresCount,
                distribution,
                topJobs,
                funnel
        );
    }

    @Transactional(readOnly = true)
    public List<FunnelStageDto> getRecruitmentFunnel(UUID recruiterUserId) {
        Company company = companyService.getCompanyForRecruiter(recruiterUserId);
        long totalApplications = applicationRepository.countByJobCompanyId(company.getId());
        return calculateFunnel(company.getId(), totalApplications);
    }

    private List<FunnelStageDto> calculateFunnel(UUID companyId, long totalApplications) {
        long applied = totalApplications;
        long underReview = applicationRepository.countByJobCompanyIdAndApplicationStatus(companyId, ApplicationStatus.UNDER_REVIEW);
        long shortlisted = applicationRepository.countByJobCompanyIdAndApplicationStatus(companyId, ApplicationStatus.SHORTLISTED);
        long interview = applicationRepository.countByJobCompanyIdAndApplicationStatus(companyId, ApplicationStatus.INTERVIEW);
        long offered = applicationRepository.countByJobCompanyIdAndApplicationStatus(companyId, ApplicationStatus.OFFERED);
        long hired = applicationRepository.countByJobCompanyIdAndApplicationStatus(companyId, ApplicationStatus.HIRED);

        List<FunnelStageDto> list = new ArrayList<>();
        list.add(new FunnelStageDto("Applied", applied, 100.0));
        list.add(new FunnelStageDto("Under Review", underReview, applied > 0 ? (underReview * 100.0 / applied) : 0.0));
        list.add(new FunnelStageDto("Shortlisted", shortlisted, applied > 0 ? (shortlisted * 100.0 / applied) : 0.0));
        list.add(new FunnelStageDto("Interview", interview, applied > 0 ? (interview * 100.0 / applied) : 0.0));
        list.add(new FunnelStageDto("Offered", offered, applied > 0 ? (offered * 100.0 / applied) : 0.0));
        list.add(new FunnelStageDto("Hired", hired, applied > 0 ? (hired * 100.0 / applied) : 0.0));
        return list;
    }

    @Transactional(readOnly = true)
    public AdminDashboardDto getAdminDashboard() {
        long totalCandidates = userRepository.countByRole(Role.CANDIDATE);
        long totalRecruiters = userRepository.countByRole(Role.RECRUITER);
        long totalCompanies = companyRepository.count();
        long pendingCompanies = companyRepository.countByCompanyStatus(CompanyStatus.PENDING);
        long approvedCompanies = companyRepository.countByCompanyStatus(CompanyStatus.APPROVED);
        long activeJobs = jobRepository.countByStatus(JobStatus.PUBLISHED);
        long totalApplications = applicationRepository.count();

        Map<String, Long> stats = Map.of(
                "candidates", totalCandidates,
                "recruiters", totalRecruiters,
                "companies", totalCompanies,
                "pendingApprovals", pendingCompanies,
                "approvedCompanies", approvedCompanies,
                "activeJobs", activeJobs,
                "totalApplications", totalApplications
        );

        return new AdminDashboardDto(
                totalCandidates,
                totalRecruiters,
                totalCompanies,
                pendingCompanies,
                approvedCompanies,
                activeJobs,
                totalApplications,
                stats
        );
    }
}
