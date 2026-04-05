package mk.govassist.controller;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import mk.govassist.dto.auth.LoginRequestDto;
import mk.govassist.dto.auth.RegisterRequestDto;
import mk.govassist.service.AuthService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

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
    public ResponseEntity<Map<String, String>> login(@Valid @RequestBody LoginRequestDto request) {
        String message = authService.login(request);
        return ResponseEntity.ok(Map.of("message", message));
    }
}
