import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { leaveService } from '../services/api';
import { useAuth } from '../context/AuthContext';
import type { LeaveRequest, LeaveRequestDto, LeaveType } from '../types';
import Modal from '../components/ui/Modal';

const statusColors: Record<string, string> = {
  PENDING: 'bg-yellow-100 text-yellow-800',
  APPROVED: 'bg-green-100 text-green-800',
  REJECTED: 'bg-red-100 text-red-800',
  CANCELLED: 'bg-gray-100 text-gray-600',
};

export default function Leaves() {
  const { user, hasRole } = useAuth();
  const [leaves, setLeaves] = useState<LeaveRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [showApply, setShowApply] = useState(false);
  const [actionModal, setActionModal] = useState<{ id: number; type: 'approve' | 'reject' } | null>(null);
  const [remarks, setRemarks] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  const { register, handleSubmit, reset, formState: { errors } } = useForm<LeaveRequestDto>({
    defaultValues: { employeeId: user?.role === 'EMPLOYEE' ? undefined : undefined },
  });

  const fetchLeaves = async () => {
    setLoading(true);
    try {
      const data = hasRole('HR_ADMIN', 'MANAGER')
        ? await leaveService.getAll({ status: statusFilter || undefined })
        : await leaveService.getMyLeaves();
      setLeaves(data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchLeaves(); }, [statusFilter]);

  const onApply = async (data: LeaveRequestDto) => {
    await leaveService.apply({ ...data, employeeId: user!.id });
    reset();
    setShowApply(false);
    fetchLeaves();
  };

  const handleAction = async () => {
    if (!actionModal) return;
    if (actionModal.type === 'approve') {
      await leaveService.approve(actionModal.id, remarks);
    } else {
      await leaveService.reject(actionModal.id, remarks);
    }
    setActionModal(null);
    setRemarks('');
    fetchLeaves();
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Leave Management</h1>
        <button onClick={() => setShowApply(true)} className="btn-primary">Apply for Leave</button>
      </div>

      {hasRole('HR_ADMIN', 'MANAGER') && (
        <div className="card mb-4">
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="input-field w-48">
            <option value="">All Status</option>
            <option value="PENDING">Pending</option>
            <option value="APPROVED">Approved</option>
            <option value="REJECTED">Rejected</option>
            <option value="CANCELLED">Cancelled</option>
          </select>
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
                {['Employee', 'Type', 'Start', 'End', 'Days', 'Status', 'Reason', 'Actions'].map((h) => (
                  <th key={h} className="text-left py-3 px-4 text-gray-500 font-medium">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {leaves.map((leave) => (
                <tr key={leave.id} className="border-b border-gray-50 hover:bg-gray-50">
                  <td className="py-3 px-4 font-medium">{leave.employeeName}</td>
                  <td className="py-3 px-4"><span className="badge bg-blue-100 text-blue-800">{leave.type}</span></td>
                  <td className="py-3 px-4">{leave.startDate}</td>
                  <td className="py-3 px-4">{leave.endDate}</td>
                  <td className="py-3 px-4">{leave.daysCount}</td>
                  <td className="py-3 px-4">
                    <span className={`badge ${statusColors[leave.status]}`}>{leave.status}</span>
                  </td>
                  <td className="py-3 px-4 max-w-[150px] truncate text-gray-600">{leave.reason}</td>
                  <td className="py-3 px-4">
                    <div className="flex gap-2">
                      {hasRole('HR_ADMIN', 'MANAGER') && leave.status === 'PENDING' && (
                        <>
                          <button onClick={() => setActionModal({ id: leave.id, type: 'approve' })} className="text-green-600 hover:underline text-xs">Approve</button>
                          <button onClick={() => setActionModal({ id: leave.id, type: 'reject' })} className="text-red-500 hover:underline text-xs">Reject</button>
                        </>
                      )}
                      {leave.status === 'PENDING' && (
                        <button onClick={async () => { await leaveService.cancel(leave.id); fetchLeaves(); }} className="text-gray-500 hover:underline text-xs">Cancel</button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
              {leaves.length === 0 && (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-gray-400">No leave requests found</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {showApply && (
        <Modal title="Apply for Leave" onClose={() => setShowApply(false)} size="md">
          <form onSubmit={handleSubmit(onApply)} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Leave Type *</label>
              <select {...register('type', { required: 'Required' })} className="input-field">
                {(['ANNUAL', 'SICK', 'PERSONAL', 'UNPAID', 'MATERNITY', 'PATERNITY'] as LeaveType[]).map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Start Date *</label>
                <input {...register('startDate', { required: 'Required' })} type="date" className="input-field" />
                {errors.startDate && <p className="text-red-500 text-xs mt-1">{errors.startDate.message}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">End Date *</label>
                <input {...register('endDate', { required: 'Required' })} type="date" className="input-field" />
                {errors.endDate && <p className="text-red-500 text-xs mt-1">{errors.endDate.message}</p>}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Reason *</label>
              <textarea {...register('reason', { required: 'Required' })} rows={3} className="input-field" />
              {errors.reason && <p className="text-red-500 text-xs mt-1">{errors.reason.message}</p>}
            </div>
            <div className="flex justify-end gap-3">
              <button type="button" onClick={() => setShowApply(false)} className="btn-secondary">Cancel</button>
              <button type="submit" className="btn-primary">Submit Request</button>
            </div>
          </form>
        </Modal>
      )}

      {actionModal && (
        <Modal
          title={actionModal.type === 'approve' ? 'Approve Leave' : 'Reject Leave'}
          onClose={() => { setActionModal(null); setRemarks(''); }}
          size="sm"
        >
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Manager Remarks</label>
              <textarea
                value={remarks}
                onChange={(e) => setRemarks(e.target.value)}
                rows={3}
                className="input-field"
                placeholder="Optional remarks..."
              />
            </div>
            <div className="flex justify-end gap-3">
              <button onClick={() => { setActionModal(null); setRemarks(''); }} className="btn-secondary">Cancel</button>
              <button
                onClick={handleAction}
                className={actionModal.type === 'approve' ? 'btn-success' : 'btn-danger'}
              >
                {actionModal.type === 'approve' ? 'Approve' : 'Reject'}
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
