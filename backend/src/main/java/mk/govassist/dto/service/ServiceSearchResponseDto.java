package mk.govassist.dto.service;

import lombok.Builder;
import lombok.Value;

@Value
@Builder
public class ServiceSearchResponseDto {
    Long id;
    String title;
    String description;
    String conditions;
    String requiredDocuments;
}
