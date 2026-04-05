package mk.govassist.config;

import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
import mk.govassist.model.Role;
import mk.govassist.model.RoleType;
import mk.govassist.model.AdministrativeService;
import mk.govassist.repository.RoleRepository;
import mk.govassist.repository.AdministrativeServiceRepository;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class DataInitializer {

    private final RoleRepository roleRepository;
    private final AdministrativeServiceRepository administrativeServiceRepository;

    @PostConstruct
    public void seedRoles() {
        for (RoleType type : RoleType.values()) {
            roleRepository.findByName(type).orElseGet(() ->
                    roleRepository.save(Role.builder().name(type).build())
            );
        }
    }

    @PostConstruct
    public void seedSampleService() {
        if (administrativeServiceRepository.count() == 0) {
            administrativeServiceRepository.save(
                    AdministrativeService.builder()
                            .title("Birth Certificate Issuance")
                            .description("Request and obtain an official birth certificate.")
                            .conditions("Citizen must present valid ID.")
                            .requiredDocuments("National ID card; completed application form.")
                            .build()
            );
        }
    }
}
