package com.ems.controller;

import com.ems.dto.LeaveRequestDto;
import com.ems.enums.LeaveStatus;
import com.ems.service.LeaveService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/leaves")
@RequiredArgsConstructor
public class LeaveController {

    private final LeaveService leaveService;

    @GetMapping
    @PreAuthorize("hasAnyRole('HR_ADMIN', 'MANAGER')")
    public ResponseEntity<List<LeaveRequestDto>> getAll(
            @RequestParam(required = false) String status) {
        if (status != null) {
            return ResponseEntity.ok(leaveService.getLeavesByStatus(LeaveStatus.valueOf(status)));
        }
        return ResponseEntity.ok(leaveService.getAllLeaves());
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

    @PostMapping("/employee/{employeeId}")
    public ResponseEntity<LeaveRequestDto> apply(
            @PathVariable Long employeeId,
            @RequestBody LeaveRequestDto dto) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(leaveService.applyLeave(employeeId, dto));
    }

    @PutMapping("/{leaveId}/approve")
    @PreAuthorize("hasAnyRole('HR_ADMIN', 'MANAGER')")
    public ResponseEntity<LeaveRequestDto> approve(
            @PathVariable Long leaveId,
            @RequestBody Map<String, String> body) {
        Long approverId = Long.parseLong(body.get("approverId"));
        String remarks = body.get("remarks");
        return ResponseEntity.ok(leaveService.approveLeave(leaveId, approverId, remarks));
    }

    @PutMapping("/{leaveId}/reject")
    @PreAuthorize("hasAnyRole('HR_ADMIN', 'MANAGER')")
    public ResponseEntity<LeaveRequestDto> reject(
            @PathVariable Long leaveId,
            @RequestBody Map<String, String> body) {
        Long rejectorId = Long.parseLong(body.get("approverId"));
        String remarks = body.get("remarks");
        return ResponseEntity.ok(leaveService.rejectLeave(leaveId, rejectorId, remarks));
    }

    @PutMapping("/{leaveId}/cancel")
    public ResponseEntity<LeaveRequestDto> cancel(
            @PathVariable Long leaveId,
            @RequestBody Map<String, Long> body) {
        return ResponseEntity.ok(leaveService.cancelLeave(leaveId, body.get("employeeId")));
    }
}
