package mk.govassist.repository;

import mk.govassist.model.AdministrativeService;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

public interface AdministrativeServiceRepository extends JpaRepository<AdministrativeService, Long> {
    Page<AdministrativeService> findByTitleContainingIgnoreCaseOrDescriptionContainingIgnoreCase(String title,
                                                                                                String description,
                                                                                                Pageable pageable);
}
