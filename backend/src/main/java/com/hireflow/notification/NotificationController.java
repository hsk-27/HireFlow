package com.hireflow.notification;

import com.hireflow.common.response.ApiResponse;
import com.hireflow.common.response.PagedResponse;
import com.hireflow.common.security.SecurityUtils;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/notifications")
@Tag(name = "Notifications", description = "In-app notifications management")
public class NotificationController {

    private final NotificationService notificationService;

    public NotificationController(NotificationService notificationService) {
        this.notificationService = notificationService;
    }

    @GetMapping
    @Operation(summary = "Get current user notifications")
    public ResponseEntity<ApiResponse<PagedResponse<NotificationDto>>> getNotifications(
            @RequestParam(required = false, defaultValue = "false") boolean unreadOnly,
            @PageableDefault(size = 20, sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable
    ) {
        UUID userId = SecurityUtils.getCurrentUserId();
        return ResponseEntity.ok(ApiResponse.success(PagedResponse.from(notificationService.getUserNotifications(userId, unreadOnly, pageable))));
    }

    @GetMapping("/unread-count")
    @Operation(summary = "Get unread notifications count")
    public ResponseEntity<ApiResponse<Map<String, Long>>> getUnreadCount() {
        UUID userId = SecurityUtils.getCurrentUserId();
        long count = notificationService.getUnreadCount(userId);
        return ResponseEntity.ok(ApiResponse.success(Map.of("unreadCount", count)));
    }

    @RequestMapping(value = "/{id}/read", method = {RequestMethod.POST, RequestMethod.PATCH})
    @Operation(summary = "Mark single notification as read")
    public ResponseEntity<ApiResponse<NotificationDto>> markAsRead(@PathVariable UUID id) {
        UUID userId = SecurityUtils.getCurrentUserId();
        NotificationDto dto = notificationService.markAsRead(userId, id);
        return ResponseEntity.ok(ApiResponse.success(dto, "Notification marked as read"));
    }

    @RequestMapping(value = "/read-all", method = {RequestMethod.POST, RequestMethod.PATCH})
    @Operation(summary = "Mark all notifications as read")
    public ResponseEntity<ApiResponse<Map<String, Object>>> markAllAsRead() {
        UUID userId = SecurityUtils.getCurrentUserId();
        notificationService.markAllAsRead(userId);
        return ResponseEntity.ok(ApiResponse.success(Map.of("count", 0), "All notifications marked as read"));
    }
}
