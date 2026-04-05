package mk.govassist.service;

import lombok.RequiredArgsConstructor;
import mk.govassist.dto.auth.LoginRequestDto;
import mk.govassist.dto.auth.RegisterRequestDto;
import mk.govassist.exception.BadRequestException;
import mk.govassist.model.Role;
import mk.govassist.model.RoleType;
import mk.govassist.model.User;
import mk.govassist.repository.RoleRepository;
import mk.govassist.repository.UserRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final PasswordEncoder passwordEncoder;

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
        return "Registration successful";
    }

    public String login(LoginRequestDto request) {
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new BadRequestException("Invalid credentials"));

        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            throw new BadRequestException("Invalid credentials");
        }

        return "Login successful";
    }
}
