package com.hireflow.candidate;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/v1/documents")
@Tag(name = "Documents", description = "Document and media asset download endpoint")
public class DocumentController {

    private final DocumentStorageService documentStorageService;

    public DocumentController(DocumentStorageService documentStorageService) {
        this.documentStorageService = documentStorageService;
    }

    @GetMapping("/{documentId}/download")
    @Operation(summary = "Download stored document or company logo")
    public ResponseEntity<Resource> downloadDocument(@PathVariable UUID documentId) {
        Document document = documentStorageService.getDocumentById(documentId);
        Resource resource = documentStorageService.loadAsResource(document);

        MediaType mediaType = MediaType.APPLICATION_OCTET_STREAM;
        if (document.getContentType() != null) {
            try {
                mediaType = MediaType.parseMediaType(document.getContentType());
            } catch (Exception ignored) {}
        }

        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=\"" + document.getOriginalFilename() + "\"")
                .contentType(mediaType)
                .body(resource);
    }
}
