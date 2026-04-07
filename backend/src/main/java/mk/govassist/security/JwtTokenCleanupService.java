package mk.govassist.security;

import java.time.LocalDateTime;
import java.time.ZoneOffset;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import mk.govassist.repository.RefreshTokenRepository;
import mk.govassist.repository.RevokedTokenRepository;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Slf4j
public class JwtTokenCleanupService {

    private final RefreshTokenRepository refreshTokenRepository;
    private final RevokedTokenRepository revokedTokenRepository;

    @Scheduled(cron = "0 0 * * * *")
    @Transactional
    public void cleanupExpiredTokens() {
        LocalDateTime now = LocalDateTime.now(ZoneOffset.UTC);
        long deletedRefresh = refreshTokenRepository.deleteByExpiresAtBefore(now);
        long deletedRevoked = revokedTokenRepository.deleteByExpiresAtBefore(now);

        if (deletedRefresh > 0 || deletedRevoked > 0) {
            log.info("JWT cleanup removed refreshTokens={} revokedTokens={}", deletedRefresh, deletedRevoked);
        }
    }
}
