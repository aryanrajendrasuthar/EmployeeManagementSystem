package com.ems.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PerformanceReviewDto {
    private Long id;
    private Long employeeId;
    private String employeeName;
    private Long reviewerId;
    private String reviewerName;
    private String quarter;
    private Integer rating;
    private String feedback;
    private LocalDate reviewDate;
}
