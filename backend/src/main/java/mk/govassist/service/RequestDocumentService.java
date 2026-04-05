package mk.govassist.service;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.List;
import java.util.Set;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import mk.govassist.dto.document.RequestDocumentResponseDto;
import mk.govassist.exception.BadRequestException;
import mk.govassist.exception.NotFoundException;
import mk.govassist.model.RequestDocument;
import mk.govassist.model.RoleType;
import mk.govassist.model.ServiceRequest;
import mk.govassist.model.User;
import mk.govassist.repository.RequestDocumentRepository;
import mk.govassist.repository.ServiceRequestRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;

@Service
@RequiredArgsConstructor
public class RequestDocumentService {

    private static final long MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024; // 5 MB
    private static final Set<String> ALLOWED_EXTENSIONS = Set.of("pdf", "png", "jpg", "jpeg", "doc", "docx");
    private static final Path UPLOAD_ROOT = Paths.get("uploads");

    private final RequestDocumentRepository requestDocumentRepository;
    private final ServiceRequestRepository serviceRequestRepository;
    private final UserService userService;

    @Transactional
    public List<RequestDocumentResponseDto> uploadDocuments(Long requestId, List<MultipartFile> files) {
        if (files == null || files.isEmpty()) {
            throw new BadRequestException("No files provided");
        }
        ServiceRequest request = serviceRequestRepository.findById(requestId)
                .orElseThrow(() -> new NotFoundException("Request not found"));

        User current = userService.getCurrentUser();
        boolean isOwner = request.getApplicant().getId().equals(current.getId());
        boolean privileged = current.getRole() != null && (
                current.getRole().getName() == RoleType.ADMINISTRATOR || current.getRole().getName() == RoleType.OFFICER);
        if (!isOwner && !privileged) {
            throw new BadRequestException("Not allowed to upload documents for this request");
        }

        ensureUploadDir();

        return files.stream()
                .map(file -> storeFile(request, file))
                .toList();
    }

    @Transactional(readOnly = true)
    public List<RequestDocumentResponseDto> getDocumentsByRequestId(Long requestId) {
        serviceRequestRepository.findById(requestId)
                .orElseThrow(() -> new NotFoundException("Request not found"));

        return requestDocumentRepository.findByRequestId(requestId)
                .stream()
                .map(this::toDto)
                .toList();
    }

    private RequestDocumentResponseDto storeFile(ServiceRequest request, MultipartFile file) {
        validateFile(file);
        String originalName = file.getOriginalFilename();
        String ext = getExtension(originalName);
        String storedName = UUID.randomUUID() + (ext.isEmpty() ? "" : "." + ext);
        Path destination = UPLOAD_ROOT.resolve(storedName);

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
        return toDto(saved);
    }

    private void validateFile(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new BadRequestException("File is empty");
        }
        if (file.getSize() > MAX_FILE_SIZE_BYTES) {
            throw new BadRequestException("File too large (max 5MB)");
        }
        String ext = getExtension(file.getOriginalFilename());
        if (!ext.isEmpty() && !ALLOWED_EXTENSIONS.contains(ext.toLowerCase())) {
            throw new BadRequestException("Invalid file type");
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
            if (Files.notExists(UPLOAD_ROOT)) {
                Files.createDirectories(UPLOAD_ROOT);
            }
        } catch (IOException e) {
            throw new BadRequestException("Could not create upload directory");
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
