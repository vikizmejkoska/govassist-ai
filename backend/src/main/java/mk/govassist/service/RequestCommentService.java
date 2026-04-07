package mk.govassist.service;

import java.util.List;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import mk.govassist.dto.comment.CreateRequestCommentDto;
import mk.govassist.dto.comment.RequestCommentResponseDto;
import mk.govassist.exception.BadRequestException;
import mk.govassist.exception.NotFoundException;
import mk.govassist.model.CommentType;
import mk.govassist.model.RequestComment;
import mk.govassist.model.RequestStatus;
import mk.govassist.model.RoleType;
import mk.govassist.model.ServiceRequest;
import mk.govassist.model.User;
import mk.govassist.repository.RequestCommentRepository;
import mk.govassist.repository.ServiceRequestRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Slf4j
public class RequestCommentService {

    private final RequestCommentRepository requestCommentRepository;
    private final ServiceRequestRepository serviceRequestRepository;
    private final UserService userService;
    private final NotificationService notificationService;

    @Transactional
    public RequestCommentResponseDto addComment(Long requestId, CreateRequestCommentDto dto) {
        User current = userService.getCurrentUser();
        ensureOfficer(current);

        ServiceRequest request = serviceRequestRepository.findById(requestId)
                .orElseThrow(() -> new NotFoundException("Request not found"));

        RequestComment comment = RequestComment.builder()
                .request(request)
                .author(current)
                .comment(dto.getComment())
                .type(dto.getType())
                .build();

        RequestComment saved = requestCommentRepository.save(comment);

        if (dto.getType() == CommentType.ADDITIONAL_DOCUMENT_REQUEST) {
            request.setStatus(RequestStatus.ADDITIONAL_DOCUMENTS_REQUIRED);
            serviceRequestRepository.save(request);
            notificationService.createNotification(request.getApplicant(), request,
                    "Additional documents required",
                    "Please provide additional documents for your request.");
            log.info("Additional documents requested for requestId={} by={}", requestId, current.getEmail());
        }

        log.info("Comment added type={} requestId={} by={}", dto.getType(), requestId, current.getEmail());
        return toDto(saved);
    }

    @Transactional(readOnly = true)
    public List<RequestCommentResponseDto> getCommentsByRequestId(Long requestId) {
        ServiceRequest request = serviceRequestRepository.findById(requestId)
                .orElseThrow(() -> new NotFoundException("Request not found"));

        User current = userService.getCurrentUser();
        RoleType role = current.getRole() != null ? current.getRole().getName() : null;
        boolean owner = request.getApplicant().getId().equals(current.getId());
        boolean privileged = role == RoleType.ADMINISTRATOR || role == RoleType.OFFICER;
        if (!owner && !privileged) {
            throw new BadRequestException("You are not allowed to view comments for this request");
        }

        return requestCommentRepository.findByRequestIdOrderByCreatedAtAsc(requestId)
                .stream()
                .map(this::toDto)
                .toList();
    }

    private void ensureOfficer(User user) {
        RoleType role = user.getRole() != null ? user.getRole().getName() : null;
        if (role != RoleType.ADMINISTRATOR && role != RoleType.OFFICER) {
            throw new BadRequestException("Only officers or administrators can add comments");
        }
    }

    private RequestCommentResponseDto toDto(RequestComment comment) {
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
}
