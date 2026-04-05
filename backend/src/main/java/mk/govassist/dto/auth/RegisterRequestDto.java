package mk.govassist.dto.auth;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class RegisterRequestDto {
    @NotBlank
    @Size(max = 100)
    private String fullName;

    @Email
    @NotBlank
    private String email;

    @NotBlank
    @Size(min = 6, max = 100)
    private String password;

    @Size(max = 30)
    private String phoneNumber;

    @Size(max = 255)
    private String address;
}
