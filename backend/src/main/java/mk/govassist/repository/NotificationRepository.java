package mk.govassist.repository;

import java.util.List;
import mk.govassist.model.Notification;
import org.springframework.data.jpa.repository.JpaRepository;

public interface NotificationRepository extends JpaRepository<Notification, Long> {
    List<Notification> findByUserEmailOrderByCreatedAtDesc(String email);
    long countByUserEmailAndIsReadFalse(String email);
}
