import React, { useState, useEffect, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate, useParams } from 'react-router-dom';
import { useDropzone } from 'react-dropzone';
import { supabase } from '../../lib/supabase';
import Button from '../ui/Button';
import { uploadImage } from '../../lib/cloudinary';
import { ImageIcon, X, Eye, EyeOff } from 'lucide-react';
import { Activity } from '../../types';
import RichTextEditor from './RichTextEditor';
import { generateSlug } from '../../utils/slugify';

const PRICE_TYPES = [
  { value: 'per_pax', label: 'Per Person' },
  { value: 'fixed_price', label: 'Fixed Price' },
  { value: 'per_duration', label: 'Per Duration' },
  { value: 'per_item', label: 'Per Item' }
];

const CATEGORIES = [
  { value: 'water_sports', label: 'Water Sports' },
  { value: 'wellness', label: 'Wellness' },
  { value: 'food_drink', label: 'Food & Drinks' },
  { value: 'transfer', label: 'Transfers' },
  { value: 'rental', label: 'Rentals' },
  { value: 'celebration', label: 'Celebration' },
  { value: 'party', label: 'Party' },
  { value: 'photoshoot', label: 'Photoshoot' },
  { value: 'cake', label: 'Cakes' },
  { value: 'drinks', label: 'Drinks' }
];

const ActivityForm: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [isOnline, setIsOnline] = useState(true);
  const [content, setContent] = useState('');
  const { register, handleSubmit, setValue, reset, watch } = useForm<Activity>();

  const loadActivity = useCallback(async () => {
    if (!id) return;

    try {
      const { data, error } = await supabase
        .from('activities')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      if (data) {
        reset(data);
        setImageUrl(data.hero_image || '');
        setContent(data.description || '');
        setIsOnline(data.is_online !== false); // Default to true if undefined
      }
    } catch (err) {
      setError('Error loading activity');
      console.error(err);
    }
  }, [id, reset]);

  useEffect(() => {
    loadActivity();
  }, [loadActivity]);

  const onDrop = async (acceptedFiles: File[]) => {
    if (acceptedFiles.length === 0) return;
    
    setLoading(true);
    try {
      const uploadedUrl = await uploadImage(acceptedFiles[0]);
      setImageUrl(uploadedUrl);
      setValue('hero_image', uploadedUrl);
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
    setValue('hero_image', '');
  };

  const onSubmit = async (data: Activity) => {
    setLoading(true);
    setError('');

    try {
      const activityData = {
        ...data,
        description: content,
        hero_image: imageUrl,
        is_online: isOnline,
        slug: generateSlug(data.name)
      };

      const { error: saveError } = id
        ? await supabase
            .from('activities')
            .update(activityData)
            .eq('id', id)
        : await supabase
            .from('activities')
            .insert([activityData]);

      if (saveError) throw saveError;
      navigate('/admin/activities');
    } catch (err: any) {
      setError(`Error saving activity: ${err.message}`);
      console.error('Save error:', err);
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
            Activity Name
          </label>
          <input
            type="text"
            {...register('name', { required: 'Name is required' })}
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Category
          </label>
          <select
            {...register('category', { required: 'Category is required' })}
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500"
          >
            <option value="">Select a category</option>
            {CATEGORIES.map(category => (
              <option key={category.value} value={category.value}>
                {category.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Price (PHP)
          </label>
          <input
            type="number"
            step="0.01"
            {...register('price_php', { 
              required: 'Price is required',
              valueAsNumber: true,
              min: { value: 0, message: 'Price must be positive' }
            })}
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Price Type
          </label>
          <select
            {...register('price_type', { required: 'Price type is required' })}
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500"
          >
            <option value="">Select a price type</option>
            {PRICE_TYPES.map(type => (
              <option key={type.value} value={type.value}>
                {type.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Minimum Participants
          </label>
          <input
            type="number"
            {...register('min_pax', { 
              valueAsNumber: true,
              min: { value: 1, message: 'Minimum participants must be at least 1' }
            })}
            defaultValue={1}
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Maximum Participants (optional)
          </label>
          <input
            type="number"
            {...register('max_pax', { 
              valueAsNumber: true,
              min: { value: 0, message: 'Maximum participants must be positive' }
            })}
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Duration (minutes, optional)
          </label>
          <input
            type="number"
            {...register('duration_minutes', { 
              valueAsNumber: true,
              min: { value: 0, message: 'Duration must be positive' }
            })}
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500"
          />
        </div>

        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Description
          </label>
          <div className="h-40">
            <RichTextEditor 
              content={content} 
              onChange={setContent}
            />
          </div>
        </div>

        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Featured Image
          </label>
          
          {imageUrl ? (
            <div className="relative aspect-video bg-gray-100 rounded-lg overflow-hidden mb-4">
              <img
                src={imageUrl}
                alt="Featured"
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
                    ? 'Drop the image here...'
                    : 'Drag & drop an image here, or click to select'}
                </p>
              </div>
            </div>
          )}
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center">
            <input
              type="checkbox"
              id="is_top_product"
              {...register('is_top_product')}
              className="rounded border-gray-300 text-amber-600 focus:ring-amber-500"
            />
            <label htmlFor="is_top_product" className="ml-2 text-sm text-gray-700">
              Top Product
            </label>
          </div>
          
          <div className="flex items-center">
            <input
              type="checkbox"
              id="is_most_sold"
              {...register('is_most_sold')}
              className="rounded border-gray-300 text-amber-600 focus:ring-amber-500"
            />
            <label htmlFor="is_most_sold" className="ml-2 text-sm text-gray-700">
              Most Sold
            </label>
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="flex items-center">
            <input
              type="checkbox"
              id="is_online"
              checked={isOnline}
              onChange={(e) => setIsOnline(e.target.checked)}
              className="rounded border-gray-300 text-amber-600 focus:ring-amber-500"
            />
            <label htmlFor="is_online" className="ml-2 text-sm text-gray-700">
              {isOnline ? (
                <span className="flex items-center gap-1">
                  <Eye className="w-4 h-4 text-green-600" />
                  Visible on website
                </span>
              ) : (
                <span className="flex items-center gap-1">
                  <EyeOff className="w-4 h-4 text-gray-500" />
                  Hidden from website
                </span>
              )}
            </label>
          </div>
        </div>
      </div>

      <div className="flex justify-end space-x-4">
        <Button
          type="button"
          variant="outline"
          onClick={() => navigate('/admin/activities')}
        >
          Cancel
        </Button>
        <Button
          type="submit"
          disabled={loading}
        >
          {loading ? 'Saving...' : id ? 'Update Activity' : 'Create Activity'}
        </Button>
      </div>
    </form>
  );
};

export default ActivityForm;