package com.hireflow.candidate;

import java.time.Instant;
import java.util.UUID;

public record DocumentDto(
        UUID id,
        String originalFilename,
        DocumentType documentType,
        String contentType,
        long fileSize,
        Instant createdAt
) {
    public static DocumentDto from(Document doc) {
        return new DocumentDto(
                doc.getId(),
                doc.getOriginalFilename(),
                doc.getDocumentType(),
                doc.getContentType(),
                doc.getFileSize(),
                doc.getCreatedAt()
        );
    }
}
