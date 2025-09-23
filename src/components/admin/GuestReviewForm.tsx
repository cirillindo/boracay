import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate, useParams } from 'react-router-dom';
import { useDropzone } from 'react-dropzone';
import { supabase } from '../../lib/supabase';
import Button from '../ui/Button';
import { uploadImage } from '../../lib/cloudinary';
import { ImageIcon, X } from 'lucide-react';

interface GuestReview {
  id?: string;
  reviewer_name: string;
  review_text: string;
  rating: number;
  review_period?: string;
  profile_image_url?: string;
  country?: string;
}

const GuestReviewForm: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const { register, handleSubmit, setValue, reset } = useForm<GuestReview>();

  useEffect(() => {
    if (id) {
      loadReview();
    }
  }, [id]);

  const loadReview = async () => {
    try {
      const { data, error } = await supabase
        .from('guest_reviews')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      if (data) {
        reset(data);
        setImageUrl(data.profile_image_url || '');
      }
    } catch (err) {
      setError('Error loading review');
      console.error(err);
    }
  };

  const onDrop = async (acceptedFiles: File[]) => {
    if (acceptedFiles.length === 0) return;
    
    setLoading(true);
    try {
      const uploadedUrl = await uploadImage(acceptedFiles[0]);
      setImageUrl(uploadedUrl);
      setValue('profile_image_url', uploadedUrl);
    } catch (err) {
      setError('Error uploading image');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.webp']
    },
    multiple: false
  });

  const removeImage = () => {
    setImageUrl('');
    setValue('profile_image_url', '');
  };

  const onSubmit = async (data: GuestReview) => {
    setLoading(true);
    setError('');

    try {
      const reviewData = {
        ...data,
        user_id: (await supabase.auth.getUser()).data.user?.id,
        profile_image_url: imageUrl
      };

      const { error: saveError } = id
        ? await supabase
            .from('guest_reviews')
            .update(reviewData)
            .eq('id', id)
        : await supabase
            .from('guest_reviews')
            .insert([reviewData]);

      if (saveError) throw saveError;
      navigate('/admin/reviews');
    } catch (err: any) {
      setError(`Error saving review: ${err.message}`);
      console.error('Save error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 max-w-3xl">
      {error && (
        <div className="bg-red-50 text-red-600 p-4 rounded-md">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Profile Image
          </label>
          
          {imageUrl ? (
            <div className="relative w-32 h-32 bg-gray-100 rounded-full overflow-hidden mb-4">
              <img
                src={imageUrl}
                alt="Profile"
                className="w-full h-full object-cover"
              />
              <button
                type="button"
                onClick={removeImage}
                className="absolute top-2 right-2 bg-red-500 text-white p-1.5 rounded-full"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div
              {...getRootProps()}
              className={`w-32 h-32 border-2 border-dashed rounded-full p-4 text-center cursor-pointer transition-colors duration-300 ${
                isDragActive
                  ? 'border-amber-500 bg-amber-50'
                  : 'border-gray-300 hover:border-amber-500 hover:bg-gray-50'
              }`}
            >
              <input {...getInputProps()} />
              <div className="flex flex-col items-center">
                <ImageIcon className="w-8 h-8 text-gray-400 mb-2" />
                <p className="text-xs text-gray-600">
                  {isDragActive
                    ? 'Drop the image here...'
                    : 'Upload profile photo'}
                </p>
              </div>
            </div>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Reviewer Name
          </label>
          <input
            type="text"
            {...register('reviewer_name', { required: 'Name is required' })}
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Country
          </label>
          <input
            type="text"
            {...register('country')}
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500"
            placeholder="e.g., United Kingdom"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Review Text
          </label>
          <textarea
            {...register('review_text', { required: 'Review text is required' })}
            rows={5}
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Rating
            </label>
            <select
              {...register('rating', { required: 'Rating is required' })}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500"
            >
              <option value="5">5 Stars</option>
              <option value="4">4 Stars</option>
              <option value="3">3 Stars</option>
              <option value="2">2 Stars</option>
              <option value="1">1 Star</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Review Period
            </label>
            <input
              type="text"
              {...register('review_period')}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500"
              placeholder="e.g., March 2025"
            />
          </div>
        </div>

        <div className="flex justify-end space-x-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate('/admin/reviews')}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={loading}
          >
            {loading ? 'Saving...' : 'Save Review'}
          </Button>
        </div>
      </div>
    </form>
  );
};

export default GuestReviewForm;