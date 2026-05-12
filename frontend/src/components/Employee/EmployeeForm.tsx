import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { employeeService, departmentService } from '../../services/api';
import type { Employee, EmployeeRequest, Department } from '../../types';

interface Props {
  employee?: Employee | null;
  onSuccess: () => void;
  onCancel: () => void;
}

export default function EmployeeForm({ employee, onSuccess, onCancel }: Props) {
  const [departments, setDepartments] = useState<Department[]>([]);
  const [managers, setManagers] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const { register, handleSubmit, formState: { errors } } = useForm<EmployeeRequest>({
    defaultValues: employee
      ? {
          name: employee.name,
          email: employee.email,
          role: employee.role,
          departmentId: employee.departmentId,
          jobTitle: employee.jobTitle,
          salary: employee.salary,
          managerId: employee.managerId,
          joiningDate: employee.joiningDate,
          status: employee.status,
        }
      : { role: 'EMPLOYEE', status: 'ACTIVE' },
  });

  useEffect(() => {
    Promise.all([departmentService.getAll(), employeeService.getAll()]).then(
      ([depts, emps]) => {
        setDepartments(depts);
        setManagers(emps.filter((e) => e.role === 'MANAGER' || e.role === 'HR_ADMIN'));
      }
    );
  }, []);

  const onSubmit = async (data: EmployeeRequest) => {
    setLoading(true);
    setError('');
    try {
      if (employee) {
        await employeeService.update(employee.id, data);
      } else {
        await employeeService.create(data);
      }
      onSuccess();
    } catch (err: any) {
      setError(err.response?.data?.message ?? 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Full Name *</label>
          <input {...register('name', { required: 'Required' })} className="input-field" />
          {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>}
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
          <input {...register('email', { required: 'Required' })} type="email" className="input-field" />
          {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>}
        </div>
        {!employee && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
            <input {...register('password')} type="password" className="input-field" placeholder="Default: Employee@123" />
          </div>
        )}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Job Title *</label>
          <input {...register('jobTitle', { required: 'Required' })} className="input-field" />
          {errors.jobTitle && <p className="text-red-500 text-xs mt-1">{errors.jobTitle.message}</p>}
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Role *</label>
          <select {...register('role', { required: 'Required' })} className="input-field">
            <option value="EMPLOYEE">Employee</option>
            <option value="MANAGER">Manager</option>
            <option value="HR_ADMIN">HR Admin</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Department *</label>
          <select {...register('departmentId', { required: 'Required', valueAsNumber: true })} className="input-field">
            <option value="">Select department</option>
            {departments.map((d) => (
              <option key={d.id} value={d.id}>{d.name}</option>
            ))}
          </select>
          {errors.departmentId && <p className="text-red-500 text-xs mt-1">{errors.departmentId.message}</p>}
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Salary *</label>
          <input {...register('salary', { required: 'Required', valueAsNumber: true })} type="number" className="input-field" />
          {errors.salary && <p className="text-red-500 text-xs mt-1">{errors.salary.message}</p>}
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Manager</label>
          <select {...register('managerId', { valueAsNumber: true })} className="input-field">
            <option value="">None</option>
            {managers.map((m) => (
              <option key={m.id} value={m.id}>{m.name}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Joining Date *</label>
          <input {...register('joiningDate', { required: 'Required' })} type="date" className="input-field" />
          {errors.joiningDate && <p className="text-red-500 text-xs mt-1">{errors.joiningDate.message}</p>}
        </div>
        {employee && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
            <select {...register('status')} className="input-field">
              <option value="ACTIVE">Active</option>
              <option value="INACTIVE">Inactive</option>
              <option value="ON_LEAVE">On Leave</option>
            </select>
          </div>
        )}
      </div>

      {error && <p className="text-red-500 text-sm">{error}</p>}

      <div className="flex justify-end gap-3 pt-4">
        <button type="button" onClick={onCancel} className="btn-secondary">Cancel</button>
        <button type="submit" disabled={loading} className="btn-primary">
          {loading ? 'Saving...' : employee ? 'Update Employee' : 'Create Employee'}
        </button>
      </div>
    </form>
  );
}
