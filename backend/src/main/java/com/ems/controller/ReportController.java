package com.ems.controller;

import com.ems.service.ReportService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/reports")
@RequiredArgsConstructor
public class ReportController {

    private final ReportService reportService;

    @GetMapping("/employees/export")
    @PreAuthorize("hasAnyRole('HR_ADMIN', 'MANAGER')")
    public ResponseEntity<byte[]> exportEmployees() {
        String csv = reportService.generateEmployeeCsv();
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=employees.csv")
                .contentType(MediaType.parseMediaType("text/csv"))
                .body(csv.getBytes());
    }

    @GetMapping("/payroll/export")
    @PreAuthorize("hasRole('HR_ADMIN')")
    public ResponseEntity<byte[]> exportPayroll(
            @RequestParam(required = false) String month) {
        String csv = reportService.generatePayrollCsv(month);
        String filename = month != null ? "payroll-" + month + ".csv" : "payroll-all.csv";
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=" + filename)
                .contentType(MediaType.parseMediaType("text/csv"))
                .body(csv.getBytes());
    }

    @GetMapping("/department-stats")
    public ResponseEntity<List<Object[]>> getDepartmentStats() {
        return ResponseEntity.ok(reportService.getDepartmentHeadcount());
    }
}
