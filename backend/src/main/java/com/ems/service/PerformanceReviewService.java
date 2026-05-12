package com.ems.service;

import com.ems.dto.PerformanceReviewDto;
import com.ems.entity.Employee;
import com.ems.entity.PerformanceReview;
import com.ems.exception.BadRequestException;
import com.ems.exception.ResourceNotFoundException;
import com.ems.repository.EmployeeRepository;
import com.ems.repository.PerformanceReviewRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class PerformanceReviewService {

    private final PerformanceReviewRepository reviewRepository;
    private final EmployeeRepository employeeRepository;

    public List<PerformanceReviewDto> getAllReviews() {
        return reviewRepository.findAll().stream().map(this::mapToDto).collect(Collectors.toList());
    }

    public List<PerformanceReviewDto> getReviewsByEmployee(Long employeeId) {
        Employee emp = findEmployee(employeeId);
        return reviewRepository.findByEmployee(emp).stream().map(this::mapToDto).collect(Collectors.toList());
    }

    public List<PerformanceReviewDto> getReviewsByQuarter(String quarter) {
        return reviewRepository.findByQuarter(quarter).stream().map(this::mapToDto).collect(Collectors.toList());
    }

    @Transactional
    public PerformanceReviewDto createReview(PerformanceReviewDto dto) {
        Employee employee = findEmployee(dto.getEmployeeId());
        Employee reviewer = findEmployee(dto.getReviewerId());

        if (dto.getRating() < 1 || dto.getRating() > 5) {
            throw new BadRequestException("Rating must be between 1 and 5");
        }

        PerformanceReview review = PerformanceReview.builder()
                .employee(employee)
                .reviewer(reviewer)
                .quarter(dto.getQuarter())
                .rating(dto.getRating())
                .feedback(dto.getFeedback())
                .build();

        return mapToDto(reviewRepository.save(review));
    }

    @Transactional
    public PerformanceReviewDto updateReview(Long id, PerformanceReviewDto dto) {
        PerformanceReview review = reviewRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Review not found: " + id));

        if (dto.getRating() < 1 || dto.getRating() > 5) {
            throw new BadRequestException("Rating must be between 1 and 5");
        }

        review.setRating(dto.getRating());
        review.setFeedback(dto.getFeedback());
        review.setQuarter(dto.getQuarter());

        return mapToDto(reviewRepository.save(review));
    }

    @Transactional
    public void deleteReview(Long id) {
        if (!reviewRepository.existsById(id)) {
            throw new ResourceNotFoundException("Review not found: " + id);
        }
        reviewRepository.deleteById(id);
    }

    public Double getAverageRating(Long employeeId) {
        return reviewRepository.avgRatingByEmployee(employeeId);
    }

    private Employee findEmployee(Long id) {
        return employeeRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Employee not found: " + id));
    }

    private PerformanceReviewDto mapToDto(PerformanceReview r) {
        return PerformanceReviewDto.builder()
                .id(r.getId())
                .employeeId(r.getEmployee().getId())
                .employeeName(r.getEmployee().getName())
                .reviewerId(r.getReviewer().getId())
                .reviewerName(r.getReviewer().getName())
                .quarter(r.getQuarter())
                .rating(r.getRating())
                .feedback(r.getFeedback())
                .reviewDate(r.getReviewDate())
                .build();
    }
}
