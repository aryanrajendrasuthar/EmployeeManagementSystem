import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { payrollService, employeeService, reportService } from '../services/api';
import { useAuth } from '../context/AuthContext';
import type { PayrollRecord, PayrollDto, Employee } from '../types';
import Modal from '../components/ui/Modal';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

export default function Payroll() {
  const { hasRole } = useAuth();
  const [records, setRecords] = useState<PayrollRecord[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [monthFilter, setMonthFilter] = useState('');
  const [showForm, setShowForm] = useState(false);

  const { register, handleSubmit, reset, formState: { errors } } = useForm<PayrollDto>();

  const fetchRecords = async () => {
    setLoading(true);
    try {
      const data = hasRole('HR_ADMIN', 'MANAGER')
        ? await payrollService.getAll({ month: monthFilter || undefined })
        : await payrollService.getMyPayroll();
      setRecords(data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (hasRole('HR_ADMIN', 'MANAGER')) {
      employeeService.getAll().then(setEmployees);
    }
    fetchRecords();
  }, [monthFilter]);

  const onSubmit = async (data: PayrollDto) => {
    await payrollService.create({ ...data, employeeId: Number(data.employeeId) });
    reset();
    setShowForm(false);
    fetchRecords();
  };

  const exportPdf = () => {
    const doc = new jsPDF();
    doc.setFontSize(16);
    doc.text('Payroll Report', 14, 15);
    if (monthFilter) {
      doc.setFontSize(10);
      doc.text(`Month: ${monthFilter}`, 14, 22);
    }
    autoTable(doc, {
      startY: monthFilter ? 27 : 22,
      head: [['Employee', 'Month', 'Base Salary', 'Bonuses', 'Deductions', 'Net Salary']],
      body: records.map((r) => [
        r.employeeName,
        r.month,
        `$${r.baseSalary.toLocaleString()}`,
        `$${r.bonuses.toLocaleString()}`,
        `$${r.deductions.toLocaleString()}`,
        `$${r.netSalary.toLocaleString()}`,
      ]),
    });
    doc.save(`payroll-${monthFilter || 'all'}.pdf`);
  };

  const exportCsv = async () => {
    const blob = await reportService.exportPayrollCsv(monthFilter || undefined);
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `payroll-${monthFilter || 'all'}.csv`;
    a.click();
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Payroll</h1>
        <div className="flex gap-3">
          {hasRole('HR_ADMIN') && (
            <>
              <button onClick={exportCsv} className="btn-secondary text-sm">Export CSV</button>
              <button onClick={exportPdf} className="btn-secondary text-sm">Export PDF</button>
              <button onClick={() => setShowForm(true)} className="btn-primary">+ Add Record</button>
            </>
          )}
        </div>
      </div>

      {hasRole('HR_ADMIN', 'MANAGER') && (
        <div className="card mb-4">
          <input
            type="month"
            value={monthFilter}
            onChange={(e) => setMonthFilter(e.target.value)}
            className="input-field w-48"
          />
        </div>
      )}

      {loading ? (
        <div className="flex justify-center py-16">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
        </div>
      ) : (
        <div className="card p-0 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                {['Employee', 'Month', 'Base Salary', 'Bonuses', 'Deductions', 'Net Salary'].map((h) => (
                  <th key={h} className="text-left py-3 px-4 text-gray-500 font-medium">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {records.map((r) => (
                <tr key={r.id} className="border-b border-gray-50 hover:bg-gray-50">
                  <td className="py-3 px-4 font-medium">{r.employeeName}</td>
                  <td className="py-3 px-4 text-gray-600">{r.month}</td>
                  <td className="py-3 px-4">${r.baseSalary.toLocaleString()}</td>
                  <td className="py-3 px-4 text-green-600">+${r.bonuses.toLocaleString()}</td>
                  <td className="py-3 px-4 text-red-500">-${r.deductions.toLocaleString()}</td>
                  <td className="py-3 px-4 font-bold text-blue-600">${r.netSalary.toLocaleString()}</td>
                </tr>
              ))}
              {records.length === 0 && (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-gray-400">No payroll records found</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {showForm && (
        <Modal title="Add Payroll Record" onClose={() => { setShowForm(false); reset(); }} size="md">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Employee *</label>
              <select {...register('employeeId', { required: 'Required' })} className="input-field">
                <option value="">Select employee</option>
                {employees.map((e) => <option key={e.id} value={e.id}>{e.name}</option>)}
              </select>
              {errors.employeeId && <p className="text-red-500 text-xs mt-1">{errors.employeeId.message}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Month (YYYY-MM) *</label>
              <input {...register('month', { required: 'Required' })} type="month" className="input-field" />
              {errors.month && <p className="text-red-500 text-xs mt-1">{errors.month.message}</p>}
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Base Salary *</label>
                <input {...register('baseSalary', { required: 'Required', valueAsNumber: true })} type="number" className="input-field" />
                {errors.baseSalary && <p className="text-red-500 text-xs mt-1">{errors.baseSalary.message}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Bonuses</label>
                <input {...register('bonuses', { valueAsNumber: true })} type="number" defaultValue={0} className="input-field" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Deductions</label>
                <input {...register('deductions', { valueAsNumber: true })} type="number" defaultValue={0} className="input-field" />
              </div>
            </div>
            <div className="flex justify-end gap-3">
              <button type="button" onClick={() => { setShowForm(false); reset(); }} className="btn-secondary">Cancel</button>
              <button type="submit" className="btn-primary">Add Record</button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
