package mk.govassist.repository;

import java.util.List;
import mk.govassist.model.RequestComment;
import org.springframework.data.jpa.repository.JpaRepository;

public interface RequestCommentRepository extends JpaRepository<RequestComment, Long> {
    List<RequestComment> findByRequestIdOrderByCreatedAtAsc(Long requestId);
}
