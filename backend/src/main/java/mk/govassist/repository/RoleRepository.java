package mk.govassist.repository;

import java.util.Optional;
import mk.govassist.model.Role;
import mk.govassist.model.RoleType;
import org.springframework.data.jpa.repository.JpaRepository;

public interface RoleRepository extends JpaRepository<Role, Long> {
    Optional<Role> findByName(RoleType name);
}
