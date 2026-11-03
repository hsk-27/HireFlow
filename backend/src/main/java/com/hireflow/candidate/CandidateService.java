package com.hireflow.candidate;

import com.hireflow.audit.AuditService;
import com.hireflow.common.exception.BadRequestException;
import com.hireflow.common.exception.ConflictException;
import com.hireflow.common.exception.ForbiddenException;
import com.hireflow.common.exception.ResourceNotFoundException;
import com.hireflow.user.Role;
import com.hireflow.user.User;
import com.hireflow.user.UserRepository;
import org.springframework.core.io.Resource;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.UUID;

@Service
public class CandidateService {

    private final CandidateProfileRepository profileRepository;
    private final CandidateEducationRepository educationRepository;
    private final CandidateExperienceRepository experienceRepository;
    private final SkillRepository skillRepository;
    private final CandidateSkillRepository candidateSkillRepository;
    private final DocumentStorageService documentStorageService;
    private final UserRepository userRepository;
    private final AuditService auditService;

    public CandidateService(CandidateProfileRepository profileRepository,
                            CandidateEducationRepository educationRepository,
                            CandidateExperienceRepository experienceRepository,
                            SkillRepository skillRepository,
                            CandidateSkillRepository candidateSkillRepository,
                            DocumentStorageService documentStorageService,
                            UserRepository userRepository,
                            AuditService auditService) {
        this.profileRepository = profileRepository;
        this.educationRepository = educationRepository;
        this.experienceRepository = experienceRepository;
        this.skillRepository = skillRepository;
        this.candidateSkillRepository = candidateSkillRepository;
        this.documentStorageService = documentStorageService;
        this.userRepository = userRepository;
        this.auditService = auditService;
    }

    @Transactional
    public CandidateProfile getOrCreateProfile(UUID userId) {
        return profileRepository.findByUserId(userId).orElseGet(() -> {
            User user = userRepository.findById(userId)
                    .orElseThrow(() -> new ResourceNotFoundException("User", "id", userId));
            CandidateProfile profile = new CandidateProfile(user);
            return profileRepository.save(profile);
        });
    }

    @Transactional(readOnly = true)
    public CandidateProfile getProfileByUserId(UUID userId) {
        return profileRepository.findByUserId(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Candidate profile not found for user: " + userId));
    }

    @Transactional
    public CandidateProfile updateProfile(UUID userId, UpdateCandidateProfileRequest req) {
        CandidateProfile profile = getOrCreateProfile(userId);

        if (req.professionalSummary() != null) profile.setProfessionalSummary(req.professionalSummary());
        if (req.currentLocation() != null) profile.setCurrentLocation(req.currentLocation());
        if (req.preferredLocation() != null) profile.setPreferredLocation(req.preferredLocation());
        if (req.portfolioUrl() != null) profile.setPortfolioUrl(req.portfolioUrl());
        if (req.linkedinUrl() != null) profile.setLinkedinUrl(req.linkedinUrl());
        if (req.githubUrl() != null) profile.setGithubUrl(req.githubUrl());

        recalculateProfileCompletion(profile);
        return profileRepository.save(profile);
    }

    @Transactional
    public void recalculateProfileCompletion(CandidateProfile profile) {
        int percentage = 0;
        User user = profile.getUser();

        // 1. Personal info: 20%
        if (user.getFirstName() != null && !user.getFirstName().isBlank() &&
            user.getLastName() != null && !user.getLastName().isBlank() &&
            user.getPhoneNumber() != null && !user.getPhoneNumber().isBlank()) {
            percentage += 20;
        } else if (user.getFirstName() != null && user.getLastName() != null) {
            percentage += 10;
        }

        // 2. Professional summary: 15%
        if (profile.getProfessionalSummary() != null && !profile.getProfessionalSummary().isBlank()) {
            percentage += 15;
        }

        // 3. Education: 25%
        List<CandidateEducation> edus = educationRepository.findByCandidateIdOrderByGraduationYearDesc(profile.getId());
        if (!edus.isEmpty()) {
            percentage += 25;
        }

        // 4. Experience: 20%
        List<CandidateExperience> exps = experienceRepository.findByCandidateIdOrderByStartDateDesc(profile.getId());
        if (!exps.isEmpty()) {
            percentage += 20;
        }

        // 5. Skills: 10%
        List<CandidateSkill> skills = candidateSkillRepository.findByCandidateId(profile.getId());
        if (!skills.isEmpty()) {
            percentage += 10;
        }

        // 6. Resume: 10%
        if (profile.getCurrentResume() != null) {
            percentage += 10;
        }

        profile.setProfileCompletionPercentage(Math.min(100, percentage));
    }

    // ---------------- EDUCATION ----------------

    @Transactional(readOnly = true)
    public List<CandidateEducationDto> getEducationList(UUID userId) {
        CandidateProfile profile = getOrCreateProfile(userId);
        return educationRepository.findByCandidateIdOrderByGraduationYearDesc(profile.getId())
                .stream().map(CandidateEducationDto::from).toList();
    }

    @Transactional
    public CandidateEducationDto addEducation(UUID userId, CreateEducationRequest req) {
        CandidateProfile profile = getOrCreateProfile(userId);

        if (req.isPrimary()) {
            educationRepository.findByCandidateIdAndIsPrimaryTrue(profile.getId())
                    .ifPresent(existing -> {
                        existing.setPrimary(false);
                        educationRepository.save(existing);
                    });
        }

        CandidateEducation edu = new CandidateEducation();
        edu.setCandidate(profile);
        edu.setInstitution(req.institution());
        edu.setDegree(req.degree());
        edu.setBranch(req.branch());
        edu.setQualificationLevel(req.qualificationLevel());
        edu.setGraduationYear(req.graduationYear());
        edu.setScore(req.score());
        edu.setScoreScale(req.scoreScale());
        edu.setStartYear(req.startYear());
        edu.setEndYear(req.endYear());
        edu.setPrimary(req.isPrimary());

        CandidateEducation saved = educationRepository.save(edu);
        recalculateProfileCompletion(profile);
        profileRepository.save(profile);
        return CandidateEducationDto.from(saved);
    }

    @Transactional
    public void deleteEducation(UUID userId, UUID educationId) {
        CandidateProfile profile = getOrCreateProfile(userId);
        CandidateEducation edu = educationRepository.findById(educationId)
                .orElseThrow(() -> new ResourceNotFoundException("Education record", "id", educationId));

        if (!edu.getCandidate().getId().equals(profile.getId())) {
            throw new ForbiddenException("You are not authorized to delete this education record");
        }

        educationRepository.delete(edu);
        recalculateProfileCompletion(profile);
        profileRepository.save(profile);
    }

    // ---------------- EXPERIENCE ----------------

    @Transactional(readOnly = true)
    public List<CandidateExperienceDto> getExperienceList(UUID userId) {
        CandidateProfile profile = getOrCreateProfile(userId);
        return experienceRepository.findByCandidateIdOrderByStartDateDesc(profile.getId())
                .stream().map(CandidateExperienceDto::from).toList();
    }

    @Transactional
    public CandidateExperienceDto addExperience(UUID userId, CreateExperienceRequest req) {
        CandidateProfile profile = getOrCreateProfile(userId);

        CandidateExperience exp = new CandidateExperience();
        exp.setCandidate(profile);
        exp.setCompanyName(req.companyName());
        exp.setJobTitle(req.jobTitle());
        exp.setEmploymentType(req.employmentType());
        exp.setDescription(req.description());
        exp.setStartDate(req.startDate());
        exp.setEndDate(req.endDate());
        exp.setCurrentlyWorking(req.currentlyWorking());

        CandidateExperience saved = experienceRepository.save(exp);
        recalculateProfileCompletion(profile);
        profileRepository.save(profile);
        return CandidateExperienceDto.from(saved);
    }

    @Transactional
    public void deleteExperience(UUID userId, UUID experienceId) {
        CandidateProfile profile = getOrCreateProfile(userId);
        CandidateExperience exp = experienceRepository.findById(experienceId)
                .orElseThrow(() -> new ResourceNotFoundException("Experience record", "id", experienceId));

        if (!exp.getCandidate().getId().equals(profile.getId())) {
            throw new ForbiddenException("You are not authorized to delete this experience record");
        }

        experienceRepository.delete(exp);
        recalculateProfileCompletion(profile);
        profileRepository.save(profile);
    }

    // ---------------- SKILLS ----------------

    @Transactional(readOnly = true)
    public List<SkillDto> getCandidateSkills(UUID userId) {
        CandidateProfile profile = getOrCreateProfile(userId);
        return candidateSkillRepository.findByCandidateId(profile.getId())
                .stream().map(SkillDto::from).toList();
    }

    @Transactional
    public SkillDto addSkill(UUID userId, AddSkillRequest req) {
        CandidateProfile profile = getOrCreateProfile(userId);

        Skill skill = skillRepository.findByNameIgnoreCase(req.skillName().trim())
                .orElseGet(() -> skillRepository.save(new Skill(req.skillName().trim(), "General")));

        if (candidateSkillRepository.existsByCandidateIdAndSkillId(profile.getId(), skill.getId())) {
            throw new ConflictException("Skill '" + skill.getName() + "' is already added to your profile");
        }

        CandidateSkill candidateSkill = new CandidateSkill(profile, skill, req.yearsOfExperience());
        CandidateSkill saved = candidateSkillRepository.save(candidateSkill);

        recalculateProfileCompletion(profile);
        profileRepository.save(profile);
        return SkillDto.from(saved);
    }

    @Transactional
    public void deleteSkill(UUID userId, UUID skillId) {
        CandidateProfile profile = getOrCreateProfile(userId);
        CandidateSkill cs = candidateSkillRepository.findById(skillId)
                .orElseThrow(() -> new ResourceNotFoundException("Skill association", "id", skillId));

        if (!cs.getCandidate().getId().equals(profile.getId())) {
            throw new ForbiddenException("You are not authorized to delete this skill");
        }

        candidateSkillRepository.delete(cs);
        recalculateProfileCompletion(profile);
        profileRepository.save(profile);
    }

    // ---------------- RESUME / DOCUMENTS ----------------

    @Transactional
    public DocumentDto uploadResume(UUID userId, MultipartFile file) {
        CandidateProfile profile = getOrCreateProfile(userId);
        Document document = documentStorageService.storeDocument(userId, file, DocumentType.RESUME);

        profile.setCurrentResume(document);
        recalculateProfileCompletion(profile);
        profileRepository.save(profile);

        auditService.logEvent(userId, null, "RESUME_UPLOADED", "Document", document.getId(),
                "Uploaded resume: " + document.getOriginalFilename());
        return DocumentDto.from(document);
    }

    @Transactional(readOnly = true)
    public DocumentDto getCurrentResume(UUID userId) {
        CandidateProfile profile = getOrCreateProfile(userId);
        if (profile.getCurrentResume() == null) {
            throw new ResourceNotFoundException("No resume has been uploaded yet");
        }
        return DocumentDto.from(profile.getCurrentResume());
    }

    @Transactional
    public void deleteResume(UUID userId) {
        CandidateProfile profile = getOrCreateProfile(userId);
        profile.setCurrentResume(null);
        recalculateProfileCompletion(profile);
        profileRepository.save(profile);
    }

    @Transactional(readOnly = true)
    public Resource downloadResume(UUID requesterUserId, Role role, UUID documentId) {
        Document document = documentStorageService.getDocumentById(documentId);

        // Security check: Candidate can only download their own document
        if (role == Role.CANDIDATE && !document.getOwnerUserId().equals(requesterUserId)) {
            throw new ForbiddenException("You are not authorized to download this candidate's resume");
        }
        // Recruiters & Admin can download application resumes when reviewing
        return documentStorageService.loadAsResource(document);
    }
}
