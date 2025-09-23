import React, { useState, useEffect, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate, useParams } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import Button from '../ui/Button';
import { AlertCircle, Check, User, Calendar, FileText } from 'lucide-react';

interface TodoItem {
  id?: string;
  assigned_to_staff_id: string;
  assigned_by_user_id?: string;
  task_description: string;
  due_date?: string;
  is_completed: boolean;
  completed_at?: string;
  admin_remarks?: string;
}

interface Staff {
  id: string;
  first_name: string;
  last_name: string;
  user_id: string;
}

const TodoForm: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [staffOptions, setStaffOptions] = useState<Staff[]>([]);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const { register, handleSubmit, setValue, reset, watch } = useForm<TodoItem>();

  useEffect(() => {
    loadStaffOptions();
    loadCurrentUser();
    if (id) {
      loadTodoItem();
    }
  }, [id]);

  const loadCurrentUser = async () => {
    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) {
        setError('You must be logged in to manage todo items.');
        return;
      }
      setCurrentUserId(user.id);
    } catch (err) {
      console.error('Error loading current user:', err);
      setError('Failed to load user information.');
    }
  };

  const loadStaffOptions = async () => {
    try {
      const { data, error } = await supabase
        .from('staff_details')
        .select('id, first_name, last_name, user_id')
        .eq('is_active', true)
        .order('first_name');

      if (error) throw error;
      setStaffOptions(data || []);
    } catch (err) {
      console.error('Error loading staff options:', err);
      setError('Failed to load staff options.');
    }
  };

  const loadTodoItem = useCallback(async () => {
    if (!id) return;

    try {
      const { data, error } = await supabase
        .from('staff_todo_items')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      
      if (data) {
        reset(data);
        // Format date for input type="date"
        if (data.due_date) {
          setValue('due_date', data.due_date);
        }
      }
    } catch (err) {
      console.error('Error loading todo item:', err);
      setError('Error loading todo item.');
    }
  }, [id, reset, setValue]);

  const onSubmit = async (data: TodoItem) => {
    if (!currentUserId) {
      setError('You must be logged in to create todo items.');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const todoData = {
        ...data,
        assigned_by_user_id: currentUserId,
        is_completed: Boolean(data.is_completed),
        due_date: data.due_date || null,
        completed_at: data.is_completed ? new Date().toISOString() : null
      };

      const { error: saveError } = id
        ? await supabase
            .from('staff_todo_items')
            .update(todoData)
            .eq('id', id)
        : await supabase
            .from('staff_todo_items')
            .insert([todoData]);

      if (saveError) throw saveError;
      
      setSuccess('Todo item saved successfully!');
      setTimeout(() => {
        navigate('/admin/todos');
      }, 1500);

    } catch (err: any) {
      console.error('Save error:', err);
      setError(`Error saving todo item: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 max-w-3xl mx-auto">
      {error && (
        <div className="bg-red-50 text-red-600 p-4 rounded-md">
          {error}
        </div>
      )}
      {success && (
        <div className="bg-green-50 text-green-600 p-4 rounded-md">
          {success}
        </div>
      )}

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Task Description
        </label>
        <textarea
          {...register('task_description', { required: 'Task description is required' })}
          rows={4}
          className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Assigned To Staff
        </label>
        <select
          {...register('assigned_to_staff_id', { required: 'Staff assignment is required' })}
          className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500"
        >
          <option value="">Select Staff Member</option>
          {staffOptions.map((staff) => (
            <option key={staff.id} value={staff.id}>
              {staff.first_name} {staff.last_name}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Due Date (Optional)
        </label>
        <input
          type="date"
          {...register('due_date')}
          className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Admin Remarks (Optional)
        </label>
        <textarea
          {...register('admin_remarks')}
          rows={3}
          className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500"
        />
      </div>

      <div className="flex items-center">
        <input
          type="checkbox"
          id="is_completed"
          {...register('is_completed')}
          className="rounded border-gray-300 text-amber-600 focus:ring-amber-500"
        />
        <label htmlFor="is_completed" className="ml-2 text-sm font-medium text-gray-700">
          Mark as Completed
        </label>
      </div>

      <div className="flex justify-end space-x-4">
        <Button
          type="button"
          variant="outline"
          onClick={() => navigate('/admin/todos')}
        >
          Cancel
        </Button>
        <Button type="submit" disabled={loading}>
          {loading ? 'Saving...' : id ? 'Update Task' : 'Create Task'}
        </Button>
      </div>
    </form>
  );
};

export default TodoForm;