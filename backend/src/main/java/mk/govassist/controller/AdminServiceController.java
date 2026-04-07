package mk.govassist.controller;

import jakarta.validation.Valid;
import java.util.List;
import lombok.RequiredArgsConstructor;
import mk.govassist.dto.service.AdministrativeServiceResponseDto;
import mk.govassist.dto.service.CreateAdministrativeServiceDto;
import mk.govassist.dto.service.UpdateAdministrativeServiceDto;
import mk.govassist.service.AdministrativeServiceService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/admin/services")
@PreAuthorize("hasRole('ADMINISTRATOR')")
@RequiredArgsConstructor
public class AdminServiceController {

    private final AdministrativeServiceService administrativeServiceService;

    @PostMapping
    public ResponseEntity<AdministrativeServiceResponseDto> create(@Valid @RequestBody CreateAdministrativeServiceDto dto) {
        return ResponseEntity.ok(administrativeServiceService.create(dto));
    }

    @PutMapping("/{id}")
    public ResponseEntity<AdministrativeServiceResponseDto> update(
            @PathVariable Long id,
            @Valid @RequestBody UpdateAdministrativeServiceDto dto
    ) {
        return ResponseEntity.ok(administrativeServiceService.update(id, dto));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        administrativeServiceService.delete(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping
    public ResponseEntity<List<AdministrativeServiceResponseDto>> list() {
        return ResponseEntity.ok(
                administrativeServiceService.findAll()
                        .stream()
                        .map(s -> AdministrativeServiceResponseDto.builder()
                                .id(s.getId())
                                .title(s.getTitle())
                                .description(s.getDescription())
                                .conditions(s.getConditions())
                                .requiredDocuments(s.getRequiredDocuments())
                                .build())
                        .toList()
        );
    }

    @GetMapping("/{id}")
    public ResponseEntity<AdministrativeServiceResponseDto> get(@PathVariable Long id) {
        var s = administrativeServiceService.findById(id);
        return ResponseEntity.ok(AdministrativeServiceResponseDto.builder()
                .id(s.getId())
                .title(s.getTitle())
                .description(s.getDescription())
                .conditions(s.getConditions())
                .requiredDocuments(s.getRequiredDocuments())
                .build());
    }
}
