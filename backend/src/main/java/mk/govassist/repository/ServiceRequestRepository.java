package mk.govassist.repository;

import java.util.List;
import mk.govassist.model.RequestStatus;
import mk.govassist.model.ServiceRequest;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;

public interface ServiceRequestRepository extends JpaRepository<ServiceRequest, Long>, JpaSpecificationExecutor<ServiceRequest> {
    List<ServiceRequest> findByApplicantEmail(String email);
    List<ServiceRequest> findByApplicantEmailOrderByCreatedAtDesc(String email);
    List<ServiceRequest> findAllByOrderByCreatedAtDesc();
    List<ServiceRequest> findByStatusOrderByCreatedAtDesc(RequestStatus status);
}
