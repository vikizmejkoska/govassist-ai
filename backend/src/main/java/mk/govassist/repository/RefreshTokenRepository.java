package mk.govassist.repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import mk.govassist.model.RefreshToken;
import org.springframework.data.jpa.repository.JpaRepository;

public interface RefreshTokenRepository extends JpaRepository<RefreshToken, Long> {

    Optional<RefreshToken> findByTokenIdAndRevokedFalse(String tokenId);

    List<RefreshToken> findByUserIdAndRevokedFalse(Long userId);

    long deleteByExpiresAtBefore(LocalDateTime expiresAt);
}
