package com.ems.service;

import com.ems.dto.PayrollDto;
import com.ems.entity.Employee;
import com.ems.entity.PayrollRecord;
import com.ems.exception.BadRequestException;
import com.ems.exception.ResourceNotFoundException;
import com.ems.repository.EmployeeRepository;
import com.ems.repository.PayrollRecordRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class PayrollService {

    private final PayrollRecordRepository payrollRepository;
    private final EmployeeRepository employeeRepository;

    public List<PayrollDto> getAllPayroll() {
        return payrollRepository.findAll().stream().map(this::mapToDto).collect(Collectors.toList());
    }

    public List<PayrollDto> getPayrollByEmployee(Long employeeId) {
        Employee emp = findEmployee(employeeId);
        return payrollRepository.findByEmployeeIdOrderByMonthDesc(emp.getId())
                .stream().map(this::mapToDto).collect(Collectors.toList());
    }

    public List<PayrollDto> getPayrollByMonth(String month) {
        return payrollRepository.findByMonth(month).stream().map(this::mapToDto).collect(Collectors.toList());
    }

    @Transactional
    public PayrollDto createPayroll(PayrollDto dto) {
        Employee emp = findEmployee(dto.getEmployeeId());

        if (payrollRepository.findByEmployeeAndMonth(emp, dto.getMonth()).isPresent()) {
            throw new BadRequestException("Payroll for " + dto.getMonth() + " already exists for this employee");
        }

        BigDecimal bonuses = dto.getBonuses() != null ? dto.getBonuses() : BigDecimal.ZERO;
        BigDecimal deductions = dto.getDeductions() != null ? dto.getDeductions() : BigDecimal.ZERO;
        BigDecimal netSalary = dto.getBaseSalary().add(bonuses).subtract(deductions);

        PayrollRecord record = PayrollRecord.builder()
                .employee(emp)
                .month(dto.getMonth())
                .baseSalary(dto.getBaseSalary())
                .bonuses(bonuses)
                .deductions(deductions)
                .netSalary(netSalary)
                .build();

        return mapToDto(payrollRepository.save(record));
    }

    @Transactional
    public PayrollDto updatePayroll(Long id, PayrollDto dto) {
        PayrollRecord record = payrollRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Payroll record not found: " + id));

        BigDecimal bonuses = dto.getBonuses() != null ? dto.getBonuses() : BigDecimal.ZERO;
        BigDecimal deductions = dto.getDeductions() != null ? dto.getDeductions() : BigDecimal.ZERO;

        record.setBaseSalary(dto.getBaseSalary());
        record.setBonuses(bonuses);
        record.setDeductions(deductions);
        record.setNetSalary(dto.getBaseSalary().add(bonuses).subtract(deductions));

        return mapToDto(payrollRepository.save(record));
    }

    @Transactional
    public void deletePayroll(Long id) {
        if (!payrollRepository.existsById(id)) {
            throw new ResourceNotFoundException("Payroll record not found: " + id);
        }
        payrollRepository.deleteById(id);
    }

    private Employee findEmployee(Long id) {
        return employeeRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Employee not found: " + id));
    }

    private PayrollDto mapToDto(PayrollRecord p) {
        return PayrollDto.builder()
                .id(p.getId())
                .employeeId(p.getEmployee().getId())
                .employeeName(p.getEmployee().getName())
                .employeeIdCode(p.getEmployee().getEmployeeId())
                .department(p.getEmployee().getDepartment() != null
                        ? p.getEmployee().getDepartment().getName() : null)
                .month(p.getMonth())
                .baseSalary(p.getBaseSalary())
                .bonuses(p.getBonuses())
                .deductions(p.getDeductions())
                .netSalary(p.getNetSalary())
                .build();
    }
}
