package mk.govassist.dto.request;

import java.time.LocalDateTime;
import lombok.Builder;
import lombok.Value;
import mk.govassist.model.RequestStatus;

@Value
@Builder
public class RequestHistoryItemDto {
    Long id;
    Long serviceId;
    String serviceTitle;
    String title;
    String description;
    RequestStatus status;
    LocalDateTime createdAt;
    LocalDateTime updatedAt;
    long documentCount;
}
