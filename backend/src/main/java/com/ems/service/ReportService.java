package com.ems.service;

import com.ems.entity.Employee;
import com.ems.entity.PayrollRecord;
import com.ems.repository.EmployeeRepository;
import com.ems.repository.LeaveRequestRepository;
import com.ems.repository.PayrollRecordRepository;
import com.opencsv.CSVWriter;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.io.StringWriter;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ReportService {

    private final EmployeeRepository employeeRepository;
    private final PayrollRecordRepository payrollRepository;
    private final LeaveRequestRepository leaveRepository;

    public String generateEmployeeCsv() {
        StringWriter sw = new StringWriter();
        try (CSVWriter writer = new CSVWriter(sw)) {
            String[] header = {"Employee ID", "Name", "Email", "Department",
                               "Job Title", "Role", "Salary", "Manager", "Joining Date", "Status"};
            writer.writeNext(header);

            List<Employee> employees = employeeRepository.findAll();
            for (Employee e : employees) {
                writer.writeNext(new String[]{
                        e.getEmployeeId(),
                        e.getName(),
                        e.getEmail(),
                        e.getDepartment() != null ? e.getDepartment().getName() : "",
                        e.getJobTitle(),
                        e.getRole().name(),
                        e.getSalary().toString(),
                        e.getManager() != null ? e.getManager().getName() : "",
                        e.getJoiningDate().toString(),
                        e.getStatus().name()
                });
            }
        } catch (Exception ex) {
            throw new RuntimeException("Failed to generate CSV", ex);
        }
        return sw.toString();
    }

    public String generatePayrollCsv(String month) {
        StringWriter sw = new StringWriter();
        try (CSVWriter writer = new CSVWriter(sw)) {
            String[] header = {"Employee ID", "Name", "Department", "Month",
                               "Base Salary", "Bonuses", "Deductions", "Net Salary"};
            writer.writeNext(header);

            List<PayrollRecord> records = month != null
                    ? payrollRepository.findByMonth(month)
                    : payrollRepository.findAll();

            for (PayrollRecord p : records) {
                writer.writeNext(new String[]{
                        p.getEmployee().getEmployeeId(),
                        p.getEmployee().getName(),
                        p.getEmployee().getDepartment() != null ? p.getEmployee().getDepartment().getName() : "",
                        p.getMonth(),
                        p.getBaseSalary().toString(),
                        p.getBonuses().toString(),
                        p.getDeductions().toString(),
                        p.getNetSalary().toString()
                });
            }
        } catch (Exception ex) {
            throw new RuntimeException("Failed to generate CSV", ex);
        }
        return sw.toString();
    }

    public List<Object[]> getDepartmentHeadcount() {
        return employeeRepository.countByDepartment();
    }
}
