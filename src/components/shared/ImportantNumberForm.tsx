// src/components/shared/ImportantNumberForm.tsx
import React, { useState, useEffect, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate, useParams } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import Button from '../ui/Button';
import { AlertCircle, User, Phone, MessageCircle, Briefcase } from 'lucide-react';

interface ImportantNumber {
  id?: string;
  job: string;
  name: string;
  phone_number: string;
  fb_link?: string;
  user_id?: string; // Will be set automatically by RLS on insert
}

interface ImportantNumberFormProps {
  dashboardType: 'admin' | 'staff';
}

const JOB_OPTIONS = [
  { value: 'GCash', label: 'GCash' },
  { value: 'Air Con Specialist', label: 'Air Con Specialist' },
  { value: 'Vet', label: 'Vet' },
  { value: 'Clinic', label: 'Clinic' },
  { value: 'Electrician', label: 'Electrician' },
  { value: 'Plumber', label: 'Plumber' },
  { value: 'Carpenter', label: 'Carpenter' },
  { value: 'Pool technician', label: 'Pool technician' },
  { value: 'Massage', label: 'Massage' },
  { value: 'All doings', label: 'All doings' },
  { value: 'Contractors', label: 'Contractors' },
];

const ImportantNumberForm: React.FC<ImportantNumberFormProps> = ({ dashboardType }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const { register, handleSubmit, setValue, reset } = useForm<ImportantNumber>();

  useEffect(() => {
    if (id) {
      loadNumber();
    }
  }, [id]);

  const loadNumber = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('important_numbers')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      if (data) {
        reset(data);
      }
    } catch (err) {
      setError('Error loading important number.');
      console.error(err);
    }
  }, [id, reset]);

  const onSubmit = async (data: ImportantNumber) => {
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      // The user_id is handled by RLS policy on insert/update, so we don't explicitly set it here.
      const numberData = {
        job: data.job,
        name: data.name,
        phone_number: data.phone_number,
        fb_link: data.fb_link || null, // Ensure empty string becomes null
      };

      const { error: saveError } = id
        ? await supabase
            .from('important_numbers')
            .update(numberData)
            .eq('id', id)
        : await supabase
            .from('important_numbers')
            .insert([numberData]);

      if (saveError) throw saveError;
      
      setSuccess('Important number saved successfully!');
      setTimeout(() => {
        navigate(`/${dashboardType}/important-numbers`);
      }, 1500);

    } catch (err: any) {
      console.error('Save error:', err);
      setError(`Error saving important number: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const getBasePath = () => `/${dashboardType}/important-numbers`;

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
          Job
        </label>
        <div className="relative">
          <select
            {...register('job', { required: 'Job is required' })}
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500"
          >
            <option value="">Select a job</option>
            {JOB_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          <Briefcase className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Name
        </label>
        <div className="relative">
          <input
            type="text"
            {...register('name', { required: 'Name is required' })}
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500"
          />
          <User className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Phone Number
        </label>
        <div className="relative">
          <input
            type="text"
            {...register('phone_number', { required: 'Phone number is required' })}
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500"
            placeholder="+63 912 345 6789"
          />
          <Phone className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Facebook Link (Optional)
        </label>
        <div className="relative">
          <input
            type="url"
            {...register('fb_link')}
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500"
            placeholder="https://facebook.com/profile"
          />
          <MessageCircle className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
        </div>
      </div>

      <div className="flex justify-end space-x-4">
        <Button
          type="button"
          variant="outline"
          onClick={() => navigate(getBasePath())}
        >
          Cancel
        </Button>
        <Button type="submit" disabled={loading}>
          {loading ? 'Saving...' : id ? 'Update Number' : 'Add Number'}
        </Button>
      </div>
    </form>
  );
};

export default ImportantNumberForm;
