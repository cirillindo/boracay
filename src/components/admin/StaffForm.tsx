import React, { useState, useEffect, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate, useParams } from 'react-router-dom';
import { useDropzone } from 'react-dropzone';
import { supabase } from '../../lib/supabase';
import Button from '../ui/Button';
import { uploadImage } from '../../lib/cloudinary';
import { ImageIcon, X } from 'lucide-react';

interface Staff {
  id?: string;
  user_id?: string;
  first_name: string;
  last_name: string;
  date_of_birth?: string;
  id_document_url?: string;
  phone_number?: string;
  whatsapp_number?: string;
  facebook_profile_url?: string;
  is_active: boolean;
  daily_salary_php?: number; // Added daily_salary_php to the interface
}

const StaffForm: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [idDocumentUrl, setIdDocumentUrl] = useState('');
  const { register, handleSubmit, setValue, reset } = useForm<Staff>();

  useEffect(() => {
    if (id) {
      loadStaff();
    }
  }, [id]);

  const loadStaff = useCallback(async () => {
    try {
      // Test basic connection first
      const { data: testData, error: testError } = await supabase
        .from('properties')
        .select('id')
        .limit(1);
      
      if (testError) {
        console.error('Supabase connection test failed:', testError);
        setError(`Database connection failed: ${testError.message}`);
        return;
      }

      // Now try to fetch staff data
      const { data, error } = await supabase
        .from('staff_details')
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        console.error('Staff load error:', error);
        if (error.code === 'PGRST116') {
          setError('The staff_details table does not exist. Please ensure the database migration has been run.');
        } else {
          setError(`Error loading staff: ${error.message}`);
        }
        return;
      }
      
      if (data) {
        reset(data);
        setIdDocumentUrl(data.id_document_url || '');
        // Format date for input type="date"
        if (data.date_of_birth) {
          setValue('date_of_birth', data.date_of_birth.split('T')[0]);
        }
      }
    } catch (err) {
      console.error('Unexpected load error:', err);
      setError(`Unexpected error loading staff: ${err instanceof Error ? err.message : 'Unknown error'}`);
    }
  }, [id, reset, setValue]);

  const onDrop = async (acceptedFiles: File[]) => {
    if (acceptedFiles.length === 0) return;

    setLoading(true);
    try {
      const uploadedUrl = await uploadImage(acceptedFiles[0]);
      setIdDocumentUrl(uploadedUrl);
      setValue('id_document_url', uploadedUrl);
    } catch (err) {
      setError('Error uploading ID document');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.webp'],
      'application/pdf': ['.pdf']
    },
    multiple: false
  });

  const removeIdDocument = () => {
    setIdDocumentUrl('');
    setValue('id_document_url', '');
  };

  const onSubmit = async (data: Staff) => {
    setLoading(true);
    setError('');

    try {
      const staffData = {
        ...data,
        id_document_url: idDocumentUrl,
        is_active: Boolean(data.is_active),
        // Ensure daily_salary_php is a number or null
        daily_salary_php: data.daily_salary_php === null || isNaN(data.daily_salary_php as number) ? null : data.daily_salary_php,
      };

      let saveError;
      if (id) {
        const { error } = await supabase
          .from('staff_details')
          .update(staffData)
          .eq('id', id);
        saveError = error;
      } else {
        const { error } = await supabase
          .from('staff_details')
          .insert([staffData]);
        saveError = error;
      }

      if (saveError) {
        console.error('Save error:', saveError);
        if (saveError.code === 'PGRST116') {
          setError('The staff_details table does not exist. Please ensure the database migration has been run.');
        } else {
          setError(`Error saving staff: ${saveError.message}`);
        }
        return;
      }
      
      navigate('/admin/staff');
    } catch (err: any) {
      console.error('Unexpected save error:', err);
      setError(`Unexpected error saving staff: ${err instanceof Error ? err.message : 'Unknown error'}`);
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

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            First Name
          </label>
          <input
            type="text"
            {...register('first_name', { required: 'First name is required' })}
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Last Name
          </label>
          <input
            type="text"
            {...register('last_name', { required: 'Last name is required' })}
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Date of Birth
        </label>
        <input
          type="date"
          {...register('date_of_birth')}
          className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          ID Document (Image or PDF)
        </label>
        {idDocumentUrl ? (
          <div className="relative aspect-video bg-gray-100 rounded-lg overflow-hidden mb-4">
            {idDocumentUrl.match(/\.(jpeg|jpg|png|webp)$/i) ? (
              <img
                src={idDocumentUrl}
                alt="ID Document"
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gray-200 text-gray-500">
                <div className="text-center">
                  <ImageIcon className="w-12 h-12 mx-auto mb-2" />
                  <p>ID Document Uploaded</p>
                </div>
              </div>
            )}
            <button
              type="button"
              onClick={removeIdDocument}
              className="absolute top-2 right-2 bg-red-500 text-white p-1.5 rounded-full"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <div
            {...getRootProps()}
            className={`aspect-video border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors duration-300 ${
              isDragActive
                ? 'border-amber-500 bg-amber-50'
                : 'border-gray-300 hover:border-amber-500 hover:bg-gray-50'
            }`}
          >
            <input {...getInputProps()} />
            <div className="flex flex-col items-center">
              <ImageIcon className="w-10 h-10 text-gray-400 mb-3" />
              <p className="text-gray-600">
                {isDragActive
                  ? 'Drop the file here...'
                  : 'Drag & drop ID document (image or PDF), or click to select'}
              </p>
            </div>
          </div>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Phone Number
        </label>
        <input
          type="text"
          {...register('phone_number')}
          className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500"
          placeholder="+63 912 345 6789"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          WhatsApp Number
        </label>
        <input
          type="text"
          {...register('whatsapp_number')}
          className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500"
          placeholder="+63 912 345 6789"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Facebook Profile URL
        </label>
        <input
          type="url"
          {...register('facebook_profile_url')}
          className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500"
          placeholder="https://facebook.com/username"
        />
      </div>

      {/* New Daily Salary Field */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Daily Salary (PHP)
        </label>
        <input
          type="number"
          step="0.01" // Allows decimal values for currency
          {...register('daily_salary_php', { valueAsNumber: true })} // Ensures value is treated as a number
          className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500"
          placeholder="e.g., 500.00"
        />
      </div>

      <div className="flex items-center">
        <input
          type="checkbox"
          id="is_active"
          {...register('is_active')}
          defaultChecked={true}
          className="rounded border-gray-300 text-amber-600 focus:ring-amber-500"
        />
        <label htmlFor="is_active" className="ml-2 text-sm font-medium text-gray-700">
          Is Active
        </label>
      </div>

      <div className="flex justify-end space-x-4">
        <Button
          type="button"
          variant="outline"
          onClick={() => navigate('/admin/staff')}
        >
          Cancel
        </Button>
        <Button type="submit" disabled={loading}>
          {loading ? 'Saving...' : id ? 'Update Staff' : 'Add Staff'}
        </Button>
      </div>
    </form>
  );
};

export default StaffForm;
