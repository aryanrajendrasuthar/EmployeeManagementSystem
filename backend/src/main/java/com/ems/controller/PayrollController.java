package com.ems.controller;

import com.ems.dto.PayrollDto;
import com.ems.service.EmployeeService;
import com.ems.service.PayrollService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/payroll")
@RequiredArgsConstructor
public class PayrollController {

    private final PayrollService payrollService;
    private final EmployeeService employeeService;

    @GetMapping("/my")
    public ResponseEntity<List<PayrollDto>> getMyPayroll(
            @AuthenticationPrincipal UserDetails userDetails) {
        Long employeeId = employeeService.getEmployeeByEmail(userDetails.getUsername()).getId();
        return ResponseEntity.ok(payrollService.getPayrollByEmployee(employeeId));
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('HR_ADMIN', 'MANAGER')")
    public ResponseEntity<List<PayrollDto>> getAll(
            @RequestParam(required = false) String month) {
        if (month != null) {
            return ResponseEntity.ok(payrollService.getPayrollByMonth(month));
        }
        return ResponseEntity.ok(payrollService.getAllPayroll());
    }

    @GetMapping("/employee/{employeeId}")
    public ResponseEntity<List<PayrollDto>> getByEmployee(@PathVariable Long employeeId) {
        return ResponseEntity.ok(payrollService.getPayrollByEmployee(employeeId));
    }

    @PostMapping
    @PreAuthorize("hasRole('HR_ADMIN')")
    public ResponseEntity<PayrollDto> create(@RequestBody PayrollDto dto) {
        return ResponseEntity.status(HttpStatus.CREATED).body(payrollService.createPayroll(dto));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('HR_ADMIN')")
    public ResponseEntity<PayrollDto> update(@PathVariable Long id, @RequestBody PayrollDto dto) {
        return ResponseEntity.ok(payrollService.updatePayroll(id, dto));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('HR_ADMIN')")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        payrollService.deletePayroll(id);
        return ResponseEntity.noContent().build();
    }
}
