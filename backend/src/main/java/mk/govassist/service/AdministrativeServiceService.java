package mk.govassist.service;

import lombok.RequiredArgsConstructor;
import mk.govassist.dto.service.AdministrativeServiceDto;
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

    private AdministrativeServiceDto toDto(AdministrativeService service) {
        return AdministrativeServiceDto.builder()
                .id(service.getId())
                .title(service.getTitle())
                .description(service.getDescription())
                .conditions(service.getConditions())
                .requiredDocuments(service.getRequiredDocuments())
                .build();
    }
}
