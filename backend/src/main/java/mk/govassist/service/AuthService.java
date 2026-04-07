package mk.govassist.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import mk.govassist.dto.auth.AuthResponseDto;
import mk.govassist.dto.auth.LoginRequestDto;
import mk.govassist.dto.auth.RefreshTokenRequestDto;
import mk.govassist.dto.auth.RegisterRequestDto;
import mk.govassist.dto.user.UserDetailsDto;
import mk.govassist.exception.BadRequestException;
import mk.govassist.model.Role;
import mk.govassist.model.RoleType;
import mk.govassist.model.User;
import mk.govassist.repository.RoleRepository;
import mk.govassist.repository.UserRepository;
import mk.govassist.security.JwtSessionService;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
@Slf4j
public class AuthService {

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;
    private final JwtSessionService jwtSessionService;
    private final UserService userService;

    public String register(RegisterRequestDto request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new BadRequestException("Email already in use");
        }

        Role defaultRole = roleRepository.findByName(RoleType.CITIZEN)
                .orElseThrow(() -> new BadRequestException("Default role not configured"));

        User user = User.builder()
                .fullName(request.getFullName())
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .phoneNumber(request.getPhoneNumber())
                .address(request.getAddress())
                .role(defaultRole)
                .build();

        userRepository.save(user);
        log.info("User registered email={} role={}", user.getEmail(), defaultRole.getName());
        return "Registration successful";
    }

    public AuthResponseDto login(LoginRequestDto request) {
        Authentication authentication;
        try {
            authentication = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword()));
        } catch (AuthenticationException ex) {
            log.warn("Login failed: invalid credentials email={}", request.getEmail());
            throw new BadCredentialsException("Invalid credentials");
        }

        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new BadCredentialsException("Invalid credentials"));
        UserDetails userDetails = (UserDetails) authentication.getPrincipal();
        log.info("Login successful email={}", user.getEmail());
        return jwtSessionService.createSession(user, userDetails);
    }

    public AuthResponseDto refresh(RefreshTokenRequestDto request) {
        return jwtSessionService.refresh(request.getRefreshToken());
    }

    public void logout(String accessToken) {
        jwtSessionService.revokeSession(accessToken, userService.getCurrentUser());
    }

    public UserDetailsDto me() {
        return userService.getCurrentUserProfile();
    }
}
