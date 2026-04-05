package mk.govassist.dto.document;

import java.time.LocalDateTime;
import lombok.Builder;
import lombok.Value;

@Value
@Builder
public class RequestDocumentResponseDto {
    Long id;
    String originalFileName;
    String storedFileName;
    String fileType;
    LocalDateTime uploadedAt;
}
