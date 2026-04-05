package mk.govassist.controller;

import jakarta.validation.Valid;
import java.util.List;
import lombok.RequiredArgsConstructor;
import mk.govassist.dto.comment.CreateRequestCommentDto;
import mk.govassist.dto.comment.RequestCommentResponseDto;
import mk.govassist.service.RequestCommentService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/requests/{requestId}/comments")
@RequiredArgsConstructor
public class RequestCommentController {

    private final RequestCommentService requestCommentService;

    @GetMapping
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<List<RequestCommentResponseDto>> list(@PathVariable Long requestId) {
        return ResponseEntity.ok(requestCommentService.getCommentsByRequestId(requestId));
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('OFFICER','ADMINISTRATOR')")
    public ResponseEntity<RequestCommentResponseDto> add(
            @PathVariable Long requestId,
            @Valid @RequestBody CreateRequestCommentDto dto
    ) {
        return ResponseEntity.ok(requestCommentService.addComment(requestId, dto));
    }
}
