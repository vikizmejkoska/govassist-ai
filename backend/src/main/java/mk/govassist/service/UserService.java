package mk.govassist.service;

import lombok.RequiredArgsConstructor;
import mk.govassist.dto.user.UpdateProfileDto;
import mk.govassist.exception.NotFoundException;
import mk.govassist.model.User;
import mk.govassist.repository.UserRepository;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;

    @Transactional(readOnly = true)
    public User getCurrentUser() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String email = auth.getName();
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new NotFoundException("User not found"));
    }

    @Transactional
    public User updateProfile(UpdateProfileDto dto) {
        User user = getCurrentUser();
        user.setFullName(dto.getFullName());
        user.setPhoneNumber(dto.getPhoneNumber());
        user.setAddress(dto.getAddress());
        return userRepository.save(user);
    }
}
