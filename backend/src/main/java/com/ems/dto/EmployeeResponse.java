package com.ems.dto;

import com.ems.enums.EmployeeStatus;
import com.ems.enums.Role;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class EmployeeResponse {
    private Long id;
    private String employeeId;
    private String name;
    private String email;
    private Role role;
    private String department;
    private Long departmentId;
    private String jobTitle;
    private BigDecimal salary;
    private String managerName;
    private Long managerId;
    private LocalDate joiningDate;
    private EmployeeStatus status;
}
