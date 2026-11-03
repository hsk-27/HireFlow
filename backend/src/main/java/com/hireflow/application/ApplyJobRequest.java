package com.hireflow.application;

import java.util.UUID;

public record ApplyJobRequest(
        String coverLetter,
        UUID resumeDocumentId
) {}
