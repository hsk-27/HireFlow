package com.hireflow.candidate;

import com.hireflow.common.exception.ApiException;
import com.hireflow.common.exception.BadRequestException;
import com.hireflow.common.exception.ResourceNotFoundException;
import com.hireflow.common.util.ChecksumUtils;
import com.hireflow.common.util.FileUtils;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.io.InputStream;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.UUID;

@Service
public class DocumentStorageService {

    private static final Logger log = LoggerFactory.getLogger(DocumentStorageService.class);

    private final Path rootStoragePath;
    private final DocumentRepository documentRepository;
    private final long maxFileSizeBytes;

    public DocumentStorageService(
            @Value("${hireflow.storage.upload-dir:./data/uploads}") String uploadDir,
            @Value("${hireflow.storage.max-file-size:10485760}") long maxFileSizeBytes,
            DocumentRepository documentRepository
    ) {
        this.rootStoragePath = Paths.get(uploadDir).toAbsolutePath().normalize();
        this.maxFileSizeBytes = maxFileSizeBytes;
        this.documentRepository = documentRepository;

        try {
            Files.createDirectories(this.rootStoragePath);
        } catch (IOException e) {
            throw new IllegalStateException("Could not initialize local upload directory: " + rootStoragePath, e);
        }
    }

    @Transactional
    public Document storeDocument(UUID ownerUserId, MultipartFile file, DocumentType documentType) {
        if (file.getSize() > maxFileSizeBytes) {
            throw new ApiException("File size exceeds the allowed limit", HttpStatus.PAYLOAD_TOO_LARGE, "FILE_TOO_LARGE");
        }

        if (documentType == DocumentType.RESUME) {
            FileUtils.validateResumeFile(file);
        }

        String originalFilename = FileUtils.sanitizeFilename(file.getOriginalFilename());
        String extension = "";
        int dotIdx = originalFilename.lastIndexOf('.');
        if (dotIdx >= 0) {
            extension = originalFilename.substring(dotIdx);
        }

        String storedFilename = UUID.randomUUID() + extension;
        Path targetPath = rootStoragePath.resolve(storedFilename).normalize();

        // Prevent path traversal attack
        if (!targetPath.startsWith(rootStoragePath)) {
            throw new BadRequestException("Invalid file storage target path");
        }

        String checksum;
        try (InputStream inputStream = file.getInputStream()) {
            checksum = ChecksumUtils.calculateSha256(file.getBytes());
            Files.copy(file.getInputStream(), targetPath, StandardCopyOption.REPLACE_EXISTING);
        } catch (IOException e) {
            log.error("Failed to store uploaded file on filesystem: {}", e.getMessage());
            throw new ApiException("Failed to store file on disk", HttpStatus.INTERNAL_SERVER_ERROR, "STORAGE_ERROR");
        }

        Document document = new Document(
                ownerUserId,
                documentType,
                originalFilename,
                storedFilename,
                targetPath.toString(),
                file.getContentType() != null ? file.getContentType() : "application/octet-stream",
                file.getSize(),
                checksum
        );

        return documentRepository.save(document);
    }

    @Transactional(readOnly = true)
    public Document getDocumentById(UUID documentId) {
        return documentRepository.findById(documentId)
                .orElseThrow(() -> new ResourceNotFoundException("Document", "id", documentId));
    }

    public Resource loadAsResource(Document document) {
        try {
            Path filePath = rootStoragePath.resolve(document.getStoredFilename()).normalize();
            if (!filePath.startsWith(rootStoragePath)) {
                throw new BadRequestException("Path traversal attempt detected");
            }
            Resource resource = new UrlResource(filePath.toUri());
            if (resource.exists() && resource.isReadable()) {
                return resource;
            } else {
                throw new ResourceNotFoundException("File not found on storage: " + document.getOriginalFilename());
            }
        } catch (Exception e) {
            throw new ResourceNotFoundException("Could not read document file: " + e.getMessage());
        }
    }
}
