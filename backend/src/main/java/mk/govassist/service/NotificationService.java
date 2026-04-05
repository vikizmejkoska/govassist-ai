package mk.govassist.service;

import java.util.List;
import lombok.RequiredArgsConstructor;
import mk.govassist.dto.notification.NotificationResponseDto;
import mk.govassist.exception.BadRequestException;
import mk.govassist.exception.NotFoundException;
import mk.govassist.model.Notification;
import mk.govassist.model.ServiceRequest;
import mk.govassist.model.User;
import mk.govassist.repository.NotificationRepository;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class NotificationService {

    private final NotificationRepository notificationRepository;
    private final UserService userService;

    @Transactional(readOnly = true)
    public List<NotificationResponseDto> getCurrentUserNotifications() {
        String email = userService.getCurrentUser().getEmail();
        return notificationRepository.findByUserEmailOrderByCreatedAtDesc(email)
                .stream()
                .map(this::toDto)
                .toList();
    }

    @Transactional(readOnly = true)
    public long getUnreadCount() {
        String email = userService.getCurrentUser().getEmail();
        return notificationRepository.countByUserEmailAndIsReadFalse(email);
    }

    @Transactional
    public NotificationResponseDto markAsRead(Long notificationId) {
        User current = userService.getCurrentUser();
        Notification notification = notificationRepository.findById(notificationId)
                .orElseThrow(() -> new NotFoundException("Notification not found"));
        if (!notification.getUser().getId().equals(current.getId())) {
            throw new AccessDeniedException("Not allowed to modify this notification");
        }
        notification.setRead(true);
        return toDto(notificationRepository.save(notification));
    }

    @Transactional
    public Notification createNotification(User user, ServiceRequest request, String title, String message) {
        if (user == null || request == null) {
            throw new BadRequestException("Invalid notification target");
        }
        Notification notification = Notification.builder()
                .user(user)
                .request(request)
                .title(title)
                .message(message)
                .build();
        return notificationRepository.save(notification);
    }

    private NotificationResponseDto toDto(Notification notification) {
        return NotificationResponseDto.builder()
                .id(notification.getId())
                .requestId(notification.getRequest().getId())
                .title(notification.getTitle())
                .message(notification.getMessage())
                .isRead(notification.isRead())
                .createdAt(notification.getCreatedAt())
                .build();
    }
}
