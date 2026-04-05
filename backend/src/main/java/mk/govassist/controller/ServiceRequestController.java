package mk.govassist.controller;

import jakarta.validation.Valid;
import java.util.List;
import lombok.RequiredArgsConstructor;
import mk.govassist.dto.document.RequestDocumentResponseDto;
import mk.govassist.dto.request.CreateRequestDto;
import mk.govassist.dto.request.RequestDetailsDto;
import mk.govassist.dto.request.RequestHistoryItemDto;
import mk.govassist.dto.request.UpdateRequestStatusDto;
import mk.govassist.service.RequestDocumentService;
import mk.govassist.service.ServiceRequestService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api/requests")
@RequiredArgsConstructor
public class ServiceRequestController {

    private final ServiceRequestService serviceRequestService;
    private final RequestDocumentService requestDocumentService;

    @PostMapping
    public ResponseEntity<RequestDetailsDto> createRequest(@Valid @RequestBody CreateRequestDto dto) {
        var created = serviceRequestService.createRequest(dto);
        return ResponseEntity.ok(serviceRequestService.getRequestDetailsForCurrentUser(created.getId()));
    }

    @GetMapping("/my")
    public ResponseEntity<List<RequestHistoryItemDto>> myRequests() {
        return ResponseEntity.ok(serviceRequestService.getCurrentUserRequestHistory());
    }

    @GetMapping("/{id}")
    public ResponseEntity<RequestDetailsDto> getById(@PathVariable Long id) {
        return ResponseEntity.ok(serviceRequestService.getRequestDetailsForCurrentUser(id));
    }

    @PutMapping("/{id}/status")
    @PreAuthorize("hasRole('ADMINISTRATOR') or hasRole('OFFICER')")
    public ResponseEntity<RequestDetailsDto> updateStatus(
            @PathVariable Long id,
            @Valid @RequestBody UpdateRequestStatusDto dto
    ) {
        return ResponseEntity.ok(serviceRequestService.updateRequestStatus(id, dto));
    }

    @PostMapping("/{id}/documents")
    public ResponseEntity<List<RequestDocumentResponseDto>> uploadDocuments(
            @PathVariable Long id,
            @RequestParam("files") List<MultipartFile> files
    ) {
        return ResponseEntity.ok(requestDocumentService.uploadDocuments(id, files));
    }

    @GetMapping("/{id}/documents")
    public ResponseEntity<List<RequestDocumentResponseDto>> listDocuments(@PathVariable Long id) {
        return ResponseEntity.ok(requestDocumentService.getDocumentsByRequestId(id));
    }
}
