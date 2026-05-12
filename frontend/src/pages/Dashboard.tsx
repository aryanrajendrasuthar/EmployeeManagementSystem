import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { employeeService, leaveService, payrollService } from '../services/api';
import type { Employee, LeaveRequest, PayrollRecord } from '../types';

interface StatCard {
  title: string;
  value: string | number;
  icon: string;
  color: string;
}

export default function Dashboard() {
  const { user, hasRole } = useAuth();
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [pendingLeaves, setPendingLeaves] = useState<LeaveRequest[]>([]);
  const [myPayroll, setMyPayroll] = useState<PayrollRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const promises: Promise<any>[] = [];
        if (hasRole('HR_ADMIN', 'MANAGER')) {
          promises.push(employeeService.getAll());
          promises.push(leaveService.getPending());
        } else {
          promises.push(Promise.resolve([]));
          promises.push(Promise.resolve([]));
        }
        promises.push(payrollService.getMyPayroll());
        const [emps, leaves, payroll] = await Promise.all(promises);
        setEmployees(emps);
        setPendingLeaves(leaves);
        setMyPayroll(payroll);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const latestPayroll = myPayroll[0];

  const stats: StatCard[] = hasRole('HR_ADMIN', 'MANAGER')
    ? [
        { title: 'Total Employees', value: employees.length, icon: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z', color: 'bg-blue-500' },
        { title: 'Active Employees', value: employees.filter((e) => e.status === 'ACTIVE').length, icon: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z', color: 'bg-green-500' },
        { title: 'Pending Leaves', value: pendingLeaves.length, icon: 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z', color: 'bg-yellow-500' },
        { title: 'Departments', value: new Set(employees.map((e) => e.department?.name)).size, icon: 'M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-2 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4', color: 'bg-purple-500' },
      ]
    : [
        { title: 'My Net Salary', value: latestPayroll ? `$${latestPayroll.netSalary.toLocaleString()}` : '—', icon: 'M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z', color: 'bg-green-500' },
        { title: 'Latest Month', value: latestPayroll?.month ?? '—', icon: 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z', color: 'bg-blue-500' },
      ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Welcome back, {user?.name}</h1>
        <p className="text-gray-500 mt-1">Here's what's happening in your organization</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat) => (
          <div key={stat.title} className="card flex items-center gap-4">
            <div className={`${stat.color} p-3 rounded-lg`}>
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={stat.icon} />
              </svg>
            </div>
            <div>
              <p className="text-sm text-gray-500">{stat.title}</p>
              <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
            </div>
          </div>
        ))}
      </div>

      {hasRole('HR_ADMIN', 'MANAGER') && pendingLeaves.length > 0 && (
        <div className="card">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Pending Leave Requests</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="text-left py-3 px-4 text-gray-500 font-medium">Employee</th>
                  <th className="text-left py-3 px-4 text-gray-500 font-medium">Type</th>
                  <th className="text-left py-3 px-4 text-gray-500 font-medium">Dates</th>
                  <th className="text-left py-3 px-4 text-gray-500 font-medium">Days</th>
                </tr>
              </thead>
              <tbody>
                {pendingLeaves.slice(0, 5).map((leave) => (
                  <tr key={leave.id} className="border-b border-gray-50 hover:bg-gray-50">
                    <td className="py-3 px-4 font-medium">{leave.employeeName}</td>
                    <td className="py-3 px-4">
                      <span className="badge bg-blue-100 text-blue-800">{leave.type}</span>
                    </td>
                    <td className="py-3 px-4 text-gray-600">{leave.startDate} → {leave.endDate}</td>
                    <td className="py-3 px-4 text-gray-600">{leave.daysCount}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
