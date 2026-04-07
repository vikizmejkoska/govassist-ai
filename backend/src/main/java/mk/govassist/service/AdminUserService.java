package mk.govassist.service;

import java.util.List;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import mk.govassist.dto.user.UpdateUserRoleDto;
import mk.govassist.dto.user.UserDetailsDto;
import mk.govassist.dto.user.UserSummaryDto;
import mk.govassist.exception.NotFoundException;
import mk.govassist.model.Role;
import mk.govassist.model.RoleType;
import mk.govassist.model.User;
import mk.govassist.repository.RoleRepository;
import mk.govassist.repository.UserRepository;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Slf4j
public class AdminUserService {

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;

    @Transactional(readOnly = true)
    public List<UserSummaryDto> getAllUsers() {
        return userRepository.findAll().stream().map(this::toSummary).toList();
    }

    @Transactional(readOnly = true)
    public UserDetailsDto getUserById(Long id) {
        return userRepository.findById(id).map(this::toDetails)
                .orElseThrow(() -> new NotFoundException("User not found"));
    }

    @Transactional
    public UserDetailsDto updateUserRole(Long userId, UpdateUserRoleDto dto) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new NotFoundException("User not found"));

        RoleType target = dto.getRole();
        Role role = roleRepository.findByName(target)
                .orElseThrow(() -> new NotFoundException("Role not found"));

        user.setRole(role);
        User saved = userRepository.save(user);
        log.info("Admin changed role userId={} email={} newRole={} by={}",
                saved.getId(), saved.getEmail(), target, currentUserEmail());
        return toDetails(saved);
    }

    private UserSummaryDto toSummary(User user) {
        return UserSummaryDto.builder()
                .id(user.getId())
                .fullName(user.getFullName())
                .email(user.getEmail())
                .phoneNumber(user.getPhoneNumber())
                .address(user.getAddress())
                .role(user.getRole() != null ? user.getRole().getName().name() : null)
                .build();
    }

    private UserDetailsDto toDetails(User user) {
        return UserDetailsDto.builder()
                .id(user.getId())
                .fullName(user.getFullName())
                .email(user.getEmail())
                .phoneNumber(user.getPhoneNumber())
                .address(user.getAddress())
                .role(user.getRole() != null ? user.getRole().getName().name() : null)
                .build();
    }

    private String currentUserEmail() {
        var auth = SecurityContextHolder.getContext().getAuthentication();
        return auth != null ? auth.getName() : "unknown";
    }
}
