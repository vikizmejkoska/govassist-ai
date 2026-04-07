package mk.govassist.security;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.time.Instant;
import java.util.Base64;
import java.util.HashMap;
import java.util.Map;
import java.util.UUID;
import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import lombok.RequiredArgsConstructor;
import mk.govassist.config.JwtProperties;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class JwtService {

    private static final ObjectMapper OBJECT_MAPPER = new ObjectMapper();
    private static final Base64.Encoder URL_ENCODER = Base64.getUrlEncoder().withoutPadding();
    private static final Base64.Decoder URL_DECODER = Base64.getUrlDecoder();
    private static final String ACCESS_TYPE = "access";
    private static final String REFRESH_TYPE = "refresh";

    private final JwtProperties jwtProperties;

    public String generateAccessToken(UserDetails userDetails) {
        return generateToken(userDetails, ACCESS_TYPE, jwtProperties.expirationMs());
    }

    public String generateRefreshToken(UserDetails userDetails) {
        return generateToken(userDetails, REFRESH_TYPE, jwtProperties.refreshExpirationMs());
    }

    public String extractUsername(String token) {
        return (String) parsePayload(token).get("sub");
    }

    public String extractTokenId(String token) {
        return (String) parsePayload(token).get("jti");
    }

    public String extractTokenType(String token) {
        return (String) parsePayload(token).get("type");
    }

    public Instant extractExpiration(String token) {
        Number exp = (Number) parsePayload(token).get("exp");
        if (exp == null) {
            throw new BadCredentialsException("Invalid token");
        }
        return Instant.ofEpochSecond(exp.longValue());
    }

    public long getAccessExpirationMs() {
        return jwtProperties.expirationMs();
    }

    public boolean isAccessTokenValid(String token, UserDetails userDetails) {
        return isTokenValid(token, userDetails, ACCESS_TYPE);
    }

    public boolean isRefreshTokenValid(String token, UserDetails userDetails) {
        return isTokenValid(token, userDetails, REFRESH_TYPE);
    }

    private String generateToken(UserDetails userDetails, String type, long expirationMs) {
        Instant now = Instant.now();
        Instant expiration = now.plusMillis(expirationMs);

        Map<String, Object> payload = new HashMap<>();
        payload.put("sub", userDetails.getUsername());
        payload.put("iat", now.getEpochSecond());
        payload.put("exp", expiration.getEpochSecond());
        payload.put("jti", UUID.randomUUID().toString());
        payload.put("type", type);
        payload.put("role", extractRole(userDetails));

        String headerJson = toJson(Map.of("alg", "HS256", "typ", "JWT"));
        String payloadJson = toJson(payload);
        String header = URL_ENCODER.encodeToString(headerJson.getBytes(StandardCharsets.UTF_8));
        String body = URL_ENCODER.encodeToString(payloadJson.getBytes(StandardCharsets.UTF_8));
        String signature = sign(header + "." + body);

        return header + "." + body + "." + signature;
    }

    private boolean isTokenValid(String token, UserDetails userDetails, String expectedType) {
        Map<String, Object> payload = parsePayload(token);
        String username = (String) payload.get("sub");
        String type = (String) payload.get("type");
        Number exp = (Number) payload.get("exp");
        if (username == null || exp == null || type == null) {
            return false;
        }
        Instant expiration = Instant.ofEpochSecond(exp.longValue());
        return userDetails.getUsername().equals(username)
                && expectedType.equals(type)
                && expiration.isAfter(Instant.now())
                && hasValidSignature(token);
    }

    private Map<String, Object> parsePayload(String token) {
        validateTokenFormat(token);
        if (!hasValidSignature(token)) {
            throw new BadCredentialsException("Invalid token");
        }

        String[] parts = token.split("\\.");
        try {
            byte[] decoded = URL_DECODER.decode(parts[1]);
            Map<String, Object> payload = OBJECT_MAPPER.readValue(decoded, new TypeReference<>() {
            });
            Number exp = (Number) payload.get("exp");
            if (exp != null && Instant.ofEpochSecond(exp.longValue()).isBefore(Instant.now())) {
                throw new BadCredentialsException("Token expired");
            }
            return payload;
        } catch (IOException | IllegalArgumentException ex) {
            throw new BadCredentialsException("Invalid token");
        }
    }

    private boolean hasValidSignature(String token) {
        validateTokenFormat(token);
        String[] parts = token.split("\\.");
        String signingInput = parts[0] + "." + parts[1];
        byte[] expected = sign(signingInput).getBytes(StandardCharsets.UTF_8);
        byte[] actual = parts[2].getBytes(StandardCharsets.UTF_8);
        return MessageDigest.isEqual(expected, actual);
    }

    private String sign(String value) {
        try {
            Mac mac = Mac.getInstance("HmacSHA256");
            mac.init(new SecretKeySpec(jwtProperties.secret().getBytes(StandardCharsets.UTF_8), "HmacSHA256"));
            return URL_ENCODER.encodeToString(mac.doFinal(value.getBytes(StandardCharsets.UTF_8)));
        } catch (Exception ex) {
            throw new IllegalStateException("Could not sign JWT", ex);
        }
    }

    private void validateTokenFormat(String token) {
        if (token == null || token.isBlank()) {
            throw new BadCredentialsException("Invalid token");
        }
        String[] parts = token.split("\\.");
        if (parts.length != 3) {
            throw new BadCredentialsException("Invalid token");
        }
    }

    private String toJson(Map<String, Object> value) {
        try {
            return OBJECT_MAPPER.writeValueAsString(value);
        } catch (JsonProcessingException ex) {
            throw new IllegalStateException("Could not serialize JWT payload", ex);
        }
    }

    private String extractRole(UserDetails userDetails) {
        return userDetails.getAuthorities().stream()
                .map(GrantedAuthority::getAuthority)
                .findFirst()
                .orElse("ROLE_CITIZEN");
    }
}
