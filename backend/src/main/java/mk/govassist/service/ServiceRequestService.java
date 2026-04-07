package mk.govassist.service;

import java.util.List;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import mk.govassist.dto.document.RequestDocumentResponseDto;
import mk.govassist.dto.request.CreateRequestDto;
import mk.govassist.dto.request.RequestDetailsDto;
import mk.govassist.dto.request.RequestHistoryItemDto;
import mk.govassist.dto.request.ServiceRequestResponseDto;
import mk.govassist.dto.request.UpdateRequestStatusDto;
import mk.govassist.dto.request.RequestSearchItemDto;
import mk.govassist.exception.BadRequestException;
import mk.govassist.exception.NotFoundException;
import mk.govassist.model.AdministrativeService;
import mk.govassist.model.RequestDocument;
import mk.govassist.model.RequestStatus;
import mk.govassist.model.RoleType;
import mk.govassist.model.ServiceRequest;
import mk.govassist.model.User;
import mk.govassist.repository.AdministrativeServiceRepository;
import mk.govassist.repository.RequestDocumentRepository;
import mk.govassist.repository.ServiceRequestRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Slf4j
public class ServiceRequestService {

    private final ServiceRequestRepository serviceRequestRepository;
    private final AdministrativeServiceRepository administrativeServiceRepository;
    private final RequestDocumentRepository requestDocumentRepository;
    private final UserService userService;
    private final NotificationService notificationService;

    @Transactional
    public ServiceRequestResponseDto createRequest(CreateRequestDto dto) {
        User currentUser = currentUser();
        if (currentUser.getRole() == null || currentUser.getRole().getName() == null) {
            throw new BadRequestException("User role not assigned");
        }
        switch (currentUser.getRole().getName()) {
            case CITIZEN -> {
            }
            default -> throw new BadRequestException("Only citizens can submit requests");
        }

        AdministrativeService service = administrativeServiceRepository.findById(dto.getServiceId())
                .orElseThrow(() -> new NotFoundException("Service not found"));

        ServiceRequest request = ServiceRequest.builder()
                .applicant(currentUser)
                .service(service)
                .title(dto.getTitle())
                .description(dto.getDescription())
                .status(RequestStatus.SUBMITTED)
                .build();

        ServiceRequest saved = serviceRequestRepository.save(request);
        createStatusNotification(saved, RequestStatus.SUBMITTED);
        log.info("Request created id={} applicant={} serviceId={}", saved.getId(), currentUser.getEmail(), service.getId());
        return toDto(saved);
    }

    @Transactional(readOnly = true)
    public RequestDetailsDto getRequestDetailsForCurrentUser(Long id) {
        ServiceRequest request = serviceRequestRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Request not found"));

        User current = currentUser();
        RoleType role = current.getRole() != null ? current.getRole().getName() : null;
        boolean owner = request.getApplicant().getId().equals(current.getId());
        boolean privileged = role == RoleType.ADMINISTRATOR || role == RoleType.OFFICER;
        if (!owner && !privileged) {
            throw new BadRequestException("You are not allowed to access this request");
        }

        return toDetailsDto(request);
    }

    @Transactional(readOnly = true)
    public List<RequestHistoryItemDto> getCurrentUserRequestHistory() {
        String email = currentUser().getEmail();
        return serviceRequestRepository.findByApplicantEmailOrderByCreatedAtDesc(email)
                .stream()
                .map(this::toHistoryDto)
                .toList();
    }

    @Transactional(readOnly = true)
    public Page<RequestSearchItemDto> searchCurrentUserRequests(RequestStatus status, Long serviceId, String q,
                                                                Integer page, Integer size, String sort) {
        User current = currentUser();
        Pageable pageable = buildPageable(page, size, sort);
        Specification<ServiceRequest> spec = Specification.where(applicantEmailEquals(current.getEmail()));

        spec = spec.and(optionalStatus(status))
                   .and(optionalService(serviceId))
                   .and(optionalTitleLike(q));

        return serviceRequestRepository.findAll(spec, pageable).map(this::toSearchDto);
    }

    @Transactional
    public RequestDetailsDto updateRequestStatus(Long requestId, UpdateRequestStatusDto dto) {
        User current = currentUser();
        RoleType role = current.getRole() != null ? current.getRole().getName() : null;
        if (role != RoleType.ADMINISTRATOR && role != RoleType.OFFICER) {
            throw new BadRequestException("Only officers or administrators can update request status");
        }

        ServiceRequest request = serviceRequestRepository.findById(requestId)
                .orElseThrow(() -> new NotFoundException("Request not found"));

        request.setStatus(dto.getStatus());
        ServiceRequest saved = serviceRequestRepository.save(request);

        createStatusNotification(saved, dto.getStatus());
        log.info("Request status updated id={} newStatus={} by={}", saved.getId(), dto.getStatus(), current.getEmail());

        return toDetailsDto(saved);
    }

    private User currentUser() {
        return userService.getCurrentUser(); // reuses existing resolution and error handling
    }

    private ServiceRequestResponseDto toDto(ServiceRequest request) {
        return ServiceRequestResponseDto.builder()
                .id(request.getId())
                .applicantEmail(request.getApplicant().getEmail())
                .serviceId(request.getService().getId())
                .serviceTitle(request.getService().getTitle())
                .title(request.getTitle())
                .description(request.getDescription())
                .status(request.getStatus())
                .createdAt(request.getCreatedAt())
                .updatedAt(request.getUpdatedAt())
                .build();
    }

    private RequestHistoryItemDto toHistoryDto(ServiceRequest request) {
        long docCount = requestDocumentRepository.countByRequestId(request.getId());
        return RequestHistoryItemDto.builder()
                .id(request.getId())
                .serviceId(request.getService().getId())
                .serviceTitle(request.getService().getTitle())
                .title(request.getTitle())
                .description(request.getDescription())
                .status(request.getStatus())
                .createdAt(request.getCreatedAt())
                .updatedAt(request.getUpdatedAt())
                .documentCount(docCount)
                .build();
    }

    private RequestDetailsDto toDetailsDto(ServiceRequest request) {
        List<RequestDocument> docs = requestDocumentRepository.findByRequestId(request.getId());
        return RequestDetailsDto.builder()
                .id(request.getId())
                .applicantEmail(request.getApplicant().getEmail())
                .serviceId(request.getService().getId())
                .serviceTitle(request.getService().getTitle())
                .title(request.getTitle())
                .description(request.getDescription())
                .status(request.getStatus())
                .createdAt(request.getCreatedAt())
                .updatedAt(request.getUpdatedAt())
                .documents(docs.stream().map(this::toDocDto).toList())
                .build();
    }

    private RequestDocumentResponseDto toDocDto(RequestDocument doc) {
        return RequestDocumentResponseDto.builder()
                .id(doc.getId())
                .originalFileName(doc.getOriginalFileName())
                .storedFileName(doc.getStoredFileName())
                .fileType(doc.getFileType())
                .uploadedAt(doc.getUploadedAt())
                .build();
    }

    private void createStatusNotification(ServiceRequest request, RequestStatus status) {
        String title = "Request update";
        String message = "Your request status changed.";
        switch (status) {
            case SUBMITTED -> {
                title = "Request submitted";
                message = "Your request has been submitted successfully.";
            }
            case IN_PROGRESS -> {
                message = "Your request is now in progress.";
            }
            case ADDITIONAL_DOCUMENTS_REQUIRED -> {
                title = "Additional documents required";
                message = "Please provide additional documents for your request.";
            }
            case APPROVED -> {
                title = "Request approved";
                message = "Your request has been approved.";
            }
            case REJECTED -> {
                title = "Request rejected";
                message = "Your request has been rejected.";
            }
        }
        notificationService.createNotification(request.getApplicant(), request, title, message);
    }

    private Specification<ServiceRequest> applicantEmailEquals(String email) {
        return (root, query, cb) -> cb.equal(root.get("applicant").get("email"), email);
    }

    private Specification<ServiceRequest> optionalStatus(RequestStatus status) {
        if (status == null) return nullSpec();
        return (root, query, cb) -> cb.equal(root.get("status"), status);
    }

    private Specification<ServiceRequest> optionalService(Long serviceId) {
        if (serviceId == null) return nullSpec();
        return (root, query, cb) -> cb.equal(root.get("service").get("id"), serviceId);
    }

    private Specification<ServiceRequest> optionalTitleLike(String q) {
        if (q == null || q.isBlank()) return nullSpec();
        String like = "%" + q.toLowerCase() + "%";
        return (root, query, cb) -> cb.like(cb.lower(root.get("title")), like);
    }

    private Specification<ServiceRequest> nullSpec() {
        return (root, query, cb) -> cb.conjunction();
    }

    private Pageable buildPageable(Integer page, Integer size, String sort) {
        int p = page == null ? 0 : page;
        int s = size == null ? 20 : size;
        if (p < 0 || s <= 0) {
            throw new BadRequestException("Invalid pagination parameters");
        }
        Sort sortObj = Sort.by("createdAt").descending();
        if (sort != null && !sort.isBlank()) {
            String[] parts = sort.split(",");
            String prop = parts[0].trim();
            if (prop.isEmpty()) prop = "createdAt";
            Sort.Direction dir = (parts.length > 1 && "asc".equalsIgnoreCase(parts[1].trim()))
                    ? Sort.Direction.ASC : Sort.Direction.DESC;
            sortObj = Sort.by(dir, prop);
        }
        return PageRequest.of(p, s, sortObj);
    }

    private RequestSearchItemDto toSearchDto(ServiceRequest request) {
        return RequestSearchItemDto.builder()
                .id(request.getId())
                .applicantEmail(request.getApplicant().getEmail())
                .serviceId(request.getService().getId())
                .serviceTitle(request.getService().getTitle())
                .title(request.getTitle())
                .status(request.getStatus())
                .createdAt(request.getCreatedAt())
                .updatedAt(request.getUpdatedAt())
                .build();
    }
}
