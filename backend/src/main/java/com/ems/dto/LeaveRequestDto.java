package com.ems.dto;

import com.ems.enums.LeaveStatus;
import com.ems.enums.LeaveType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class LeaveRequestDto {
    private Long id;
    private Long employeeId;
    private String employeeName;
    private String employeeDepartment;
    private LeaveType type;
    private LocalDate startDate;
    private LocalDate endDate;
    private String reason;
    private LeaveStatus status;
    private Long approvedBy;
    private String approvedByName;
    private String managerRemarks;
    private LocalDate createdAt;
    private int daysCount;
}
