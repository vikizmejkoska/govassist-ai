package mk.govassist.service;

import lombok.RequiredArgsConstructor;
import mk.govassist.dto.service.AdministrativeServiceDto;
import mk.govassist.dto.service.AdministrativeServiceResponseDto;
import mk.govassist.dto.service.CreateAdministrativeServiceDto;
import mk.govassist.dto.service.UpdateAdministrativeServiceDto;
import mk.govassist.exception.NotFoundException;
import mk.govassist.model.AdministrativeService;
import mk.govassist.repository.AdministrativeServiceRepository;
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
}
