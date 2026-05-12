package com.ems.controller;

import com.ems.dto.PerformanceReviewDto;
import com.ems.service.PerformanceReviewService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/reviews")
@RequiredArgsConstructor
public class PerformanceReviewController {

    private final PerformanceReviewService reviewService;

    @GetMapping
    public ResponseEntity<List<PerformanceReviewDto>> getAll(
            @RequestParam(required = false) String quarter) {
        if (quarter != null) {
            return ResponseEntity.ok(reviewService.getReviewsByQuarter(quarter));
        }
        return ResponseEntity.ok(reviewService.getAllReviews());
    }

    @GetMapping("/employee/{employeeId}")
    public ResponseEntity<List<PerformanceReviewDto>> getByEmployee(@PathVariable Long employeeId) {
        return ResponseEntity.ok(reviewService.getReviewsByEmployee(employeeId));
    }

    @GetMapping("/employee/{employeeId}/avg-rating")
    public ResponseEntity<Double> getAvgRating(@PathVariable Long employeeId) {
        return ResponseEntity.ok(reviewService.getAverageRating(employeeId));
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('HR_ADMIN', 'MANAGER')")
    public ResponseEntity<PerformanceReviewDto> create(@RequestBody PerformanceReviewDto dto) {
        return ResponseEntity.status(HttpStatus.CREATED).body(reviewService.createReview(dto));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('HR_ADMIN', 'MANAGER')")
    public ResponseEntity<PerformanceReviewDto> update(
            @PathVariable Long id,
            @RequestBody PerformanceReviewDto dto) {
        return ResponseEntity.ok(reviewService.updateReview(id, dto));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('HR_ADMIN', 'MANAGER')")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        reviewService.deleteReview(id);
        return ResponseEntity.noContent().build();
    }
}
