package mk.govassist.controller;

import jakarta.validation.Valid;
import java.util.List;
import lombok.RequiredArgsConstructor;
import mk.govassist.dto.request.OfficerRequestDetailsDto;
import mk.govassist.dto.request.OfficerRequestListItemDto;
import mk.govassist.dto.request.RequestSearchItemDto;
import mk.govassist.dto.request.UpdateRequestStatusDto;
import mk.govassist.model.RequestStatus;
import mk.govassist.service.OfficerRequestService;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/officer/requests")
@RequiredArgsConstructor
@PreAuthorize("hasAnyRole('OFFICER','ADMINISTRATOR')")
public class OfficerRequestController {

    private final OfficerRequestService officerRequestService;

    @GetMapping
    public ResponseEntity<List<OfficerRequestListItemDto>> all() {
        return ResponseEntity.ok(officerRequestService.getAllIncomingRequests());
    }

    @GetMapping("/status/{status}")
    public ResponseEntity<List<OfficerRequestListItemDto>> byStatus(@PathVariable RequestStatus status) {
        return ResponseEntity.ok(officerRequestService.getIncomingRequestsByStatus(status));
    }

    @GetMapping("/search")
    public ResponseEntity<Page<RequestSearchItemDto>> search(
            @RequestParam(value = "status", required = false) RequestStatus status,
            @RequestParam(value = "serviceId", required = false) Long serviceId,
            @RequestParam(value = "q", required = false) String q,
            @RequestParam(value = "applicantEmail", required = false) String applicantEmail,
            @RequestParam(value = "page", required = false) Integer page,
            @RequestParam(value = "size", required = false) Integer size,
            @RequestParam(value = "sort", required = false) String sort
    ) {
        return ResponseEntity.ok(
                officerRequestService.searchAll(status, serviceId, q, applicantEmail, page, size, sort)
        );
    }

    @GetMapping("/{id}")
    public ResponseEntity<OfficerRequestDetailsDto> details(@PathVariable Long id) {
        return ResponseEntity.ok(officerRequestService.getRequestDetailsForOfficer(id));
    }

    @PutMapping("/{id}/status")
    public ResponseEntity<OfficerRequestDetailsDto> updateStatus(
            @PathVariable Long id,
            @Valid @RequestBody UpdateRequestStatusDto dto
    ) {
        return ResponseEntity.ok(officerRequestService.updateRequestStatus(id, dto));
    }
}
