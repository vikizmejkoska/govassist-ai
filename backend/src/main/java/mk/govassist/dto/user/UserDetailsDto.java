package mk.govassist.dto.user;

import lombok.Builder;
import lombok.Value;

@Value
@Builder
public class UserDetailsDto {
    Long id;
    String fullName;
    String email;
    String phoneNumber;
    String address;
    String role;
}
