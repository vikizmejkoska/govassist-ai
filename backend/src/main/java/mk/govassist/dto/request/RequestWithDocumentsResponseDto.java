package mk.govassist.dto.request;

import java.util.List;
import lombok.Builder;
import lombok.Value;
import mk.govassist.dto.document.RequestDocumentResponseDto;

@Value
@Builder
public class RequestWithDocumentsResponseDto {
    ServiceRequestResponseDto request;
    List<RequestDocumentResponseDto> documents;
}
