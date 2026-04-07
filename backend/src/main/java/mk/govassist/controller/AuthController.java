package mk.govassist.controller;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import mk.govassist.dto.auth.AuthResponseDto;
import mk.govassist.dto.auth.LoginRequestDto;
import mk.govassist.dto.auth.RefreshTokenRequestDto;
import mk.govassist.dto.auth.RegisterRequestDto;
import mk.govassist.dto.user.UserDetailsDto;
import mk.govassist.exception.BadRequestException;
import mk.govassist.service.AuthService;
import jakarta.servlet.http.HttpServletRequest;
import java.util.Map;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    @PostMapping("/register")
    public ResponseEntity<Map<String, String>> register(@Valid @RequestBody RegisterRequestDto request) {
        String message = authService.register(request);
        return ResponseEntity.ok(Map.of("message", message));
    }

    @PostMapping("/login")
    public ResponseEntity<AuthResponseDto> login(@Valid @RequestBody LoginRequestDto request) {
        return ResponseEntity.ok(authService.login(request));
    }

    @PostMapping("/refresh")
    public ResponseEntity<AuthResponseDto> refresh(@Valid @RequestBody RefreshTokenRequestDto request) {
        return ResponseEntity.ok(authService.refresh(request));
    }

    @GetMapping("/me")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<UserDetailsDto> me() {
        return ResponseEntity.ok(authService.me());
    }

    /**
     * Client should delete both access and refresh tokens after logout.
     */
    @PostMapping("/logout")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Map<String, String>> logout(HttpServletRequest request) {
        authService.logout(extractBearerToken(request));
        return ResponseEntity.ok(Map.of("message", "Logout successful"));
    }

    private String extractBearerToken(HttpServletRequest request) {
        String header = request.getHeader("Authorization");
        if (header == null || !header.startsWith("Bearer ")) {
            throw new BadRequestException("Missing bearer token");
        }
        return header.substring(7);
    }
}
