package mk.govassist.dto.request;

import java.time.LocalDateTime;
import java.util.List;
import lombok.Builder;
import lombok.Value;
import mk.govassist.dto.document.RequestDocumentResponseDto;
import mk.govassist.model.RequestStatus;

@Value
@Builder
public class RequestDetailsDto {
    Long id;
    String applicantEmail;
    Long serviceId;
    String serviceTitle;
    String title;
    String description;
    RequestStatus status;
    LocalDateTime createdAt;
    LocalDateTime updatedAt;
    List<RequestDocumentResponseDto> documents;
}
