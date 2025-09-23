// src/components/admin/ScheduleAssignmentForm.tsx
import React, { useState, useEffect, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { supabase } from '../../lib/supabase';
import Button from '../ui/Button';
import { upsertScheduleAssignment } from '../../lib/scheduleService';
import { AlertCircle, Check, User, Calendar, Clock, Star } from 'lucide-react';
// No need for date-fns-tz format here if we extract local components directly

interface Staff {
  id: string;
  first_name: string;
  last_name: string;
}

interface ScheduleAssignmentFormProps {
  initialData?: any; // For editing existing assignments
  selectedDate?: Date; // For new assignments on a specific date
  onSuccess: () => void;
  onCancel: () => void;
  onDelete?: (id: string) => void; // New prop for delete functionality
}

const SHIFT_TYPES = [
  { value: 'Morning', label: 'Morning' },
  { value: 'Afternoon', label: 'Afternoon' },
  { value: 'Full Day', label: 'Full Day' },
  { value: 'Night', label: 'Night' },
  { value: 'Off', label: 'Off' },
];

const STATUS_OPTIONS = [
  { value: 'published', label: 'Published' },
];

const ScheduleAssignmentForm: React.FC<ScheduleAssignmentFormProps> = ({
  initialData,
  selectedDate,
  onSuccess,
  onCancel,
  onDelete,
}) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [staffOptions, setStaffOptions] = useState<Staff[]>([]);
  const { register, handleSubmit, setValue, reset, watch, formState: { errors } } = useForm<any>();

  const formScheduleDate = watch('schedule_date');

  useEffect(() => {
    const fetchData = async () => {
      await loadStaffOptions(); // Load staff options first
      if (initialData) {
        // Editing existing assignment
        reset({
          ...initialData,
          schedule_date: new Date(initialData.schedule_date), // Convert string to Date object
        });
        // Explicitly set staff_id value after options are loaded and initialData is available
        // This ensures the select input displays the correct staff member
        setValue('staff_id', initialData.staff_id);
      } else if (selectedDate) {
        // Creating new assignment for a specific date
        reset({
          schedule_date: selectedDate,
          shift_type: 'Full Day', // Default for new assignments
          is_offered: false,
          is_extraordinary: false,
          status: 'published', // Default new assignments to 'published'
        });
      }
    };
    fetchData();
  }, [initialData, selectedDate, reset, setValue]); // Added setValue to dependencies

  const loadStaffOptions = async () => {
    try {
      const { data, error } = await supabase
        .from('staff_details')
        .select('id, first_name, last_name')
        .eq('is_active', true)
        .order('first_name');

      if (error) throw error;
      setStaffOptions(data || []);
    } catch (err) {
      console.error('Error loading staff options:', err);
      setError('Failed to load staff options.');
    }
  };

  const onSubmit = async (data: any) => {
    setLoading(true);
    setError('');

    try {
      // Extract year, month, and day directly from the Date object's local components
      // This is generally the most reliable way when the Date object comes from a UI picker
      // that respects the local date.
      const year = data.schedule_date.getFullYear();
      const month = (data.schedule_date.getMonth() + 1).toString().padStart(2, '0'); // Month is 0-indexed
      const day = data.schedule_date.getDate().toString().padStart(2, '0');

      const formattedDateString = `${year}-${month}-${day}`;

      // Create the assignment data to send to Supabase
      // Exclude staff_details as it's not a direct column in staff_schedules
      const { staff_details, ...restOfData } = data; 
      const assignmentData = {
        ...restOfData,
        schedule_date: formattedDateString, // Use the YYYY-MM-DD string
        is_offered: Boolean(data.is_offered),
        is_extraordinary: Boolean(data.is_extraordinary),
        status: 'published', // Force status to 'published' upon submission
      };

      await upsertScheduleAssignment(assignmentData);
      onSuccess(); // Notify parent component of success
    } catch (err: any) {
      setError(`Error saving assignment: ${err.message}`);
      console.error('Save error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteClick = async () => {
    if (initialData && onDelete && window.confirm('Are you sure you want to delete this assignment?')) {
      setLoading(true);
      try {
        await onDelete(initialData.id);
        onSuccess(); // Close modal and refresh calendar
      } catch (err: any) {
        setError(`Failed to delete assignment: ${err.message || 'Unknown error'}`);
        console.error('Delete assignment error:', err);
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 p-6 bg-white rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold text-gray-900 mb-4">
        {initialData ? 'Edit Schedule Assignment' : 'Add New Schedule Assignment'}
      </h2>

      {error && (
        <div className="bg-red-50 text-red-600 p-4 rounded-md flex items-center gap-2">
          <AlertCircle className="w-5 h-5" />
          {error}
        </div>
      )}

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Schedule Date
        </label>
        <DatePicker
          selected={formScheduleDate}
          onChange={(date: Date | null) => setValue('schedule_date', date as any)}
          dateFormat="dd/MM/yyyy"
          className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500"
          required
        />
        {errors.schedule_date && <p className="text-red-500 text-xs mt-1">Date is required</p>}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Staff Member
        </label>
        <div className="relative">
          <select
            {...register('staff_id', { required: 'Staff member is required' })}
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500"
          >
            <option value="">Select Staff Member</option>
            {staffOptions.map((staff) => (
              <option key={staff.id} value={staff.id}>
                {staff.first_name} {staff.last_name}
              </option>
            ))}
          </select>
          <User className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
        </div>
        {errors.staff_id && <p className="text-red-500 text-xs mt-1">Staff member is required</p>}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Shift Type
        </label>
        <div className="relative">
          <select
            {...register('shift_type', { required: 'Shift type is required' })}
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500"
          >
            <option value="">Select Shift Type</option>
            {SHIFT_TYPES.map((shift) => (
              <option key={shift.value} value={shift.value}>
                {shift.label}
              </option>
            ))}
          </select>
          <Clock className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
        </div>
        {errors.shift_type && <p className="text-red-500 text-xs mt-1">Shift type is required</p>}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Status
        </label>
        <div className="relative">
          <select
            {...register('status', { required: 'Status is required' })}
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500"
          >
            {STATUS_OPTIONS.map((status) => (
              <option key={status.value} value={status.value}>
                {status.label}
              </option>
            ))}
          </select>
          <Check className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
        </div>
        {errors.status && <p className="text-red-500 text-xs mt-1">Status is required</p>}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <label className="flex items-center space-x-2">
          <input
            type="checkbox"
            {...register('is_offered')}
            className="rounded border-gray-300 text-amber-600 focus:ring-amber-500"
          />
          <span className="text-sm font-medium text-gray-700">Is Offered</span>
        </label>
        <label className="flex items-center space-x-2">
          <input
            type="checkbox"
            {...register('is_extraordinary')}
            className="rounded border-gray-300 text-amber-600 focus:ring-amber-500"
          />
          <span className="text-sm font-medium text-gray-700">Is Extraordinary</span>
        </label>
      </div>

      <div className="flex justify-end space-x-4">
        {initialData && (
          <Button type="button" variant="outline" onClick={handleDeleteClick} disabled={loading}>
            Delete
          </Button>
        )}
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" disabled={loading}>
          {loading ? 'Saving...' : initialData ? 'Update Assignment' : 'Add Assignment'}
        </Button>
      </div>
    </form>
  );
};

export default ScheduleAssignmentForm;
