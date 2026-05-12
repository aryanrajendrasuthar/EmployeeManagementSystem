import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { reviewService, employeeService } from '../services/api';
import { useAuth } from '../context/AuthContext';
import type { PerformanceReview, PerformanceReviewDto, Employee } from '../types';
import Modal from '../components/ui/Modal';

function Stars({ rating }: { rating: number }) {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((s) => (
        <svg
          key={s}
          className={`w-4 h-4 ${s <= rating ? 'text-yellow-400' : 'text-gray-200'}`}
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
    </div>
  );
}

export default function Reviews() {
  const { hasRole } = useAuth();
  const [reviews, setReviews] = useState<PerformanceReview[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [quarterFilter, setQuarterFilter] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editReview, setEditReview] = useState<PerformanceReview | null>(null);
  const [deleteId, setDeleteId] = useState<number | null>(null);

  const { register, handleSubmit, reset, setValue, formState: { errors } } = useForm<PerformanceReviewDto>();

  const fetchReviews = async () => {
    setLoading(true);
    try {
      const data = await reviewService.getAll({ quarter: quarterFilter || undefined });
      setReviews(data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (hasRole('HR_ADMIN', 'MANAGER')) {
      employeeService.getAll().then(setEmployees);
    }
    fetchReviews();
  }, [quarterFilter]);

  const openEdit = (review: PerformanceReview) => {
    setEditReview(review);
    setValue('employeeId', review.employeeId);
    setValue('reviewerId', review.reviewerId);
    setValue('quarter', review.quarter);
    setValue('rating', review.rating);
    setValue('feedback', review.feedback);
    setShowForm(true);
  };

  const onSubmit = async (data: PerformanceReviewDto) => {
    if (editReview) {
      await reviewService.update(editReview.id, data);
    } else {
      await reviewService.create(data);
    }
    reset();
    setShowForm(false);
    setEditReview(null);
    fetchReviews();
  };

  const handleDelete = async () => {
    if (deleteId == null) return;
    await reviewService.delete(deleteId);
    setDeleteId(null);
    fetchReviews();
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Performance Reviews</h1>
        {hasRole('HR_ADMIN', 'MANAGER') && (
          <button onClick={() => { setEditReview(null); reset(); setShowForm(true); }} className="btn-primary">
            + Add Review
          </button>
        )}
      </div>

      <div className="card mb-4">
        <input
          type="text"
          placeholder="Quarter (e.g. Q1-2024)"
          value={quarterFilter}
          onChange={(e) => setQuarterFilter(e.target.value)}
          className="input-field w-48"
        />
      </div>

      {loading ? (
        <div className="flex justify-center py-16">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {reviews.map((r) => (
            <div key={r.id} className="card">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="font-semibold text-gray-900">{r.employeeName}</h3>
                  <p className="text-sm text-gray-500">Reviewed by {r.reviewerName}</p>
                </div>
                <span className="badge bg-purple-100 text-purple-800">{r.quarter}</span>
              </div>
              <Stars rating={r.rating} />
              <p className="mt-3 text-sm text-gray-600">{r.feedback}</p>
              <p className="mt-2 text-xs text-gray-400">{r.reviewDate}</p>
              {hasRole('HR_ADMIN', 'MANAGER') && (
                <div className="flex gap-2 mt-3 pt-3 border-t border-gray-50">
                  <button onClick={() => openEdit(r)} className="text-blue-600 hover:underline text-xs">Edit</button>
                  <button onClick={() => setDeleteId(r.id)} className="text-red-500 hover:underline text-xs">Delete</button>
                </div>
              )}
            </div>
          ))}
          {reviews.length === 0 && (
            <div className="col-span-2 text-center py-16 text-gray-400">No reviews found</div>
          )}
        </div>
      )}

      {showForm && (
        <Modal
          title={editReview ? 'Edit Review' : 'Add Review'}
          onClose={() => { setShowForm(false); setEditReview(null); reset(); }}
          size="md"
        >
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Employee *</label>
              <select {...register('employeeId', { required: 'Required', valueAsNumber: true })} className="input-field">
                <option value="">Select employee</option>
                {employees.map((e) => <option key={e.id} value={e.id}>{e.name}</option>)}
              </select>
              {errors.employeeId && <p className="text-red-500 text-xs mt-1">{errors.employeeId.message}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Reviewer *</label>
              <select {...register('reviewerId', { required: 'Required', valueAsNumber: true })} className="input-field">
                <option value="">Select reviewer</option>
                {employees.map((e) => <option key={e.id} value={e.id}>{e.name}</option>)}
              </select>
              {errors.reviewerId && <p className="text-red-500 text-xs mt-1">{errors.reviewerId.message}</p>}
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Quarter *</label>
                <input {...register('quarter', { required: 'Required' })} placeholder="Q1-2024" className="input-field" />
                {errors.quarter && <p className="text-red-500 text-xs mt-1">{errors.quarter.message}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Rating (1-5) *</label>
                <input
                  {...register('rating', { required: 'Required', valueAsNumber: true, min: 1, max: 5 })}
                  type="number"
                  min={1}
                  max={5}
                  className="input-field"
                />
                {errors.rating && <p className="text-red-500 text-xs mt-1">{errors.rating.message}</p>}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Feedback *</label>
              <textarea {...register('feedback', { required: 'Required' })} rows={4} className="input-field" />
              {errors.feedback && <p className="text-red-500 text-xs mt-1">{errors.feedback.message}</p>}
            </div>
            <div className="flex justify-end gap-3">
              <button type="button" onClick={() => { setShowForm(false); setEditReview(null); reset(); }} className="btn-secondary">Cancel</button>
              <button type="submit" className="btn-primary">{editReview ? 'Update' : 'Submit'} Review</button>
            </div>
          </form>
        </Modal>
      )}

      {deleteId != null && (
        <Modal title="Confirm Delete" onClose={() => setDeleteId(null)} size="sm">
          <p className="text-gray-600 mb-6">Delete this performance review?</p>
          <div className="flex justify-end gap-3">
            <button onClick={() => setDeleteId(null)} className="btn-secondary">Cancel</button>
            <button onClick={handleDelete} className="btn-danger">Delete</button>
          </div>
        </Modal>
      )}
    </div>
  );
}
