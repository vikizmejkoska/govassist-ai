package mk.govassist.dto.notification;

import java.time.LocalDateTime;
import lombok.Builder;
import lombok.Value;

@Value
@Builder
public class NotificationResponseDto {
    Long id;
    Long requestId;
    String title;
    String message;
    boolean isRead;
    LocalDateTime createdAt;
}
