package mk.govassist.dto.service;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class CreateAdministrativeServiceDto {
    @NotBlank
    private String title;

    @NotBlank
    private String description;

    @NotBlank
    private String conditions;

    @NotBlank
    private String requiredDocuments;
}
