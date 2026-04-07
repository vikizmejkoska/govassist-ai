package mk.govassist.service;

import java.util.List;
import lombok.RequiredArgsConstructor;
import mk.govassist.dto.comment.RequestCommentResponseDto;
import mk.govassist.dto.document.RequestDocumentResponseDto;
import mk.govassist.dto.request.OfficerRequestDetailsDto;
import mk.govassist.dto.request.OfficerRequestListItemDto;
import mk.govassist.dto.request.RequestSearchItemDto;
import mk.govassist.dto.request.UpdateRequestStatusDto;
import mk.govassist.exception.BadRequestException;
import mk.govassist.exception.NotFoundException;
import mk.govassist.model.RequestComment;
import mk.govassist.model.RequestDocument;
import mk.govassist.model.RequestStatus;
import mk.govassist.model.RoleType;
import mk.govassist.model.ServiceRequest;
import mk.govassist.model.User;
import mk.govassist.repository.RequestCommentRepository;
import mk.govassist.repository.RequestDocumentRepository;
import mk.govassist.repository.ServiceRequestRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;

@Service
@RequiredArgsConstructor
public class OfficerRequestService {

    private final ServiceRequestRepository serviceRequestRepository;
    private final RequestDocumentRepository requestDocumentRepository;
    private final RequestCommentRepository requestCommentRepository;
    private final UserService userService;
    private final NotificationService notificationService;

    @Transactional(readOnly = true)
    public Page<RequestSearchItemDto> searchAll(RequestStatus status, Long serviceId, String q, String applicantEmail,
                                               Integer page, Integer size, String sort) {
        ensureOfficer();
        Pageable pageable = buildPageable(page, size, sort);

        Specification<ServiceRequest> spec = Specification.where(nullSpec());
        spec = spec.and(optionalStatus(status))
                   .and(optionalService(serviceId))
                   .and(optionalTitleLike(q))
                   .and(optionalApplicant(applicantEmail));

        return serviceRequestRepository.findAll(spec, pageable).map(this::toSearchDto);
    }

    @Transactional(readOnly = true)
    public List<OfficerRequestListItemDto> getAllIncomingRequests() {
        ensureOfficer();
        return serviceRequestRepository.findAllByOrderByCreatedAtDesc()
                .stream()
                .map(this::toListItem)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<OfficerRequestListItemDto> getIncomingRequestsByStatus(RequestStatus status) {
        ensureOfficer();
        return serviceRequestRepository.findByStatusOrderByCreatedAtDesc(status)
                .stream()
                .map(this::toListItem)
                .toList();
    }

    @Transactional(readOnly = true)
    public OfficerRequestDetailsDto getRequestDetailsForOfficer(Long requestId) {
        ensureOfficer();
        ServiceRequest request = serviceRequestRepository.findById(requestId)
                .orElseThrow(() -> new NotFoundException("Request not found"));
        return toDetails(request);
    }

    @Transactional
    public OfficerRequestDetailsDto updateRequestStatus(Long requestId, UpdateRequestStatusDto dto) {
        ensureOfficer();
        ServiceRequest request = serviceRequestRepository.findById(requestId)
                .orElseThrow(() -> new NotFoundException("Request not found"));

        request.setStatus(dto.getStatus());
        ServiceRequest saved = serviceRequestRepository.save(request);

        createStatusNotification(saved, dto.getStatus());

        return toDetails(saved);
    }

    private void ensureOfficer() {
        User current = userService.getCurrentUser();
        RoleType role = current.getRole() != null ? current.getRole().getName() : null;
        if (role != RoleType.ADMINISTRATOR && role != RoleType.OFFICER) {
            throw new BadRequestException("Only officers or administrators can access this endpoint");
        }
    }

    private OfficerRequestListItemDto toListItem(ServiceRequest request) {
        return OfficerRequestListItemDto.builder()
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

    private OfficerRequestDetailsDto toDetails(ServiceRequest request) {
        List<RequestDocument> docs = requestDocumentRepository.findByRequestId(request.getId());
        List<RequestComment> comments = requestCommentRepository.findByRequestIdOrderByCreatedAtAsc(request.getId());
        return OfficerRequestDetailsDto.builder()
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
                .comments(comments.stream().map(this::toCommentDto).toList())
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

    private RequestCommentResponseDto toCommentDto(RequestComment comment) {
        String authorRole = comment.getAuthor().getRole() != null ? comment.getAuthor().getRole().getName().name() : "";
        return RequestCommentResponseDto.builder()
                .id(comment.getId())
                .authorEmail(comment.getAuthor().getEmail())
                .authorRole(authorRole)
                .comment(comment.getComment())
                .type(comment.getType())
                .createdAt(comment.getCreatedAt())
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

    private Specification<ServiceRequest> optionalApplicant(String email) {
        if (email == null || email.isBlank()) return nullSpec();
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
