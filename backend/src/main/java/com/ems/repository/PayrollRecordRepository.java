package com.ems.repository;

import com.ems.entity.Employee;
import com.ems.entity.PayrollRecord;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface PayrollRecordRepository extends JpaRepository<PayrollRecord, Long> {

    List<PayrollRecord> findByEmployee(Employee employee);

    List<PayrollRecord> findByMonth(String month);

    Optional<PayrollRecord> findByEmployeeAndMonth(Employee employee, String month);

    @Query("SELECT p FROM PayrollRecord p WHERE p.employee.id = :empId ORDER BY p.month DESC")
    List<PayrollRecord> findByEmployeeIdOrderByMonthDesc(@Param("empId") Long employeeId);

    @Query("SELECT SUM(p.netSalary) FROM PayrollRecord p WHERE p.month = :month")
    Double totalPayrollForMonth(@Param("month") String month);
}
