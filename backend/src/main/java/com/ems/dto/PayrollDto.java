package com.ems.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PayrollDto {
    private Long id;
    private Long employeeId;
    private String employeeName;
    private String employeeIdCode;
    private String department;
    private String month;
    private BigDecimal baseSalary;
    private BigDecimal bonuses;
    private BigDecimal deductions;
    private BigDecimal netSalary;
}
