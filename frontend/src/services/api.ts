import axios from 'axios';
import type {
  AuthRequest, AuthResponse, Employee, EmployeeRequest,
  Department, LeaveRequest, LeaveRequestDto,
  PayrollRecord, PayrollDto, PerformanceReview, PerformanceReviewDto,
} from '../types';

const api = axios.create({
  baseURL: '/api',
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

interface BackendLoginResponse {
  token: string;
  tokenType: string;
  employee: Omit<AuthResponse, 'token'>;
}

export const authService = {
  // Flatten nested backend response { token, employee: {...} } into a single flat object
  login: (data: AuthRequest): Promise<AuthResponse> =>
    api.post<BackendLoginResponse>('/auth/login', data).then((r) => ({
      token: r.data.token,
      ...r.data.employee,
    })),
};

export const employeeService = {
  getAll: (params?: { search?: string; departmentId?: number; status?: string }) =>
    api.get<Employee[]>('/employees', { params }).then((r) => r.data),
  getById: (id: number) =>
    api.get<Employee>(`/employees/${id}`).then((r) => r.data),
  getMe: () =>
    api.get<Employee>('/employees/me').then((r) => r.data),
  create: (data: EmployeeRequest) =>
    api.post<Employee>('/employees', data).then((r) => r.data),
  update: (id: number, data: EmployeeRequest) =>
    api.put<Employee>(`/employees/${id}`, data).then((r) => r.data),
  delete: (id: number) =>
    api.delete(`/employees/${id}`),
  getTeam: (managerId: number) =>
    api.get<Employee[]>(`/employees/${managerId}/reportees`).then((r) => r.data),
};

export const departmentService = {
  getAll: () =>
    api.get<Department[]>('/departments').then((r) => r.data),
  getById: (id: number) =>
    api.get<Department>(`/departments/${id}`).then((r) => r.data),
  create: (data: { name: string; headId?: number }) =>
    api.post<Department>('/departments', data).then((r) => r.data),
  update: (id: number, data: { name: string; headId?: number }) =>
    api.put<Department>(`/departments/${id}`, data).then((r) => r.data),
  delete: (id: number) =>
    api.delete(`/departments/${id}`),
};

export const leaveService = {
  getAll: (params?: { status?: string }) =>
    api.get<LeaveRequest[]>('/leaves', { params }).then((r) => r.data),
  getMyLeaves: () =>
    api.get<LeaveRequest[]>('/leaves/my').then((r) => r.data),
  getPending: () =>
    api.get<LeaveRequest[]>('/leaves/pending').then((r) => r.data),
  getByEmployee: (employeeId: number) =>
    api.get<LeaveRequest[]>(`/leaves/employee/${employeeId}`).then((r) => r.data),
  apply: (data: LeaveRequestDto) =>
    api.post<LeaveRequest>('/leaves/apply', data).then((r) => r.data),
  approve: (id: number, remarks?: string) =>
    api.put(`/leaves/${id}/approve`, remarks ? { remarks } : {}),
  reject: (id: number, remarks?: string) =>
    api.put(`/leaves/${id}/reject`, remarks ? { remarks } : {}),
  cancel: (id: number) =>
    api.put(`/leaves/${id}/cancel`),
};

export const payrollService = {
  getAll: (params?: { month?: string }) =>
    api.get<PayrollRecord[]>('/payroll', { params }).then((r) => r.data),
  getMyPayroll: () =>
    api.get<PayrollRecord[]>('/payroll/my').then((r) => r.data),
  getByEmployee: (employeeId: number) =>
    api.get<PayrollRecord[]>(`/payroll/employee/${employeeId}`).then((r) => r.data),
  create: (data: PayrollDto) =>
    api.post<PayrollRecord>('/payroll', data).then((r) => r.data),
  update: (id: number, data: Partial<PayrollDto>) =>
    api.put<PayrollRecord>(`/payroll/${id}`, data).then((r) => r.data),
};

export const reviewService = {
  getAll: (params?: { quarter?: string }) =>
    api.get<PerformanceReview[]>('/reviews', { params }).then((r) => r.data),
  getByEmployee: (employeeId: number) =>
    api.get<PerformanceReview[]>(`/reviews/employee/${employeeId}`).then((r) => r.data),
  getAvgRating: (employeeId: number) =>
    api.get<number>(`/reviews/employee/${employeeId}/avg-rating`).then((r) => r.data),
  create: (data: PerformanceReviewDto) =>
    api.post<PerformanceReview>('/reviews', data).then((r) => r.data),
  update: (id: number, data: PerformanceReviewDto) =>
    api.put<PerformanceReview>(`/reviews/${id}`, data).then((r) => r.data),
  delete: (id: number) =>
    api.delete(`/reviews/${id}`),
};

export const reportService = {
  exportEmployeesCsv: () =>
    api.get('/reports/employees/export', { responseType: 'blob' }).then((r) => r.data),
  exportPayrollCsv: (month?: string) =>
    api.get('/reports/payroll/export', { params: { month }, responseType: 'blob' }).then((r) => r.data),
  getDepartmentStats: () =>
    api.get<[string, number][]>('/reports/department-stats').then((r) => r.data),
};

export default api;
