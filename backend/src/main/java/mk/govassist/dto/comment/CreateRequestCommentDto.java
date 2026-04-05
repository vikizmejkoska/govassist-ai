package mk.govassist.dto.comment;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;
import mk.govassist.model.CommentType;

@Data
public class CreateRequestCommentDto {

    @NotBlank
    private String comment;

    @NotNull
    private CommentType type;
}
