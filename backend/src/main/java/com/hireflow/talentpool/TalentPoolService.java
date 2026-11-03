package com.hireflow.talentpool;

import com.hireflow.audit.AuditService;
import com.hireflow.common.exception.BadRequestException;
import com.hireflow.common.exception.ConflictException;
import com.hireflow.common.exception.ResourceNotFoundException;
import com.hireflow.company.Company;
import com.hireflow.company.CompanyService;
import com.hireflow.user.User;
import com.hireflow.user.UserRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.UUID;
import java.util.regex.Pattern;

@Service
public class TalentPoolService {

    private static final int MAX_BATCH_SIZE = 500;
    private static final Pattern EMAIL_PATTERN = Pattern.compile("^[A-Za-z0-9+_.-]+@(.+)$");

    private final TalentLeadRepository talentLeadRepository;
    private final CompanyService companyService;
    private final UserRepository userRepository;
    private final AuditService auditService;

    public TalentPoolService(TalentLeadRepository talentLeadRepository,
                             CompanyService companyService,
                             UserRepository userRepository,
                             AuditService auditService) {
        this.talentLeadRepository = talentLeadRepository;
        this.companyService = companyService;
        this.userRepository = userRepository;
        this.auditService = auditService;
    }

    @Transactional
    public TalentLeadDto createLead(UUID recruiterUserId, CreateLeadRequest req) {
        if (req.fullName() == null || req.fullName().isBlank()) {
            throw new BadRequestException("Full name is required");
        }
        Company company = companyService.getCompanyForRecruiter(recruiterUserId);
        User creator = userRepository.findById(recruiterUserId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", recruiterUserId));

        String normalizedEmail = req.email().toLowerCase().trim();
        if (talentLeadRepository.existsByCompanyIdAndEmail(company.getId(), normalizedEmail)) {
            throw new ConflictException("A talent lead with this email already exists in your company's talent pool");
        }

        TalentLead lead = new TalentLead();
        lead.setCompany(company);
        lead.setFullName(req.fullName().trim());
        lead.setEmail(normalizedEmail);
        lead.setPhone(req.phone());
        lead.setCurrentCompany(req.currentCompany());
        lead.setCurrentDesignation(req.currentDesignation());
        lead.setYearsOfExperience(req.yearsOfExperience());
        lead.setLocation(req.location());
        lead.setSkills(req.skills());
        lead.setSource(req.source() != null ? req.source() : "Manual Entry");
        lead.setLeadStatus(LeadStatus.NEW);
        lead.setCreatedBy(creator);

        TalentLead saved = talentLeadRepository.save(lead);
        auditService.logEvent(recruiterUserId, company.getId(), "TALENT_LEAD_CREATED", "TalentLead", saved.getId(),
                "Added lead: " + saved.getFullName());

        return TalentLeadDto.from(saved);
    }

    @Transactional
    public TalentLeadDto updateLead(UUID leadId, UUID recruiterUserId, UpdateLeadRequest req) {
        Company company = companyService.getCompanyForRecruiter(recruiterUserId);
        TalentLead lead = talentLeadRepository.findByIdAndCompanyId(leadId, company.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Talent lead not found or unauthorized"));

        if (req.fullName() != null) lead.setFullName(req.fullName().trim());
        if (req.phone() != null) lead.setPhone(req.phone());
        if (req.currentCompany() != null) lead.setCurrentCompany(req.currentCompany());
        if (req.currentDesignation() != null) lead.setCurrentDesignation(req.currentDesignation());
        if (req.yearsOfExperience() != null) lead.setYearsOfExperience(req.yearsOfExperience());
        if (req.location() != null) lead.setLocation(req.location());
        if (req.skills() != null) lead.setSkills(req.skills());
        if (req.source() != null) lead.setSource(req.source());
        if (req.leadStatus() != null) lead.setLeadStatus(req.leadStatus());

        TalentLead saved = talentLeadRepository.save(lead);
        return TalentLeadDto.from(saved);
    }

    @Transactional
    public void deleteLead(UUID leadId, UUID recruiterUserId) {
        Company company = companyService.getCompanyForRecruiter(recruiterUserId);
        TalentLead lead = talentLeadRepository.findByIdAndCompanyId(leadId, company.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Talent lead not found or unauthorized"));
        talentLeadRepository.delete(lead);
    }

    @Transactional(readOnly = true)
    public Page<TalentLeadDto> getCompanyLeads(UUID recruiterUserId, LeadStatus status, String search, Pageable pageable) {
        Company company = companyService.getCompanyForRecruiter(recruiterUserId);
        return talentLeadRepository.findCompanyLeads(company.getId(), status, search, pageable).map(TalentLeadDto::from);
    }

    @Transactional(readOnly = true)
    public TalentLeadDto getLeadById(UUID leadId, UUID recruiterUserId) {
        Company company = companyService.getCompanyForRecruiter(recruiterUserId);
        TalentLead lead = talentLeadRepository.findByIdAndCompanyId(leadId, company.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Talent lead not found or unauthorized"));
        return TalentLeadDto.from(lead);
    }

    @Transactional
    public BulkImportResultDto bulkImport(UUID recruiterUserId, BulkImportRequest request) {
        if (request.confirmedAuthorization() == null || !request.confirmedAuthorization()) {
            throw new BadRequestException("You must confirm that you have authorization to import and process candidate leads");
        }

        List<BulkImportLeadItem> leads = request.leads();
        if (leads == null || leads.isEmpty()) {
            throw new BadRequestException("Leads import list cannot be empty");
        }
        if (leads.size() > MAX_BATCH_SIZE) {
            throw new BadRequestException("Batch size exceeds maximum limit of " + MAX_BATCH_SIZE + " records per request");
        }

        Company company = companyService.getCompanyForRecruiter(recruiterUserId);
        User creator = userRepository.findById(recruiterUserId).orElse(null);

        int importedCount = 0;
        int skippedDuplicateCount = 0;
        int failedCount = 0;
        List<String> errors = new ArrayList<>();

        for (int i = 0; i < leads.size(); i++) {
            BulkImportLeadItem item = leads.get(i);
            int rowNum = i + 1;

            if (item.fullName() == null || item.fullName().trim().isEmpty()) {
                failedCount++;
                errors.add("Row " + rowNum + ": Full name is missing");
                continue;
            }

            if (item.email() == null || !EMAIL_PATTERN.matcher(item.email().trim()).matches()) {
                failedCount++;
                errors.add("Row " + rowNum + ": Invalid email format ('" + item.email() + "')");
                continue;
            }

            String normalizedEmail = item.email().toLowerCase().trim();

            if (talentLeadRepository.existsByCompanyIdAndEmail(company.getId(), normalizedEmail)) {
                skippedDuplicateCount++;
                continue;
            }

            try {
                TalentLead lead = new TalentLead();
                lead.setCompany(company);
                lead.setFullName(item.fullName().trim());
                lead.setEmail(normalizedEmail);
                lead.setPhone(item.phone());
                lead.setCurrentCompany(item.currentCompany());
                lead.setCurrentDesignation(item.currentDesignation());
                lead.setYearsOfExperience(item.yearsOfExperience());
                lead.setLocation(item.location());
                lead.setSkills(item.skills());
                lead.setSource(item.source() != null && !item.source().isBlank() ? item.source() : "CSV Import");
                lead.setLeadStatus(LeadStatus.NEW);
                lead.setCreatedBy(creator);

                talentLeadRepository.save(lead);
                importedCount++;
            } catch (Exception e) {
                failedCount++;
                errors.add("Row " + rowNum + ": Persistence error: " + e.getMessage());
            }
        }

        auditService.logEvent(recruiterUserId, company.getId(), "TALENT_POOL_BULK_IMPORT", "TalentLead", null,
                String.format("Imported %d leads (skipped %d duplicates, failed %d)",
                        importedCount, skippedDuplicateCount, failedCount));

        return new BulkImportResultDto(leads.size(), importedCount, skippedDuplicateCount, failedCount, errors);
    }

    @Transactional
    public BulkImportResultDto importFromCsv(UUID recruiterUserId, org.springframework.web.multipart.MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new BadRequestException("Uploaded CSV file is empty");
        }
        try (java.io.BufferedReader reader = new java.io.BufferedReader(
                new java.io.InputStreamReader(file.getInputStream(), java.nio.charset.StandardCharsets.UTF_8))) {
            String headerLine = reader.readLine();
            if (headerLine == null) {
                throw new BadRequestException("CSV file has no header row");
            }
            List<String> headers = parseCsvRow(headerLine).stream().map(String::toLowerCase).map(String::trim).toList();
            int firstNameIdx = findHeaderIndex(headers, "first name", "firstname", "first_name");
            int lastNameIdx = findHeaderIndex(headers, "last name", "lastname", "last_name");
            int nameIdx = findHeaderIndex(headers, "name", "fullname", "full name", "full_name");
            int emailIdx = findHeaderIndex(headers, "email", "email address", "mail");
            int phoneIdx = findHeaderIndex(headers, "phone", "phonenumber", "phone number", "mobile");
            int companyIdx = findHeaderIndex(headers, "company", "currentcompany", "current company");
            int titleIdx = findHeaderIndex(headers, "title", "designation", "currenttitle", "current title", "current designation");
            int expIdx = findHeaderIndex(headers, "experience", "yearsofexperience", "years of experience", "yearsexperience", "years experience");
            int locationIdx = findHeaderIndex(headers, "location", "city");
            int skillsIdx = findHeaderIndex(headers, "skills", "skill set", "technologies");
            int sourceIdx = findHeaderIndex(headers, "source");

            List<BulkImportLeadItem> items = new ArrayList<>();
            String line;
            while ((line = reader.readLine()) != null) {
                if (line.trim().isEmpty()) continue;
                List<String> columns = parseCsvRow(line);
                String fullName = getCol(columns, nameIdx);
                if ((fullName == null || fullName.isBlank()) && (firstNameIdx >= 0 || lastNameIdx >= 0)) {
                    String fn = getCol(columns, firstNameIdx);
                    String ln = getCol(columns, lastNameIdx);
                    fullName = ((fn != null ? fn : "") + " " + (ln != null ? ln : "")).trim();
                }
                String email = getCol(columns, emailIdx);
                String phone = getCol(columns, phoneIdx);
                String currentComp = getCol(columns, companyIdx);
                String currentTitle = getCol(columns, titleIdx);
                String expStr = getCol(columns, expIdx);
                java.math.BigDecimal exp = null;
                if (expStr != null && !expStr.isBlank()) {
                    try {
                        exp = new java.math.BigDecimal(expStr.replaceAll("[^0-9.]", ""));
                    } catch (Exception ignored) {}
                }
                String location = getCol(columns, locationIdx);
                String skills = getCol(columns, skillsIdx);
                String source = getCol(columns, sourceIdx);

                items.add(new BulkImportLeadItem(fullName, email, phone, currentComp, currentTitle, exp, location, skills, source));
            }

            BulkImportRequest req = new BulkImportRequest(items, true);
            return bulkImport(recruiterUserId, req);
        } catch (java.io.IOException e) {
            throw new BadRequestException("Failed to read CSV file: " + e.getMessage());
        }
    }

    private int findHeaderIndex(List<String> headers, String... candidates) {
        for (int i = 0; i < headers.size(); i++) {
            String h = headers.get(i).replaceAll("[^a-z0-9 ]", "").trim();
            for (String candidate : candidates) {
                if (h.equalsIgnoreCase(candidate)) {
                    return i;
                }
            }
        }
        return -1;
    }

    private String getCol(List<String> cols, int idx) {
        if (idx >= 0 && idx < cols.size()) {
            String v = cols.get(idx).trim();
            return v.isEmpty() ? null : v;
        }
        return null;
    }

    private List<String> parseCsvRow(String line) {
        List<String> tokens = new ArrayList<>();
        StringBuilder sb = new StringBuilder();
        boolean inQuotes = false;
        for (int i = 0; i < line.length(); i++) {
            char c = line.charAt(i);
            if (c == '\"') {
                inQuotes = !inQuotes;
            } else if (c == ',' && !inQuotes) {
                tokens.add(sb.toString().trim());
                sb.setLength(0);
            } else {
                sb.append(c);
            }
        }
        tokens.add(sb.toString().trim());
        return tokens;
    }
}
