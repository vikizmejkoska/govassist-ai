package mk.govassist.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class CreateRequestDto {

    @NotNull
    private Long serviceId;

    @NotBlank
    @Size(max = 255)
    private String title;

    @NotBlank
    private String description;
}
