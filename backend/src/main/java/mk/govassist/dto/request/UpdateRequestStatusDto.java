package mk.govassist.dto.request;

import jakarta.validation.constraints.NotNull;
import lombok.Data;
import mk.govassist.model.RequestStatus;

@Data
public class UpdateRequestStatusDto {
    @NotNull
    private RequestStatus status;
}
