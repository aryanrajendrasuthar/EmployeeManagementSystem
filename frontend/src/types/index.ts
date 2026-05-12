export type Role = 'HR_ADMIN' | 'MANAGER' | 'EMPLOYEE';
export type EmployeeStatus = 'ACTIVE' | 'INACTIVE' | 'ON_LEAVE';
export type LeaveType = 'ANNUAL' | 'SICK' | 'PERSONAL' | 'UNPAID' | 'MATERNITY' | 'PATERNITY';
export type LeaveStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'CANCELLED';

export interface AuthRequest {
  email: string;
  password: string;
}

// Flat user object stored in auth context after login
export interface AuthResponse {
  token: string;
  id: number;
  employeeId: string;
  name: string;
  email: string;
  role: Role;
  department: string;
  departmentId: number;
  jobTitle: string;
  salary: number;
  managerName?: string;
  managerId?: number;
  joiningDate: string;
  status: EmployeeStatus;
}

export interface Department {
  id: number;
  name: string;
  headId: number | null;
  headName?: string;
  employeeCount?: number;
}

// Matches backend EmployeeResponse: department is a string (name), departmentId is Long
export interface Employee {
  id: number;
  employeeId: string;
  name: string;
  email: string;
  role: Role;
  department: string;       // department name
  departmentId: number;     // department ID
  jobTitle: string;
  salary: number;
  managerId?: number;
  managerName?: string;
  joiningDate: string;
  status: EmployeeStatus;
}

export interface EmployeeRequest {
  name: string;
  email: string;
  password?: string;
  role: Role;
  departmentId: number;
  jobTitle: string;
  salary: number;
  managerId?: number;
  joiningDate: string;
  status?: EmployeeStatus;
}

export interface LeaveRequest {
  id: number;
  employeeId: number;
  employeeName: string;
  employeeDepartment?: string;
  type: LeaveType;
  startDate: string;
  endDate: string;
  reason: string;
  status: LeaveStatus;
  approvedBy?: number;
  approvedByName?: string;
  managerRemarks?: string;
  createdAt: string;
  daysCount: number;
}

export interface LeaveRequestDto {
  employeeId?: number;
  type: LeaveType;
  startDate: string;
  endDate: string;
  reason: string;
}

export interface PayrollRecord {
  id: number;
  employeeId: number;
  employeeName: string;
  employeeIdCode?: string;
  department?: string;
  month: string;
  baseSalary: number;
  bonuses: number;
  deductions: number;
  netSalary: number;
}

export interface PayrollDto {
  employeeId: number;
  month: string;
  baseSalary: number;
  bonuses?: number;
  deductions?: number;
}

export interface PerformanceReview {
  id: number;
  employeeId: number;
  employeeName: string;
  reviewerId: number;
  reviewerName: string;
  quarter: string;
  rating: number;
  feedback: string;
  reviewDate: string;
}

export interface PerformanceReviewDto {
  employeeId: number;
  reviewerId: number;
  quarter: string;
  rating: number;
  feedback: string;
}

export interface DepartmentStat {
  department: string;
  count: number;
}
