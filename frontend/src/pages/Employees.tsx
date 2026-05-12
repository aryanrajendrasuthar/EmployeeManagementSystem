import { useEffect, useState } from 'react';
import { employeeService, departmentService } from '../services/api';
import type { Employee, Department } from '../types';
import { useAuth } from '../context/AuthContext';
import Modal from '../components/ui/Modal';
import EmployeeForm from '../components/Employee/EmployeeForm';
import EmployeeProfile from '../components/Employee/EmployeeProfile';

const statusColors: Record<string, string> = {
  ACTIVE: 'bg-green-100 text-green-800',
  INACTIVE: 'bg-red-100 text-red-800',
  ON_LEAVE: 'bg-yellow-100 text-yellow-800',
};

export default function Employees() {
  const { hasRole } = useAuth();
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [deptFilter, setDeptFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editEmployee, setEditEmployee] = useState<Employee | null>(null);
  const [viewEmployee, setViewEmployee] = useState<Employee | null>(null);
  const [deleteId, setDeleteId] = useState<number | null>(null);

  const fetchEmployees = () => {
    setLoading(true);
    employeeService
      .getAll({
        search: search || undefined,
        departmentId: deptFilter ? Number(deptFilter) : undefined,
        status: statusFilter || undefined,
      })
      .then(setEmployees)
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    departmentService.getAll().then(setDepartments);
  }, []);

  useEffect(() => {
    fetchEmployees();
  }, [search, deptFilter, statusFilter]);

  const handleDelete = async () => {
    if (deleteId == null) return;
    await employeeService.delete(deleteId);
    setDeleteId(null);
    fetchEmployees();
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Employees</h1>
        {hasRole('HR_ADMIN') && (
          <button onClick={() => { setEditEmployee(null); setShowForm(true); }} className="btn-primary">
            + Add Employee
          </button>
        )}
      </div>

      <div className="card mb-6">
        <div className="flex flex-wrap gap-4">
          <input
            type="text"
            placeholder="Search by name, email, job title..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="input-field flex-1 min-w-[200px]"
          />
          <select value={deptFilter} onChange={(e) => setDeptFilter(e.target.value)} className="input-field w-48">
            <option value="">All Departments</option>
            {departments.map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}
          </select>
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="input-field w-40">
            <option value="">All Status</option>
            <option value="ACTIVE">Active</option>
            <option value="INACTIVE">Inactive</option>
            <option value="ON_LEAVE">On Leave</option>
          </select>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-16">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
        </div>
      ) : (
        <div className="card p-0 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                {['ID', 'Name', 'Department', 'Job Title', 'Status', 'Joining Date', 'Actions'].map((h) => (
                  <th key={h} className="text-left py-3 px-4 text-gray-500 font-medium">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {employees.map((emp) => (
                <tr key={emp.id} className="border-b border-gray-50 hover:bg-gray-50">
                  <td className="py-3 px-4 font-mono text-xs text-gray-500">{emp.employeeId}</td>
                  <td className="py-3 px-4">
                    <div className="font-medium">{emp.name}</div>
                    <div className="text-xs text-gray-400">{emp.email}</div>
                  </td>
                  <td className="py-3 px-4">{emp.department}</td>
                  <td className="py-3 px-4">{emp.jobTitle}</td>
                  <td className="py-3 px-4">
                    <span className={`badge ${statusColors[emp.status]}`}>{emp.status}</span>
                  </td>
                  <td className="py-3 px-4">{emp.joiningDate}</td>
                  <td className="py-3 px-4">
                    <div className="flex gap-2">
                      <button onClick={() => setViewEmployee(emp)} className="text-blue-600 hover:underline text-xs">View</button>
                      {hasRole('HR_ADMIN', 'MANAGER') && (
                        <button onClick={() => { setEditEmployee(emp); setShowForm(true); }} className="text-gray-600 hover:underline text-xs">Edit</button>
                      )}
                      {hasRole('HR_ADMIN') && (
                        <button onClick={() => setDeleteId(emp.id)} className="text-red-500 hover:underline text-xs">Delete</button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
              {employees.length === 0 && (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-gray-400">No employees found</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {(showForm) && (
        <Modal
          title={editEmployee ? 'Edit Employee' : 'Add Employee'}
          onClose={() => { setShowForm(false); setEditEmployee(null); }}
          size="xl"
        >
          <EmployeeForm
            employee={editEmployee}
            onSuccess={() => { setShowForm(false); setEditEmployee(null); fetchEmployees(); }}
            onCancel={() => { setShowForm(false); setEditEmployee(null); }}
          />
        </Modal>
      )}

      {viewEmployee && (
        <Modal title="Employee Profile" onClose={() => setViewEmployee(null)} size="lg">
          <EmployeeProfile employee={viewEmployee} onClose={() => setViewEmployee(null)} />
        </Modal>
      )}

      {deleteId != null && (
        <Modal title="Confirm Delete" onClose={() => setDeleteId(null)} size="sm">
          <p className="text-gray-600 mb-6">Are you sure you want to delete this employee? This action cannot be undone.</p>
          <div className="flex justify-end gap-3">
            <button onClick={() => setDeleteId(null)} className="btn-secondary">Cancel</button>
            <button onClick={handleDelete} className="btn-danger">Delete</button>
          </div>
        </Modal>
      )}
    </div>
  );
}
