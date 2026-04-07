package mk.govassist.service;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.List;
import java.util.Set;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import mk.govassist.config.UploadProperties;
import mk.govassist.dto.document.RequestDocumentResponseDto;
import mk.govassist.exception.BadRequestException;
import mk.govassist.exception.NotFoundException;
import mk.govassist.model.RequestDocument;
import mk.govassist.model.RoleType;
import mk.govassist.model.ServiceRequest;
import mk.govassist.model.User;
import mk.govassist.repository.RequestDocumentRepository;
import mk.govassist.repository.ServiceRequestRepository;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.MimeType;
import org.springframework.util.MimeTypeUtils;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;

@Service
@RequiredArgsConstructor
@Slf4j
public class RequestDocumentService {

    private static final Set<String> ALLOWED_EXTENSIONS = Set.of("pdf", "png", "jpg", "jpeg", "doc", "docx");
    private static final Set<String> ALLOWED_MIME = Set.of(
            MediaType.APPLICATION_PDF_VALUE,
            MediaType.IMAGE_PNG_VALUE,
            MediaType.IMAGE_JPEG_VALUE,
            "application/msword",
            "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
    );

    private final RequestDocumentRepository requestDocumentRepository;
    private final ServiceRequestRepository serviceRequestRepository;
    private final UserService userService;
    private final UploadProperties uploadProperties;

    @Transactional
    public List<RequestDocumentResponseDto> uploadDocuments(Long requestId, List<MultipartFile> files) {
        if (files == null || files.isEmpty()) {
            throw new BadRequestException("No files provided");
        }
        ServiceRequest request = serviceRequestRepository.findById(requestId)
                .orElseThrow(() -> new NotFoundException("Request not found"));

        User current = userService.getCurrentUser();
        validateRequestAccess(request, current, "upload documents for");

        ensureUploadDir();

        String uploaderEmail = current.getEmail();
        return files.stream()
                .map(file -> storeFile(request, file, uploaderEmail))
                .toList();
    }

    @Transactional(readOnly = true)
    public List<RequestDocumentResponseDto> getDocumentsByRequestId(Long requestId) {
        ServiceRequest request = serviceRequestRepository.findById(requestId)
                .orElseThrow(() -> new NotFoundException("Request not found"));
        validateRequestAccess(request, userService.getCurrentUser(), "view documents for");

        return requestDocumentRepository.findByRequestId(requestId)
                .stream()
                .map(this::toDto)
                .toList();
    }

    private RequestDocumentResponseDto storeFile(ServiceRequest request, MultipartFile file, String uploaderEmail) {
        validateFile(file);
        String originalName = sanitizeFilename(file.getOriginalFilename());
        String ext = getExtension(originalName);
        String storedName = UUID.randomUUID() + (ext.isEmpty() ? "" : "." + ext);
        Path destination = Paths.get(uploadProperties.dir()).resolve(storedName).normalize().toAbsolutePath();

        try {
            Files.copy(file.getInputStream(), destination);
        } catch (IOException e) {
            throw new BadRequestException("Failed to store file: " + originalName);
        }

        RequestDocument document = RequestDocument.builder()
                .request(request)
                .originalFileName(originalName)
                .storedFileName(storedName)
                .fileType(file.getContentType())
                .filePath(destination.toAbsolutePath().toString())
                .build();

        RequestDocument saved = requestDocumentRepository.save(document);
        log.info("Document uploaded requestId={} storedName={} by={}", request.getId(), storedName, uploaderEmail);
        return toDto(saved);
    }

    private void validateFile(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new BadRequestException("File is empty");
        }
        if (file.getSize() > uploadProperties.maxFileSize().toBytes()) {
            throw new BadRequestException("File too large");
        }
        String ext = getExtension(file.getOriginalFilename());
        if (!ext.isEmpty() && !ALLOWED_EXTENSIONS.contains(ext.toLowerCase())) {
            throw new BadRequestException("Invalid file type");
        }
        String contentType = file.getContentType();
        if (contentType != null && !contentType.isBlank()) {
            try {
                MimeType mime = MimeTypeUtils.parseMimeType(contentType);
                String normalized = mime.getType() + "/" + mime.getSubtype();
                if (!ALLOWED_MIME.contains(normalized)) {
                    throw new BadRequestException("Invalid file type");
                }
            } catch (IllegalArgumentException ex) {
                throw new BadRequestException("Invalid file type");
            }
        }
    }

    private String getExtension(String filename) {
        if (!StringUtils.hasText(filename) || !filename.contains(".")) {
            return "";
        }
        return filename.substring(filename.lastIndexOf('.') + 1).toLowerCase();
    }

    private void ensureUploadDir() {
        try {
            Path root = Paths.get(uploadProperties.dir()).normalize().toAbsolutePath();
            if (Files.notExists(root)) {
                Files.createDirectories(root);
            }
        } catch (IOException e) {
            throw new BadRequestException("Could not create upload directory");
        }
    }

    private String sanitizeFilename(String original) {
        String cleaned = StringUtils.cleanPath(original == null ? "" : original);
        if (cleaned.contains("..")) {
            throw new BadRequestException("Invalid file name");
        }
        return cleaned;
    }

    private void validateRequestAccess(ServiceRequest request, User current, String action) {
        boolean isOwner = request.getApplicant().getId().equals(current.getId());
        boolean privileged = current.getRole() != null && (
                current.getRole().getName() == RoleType.ADMINISTRATOR || current.getRole().getName() == RoleType.OFFICER);
        if (!isOwner && !privileged) {
            throw new BadRequestException("Not allowed to " + action + " this request");
        }
    }

    private RequestDocumentResponseDto toDto(RequestDocument doc) {
        return RequestDocumentResponseDto.builder()
                .id(doc.getId())
                .originalFileName(doc.getOriginalFileName())
                .storedFileName(doc.getStoredFileName())
                .fileType(doc.getFileType())
                .uploadedAt(doc.getUploadedAt())
                .build();
    }
}
