package mk.govassist.dto.request;

import java.time.LocalDateTime;
import lombok.Builder;
import lombok.Value;
import mk.govassist.model.RequestStatus;

@Value
@Builder
public class ServiceRequestResponseDto {
    Long id;
    String applicantEmail;
    Long serviceId;
    String serviceTitle;
    String title;
    String description;
    RequestStatus status;
    LocalDateTime createdAt;
    LocalDateTime updatedAt;
}
