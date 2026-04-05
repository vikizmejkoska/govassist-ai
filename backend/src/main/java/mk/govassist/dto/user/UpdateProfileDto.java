package mk.govassist.dto.user;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class UpdateProfileDto {
    @NotBlank
    @Size(max = 100)
    private String fullName;

    @Size(max = 30)
    private String phoneNumber;

    @Size(max = 255)
    private String address;
}
