package mk.govassist.config;

import org.springframework.boot.context.properties.ConfigurationProperties;

@ConfigurationProperties(prefix = "app.jwt")
public record JwtProperties(
        String secret,
        long expirationMs,
        long refreshExpirationMs
) {
    public JwtProperties {
        if (secret == null || secret.isBlank()) {
            secret = "govassist-dev-secret-key-change-this-in-production-2026";
        }
        if (expirationMs <= 0) {
            expirationMs = 86_400_000L;
        }
        if (refreshExpirationMs <= 0) {
            refreshExpirationMs = 604_800_000L;
        }
    }
}
