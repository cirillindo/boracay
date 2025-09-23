import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useParams, useNavigate } from 'react-router-dom';
import { StaffBonus, Staff, addStaffBonus, updateStaffBonus, fetchStaffBonusById, fetchStaffMembers } from '../../lib/staffBonusService';
import { DollarSign, Calendar, User, CheckCircle } from 'lucide-react';
import { format } from 'date-fns'; // Import format from date-fns

const REASON_OPTIONS = [
  { value: 'Performance', label: 'Performance Bonus' },
  { value: 'Holiday', label: 'Holiday Bonus' },
  { value: 'Overtime', label: 'Overtime Bonus' },
  { value: 'Achievement', label: 'Achievement Bonus' },
  { value: 'Other', label: 'Other' },
];

const StaffBonusForm: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [staffOptions, setStaffOptions] = useState<Staff[]>([]);
  const { register, handleSubmit, setValue, reset, watch, formState: { errors } } = useForm<StaffBonus>({
    defaultValues: {
      staff_id: '',
      amount_php: 0,
      bonus_date: null,
      description: '',
      is_paid: false,
    }
  });

  const isEditing = Boolean(id);

  useEffect(() => {
    const loadData = async () => {
      try {
        // Load staff options
        const staff = await fetchStaffMembers();
        setStaffOptions(staff);

        // If editing, load the bonus data
        if (id) {
          const bonusData = await fetchStaffBonusById(id!);
          if (bonusData) {
            reset({
              ...bonusData,
              // Correctly format the date for the input type="date"
              bonus_date: bonusData.bonus_date ? format(new Date(bonusData.bonus_date), 'yyyy-MM-dd') : null,
            });
          }
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load data');
      }
    };

    loadData();
  }, [id, reset]);

  const onSubmit = async (data: StaffBonus) => {
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      // Format date to YYYY-MM-DD string for Supabase
      const formattedBonusDate = data.bonus_date ? new Date(data.bonus_date).toISOString().split('T')[0] : '';

      const bonusDataToSave: Omit<StaffBonus, 'id' | 'created_at' | 'updated_at' | 'staff_details'> = {
        staff_id: data.staff_id,
        amount_php: data.amount_php,
        bonus_date: formattedBonusDate,
        description: data.description,
        is_paid: Boolean(data.is_paid),
      };

      if (isEditing) {
        await updateStaffBonus(id!, bonusDataToSave);
        setSuccess('Staff bonus updated successfully!');
      } else {
        await addStaffBonus(bonusDataToSave);
        setSuccess('Staff bonus added successfully!');
      }

      // Navigate back to the list after a short delay
      setTimeout(() => {
        navigate('/admin/staff-bonuses');
      }, 1500);
    } catch (err) {
      setError(`Save error: ${err instanceof Error ? err.message : 'Unknown error occurred'}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">
        {isEditing ? 'Edit Staff Bonus' : 'Add New Staff Bonus'}
      </h2>

      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-md">
          <p className="text-red-600 text-sm">{error}</p>
        </div>
      )}

      {success && (
        <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-md flex items-center">
          <CheckCircle className="w-5 h-5 text-green-600 mr-2" />
          <p className="text-green-600 text-sm">{success}</p>
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Staff Member
          </label>
          <div className="relative">
            <select
              {...register('staff_id', { required: 'Staff member is required' })}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500"
            >
              <option value="">Select a staff member</option>
              {staffOptions.map((staff) => (
                <option key={staff.id} value={staff.id}>
                  {staff.first_name} {staff.last_name}
                </option>
              ))}
            </select>
            <User className="absolute right-3 top-2.5 h-5 w-5 text-gray-400" />
          </div>
          {errors.staff_id && (
            <p className="mt-1 text-sm text-red-600">{errors.staff_id.message}</p>
          )}
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
                min: { value: 0.01, message: 'Amount must be greater than 0' }
              })}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500"
              placeholder="0.00"
            />
            <DollarSign className="absolute right-3 top-2.5 h-5 w-5 text-gray-400" />
          </div>
          {errors.amount_php && (
            <p className="mt-1 text-sm text-red-600">{errors.amount_php.message}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Bonus Date
          </label>
          <div className="relative">
            <input
              type="date"
              {...register('bonus_date', { required: 'Bonus date is required' })}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
            <Calendar className="absolute right-3 top-2.5 h-5 w-5 text-gray-400" />
          </div>
          {errors.bonus_date && (
            <p className="mt-1 text-sm text-red-600">{errors.bonus_date.message}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Description
          </label>
          <div className="relative">
            <select
              {...register('description', { required: 'Description is required' })}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500"
            >
              <option value="">Select a description</option>
              {REASON_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
          {errors.description && (
            <p className="mt-1 text-sm text-red-600">{errors.description.message}</p>
          )}
        </div>

        <div className="flex items-center">
          <input
            type="checkbox"
            {...register('is_paid')}
            className="h-4 w-4 text-amber-600 focus:ring-amber-500 border-gray-300 rounded"
          />
          <label className="ml-2 block text-sm text-gray-900">
            Mark as Paid
          </label>
        </div>

        <div className="flex justify-end space-x-4">
          <button
            type="button"
            onClick={() => navigate('/admin/staff-bonuses')}
            className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-amber-500"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-2 bg-amber-600 text-white rounded-md hover:bg-amber-700 focus:outline-none focus:ring-2 focus:ring-amber-500 disabled:opacity-50"
          >
            {loading ? 'Saving...' : isEditing ? 'Update Bonus' : 'Add Bonus'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default StaffBonusForm;
