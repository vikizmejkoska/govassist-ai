package mk.govassist.controller;

import lombok.RequiredArgsConstructor;
import mk.govassist.dto.service.AdministrativeServiceDto;
import mk.govassist.dto.service.ServiceSearchResponseDto;
import mk.govassist.service.AdministrativeServiceService;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/services")
@RequiredArgsConstructor
public class AdministrativeServiceController {

    private final AdministrativeServiceService administrativeServiceService;

    @GetMapping
    public ResponseEntity<List<AdministrativeServiceDto>> list() {
        return ResponseEntity.ok(administrativeServiceService.findAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<AdministrativeServiceDto> getById(@PathVariable Long id) {
        return ResponseEntity.ok(administrativeServiceService.findById(id));
    }

    @GetMapping("/search")
    public ResponseEntity<Page<ServiceSearchResponseDto>> search(
            @RequestParam(value = "q", required = false) String q,
            @RequestParam(value = "page", required = false) Integer page,
            @RequestParam(value = "size", required = false) Integer size,
            @RequestParam(value = "sort", required = false) String sort
    ) {
        return ResponseEntity.ok(administrativeServiceService.searchServices(q, page, size, sort));
    }
}
