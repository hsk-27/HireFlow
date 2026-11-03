package com.hireflow.config;

import com.hireflow.application.*;
import com.hireflow.candidate.*;
import com.hireflow.company.*;
import com.hireflow.interview.*;
import com.hireflow.job.*;
import com.hireflow.offer.*;
import com.hireflow.user.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.UUID;

@Component
@ConditionalOnProperty(name = "hireflow.seed.enabled", havingValue = "true", matchIfMissing = true)
public class DataInitializer implements CommandLineRunner {

    private static final Logger log = LoggerFactory.getLogger(DataInitializer.class);

    private final UserRepository userRepository;
    private final CompanyRepository companyRepository;
    private final RecruiterCompanyRepository recruiterCompanyRepository;
    private final CandidateProfileRepository profileRepository;
    private final CandidateEducationRepository educationRepository;
    private final CandidateExperienceRepository experienceRepository;
    private final SkillRepository skillRepository;
    private final CandidateSkillRepository candidateSkillRepository;
    private final DocumentRepository documentRepository;
    private final JobRepository jobRepository;
    private final JobEligibilityCriteriaRepository criteriaRepository;
    private final JobEligibleBranchRepository branchRepository;
    private final JobEligibleDegreeRepository degreeRepository;
    private final ApplicationRepository applicationRepository;
    private final ApplicationStatusHistoryRepository historyRepository;
    private final InterviewRepository interviewRepository;
    private final OfferRepository offerRepository;
    private final PasswordEncoder passwordEncoder;

    public DataInitializer(
            UserRepository userRepository,
            CompanyRepository companyRepository,
            RecruiterCompanyRepository recruiterCompanyRepository,
            CandidateProfileRepository profileRepository,
            CandidateEducationRepository educationRepository,
            CandidateExperienceRepository experienceRepository,
            SkillRepository skillRepository,
            CandidateSkillRepository candidateSkillRepository,
            DocumentRepository documentRepository,
            JobRepository jobRepository,
            JobEligibilityCriteriaRepository criteriaRepository,
            JobEligibleBranchRepository branchRepository,
            JobEligibleDegreeRepository degreeRepository,
            ApplicationRepository applicationRepository,
            ApplicationStatusHistoryRepository historyRepository,
            InterviewRepository interviewRepository,
            OfferRepository offerRepository,
            PasswordEncoder passwordEncoder
    ) {
        this.userRepository = userRepository;
        this.companyRepository = companyRepository;
        this.recruiterCompanyRepository = recruiterCompanyRepository;
        this.profileRepository = profileRepository;
        this.educationRepository = educationRepository;
        this.experienceRepository = experienceRepository;
        this.skillRepository = skillRepository;
        this.candidateSkillRepository = candidateSkillRepository;
        this.documentRepository = documentRepository;
        this.jobRepository = jobRepository;
        this.criteriaRepository = criteriaRepository;
        this.branchRepository = branchRepository;
        this.degreeRepository = degreeRepository;
        this.applicationRepository = applicationRepository;
        this.historyRepository = historyRepository;
        this.interviewRepository = interviewRepository;
        this.offerRepository = offerRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    @Transactional
    public void run(String... args) {
        if (userRepository.existsByEmail("admin@hireflow.dev")) {
            log.info("Development seed data already initialized. Skipping.");
            return;
        }

        log.info("Seeding development demo accounts and business data...");

        // 1. ADMIN USER
        User admin = new User();
        admin.setEmail("admin@hireflow.dev");
        admin.setPasswordHash(passwordEncoder.encode("AdminPass123!"));
        admin.setFirstName("Sarah");
        admin.setLastName("Administrator");
        admin.setPhoneNumber("+1 555-0100");
        admin.setRole(Role.ADMIN);
        admin.setAccountStatus(AccountStatus.ACTIVE);
        admin.setEmailVerified(true);
        admin = userRepository.save(admin);

        // 2. RECRUITER 1: TechCorp (Approved)
        User recruiterTech = new User();
        recruiterTech.setEmail("recruiter@techcorp.com");
        recruiterTech.setPasswordHash(passwordEncoder.encode("RecruiterPass123!"));
        recruiterTech.setFirstName("Alex");
        recruiterTech.setLastName("Vance");
        recruiterTech.setPhoneNumber("+1 555-0200");
        recruiterTech.setRole(Role.RECRUITER);
        recruiterTech.setAccountStatus(AccountStatus.ACTIVE);
        recruiterTech.setEmailVerified(true);
        recruiterTech = userRepository.save(recruiterTech);

        Company techCorp = new Company(
                "TechCorp Solutions",
                "Leading enterprise cloud and distributed systems consulting firm.",
                "https://techcorp.example.com",
                "Software & Technology",
                "ENTERPRISE",
                "San Francisco, CA",
                recruiterTech
        );
        techCorp.setCompanyStatus(CompanyStatus.APPROVED);
        techCorp.setReviewedBy(admin);
        techCorp.setReviewedAt(Instant.now());
        techCorp.setReviewReason("Pre-approved enterprise partner");
        techCorp = companyRepository.save(techCorp);

        recruiterCompanyRepository.save(new RecruiterCompany(recruiterTech, techCorp, true));

        // 3. RECRUITER 2: InnoSoft (Approved)
        User recruiterInno = new User();
        recruiterInno.setEmail("recruiter@innosoft.com");
        recruiterInno.setPasswordHash(passwordEncoder.encode("RecruiterPass123!"));
        recruiterInno.setFirstName("Marcus");
        recruiterInno.setLastName("Brody");
        recruiterInno.setPhoneNumber("+1 555-0201");
        recruiterInno.setRole(Role.RECRUITER);
        recruiterInno.setAccountStatus(AccountStatus.ACTIVE);
        recruiterInno.setEmailVerified(true);
        recruiterInno = userRepository.save(recruiterInno);

        Company innoSoft = new Company(
                "InnoSoft Global",
                "Pioneering next-generation developer tooling and modern SaaS platforms.",
                "https://innosoft.example.com",
                "Information Technology",
                "MEDIUM",
                "New York, NY",
                recruiterInno
        );
        innoSoft.setCompanyStatus(CompanyStatus.APPROVED);
        innoSoft.setReviewedBy(admin);
        innoSoft.setReviewedAt(Instant.now());
        innoSoft.setReviewReason("Verified corporate domain");
        innoSoft = companyRepository.save(innoSoft);

        recruiterCompanyRepository.save(new RecruiterCompany(recruiterInno, innoSoft, true));

        // 4. RECRUITER 3: Pending Innovations (Pending approval)
        User recruiterPending = new User();
        recruiterPending.setEmail("recruiter@pendingco.com");
        recruiterPending.setPasswordHash(passwordEncoder.encode("RecruiterPass123!"));
        recruiterPending.setFirstName("Olivia");
        recruiterPending.setLastName("Chen");
        recruiterPending.setPhoneNumber("+1 555-0202");
        recruiterPending.setRole(Role.RECRUITER);
        recruiterPending.setAccountStatus(AccountStatus.ACTIVE);
        recruiterPending = userRepository.save(recruiterPending);

        Company pendingCo = new Company(
                "Pending Innovations LLC",
                "Emerging AI hardware and robotics research lab awaiting verification.",
                "https://pendingco.example.com",
                "Artificial Intelligence",
                "SEED",
                "Austin, TX",
                recruiterPending
        );
        pendingCo.setCompanyStatus(CompanyStatus.PENDING);
        pendingCo = companyRepository.save(pendingCo);

        recruiterCompanyRepository.save(new RecruiterCompany(recruiterPending, pendingCo, true));

        // 5. CANDIDATE 1: Jane Doe (Full profile)
        User candidateJane = new User();
        candidateJane.setEmail("jane.candidate@example.com");
        candidateJane.setPasswordHash(passwordEncoder.encode("CandidatePass123!"));
        candidateJane.setFirstName("Jane");
        candidateJane.setLastName("Candidate");
        candidateJane.setPhoneNumber("+1 555-0301");
        candidateJane.setRole(Role.CANDIDATE);
        candidateJane.setAccountStatus(AccountStatus.ACTIVE);
        candidateJane.setEmailVerified(true);
        candidateJane = userRepository.save(candidateJane);

        CandidateProfile janeProfile = new CandidateProfile(candidateJane);
        janeProfile.setProfessionalSummary("Senior Full-Stack Engineer with 5+ years of experience specializing in Java 21, Spring Boot, React, and scalable PostgreSQL database design.");
        janeProfile.setCurrentLocation("Seattle, WA");
        janeProfile.setPreferredLocation("Remote / Seattle");
        janeProfile.setLinkedinUrl("https://linkedin.com/in/jane-candidate-example");
        janeProfile.setGithubUrl("https://github.com/jane-candidate-example");
        janeProfile.setProfileCompletionPercentage(100);

        Document sampleResume = new Document(
                candidateJane.getId(),
                DocumentType.RESUME,
                "Jane_Candidate_Resume.pdf",
                "seed_jane_resume.pdf",
                "./data/uploads/seed_jane_resume.pdf",
                "application/pdf",
                245800L,
                "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855"
        );
        sampleResume = documentRepository.save(sampleResume);
        janeProfile.setCurrentResume(sampleResume);
        janeProfile = profileRepository.save(janeProfile);

        // Education for Jane
        CandidateEducation eduJane = new CandidateEducation();
        eduJane.setCandidate(janeProfile);
        eduJane.setInstitution("University of Washington");
        eduJane.setDegree("B.S.");
        eduJane.setBranch("Computer Science");
        eduJane.setQualificationLevel("UNDERGRADUATE");
        eduJane.setGraduationYear(2021);
        eduJane.setScore(new BigDecimal("3.85"));
        eduJane.setScoreScale(new BigDecimal("4.00"));
        eduJane.setStartYear(2017);
        eduJane.setEndYear(2021);
        eduJane.setPrimary(true);
        educationRepository.save(eduJane);

        // Experience for Jane
        CandidateExperience expJane = new CandidateExperience();
        expJane.setCandidate(janeProfile);
        expJane.setCompanyName("CloudScale Systems");
        expJane.setJobTitle("Software Engineer");
        expJane.setEmploymentType("Full-time");
        expJane.setDescription("Architected high-throughput microservices using Spring Boot and PostgreSQL.");
        expJane.setStartDate(LocalDate.of(2021, 6, 1));
        expJane.setCurrentlyWorking(true);
        experienceRepository.save(expJane);

        // Skills for Jane
        Skill javaSkill = skillRepository.findByNameIgnoreCase("Java").orElseGet(() -> skillRepository.save(new Skill("Java", "Backend")));
        Skill springSkill = skillRepository.findByNameIgnoreCase("Spring Boot").orElseGet(() -> skillRepository.save(new Skill("Spring Boot", "Backend")));
        Skill reactSkill = skillRepository.findByNameIgnoreCase("React").orElseGet(() -> skillRepository.save(new Skill("React", "Frontend")));
        candidateSkillRepository.save(new CandidateSkill(janeProfile, javaSkill, new BigDecimal("4.0")));
        candidateSkillRepository.save(new CandidateSkill(janeProfile, springSkill, new BigDecimal("4.0")));
        candidateSkillRepository.save(new CandidateSkill(janeProfile, reactSkill, new BigDecimal("3.0")));

        // 6. CANDIDATE 2: John Smith
        User candidateJohn = new User();
        candidateJohn.setEmail("john.smith@example.com");
        candidateJohn.setPasswordHash(passwordEncoder.encode("CandidatePass123!"));
        candidateJohn.setFirstName("John");
        candidateJohn.setLastName("Smith");
        candidateJohn.setPhoneNumber("+1 555-0302");
        candidateJohn.setRole(Role.CANDIDATE);
        candidateJohn.setAccountStatus(AccountStatus.ACTIVE);
        candidateJohn = userRepository.save(candidateJohn);

        CandidateProfile johnProfile = new CandidateProfile(candidateJohn);
        johnProfile.setProfessionalSummary("Frontend specialist focusing on React, TypeScript, and modern responsive design systems.");
        johnProfile.setCurrentLocation("Chicago, IL");
        johnProfile.setProfileCompletionPercentage(75);
        Document johnResume = new Document(
                candidateJohn.getId(),
                DocumentType.RESUME,
                "John_Smith_CV.pdf",
                "seed_john_resume.pdf",
                "./data/uploads/seed_john_resume.pdf",
                "application/pdf",
                198200L,
                "c5b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b811"
        );
        johnResume = documentRepository.save(johnResume);
        johnProfile.setCurrentResume(johnResume);
        johnProfile = profileRepository.save(johnProfile);

        CandidateEducation eduJohn = new CandidateEducation();
        eduJohn.setCandidate(johnProfile);
        eduJohn.setInstitution("Northwestern University");
        eduJohn.setDegree("B.S.");
        eduJohn.setBranch("Computer Science");
        eduJohn.setGraduationYear(2022);
        eduJohn.setScore(new BigDecimal("3.70"));
        eduJohn.setScoreScale(new BigDecimal("4.00"));
        eduJohn.setPrimary(true);
        educationRepository.save(eduJohn);

        candidateSkillRepository.save(new CandidateSkill(johnProfile, reactSkill, new BigDecimal("2.5")));

        // 7. SEED JOBS FOR TECHCORP
        Job job1 = new Job();
        job1.setCompany(techCorp);
        job1.setCreatedBy(recruiterTech);
        job1.setTitle("Senior Backend Java Engineer");
        job1.setDescription("We are seeking an experienced Backend Engineer to lead development of our distributed cloud computing platform.");
        job1.setResponsibilities("Design, develop, and maintain high-volume REST APIs using Spring Boot, Hibernate, and PostgreSQL. Lead code reviews and performance optimizations.");
        job1.setRequiredQualifications("4+ years experience with Java & Spring ecosystem. Solid experience with relational databases and SQL query tuning.");
        job1.setPreferredQualifications("Knowledge of Docker, AWS, and reactive architectures.");
        job1.setEmploymentType(EmploymentType.FULL_TIME);
        job1.setWorkplaceType(WorkplaceType.REMOTE);
        job1.setLocation("Remote - US");
        job1.setSalaryMin(new BigDecimal("140000"));
        job1.setSalaryMax(new BigDecimal("175000"));
        job1.setSalaryCurrency("USD");
        job1.setExperienceMin(3);
        job1.setExperienceMax(8);
        job1.setStatus(JobStatus.PUBLISHED);
        job1.setApplicationDeadline(Instant.now().plus(60, ChronoUnit.DAYS));
        job1.setPublishedAt(Instant.now().minus(5, ChronoUnit.DAYS));
        job1 = jobRepository.save(job1);

        // Eligibility criteria for Job 1
        JobEligibilityCriteria criteria1 = new JobEligibilityCriteria(job1);
        criteria1.setMinimumGraduationYear(2016);
        criteria1.setMaximumGraduationYear(2024);
        criteria1.setMinimumScore(new BigDecimal("3.0"));
        criteria1.setScoreScale(new BigDecimal("4.0"));
        criteria1.setMinimumExperienceYears(2);
        criteriaRepository.save(criteria1);
        branchRepository.save(new JobEligibleBranch(job1.getId(), "Computer Science"));
        degreeRepository.save(new JobEligibleDegree(job1.getId(), "B.S."));

        Job job2 = new Job();
        job2.setCompany(techCorp);
        job2.setCreatedBy(recruiterTech);
        job2.setTitle("Full-Stack React & TypeScript Developer");
        job2.setDescription("Build high-fidelity, data-dense web applications for our enterprise SaaS product suite.");
        job2.setEmploymentType(EmploymentType.FULL_TIME);
        job2.setWorkplaceType(WorkplaceType.HYBRID);
        job2.setLocation("San Francisco, CA");
        job2.setSalaryMin(new BigDecimal("130000"));
        job2.setSalaryMax(new BigDecimal("160000"));
        job2.setStatus(JobStatus.PUBLISHED);
        job2.setApplicationDeadline(Instant.now().plus(45, ChronoUnit.DAYS));
        job2.setPublishedAt(Instant.now().minus(2, ChronoUnit.DAYS));
        job2 = jobRepository.save(job2);

        // 8. SEED APPLICATION FOR JANE ON JOB 1
        Application app1 = new Application();
        app1.setJob(job1);
        app1.setCandidate(janeProfile);
        app1.setResumeDocument(sampleResume);
        app1.setCoverLetter("I am thrilled to apply for the Senior Backend Java Engineer role at TechCorp. My background in building resilient Spring Boot systems matches your requirements.");
        app1.setApplicationStatus(ApplicationStatus.INTERVIEW);
        app1.setEligibilityStatus(EligibilityStatus.ELIGIBLE);
        app1.setEligibilityReasons("Eligible: Degree 'B.S.' matches criteria.\nEligible: Branch 'Computer Science' matches criteria.\nEligible: Score 3.85/4.00 meets minimum threshold.\nEligible: Total experience meets requirement.");
        app1.setSubmittedAt(Instant.now().minus(3, ChronoUnit.DAYS));
        app1 = applicationRepository.save(app1);

        historyRepository.save(new ApplicationStatusHistory(app1, null, ApplicationStatus.SUBMITTED, candidateJane, "Application submitted"));
        historyRepository.save(new ApplicationStatusHistory(app1, ApplicationStatus.SUBMITTED, ApplicationStatus.UNDER_REVIEW, recruiterTech, "Resume reviewed"));
        historyRepository.save(new ApplicationStatusHistory(app1, ApplicationStatus.UNDER_REVIEW, ApplicationStatus.SHORTLISTED, recruiterTech, "Strong technical match"));
        historyRepository.save(new ApplicationStatusHistory(app1, ApplicationStatus.SHORTLISTED, ApplicationStatus.INTERVIEW, recruiterTech, "Invited to technical round"));

        // Schedule interview for Jane
        Interview interview1 = new Interview();
        interview1.setApplication(app1);
        interview1.setCandidate(janeProfile);
        interview1.setInterviewer(recruiterTech);
        interview1.setScheduledStart(Instant.now().plus(2, ChronoUnit.DAYS));
        interview1.setScheduledEnd(Instant.now().plus(2, ChronoUnit.DAYS).plus(45, ChronoUnit.MINUTES));
        interview1.setInterviewType(InterviewType.TECHNICAL);
        interview1.setMeetingLocation("Virtual Google Meet");
        interview1.setMeetingLink("https://meet.google.com/hfl-tech-test");
        interview1.setInterviewStatus(InterviewStatus.SCHEDULED);
        interview1.setCreatedBy(recruiterTech);
        interviewRepository.save(interview1);

        log.info("Development demo accounts successfully seeded!");
        log.info("Credentials for testing:");
        log.info("  Admin: admin@hireflow.dev / AdminPass123!");
        log.info("  Recruiter (TechCorp - Approved): recruiter@techcorp.com / RecruiterPass123!");
        log.info("  Recruiter (InnoSoft - Approved): recruiter@innosoft.com / RecruiterPass123!");
        log.info("  Recruiter (PendingCo - Pending): recruiter@pendingco.com / RecruiterPass123!");
        log.info("  Candidate 1: jane.candidate@example.com / CandidatePass123!");
        log.info("  Candidate 2: john.smith@example.com / CandidatePass123!");
    }
}
