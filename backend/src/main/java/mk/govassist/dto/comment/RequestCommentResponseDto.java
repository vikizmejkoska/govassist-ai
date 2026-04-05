package mk.govassist.dto.comment;

import java.time.LocalDateTime;
import lombok.Builder;
import lombok.Value;
import mk.govassist.model.CommentType;

@Value
@Builder
public class RequestCommentResponseDto {
    Long id;
    String authorEmail;
    String authorRole;
    String comment;
    CommentType type;
    LocalDateTime createdAt;
}
