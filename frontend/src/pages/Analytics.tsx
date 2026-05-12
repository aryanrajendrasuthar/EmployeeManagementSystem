import { useEffect, useState } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend,
} from 'recharts';
import { reportService, employeeService, leaveService, payrollService } from '../services/api';
import type { Employee, LeaveRequest } from '../types';

const COLORS = ['#3b82f6', '#8b5cf6', '#10b981', '#f59e0b', '#ef4444', '#06b6d4'];

export default function Analytics() {
  const [deptStats, setDeptStats] = useState<{ name: string; count: number }[]>([]);
  const [leaveStats, setLeaveStats] = useState<{ type: string; count: number }[]>([]);
  const [salaryDist, setSalaryDist] = useState<{ range: string; count: number }[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      reportService.getDepartmentStats(),
      employeeService.getAll(),
      leaveService.getAll(),
      payrollService.getAll(),
    ])
      .then(([stats, employees, leaves, payroll]) => {
        setDeptStats(
          (stats as [string, number][]).map(([dept, count]) => ({ name: dept, count }))
        );

        const leaveCounts = leaves.reduce((acc: Record<string, number>, l: LeaveRequest) => {
          acc[l.type] = (acc[l.type] ?? 0) + 1;
          return acc;
        }, {});
        setLeaveStats(Object.entries(leaveCounts).map(([type, count]) => ({ type, count })));

        const buckets: Record<string, number> = {
          '< 50k': 0, '50k-80k': 0, '80k-100k': 0, '100k-150k': 0, '> 150k': 0,
        };
        employees.forEach((e: Employee) => {
          const s = e.salary;
          if (s < 50000) buckets['< 50k']++;
          else if (s < 80000) buckets['50k-80k']++;
          else if (s < 100000) buckets['80k-100k']++;
          else if (s < 150000) buckets['100k-150k']++;
          else buckets['> 150k']++;
        });
        setSalaryDist(Object.entries(buckets).map(([range, count]) => ({ range, count })));
      })
      .finally(() => setLoading(false));
  }, []);

  const exportEmployeesCsv = async () => {
    const blob = await reportService.exportEmployeesCsv();
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'employees.csv';
    a.click();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Analytics</h1>
        <button onClick={exportEmployeesCsv} className="btn-secondary text-sm">Export Employees CSV</button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Department Headcount</h2>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={deptStats} margin={{ top: 5, right: 10, bottom: 40, left: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="name" tick={{ fontSize: 12 }} angle={-30} textAnchor="end" />
              <YAxis tick={{ fontSize: 12 }} allowDecimals={false} />
              <Tooltip />
              <Bar dataKey="count" fill="#3b82f6" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="card">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Leave Type Distribution</h2>
          {leaveStats.length > 0 ? (
            <ResponsiveContainer width="100%" height={280}>
              <PieChart>
                <Pie
                  data={leaveStats}
                  dataKey="count"
                  nameKey="type"
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  label={({ type, percent }) => `${type} ${(percent * 100).toFixed(0)}%`}
                  labelLine={false}
                >
                  {leaveStats.map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-64 text-gray-400">No leave data</div>
          )}
        </div>

        <div className="card lg:col-span-2">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Salary Distribution</h2>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={salaryDist} margin={{ top: 5, right: 10, bottom: 5, left: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="range" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} allowDecimals={false} />
              <Tooltip />
              <Bar dataKey="count" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
