import { useEffect, useState } from 'react';
import { reviewService } from '../../services/api';
import type { Employee } from '../../types';

interface Props {
  employee: Employee;
  onClose: () => void;
}

const statusColors: Record<string, string> = {
  ACTIVE: 'bg-green-100 text-green-800',
  INACTIVE: 'bg-red-100 text-red-800',
  ON_LEAVE: 'bg-yellow-100 text-yellow-800',
};

export default function EmployeeProfile({ employee, onClose }: Props) {
  const [avgRating, setAvgRating] = useState<number | null>(null);

  useEffect(() => {
    reviewService.getAvgRating(employee.id).then(setAvgRating).catch(() => setAvgRating(null));
  }, [employee.id]);

  const field = (label: string, value: React.ReactNode) => (
    <div>
      <dt className="text-sm text-gray-500">{label}</dt>
      <dd className="font-medium text-gray-900 mt-0.5">{value}</dd>
    </div>
  );

  return (
    <div>
      <div className="flex items-center gap-4 mb-6">
        <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center text-2xl font-bold text-blue-600">
          {employee.name.charAt(0).toUpperCase()}
        </div>
        <div>
          <h2 className="text-xl font-bold text-gray-900">{employee.name}</h2>
          <p className="text-gray-500">{employee.jobTitle}</p>
          <span className={`badge mt-1 ${statusColors[employee.status]}`}>{employee.status}</span>
        </div>
      </div>

      <dl className="grid grid-cols-2 gap-4">
        {field('Employee ID', employee.employeeId)}
        {field('Email', employee.email)}
        {field('Department', employee.department)}
        {field('Role', employee.role.replace('_', ' '))}
        {field('Manager', employee.managerName ?? '—')}
        {field('Joining Date', employee.joiningDate)}
        {field('Salary', `$${employee.salary?.toLocaleString()}`)}
        {field('Avg Rating', avgRating != null ? `${avgRating.toFixed(1)} / 5` : '—')}
      </dl>

      <div className="flex justify-end mt-6">
        <button onClick={onClose} className="btn-secondary">Close</button>
      </div>
    </div>
  );
}
