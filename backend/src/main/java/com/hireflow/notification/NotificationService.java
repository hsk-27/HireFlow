package com.hireflow.notification;

import com.hireflow.common.exception.ResourceNotFoundException;
import com.hireflow.user.User;
import com.hireflow.user.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.UUID;

@Service
public class NotificationService {

    private static final Logger log = LoggerFactory.getLogger(NotificationService.class);

    private final NotificationRepository notificationRepository;
    private final UserRepository userRepository;

    public NotificationService(NotificationRepository notificationRepository, UserRepository userRepository) {
        this.notificationRepository = notificationRepository;
        this.userRepository = userRepository;
    }

    @Transactional
    public void sendNotification(UUID userId, NotificationType type, String title, String message, String resourceType, UUID resourceId) {
        User user = userRepository.findById(userId).orElse(null);
        if (user == null) {
            log.warn("Cannot send notification to non-existent user: {}", userId);
            return;
        }

        Notification notification = new Notification(user, type, title, message, resourceType, resourceId);
        notificationRepository.save(notification);
        log.info("Sent in-app notification [{}] to user {}", type, user.getEmail());
    }

    @Transactional(readOnly = true)
    public Page<NotificationDto> getUserNotifications(UUID userId, boolean unreadOnly, Pageable pageable) {
        Page<Notification> page = unreadOnly
                ? notificationRepository.findByUserIdAndReadAtIsNullOrderByCreatedAtDesc(userId, pageable)
                : notificationRepository.findByUserIdOrderByCreatedAtDesc(userId, pageable);
        return page.map(NotificationDto::from);
    }

    @Transactional(readOnly = true)
    public Page<NotificationDto> getUserNotifications(UUID userId, Pageable pageable) {
        return getUserNotifications(userId, false, pageable);
    }

    @Transactional(readOnly = true)
    public long getUnreadCount(UUID userId) {
        return notificationRepository.countByUserIdAndReadAtIsNull(userId);
    }

    @Transactional
    public NotificationDto markAsRead(UUID userId, UUID notificationId) {
        Notification notification = notificationRepository.findByIdAndUserId(notificationId, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Notification", "id", notificationId));
        if (notification.getReadAt() == null) {
            notification.setReadAt(Instant.now());
            notification = notificationRepository.save(notification);
        }
        return NotificationDto.from(notification);
    }

    @Transactional
    public void markAllAsRead(UUID userId) {
        notificationRepository.markAllAsReadForUser(userId, Instant.now());
    }
}
