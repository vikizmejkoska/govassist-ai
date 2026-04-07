package mk.govassist.repository;

import java.time.LocalDateTime;
import mk.govassist.model.RevokedToken;
import org.springframework.data.jpa.repository.JpaRepository;

public interface RevokedTokenRepository extends JpaRepository<RevokedToken, Long> {

    boolean existsByTokenId(String tokenId);

    long deleteByExpiresAtBefore(LocalDateTime expiresAt);
}
