package mk.govassist.repository;

import java.util.List;
import mk.govassist.model.RequestDocument;
import org.springframework.data.jpa.repository.JpaRepository;

public interface RequestDocumentRepository extends JpaRepository<RequestDocument, Long> {
    List<RequestDocument> findByRequestId(Long requestId);
    long countByRequestId(Long requestId);
}
