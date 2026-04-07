package mk.govassist.security;

import java.time.LocalDateTime;
import java.time.ZoneOffset;
import java.util.List;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import mk.govassist.dto.auth.AuthResponseDto;
import mk.govassist.model.RefreshToken;
import mk.govassist.model.RevokedToken;
import mk.govassist.model.User;
import mk.govassist.repository.RefreshTokenRepository;
import mk.govassist.repository.RevokedTokenRepository;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Slf4j
public class JwtSessionService {

    private final JwtService jwtService;
    private final CustomUserDetailsService userDetailsService;
    private final RefreshTokenRepository refreshTokenRepository;
    private final RevokedTokenRepository revokedTokenRepository;

    @Transactional
    public AuthResponseDto createSession(User user, UserDetails userDetails) {
        String accessToken = jwtService.generateAccessToken(userDetails);
        String refreshToken = jwtService.generateRefreshToken(userDetails);

        refreshTokenRepository.save(RefreshToken.builder()
                .tokenId(jwtService.extractTokenId(refreshToken))
                .user(user)
                .expiresAt(LocalDateTime.ofInstant(jwtService.extractExpiration(refreshToken), ZoneOffset.UTC))
                .revoked(false)
                .build());

        return AuthResponseDto.builder()
                .accessToken(accessToken)
                .refreshToken(refreshToken)
                .tokenType("Bearer")
                .expiresIn(jwtService.getAccessExpirationMs())
                .email(user.getEmail())
                .role(user.getRole().getName().name())
                .build();
    }

    @Transactional
    public AuthResponseDto refresh(String refreshToken) {
        if (!"refresh".equals(jwtService.extractTokenType(refreshToken))) {
            throw new BadCredentialsException("Invalid refresh token");
        }

        String tokenId = jwtService.extractTokenId(refreshToken);
        RefreshToken storedToken = refreshTokenRepository.findByTokenIdAndRevokedFalse(tokenId)
                .orElseThrow(() -> new BadCredentialsException("Invalid refresh token"));

        if (storedToken.getExpiresAt().isBefore(LocalDateTime.now(ZoneOffset.UTC))) {
            storedToken.setRevoked(true);
            refreshTokenRepository.save(storedToken);
            throw new BadCredentialsException("Refresh token expired");
        }

        User user = storedToken.getUser();
        UserDetails userDetails = userDetailsService.loadUserByUsername(user.getEmail());
        if (!jwtService.isRefreshTokenValid(refreshToken, userDetails)) {
            throw new BadCredentialsException("Invalid refresh token");
        }

        storedToken.setRevoked(true);
        refreshTokenRepository.save(storedToken);
        log.info("JWT refresh token rotated user={}", user.getEmail());
        return createSession(user, userDetails);
    }

    @Transactional
    public void revokeSession(String accessToken, User user) {
        if (accessToken != null && !accessToken.isBlank() && "access".equals(jwtService.extractTokenType(accessToken))) {
            String tokenId = jwtService.extractTokenId(accessToken);
            if (!revokedTokenRepository.existsByTokenId(tokenId)) {
                revokedTokenRepository.save(RevokedToken.builder()
                        .tokenId(tokenId)
                        .expiresAt(LocalDateTime.ofInstant(jwtService.extractExpiration(accessToken), ZoneOffset.UTC))
                        .build());
            }
        }

        List<RefreshToken> activeTokens = refreshTokenRepository.findByUserIdAndRevokedFalse(user.getId());
        activeTokens.forEach(token -> token.setRevoked(true));
        refreshTokenRepository.saveAll(activeTokens);
        log.info("JWT session revoked user={} refreshTokensRevoked={}", user.getEmail(), activeTokens.size());
    }

    @Transactional(readOnly = true)
    public boolean isAccessTokenRevoked(String token) {
        return revokedTokenRepository.existsByTokenId(jwtService.extractTokenId(token));
    }
}
