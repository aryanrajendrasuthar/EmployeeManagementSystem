package com.ems.repository;

import com.ems.entity.Department;
import com.ems.entity.Employee;
import com.ems.enums.EmployeeStatus;
import com.ems.enums.Role;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface EmployeeRepository extends JpaRepository<Employee, Long> {

    Optional<Employee> findByEmail(String email);

    Optional<Employee> findByEmployeeId(String employeeId);

    boolean existsByEmail(String email);

    boolean existsByEmployeeId(String employeeId);

    List<Employee> findByDepartment(Department department);

    List<Employee> findByStatus(EmployeeStatus status);

    List<Employee> findByRole(Role role);

    List<Employee> findByManager(Employee manager);

    @Query("SELECT e FROM Employee e WHERE " +
           "LOWER(e.name) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
           "LOWER(e.email) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
           "LOWER(e.jobTitle) LIKE LOWER(CONCAT('%', :query, '%'))")
    List<Employee> searchEmployees(@Param("query") String query);

    @Query("SELECT COUNT(e) FROM Employee e WHERE e.department.id = :deptId")
    Long countByDepartmentId(@Param("deptId") Long deptId);

    @Query("SELECT e.department.name, COUNT(e) FROM Employee e GROUP BY e.department.name")
    List<Object[]> countByDepartment();
}
