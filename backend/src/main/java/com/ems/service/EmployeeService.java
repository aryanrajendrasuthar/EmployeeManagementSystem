package com.ems.service;

import com.ems.dto.EmployeeRequest;
import com.ems.dto.EmployeeResponse;
import com.ems.entity.Department;
import com.ems.entity.Employee;
import com.ems.enums.EmployeeStatus;
import com.ems.exception.BadRequestException;
import com.ems.exception.ResourceNotFoundException;
import com.ems.repository.DepartmentRepository;
import com.ems.repository.EmployeeRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class EmployeeService {

    private final EmployeeRepository employeeRepository;
    private final DepartmentRepository departmentRepository;
    private final PasswordEncoder passwordEncoder;

    @Cacheable(value = "employees", key = "'all'")
    public List<EmployeeResponse> getAllEmployees() {
        return employeeRepository.findAll()
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    public EmployeeResponse getEmployeeById(Long id) {
        return mapToResponse(findById(id));
    }

    public EmployeeResponse getEmployeeByEmployeeId(String employeeId) {
        Employee employee = employeeRepository.findByEmployeeId(employeeId)
                .orElseThrow(() -> new ResourceNotFoundException("Employee not found: " + employeeId));
        return mapToResponse(employee);
    }

    public List<EmployeeResponse> searchEmployees(String query) {
        return employeeRepository.searchEmployees(query)
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    public List<EmployeeResponse> getEmployeesByDepartment(Long departmentId) {
        Department dept = departmentRepository.findById(departmentId)
                .orElseThrow(() -> new ResourceNotFoundException("Department not found"));
        return employeeRepository.findByDepartment(dept)
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Transactional
    @CacheEvict(value = "employees", key = "'all'")
    public EmployeeResponse createEmployee(EmployeeRequest request) {
        if (employeeRepository.existsByEmail(request.getEmail())) {
            throw new BadRequestException("Email already exists: " + request.getEmail());
        }

        Department department = departmentRepository.findById(request.getDepartmentId())
                .orElseThrow(() -> new ResourceNotFoundException("Department not found"));

        Employee manager = null;
        if (request.getManagerId() != null) {
            manager = findById(request.getManagerId());
        }

        String employeeId = generateEmployeeId();

        Employee employee = Employee.builder()
                .employeeId(employeeId)
                .name(request.getName())
                .email(request.getEmail())
                .passwordHash(passwordEncoder.encode(
                    request.getPassword() != null ? request.getPassword() : "Employee@123"))
                .role(request.getRole())
                .department(department)
                .jobTitle(request.getJobTitle())
                .salary(request.getSalary())
                .manager(manager)
                .joiningDate(request.getJoiningDate())
                .status(request.getStatus() != null ? request.getStatus() : EmployeeStatus.ACTIVE)
                .build();

        return mapToResponse(employeeRepository.save(employee));
    }

    @Transactional
    @CacheEvict(value = "employees", key = "'all'")
    public EmployeeResponse updateEmployee(Long id, EmployeeRequest request) {
        Employee employee = findById(id);

        if (!employee.getEmail().equals(request.getEmail())
                && employeeRepository.existsByEmail(request.getEmail())) {
            throw new BadRequestException("Email already in use: " + request.getEmail());
        }

        Department department = departmentRepository.findById(request.getDepartmentId())
                .orElseThrow(() -> new ResourceNotFoundException("Department not found"));

        Employee manager = null;
        if (request.getManagerId() != null) {
            manager = findById(request.getManagerId());
        }

        employee.setName(request.getName());
        employee.setEmail(request.getEmail());
        employee.setRole(request.getRole());
        employee.setDepartment(department);
        employee.setJobTitle(request.getJobTitle());
        employee.setSalary(request.getSalary());
        employee.setManager(manager);
        employee.setJoiningDate(request.getJoiningDate());
        if (request.getStatus() != null) employee.setStatus(request.getStatus());
        if (request.getPassword() != null && !request.getPassword().isBlank()) {
            employee.setPasswordHash(passwordEncoder.encode(request.getPassword()));
        }

        return mapToResponse(employeeRepository.save(employee));
    }

    @Transactional
    @CacheEvict(value = "employees", key = "'all'")
    public void deleteEmployee(Long id) {
        if (!employeeRepository.existsById(id)) {
            throw new ResourceNotFoundException("Employee not found: " + id);
        }
        employeeRepository.deleteById(id);
    }

    public List<EmployeeResponse> getReportees(Long managerId) {
        Employee manager = findById(managerId);
        return employeeRepository.findByManager(manager)
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    public List<EmployeeResponse> getEmployeesByStatus(EmployeeStatus status) {
        return employeeRepository.findByStatus(status)
                .stream().map(this::mapToResponse).collect(Collectors.toList());
    }

    public EmployeeResponse getEmployeeByEmail(String email) {
        return mapToResponse(employeeRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("Employee not found")));
    }

    public List<Object[]> getDepartmentHeadcount() {
        return employeeRepository.countByDepartment();
    }

    private Employee findById(Long id) {
        return employeeRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Employee not found: " + id));
    }

    private String generateEmployeeId() {
        long count = employeeRepository.count() + 1;
        return String.format("EMP%04d", count);
    }

    public EmployeeResponse mapToResponse(Employee e) {
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
