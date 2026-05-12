package com.ems.dto;

import com.ems.enums.EmployeeStatus;
import com.ems.enums.Role;
import jakarta.validation.constraints.*;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;

@Data
public class EmployeeRequest {

    @NotBlank
    private String name;

    @NotBlank
    @Email
    private String email;

    private String password;

    @NotNull
    private Role role;

    @NotNull
    private Long departmentId;

    @NotBlank
    private String jobTitle;

    @NotNull
    @DecimalMin("0.0")
    private BigDecimal salary;

    private Long managerId;

    @NotNull
    private LocalDate joiningDate;

    private EmployeeStatus status;
}
