package com.ems.controller;

import com.ems.dto.LeaveRequestDto;
import com.ems.enums.LeaveStatus;
import com.ems.service.EmployeeService;
import com.ems.service.LeaveService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/leaves")
@RequiredArgsConstructor
public class LeaveController {

    private final LeaveService leaveService;
    private final EmployeeService employeeService;

    @GetMapping
    @PreAuthorize("hasAnyRole('HR_ADMIN', 'MANAGER')")
    public ResponseEntity<List<LeaveRequestDto>> getAll(
            @RequestParam(required = false) String status) {
        if (status != null) {
            return ResponseEntity.ok(leaveService.getLeavesByStatus(LeaveStatus.valueOf(status)));
        }
        return ResponseEntity.ok(leaveService.getAllLeaves());
    }

    @GetMapping("/my")
    public ResponseEntity<List<LeaveRequestDto>> getMyLeaves(
            @AuthenticationPrincipal UserDetails userDetails) {
        Long employeeId = employeeService.getEmployeeByEmail(userDetails.getUsername()).getId();
        return ResponseEntity.ok(leaveService.getLeavesByEmployee(employeeId));
    }

    @GetMapping("/pending")
    @PreAuthorize("hasAnyRole('HR_ADMIN', 'MANAGER')")
    public ResponseEntity<List<LeaveRequestDto>> getPending(
            @AuthenticationPrincipal UserDetails userDetails) {
        var emp = employeeService.getEmployeeByEmail(userDetails.getUsername());
        if (emp.getRole().name().equals("HR_ADMIN")) {
            return ResponseEntity.ok(leaveService.getLeavesByStatus(LeaveStatus.PENDING));
        }
        return ResponseEntity.ok(leaveService.getPendingLeavesForManager(emp.getId()));
    }

    @GetMapping("/employee/{employeeId}")
    public ResponseEntity<List<LeaveRequestDto>> getByEmployee(@PathVariable Long employeeId) {
        return ResponseEntity.ok(leaveService.getLeavesByEmployee(employeeId));
    }

    @GetMapping("/pending/manager/{managerId}")
    @PreAuthorize("hasAnyRole('HR_ADMIN', 'MANAGER')")
    public ResponseEntity<List<LeaveRequestDto>> getPendingForManager(@PathVariable Long managerId) {
        return ResponseEntity.ok(leaveService.getPendingLeavesForManager(managerId));
    }

    @PostMapping("/apply")
    public ResponseEntity<LeaveRequestDto> apply(
            @RequestBody LeaveRequestDto dto,
            @AuthenticationPrincipal UserDetails userDetails) {
        Long employeeId = dto.getEmployeeId() != null
                ? dto.getEmployeeId()
                : employeeService.getEmployeeByEmail(userDetails.getUsername()).getId();
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(leaveService.applyLeave(employeeId, dto));
    }

    @PostMapping("/employee/{employeeId}")
    public ResponseEntity<LeaveRequestDto> applyForEmployee(
            @PathVariable Long employeeId,
            @RequestBody LeaveRequestDto dto) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(leaveService.applyLeave(employeeId, dto));
    }

    @PutMapping("/{leaveId}/approve")
    @PreAuthorize("hasAnyRole('HR_ADMIN', 'MANAGER')")
    public ResponseEntity<LeaveRequestDto> approve(
            @PathVariable Long leaveId,
            @RequestBody(required = false) Map<String, String> body,
            @AuthenticationPrincipal UserDetails userDetails) {
        Long approverId = employeeService.getEmployeeByEmail(userDetails.getUsername()).getId();
        String remarks = body != null ? body.get("remarks") : null;
        return ResponseEntity.ok(leaveService.approveLeave(leaveId, approverId, remarks));
    }

    @PutMapping("/{leaveId}/reject")
    @PreAuthorize("hasAnyRole('HR_ADMIN', 'MANAGER')")
    public ResponseEntity<LeaveRequestDto> reject(
            @PathVariable Long leaveId,
            @RequestBody(required = false) Map<String, String> body,
            @AuthenticationPrincipal UserDetails userDetails) {
        Long rejectorId = employeeService.getEmployeeByEmail(userDetails.getUsername()).getId();
        String remarks = body != null ? body.get("remarks") : null;
        return ResponseEntity.ok(leaveService.rejectLeave(leaveId, rejectorId, remarks));
    }

    @PutMapping("/{leaveId}/cancel")
    public ResponseEntity<LeaveRequestDto> cancel(
            @PathVariable Long leaveId,
            @AuthenticationPrincipal UserDetails userDetails) {
        Long employeeId = employeeService.getEmployeeByEmail(userDetails.getUsername()).getId();
        return ResponseEntity.ok(leaveService.cancelLeave(leaveId, employeeId));
    }
}
