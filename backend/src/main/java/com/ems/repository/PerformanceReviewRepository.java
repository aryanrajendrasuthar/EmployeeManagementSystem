package com.ems.repository;

import com.ems.entity.Employee;
import com.ems.entity.PerformanceReview;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PerformanceReviewRepository extends JpaRepository<PerformanceReview, Long> {

    List<PerformanceReview> findByEmployee(Employee employee);

    List<PerformanceReview> findByReviewer(Employee reviewer);

    List<PerformanceReview> findByQuarter(String quarter);

    List<PerformanceReview> findByEmployeeAndQuarter(Employee employee, String quarter);

    @Query("SELECT AVG(r.rating) FROM PerformanceReview r WHERE r.employee.id = :empId")
    Double avgRatingByEmployee(@Param("empId") Long employeeId);
}
