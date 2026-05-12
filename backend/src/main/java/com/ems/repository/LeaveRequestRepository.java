package com.ems.repository;

import com.ems.entity.Employee;
import com.ems.entity.LeaveRequest;
import com.ems.enums.LeaveStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface LeaveRequestRepository extends JpaRepository<LeaveRequest, Long> {

    List<LeaveRequest> findByEmployee(Employee employee);

    List<LeaveRequest> findByStatus(LeaveStatus status);

    List<LeaveRequest> findByEmployeeAndStatus(Employee employee, LeaveStatus status);

    @Query("SELECT l FROM LeaveRequest l WHERE l.employee.manager = :manager AND l.status = :status")
    List<LeaveRequest> findByManagerAndStatus(@Param("manager") Employee manager, @Param("status") LeaveStatus status);

    @Query("SELECT l FROM LeaveRequest l WHERE l.employee.manager.id = :managerId")
    List<LeaveRequest> findByManagerId(@Param("managerId") Long managerId);

    @Query("SELECT l.type, COUNT(l) FROM LeaveRequest l WHERE l.status = 'APPROVED' GROUP BY l.type")
    List<Object[]> countApprovedByType();

    @Query("SELECT MONTH(l.startDate), COUNT(l) FROM LeaveRequest l WHERE l.status = 'APPROVED' GROUP BY MONTH(l.startDate)")
    List<Object[]> countApprovedByMonth();
}
