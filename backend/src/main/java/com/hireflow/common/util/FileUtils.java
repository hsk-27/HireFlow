package com.hireflow.common.util;

import com.hireflow.common.exception.BadRequestException;
import org.apache.tika.Tika;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Paths;
import java.util.Set;

public final class FileUtils {

    private static final Tika TIKA = new Tika();

    private static final Set<String> ALLOWED_RESUME_TYPES = Set.of(
            "application/pdf",
            "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
            "application/msword"
    );

    private static final Set<String> ALLOWED_EXTENSIONS = Set.of(
            ".pdf",
            ".docx",
            ".doc"
    );

    private FileUtils() {
    }

    public static String sanitizeFilename(String filename) {
        if (filename == null || filename.isBlank()) {
            return "unnamed_file";
        }
        // Prevent path traversal
        String cleanName = Paths.get(filename).getFileName().toString();
        // Remove potentially dangerous characters
        return cleanName.replaceAll("[^a-zA-Z0-9._-]", "_");
    }

    public static void validateResumeFile(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new BadRequestException("Uploaded file cannot be empty");
        }

        String originalFilename = file.getOriginalFilename();
        if (originalFilename == null) {
            throw new BadRequestException("Filename cannot be null");
        }

        String lowerName = originalFilename.toLowerCase();
        boolean validExtension = ALLOWED_EXTENSIONS.stream().anyMatch(lowerName::endsWith);
        if (!validExtension) {
            throw new BadRequestException("Only PDF and DOCX files are supported for resume uploads");
        }

        try {
            String detectedType = TIKA.detect(file.getInputStream());
            if (!ALLOWED_RESUME_TYPES.contains(detectedType)) {
                throw new BadRequestException("File content type (" + detectedType + ") is not permitted. Only PDF and Word documents are accepted.");
            }
        } catch (IOException e) {
            throw new BadRequestException("Failed to inspect file contents: " + e.getMessage());
        }
    }
}
