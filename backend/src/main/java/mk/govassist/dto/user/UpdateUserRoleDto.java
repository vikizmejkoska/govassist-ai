package mk.govassist.dto.user;

import jakarta.validation.constraints.NotNull;
import lombok.Data;
import mk.govassist.model.RoleType;

@Data
public class UpdateUserRoleDto {
    @NotNull
    private RoleType role;
}
