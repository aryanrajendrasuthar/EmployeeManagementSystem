package com.ems.service;

import com.ems.dto.LeaveRequestDto;
import com.ems.entity.Employee;
import com.ems.entity.LeaveRequest;
import com.ems.enums.LeaveStatus;
import com.ems.exception.BadRequestException;
import com.ems.exception.ResourceNotFoundException;
import com.ems.repository.EmployeeRepository;
import com.ems.repository.LeaveRequestRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class LeaveService {

    private final LeaveRequestRepository leaveRepository;
    private final EmployeeRepository employeeRepository;

    public List<LeaveRequestDto> getAllLeaves() {
        return leaveRepository.findAll().stream().map(this::mapToDto).collect(Collectors.toList());
    }

    public List<LeaveRequestDto> getLeavesByEmployee(Long employeeId) {
        Employee emp = findEmployee(employeeId);
        return leaveRepository.findByEmployee(emp).stream().map(this::mapToDto).collect(Collectors.toList());
    }

    public List<LeaveRequestDto> getPendingLeavesForManager(Long managerId) {
        Employee manager = findEmployee(managerId);
        return leaveRepository.findByManagerAndStatus(manager, LeaveStatus.PENDING)
                .stream().map(this::mapToDto).collect(Collectors.toList());
    }

    public List<LeaveRequestDto> getLeavesByStatus(LeaveStatus status) {
        return leaveRepository.findByStatus(status).stream().map(this::mapToDto).collect(Collectors.toList());
    }

    @Transactional
    public LeaveRequestDto applyLeave(Long employeeId, LeaveRequestDto dto) {
        Employee emp = findEmployee(employeeId);

        if (dto.getEndDate().isBefore(dto.getStartDate())) {
            throw new BadRequestException("End date cannot be before start date");
        }

        LeaveRequest leave = LeaveRequest.builder()
                .employee(emp)
                .type(dto.getType())
                .startDate(dto.getStartDate())
                .endDate(dto.getEndDate())
                .reason(dto.getReason())
                .status(LeaveStatus.PENDING)
                .build();

        return mapToDto(leaveRepository.save(leave));
    }

    @Transactional
    public LeaveRequestDto approveLeave(Long leaveId, Long approverId, String remarks) {
        LeaveRequest leave = findLeave(leaveId);

        if (leave.getStatus() != LeaveStatus.PENDING) {
            throw new BadRequestException("Leave request is not in PENDING status");
        }

        leave.setStatus(LeaveStatus.APPROVED);
        leave.setApprovedBy(approverId);
        leave.setManagerRemarks(remarks);

        return mapToDto(leaveRepository.save(leave));
    }

    @Transactional
    public LeaveRequestDto rejectLeave(Long leaveId, Long rejectorId, String remarks) {
        LeaveRequest leave = findLeave(leaveId);

        if (leave.getStatus() != LeaveStatus.PENDING) {
            throw new BadRequestException("Leave request is not in PENDING status");
        }

        leave.setStatus(LeaveStatus.REJECTED);
        leave.setApprovedBy(rejectorId);
        leave.setManagerRemarks(remarks);

        return mapToDto(leaveRepository.save(leave));
    }

    @Transactional
    public LeaveRequestDto cancelLeave(Long leaveId, Long employeeId) {
        LeaveRequest leave = findLeave(leaveId);

        if (!leave.getEmployee().getId().equals(employeeId)) {
            throw new BadRequestException("You can only cancel your own leave requests");
        }

        leave.setStatus(LeaveStatus.CANCELLED);
        return mapToDto(leaveRepository.save(leave));
    }

    private Employee findEmployee(Long id) {
        return employeeRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Employee not found: " + id));
    }

    private LeaveRequest findLeave(Long id) {
        return leaveRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Leave request not found: " + id));
    }

    private LeaveRequestDto mapToDto(LeaveRequest l) {
        int days = (int) ChronoUnit.DAYS.between(l.getStartDate(), l.getEndDate()) + 1;
        String approvedByName = null;
        if (l.getApprovedBy() != null) {
            approvedByName = employeeRepository.findById(l.getApprovedBy())
                    .map(Employee::getName).orElse(null);
        }
        return LeaveRequestDto.builder()
                .id(l.getId())
                .employeeId(l.getEmployee().getId())
                .employeeName(l.getEmployee().getName())
                .employeeDepartment(l.getEmployee().getDepartment() != null
                        ? l.getEmployee().getDepartment().getName() : null)
                .type(l.getType())
                .startDate(l.getStartDate())
                .endDate(l.getEndDate())
                .reason(l.getReason())
                .status(l.getStatus())
                .approvedBy(l.getApprovedBy())
                .approvedByName(approvedByName)
                .managerRemarks(l.getManagerRemarks())
                .createdAt(l.getCreatedAt())
                .daysCount(days)
                .build();
    }
}
