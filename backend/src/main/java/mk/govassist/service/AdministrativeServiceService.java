package mk.govassist.service;

import lombok.RequiredArgsConstructor;
import mk.govassist.dto.service.AdministrativeServiceDto;
import mk.govassist.dto.service.AdministrativeServiceResponseDto;
import mk.govassist.dto.service.CreateAdministrativeServiceDto;
import mk.govassist.dto.service.ServiceSearchResponseDto;
import mk.govassist.dto.service.UpdateAdministrativeServiceDto;
import mk.govassist.exception.BadRequestException;
import mk.govassist.exception.NotFoundException;
import mk.govassist.model.AdministrativeService;
import mk.govassist.repository.AdministrativeServiceRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class AdministrativeServiceService {

    private final AdministrativeServiceRepository administrativeServiceRepository;

    @Transactional(readOnly = true)
    public List<AdministrativeServiceDto> findAll() {
        return administrativeServiceRepository.findAll()
                .stream()
                .map(this::toDto)
                .toList();
    }

    @Transactional(readOnly = true)
    public AdministrativeServiceDto findById(Long id) {
        AdministrativeService service = administrativeServiceRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Service not found"));
        return toDto(service);
    }

    @Transactional(readOnly = true)
    public Page<ServiceSearchResponseDto> searchServices(String q, Integer page, Integer size, String sort) {
        Pageable pageable = buildPageable(page, size, sort);

        if (q == null || q.isBlank()) {
            return administrativeServiceRepository.findAll(pageable).map(this::toSearchDto);
        }
        return administrativeServiceRepository
                .findByTitleContainingIgnoreCaseOrDescriptionContainingIgnoreCase(q, q, pageable)
                .map(this::toSearchDto);
    }

    @Transactional
    public AdministrativeServiceResponseDto create(CreateAdministrativeServiceDto dto) {
        AdministrativeService service = AdministrativeService.builder()
                .title(dto.getTitle())
                .description(dto.getDescription())
                .conditions(dto.getConditions())
                .requiredDocuments(dto.getRequiredDocuments())
                .build();
        return toResponse(administrativeServiceRepository.save(service));
    }

    @Transactional
    public AdministrativeServiceResponseDto update(Long id, UpdateAdministrativeServiceDto dto) {
        AdministrativeService service = administrativeServiceRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Service not found"));
        service.setTitle(dto.getTitle());
        service.setDescription(dto.getDescription());
        service.setConditions(dto.getConditions());
        service.setRequiredDocuments(dto.getRequiredDocuments());
        return toResponse(administrativeServiceRepository.save(service));
    }

    @Transactional
    public void delete(Long id) {
        AdministrativeService service = administrativeServiceRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Service not found"));
        administrativeServiceRepository.delete(service);
    }

    private AdministrativeServiceDto toDto(AdministrativeService service) {
        return AdministrativeServiceDto.builder()
                .id(service.getId())
                .title(service.getTitle())
                .description(service.getDescription())
                .conditions(service.getConditions())
                .requiredDocuments(service.getRequiredDocuments())
                .build();
    }

    private AdministrativeServiceResponseDto toResponse(AdministrativeService service) {
        return AdministrativeServiceResponseDto.builder()
                .id(service.getId())
                .title(service.getTitle())
                .description(service.getDescription())
                .conditions(service.getConditions())
                .requiredDocuments(service.getRequiredDocuments())
                .build();
    }

    private ServiceSearchResponseDto toSearchDto(AdministrativeService service) {
        return ServiceSearchResponseDto.builder()
                .id(service.getId())
                .title(service.getTitle())
                .description(service.getDescription())
                .conditions(service.getConditions())
                .requiredDocuments(service.getRequiredDocuments())
                .build();
    }

    private Pageable buildPageable(Integer page, Integer size, String sort) {
        int p = page == null ? 0 : page;
        int s = size == null ? 20 : size;
        if (p < 0 || s <= 0) {
            throw new BadRequestException("Invalid pagination parameters");
        }
        Sort sortObj = Sort.by("title").ascending();
        if (sort != null && !sort.isBlank()) {
            String[] parts = sort.split(",");
            String prop = parts[0].trim();
            if (prop.isEmpty()) prop = "title";
            Sort.Direction dir = (parts.length > 1 && "desc".equalsIgnoreCase(parts[1].trim()))
                    ? Sort.Direction.DESC : Sort.Direction.ASC;
            sortObj = Sort.by(dir, prop);
        }
        return PageRequest.of(p, s, sortObj);
    }
}
