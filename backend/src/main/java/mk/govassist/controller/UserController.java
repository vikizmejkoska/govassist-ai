package mk.govassist.controller;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import mk.govassist.dto.user.UpdateProfileDto;
import mk.govassist.dto.user.UserDetailsDto;
import mk.govassist.service.UserService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;

    @GetMapping("/me")
    public ResponseEntity<UserDetailsDto> me() {
        return ResponseEntity.ok(userService.getCurrentUserProfile());
    }

    @PutMapping("/me")
    public ResponseEntity<UserDetailsDto> update(@Valid @RequestBody UpdateProfileDto dto) {
        return ResponseEntity.ok(userService.updateProfile(dto));
    }
}
