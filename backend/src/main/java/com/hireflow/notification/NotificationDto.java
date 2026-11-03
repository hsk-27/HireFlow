package com.hireflow.notification;

import com.fasterxml.jackson.annotation.JsonProperty;
import java.time.Instant;
import java.util.UUID;

public record NotificationDto(
        UUID id,
        NotificationType notificationType,
        String title,
        String message,
        String resourceType,
        UUID resourceId,
        Instant readAt,
        Instant createdAt
) {
    @JsonProperty("read")
    public boolean read() {
        return readAt != null;
    }

    @JsonProperty("type")
    public String type() {
        return notificationType != null ? notificationType.name() : null;
    }

    public static NotificationDto from(Notification notification) {
        return new NotificationDto(
                notification.getId(),
                notification.getNotificationType(),
                notification.getTitle(),
                notification.getMessage(),
                notification.getResourceType(),
                notification.getResourceId(),
                notification.getReadAt(),
                notification.getCreatedAt()
        );
    }
}
