package com.ems.service;

import com.ems.dto.DepartmentDto;
import com.ems.entity.Department;
import com.ems.entity.Employee;
import com.ems.exception.BadRequestException;
import com.ems.exception.ResourceNotFoundException;
import com.ems.repository.DepartmentRepository;
import com.ems.repository.EmployeeRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class DepartmentService {

    private final DepartmentRepository departmentRepository;
    private final EmployeeRepository employeeRepository;

    public List<DepartmentDto> getAllDepartments() {
        return departmentRepository.findAll()
                .stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    public DepartmentDto getDepartmentById(Long id) {
        return mapToDto(findById(id));
    }

    @Transactional
    public DepartmentDto createDepartment(DepartmentDto dto) {
        if (departmentRepository.existsByName(dto.getName())) {
            throw new BadRequestException("Department already exists: " + dto.getName());
        }
        Department dept = Department.builder()
                .name(dto.getName())
                .headId(dto.getHeadId())
                .build();
        return mapToDto(departmentRepository.save(dept));
    }

    @Transactional
    public DepartmentDto updateDepartment(Long id, DepartmentDto dto) {
        Department dept = findById(id);
        dept.setName(dto.getName());
        dept.setHeadId(dto.getHeadId());
        return mapToDto(departmentRepository.save(dept));
    }

    @Transactional
    public void deleteDepartment(Long id) {
        if (!departmentRepository.existsById(id)) {
            throw new ResourceNotFoundException("Department not found: " + id);
        }
        departmentRepository.deleteById(id);
    }

    private Department findById(Long id) {
        return departmentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Department not found: " + id));
    }

    private DepartmentDto mapToDto(Department d) {
        String headName = null;
        if (d.getHeadId() != null) {
            headName = employeeRepository.findById(d.getHeadId())
                    .map(Employee::getName).orElse(null);
        }
        Long count = employeeRepository.countByDepartmentId(d.getId());
        return DepartmentDto.builder()
                .id(d.getId())
                .name(d.getName())
                .headId(d.getHeadId())
                .headName(headName)
                .employeeCount(count)
                .build();
    }
}
