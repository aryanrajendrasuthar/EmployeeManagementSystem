package com.ems.service;

import com.ems.dto.AuthRequest;
import com.ems.dto.AuthResponse;
import com.ems.dto.EmployeeResponse;
import com.ems.entity.Employee;
import com.ems.exception.ResourceNotFoundException;
import com.ems.repository.EmployeeRepository;
import com.ems.security.JwtTokenProvider;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final AuthenticationManager authenticationManager;
    private final JwtTokenProvider tokenProvider;
    private final EmployeeRepository employeeRepository;

    public AuthResponse login(AuthRequest request) {
        Authentication auth = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword())
        );

        String token = tokenProvider.generateToken(auth);

        Employee employee = employeeRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new ResourceNotFoundException("Employee not found"));

        EmployeeResponse employeeResponse = mapToResponse(employee);

        return AuthResponse.builder()
                .token(token)
                .tokenType("Bearer")
                .employee(employeeResponse)
                .build();
    }

    public EmployeeResponse getCurrentUser(String email) {
        Employee employee = employeeRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("Employee not found"));
        return mapToResponse(employee);
    }

    private EmployeeResponse mapToResponse(Employee e) {
        return EmployeeResponse.builder()
                .id(e.getId())
                .employeeId(e.getEmployeeId())
                .name(e.getName())
                .email(e.getEmail())
                .role(e.getRole())
                .department(e.getDepartment() != null ? e.getDepartment().getName() : null)
                .departmentId(e.getDepartment() != null ? e.getDepartment().getId() : null)
                .jobTitle(e.getJobTitle())
                .salary(e.getSalary())
                .managerName(e.getManager() != null ? e.getManager().getName() : null)
                .managerId(e.getManager() != null ? e.getManager().getId() : null)
                .joiningDate(e.getJoiningDate())
                .status(e.getStatus())
                .build();
    }
}
