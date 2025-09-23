import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { AlertCircle, Check, DollarSign, Calendar, FileText, User } from 'lucide-react';
import Button from '../ui/Button';
import { addStaffPayment, StaffPayment } from '../../lib/staffPaymentService';
import { supabase } from '../../lib/supabase';

interface StaffPaymentFormProps {
  staffId: string;
  staffName: string;
  onSuccess: () => void;
  onCancel: () => void;
}

const PAYMENT_TYPES = [
  { value: 'salary', label: 'Salary' },
  { value: 'cash_advance', label: 'Cash Advance' },
  { value: 'bonus', label: 'Bonus' },
  { value: 'other', label: 'Other' },
];

const StaffPaymentForm: React.FC<StaffPaymentFormProps> = ({ staffId, staffName, onSuccess, onCancel }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm<StaffPayment>({
    defaultValues: {
      staff_id: staffId,
      payment_date: new Date().toISOString().split('T')[0], // Default to today
      amount_php: 0,
      payment_type: 'salary',
      notes: '',
    }
  });

  const paymentDate = watch('payment_date');

  const onSubmit = async (data: StaffPayment) => {
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const paymentData: Omit<StaffPayment, 'id' | 'created_at' | 'updated_at'> = {
        staff_id: data.staff_id,
        payment_date: data.payment_date,
        amount_php: data.amount_php,
        payment_type: data.payment_type,
        notes: data.notes?.trim() || null,
      };

      await addStaffPayment(paymentData);
      setSuccess('Payment recorded successfully!');
      setTimeout(onSuccess, 1500);
    } catch (err: any) {
      setError(`Error recording payment: ${err.message}`);
      console.error('Payment submission error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 p-6 bg-white rounded-lg shadow-lg max-w-md w-full">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Record Payment for {staffName}</h2>

        {error && (
          <div className="bg-red-50 text-red-600 p-4 rounded-md flex items-center gap-2">
            <AlertCircle className="w-5 h-5" />
            {error}
          </div>
        )}
        {success && (
          <div className="bg-green-50 text-green-600 p-4 rounded-md flex items-center gap-2">
            <Check className="w-5 h-5" />
            {success}
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Staff Member
          </label>
          <div className="relative">
            <input
              type="text"
              value={staffName}
              readOnly
              className="w-full px-4 py-2 border border-gray-300 rounded-md bg-gray-100 text-gray-700"
            />
            <User className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          </div>
          <input type="hidden" {...register('staff_id')} />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Payment Date
          </label>
          <DatePicker
            selected={paymentDate ? new Date(paymentDate) : null}
            onChange={(date: Date | null) => setValue('payment_date', date ? date.toISOString().split('T')[0] : '')}
            dateFormat="yyyy/MM/dd"
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500"
            required
          />
          {errors.payment_date && <p className="text-red-500 text-xs mt-1">Payment date is required</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Amount (PHP)
          </label>
          <div className="relative">
            <input
              type="number"
              step="0.01"
              {...register('amount_php', {
                required: 'Amount is required',
                valueAsNumber: true,
                min: { value: 0.01, message: 'Amount must be greater than 0' }
              })}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500"
              placeholder="0.00"
            />
            <DollarSign className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          </div>
          {errors.amount_php && <p className="text-red-500 text-xs mt-1">{errors.amount_php.message}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Payment Type
          </label>
          <div className="relative">
            <select
              {...register('payment_type', { required: 'Payment type is required' })}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500"
            >
              {PAYMENT_TYPES.map((type) => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </select>
            <FileText className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          </div>
          {errors.payment_type && <p className="text-red-500 text-xs mt-1">Payment type is required</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Notes (Optional)
          </label>
          <textarea
            {...register('notes')}
            rows={3}
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500"
            placeholder="e.g., Cash advance for medical bill, Bonus for excellent performance"
          />
        </div>

        <div className="flex justify-end space-x-4">
          <Button type="button" variant="outline" onClick={onCancel} disabled={loading}>
            Cancel
          </Button>
          <Button type="submit" disabled={loading}>
            {loading ? 'Recording...' : 'Record Payment'}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default StaffPaymentForm;
