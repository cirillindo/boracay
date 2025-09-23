import React, { useState, useEffect, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate, useParams } from 'react-router-dom';
import { useDropzone } from 'react-dropzone';
import { supabase } from '../../lib/supabase';
import Button from '../ui/Button';
import { uploadImage } from '../../lib/cloudinary';
import { ImageIcon, X, Plus, Trash2, Minus, DollarSign, Info, Bug } from 'lucide-react';
import { Package, Activity, PackageActivityItem } from '../../types';
import { generateSlug } from '../../utils/slugify';
import Select from 'react-select';
import RichTextEditor from './RichTextEditor';

// Define interfaces for activity options and selected activities
interface ActivityOption {
  value: string;
  label: string;
  price: number;
  category: string;
  min_pax?: number;
}

interface SelectedActivity extends ActivityOption {
  notes: string;
  custom_price?: number;
}

const PackageForm: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [minPax, setMinPax] = useState<number>(2);
  const [maxPax, setMaxPax] = useState<number | null>(null);
  const [minNights, setMinNights] = useState<number>(2);
  const [maxNights, setMaxNights] = useState<number | null>(null);
  const [whatsappNumber, setWhatsappNumber] = useState<string>('+639617928834');
  const [grandTotal, setGrandTotal] = useState<number>(0);
  const [isSoldOut, setIsSoldOut] = useState(false);
  const [description, setDescription] = useState('');
  const [activities, setActivities] = useState<ActivityOption[]>([]);
  const [selectedActivities, setSelectedActivities] = useState<SelectedActivity[]>([]);
  const [selectInputValue, setSelectInputValue] = useState<ActivityOption | null>(null);
  const [expandedPackageActivities, setExpandedPackageActivities] = useState<Record<string, boolean>>({});
  const { register, handleSubmit, setValue, reset, watch } = useForm<Package>();

  const loadPackage = useCallback(async () => {
    if (!id) return;

    try {
      // Load package data
      const { data: packageData, error: packageError } = await supabase
        .from('packages')
        .select('*')
        .eq('id', id)
        .single();

      if (packageError) throw packageError;
      
      if (packageData) {
        console.log('Package data loaded:', packageData);
        reset(packageData);
        setImageUrl(packageData.hero_image || '');
        setMinPax(packageData.min_pax || 2);
        setMaxPax(packageData.max_pax || null);
        setMinNights(packageData.min_nights || 2);
        setMaxNights(packageData.max_nights || null);
        setWhatsappNumber(packageData.whatsapp_number || '+639617928834');
        setIsSoldOut(packageData.is_sold_out || false);
        setDescription(packageData.description || '');
        setExpandedPackageActivities({ [packageData.id]: true });
        
        // Load package activities
        const { data: packageActivities, error: activitiesError } = await supabase
          .from('package_activity_items')
          .select(`
            activity_id,
            quantity,
            notes,
            custom_price,
            activities (
              id,
              name,
              price_php,
              category
            )
          `)
          .eq('package_id', id);
          
        if (activitiesError) throw activitiesError;
        console.log('Package activities data:', packageActivities);
        
        if (packageActivities) {
          const selectedItems: SelectedActivity[] = packageActivities.map(item => ({
            value: item.activity_id,
            label: item.activities.name,
            price: item.activities.price_php,
            category: item.activities.category,
            min_pax: item.activities.min_pax || 1,
            notes: item.notes || '',
            custom_price: item.custom_price
          }));
          
          console.log('Selected activities to set:', selectedItems);
          setSelectedActivities(selectedItems);
        }
      }
    } catch (err) {
      setError('Error loading package');
      console.error(err);
    }
  }, [id, reset]);

  const loadActivities = async () => {
    try {
      const { data, error } = await supabase
        .from('activities')
        .select('id, name, price_php, category, min_pax')
        .order('category')
        .order('name');

      if (error) throw error;
      
      if (data) {
        const options: ActivityOption[] = data.map(activity => ({
          value: activity.id,
          label: activity.name,
          price: activity.price_php,
          category: activity.category,
          min_pax: activity.min_pax || 1
        }));
        
        setActivities(options);
      }
    } catch (err) {
      console.error('Error loading activities:', err);
    }
  };

  useEffect(() => {
    loadActivities();
    loadPackage();
  }, [loadPackage]);

  // Calculate grand total whenever relevant values change
  useEffect(() => {
    calculateGrandTotal();
  }, [selectedActivities, minPax, minNights, watch('base_price_php')]);

  const calculateGrandTotal = () => {
    // Base package price calculation
    const basePrice = watch('base_price_php') || 0;
    const baseTotal = basePrice * minPax * minNights;
    
    // Calculate total from selected activities
    let activitiesTotal = 0;
    
    selectedActivities.forEach(activity => {
      const price = activity.custom_price || activity.price;
      activitiesTotal += price * minPax;
    });
    
    setGrandTotal(baseTotal + activitiesTotal);
  };

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

  const handleActivityChange = useCallback((selected: ActivityOption | null) => {
    if (!selected) return;
    
    // Check if activity is already selected - if so, show a message or highlight it
    const isAlreadySelected = selectedActivities.some(item => item.value === selected.value);
    console.log('Activity selected from dropdown:', selected.label);
    console.log('Is activity already selected?', isAlreadySelected);
    
    if (isAlreadySelected) {
      // Optionally show a message that this activity is already selected
      console.log('Activity already selected');
      setSelectInputValue(null);
      return;
    }
    
    setSelectedActivities(prev => [
      ...prev,
      {
        ...selected,
        notes: '',
        custom_price: undefined
      }
    ]);
    
    // Clear the select input after adding
    setSelectInputValue(null);
  }, [selectedActivities]);

  const handleActivityCustomPriceChange = (activityId: string, price: number | undefined) => {
    console.log('Changing custom price for activity:', activityId, 'to', price);
    setSelectedActivities(prev => prev.map(item => 
      item.value === activityId 
        ? { ...item, custom_price: price } 
        : item
    ));
  };

  const handleActivityNotesChange = (activityId: string, notes: string) => {
    console.log('Changing notes for activity:', activityId, 'to', notes);
    setSelectedActivities(prev => 
      prev.map(item => 
        item.value === activityId 
          ? { ...item, notes } 
          : item
      )
    );
  };

  const removeActivity = (activityId: string) => {
    console.log('Removing activity:', activityId);
    setSelectedActivities(prev => prev.filter(item => item.value !== activityId));
  };

  const onSubmit = async (data: Package) => {
    setLoading(true);
    setError('');

    try {
      const packageData = {
        ...data,
        hero_image: imageUrl,
        description: description,
        min_pax: minPax,
        max_pax: maxPax,
        min_nights: minNights,
        max_nights: maxNights,
        whatsapp_number: whatsappNumber,
        is_sold_out: isSoldOut,
        slug: generateSlug(data.name)
      };

      let packageId = id;
      
      if (id) {
        // Update existing package
        const { error: updateError } = await supabase
          .from('packages')
          .update(packageData)
          .eq('id', id);
          
        if (updateError) throw updateError;
      } else {
        // Insert new package
        const { data: newPackage, error: insertError } = await supabase
          .from('packages')
          .insert([packageData])
          .select()
          .single();
          
        if (insertError) throw insertError;
        packageId = newPackage.id;
      }
      
      if (packageId) {
        // First, delete all existing package activity items
        console.log('Deleting existing package activity items for package:', packageId);
        const { error: deleteError } = await supabase
          .from('package_activity_items')
          .delete()
          .eq('package_id', packageId);
          
        if (deleteError) throw deleteError;
        
        // Then insert new package activity items
        console.log('Creating package activity items:', selectedActivities.length);
        const packageActivityItems = selectedActivities.map(activity => ({
          package_id: packageId as string,
          activity_id: activity.value,
          quantity: minPax,
          notes: activity.notes,
          custom_price: activity.custom_price
        }));
        
        const { error: insertItemsError } = await supabase
          .from('package_activity_items')
          .insert(packageActivityItems);
          
        if (insertItemsError) throw insertItemsError;
      }

      navigate('/admin/packages');
    } catch (err: any) {
      // Check for duplicate slug error
      if (err.code === '23505' && err.message.includes('packages_slug_key')) {
        setError('A package with this name already exists. Please choose a different name.');
      } else {
        setError(`Error saving package: ${err.message}`);
      }
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

      <div className="grid grid-cols-1 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Package Name
          </label>
          <input
            type="text"
            {...register('name', { required: 'Name is required' })}
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Base Price per Person for Package Duration (PHP)
          </label>
          <input
            type="number"
            step="0.01"
            {...register('base_price_php', { 
              required: 'Base price is required',
              valueAsNumber: true,
              min: { value: 0, message: 'Base price must be positive' }
            })}
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Promo Code (Optional)
            </label>
            <input
              type="text"
              {...register('promo_code')}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500"
              placeholder="e.g., SUMMER20"
            />
            <p className="mt-1 text-sm text-gray-500">
              Enter a unique promo code for this package
            </p>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Discount Percentage (Optional)
            </label>
            <input
              type="number"
              step="1"
              min="0"
              max="100"
              {...register('promo_discount_percentage', { 
                valueAsNumber: true,
                min: { value: 0, message: 'Discount must be 0 or greater' },
                max: { value: 100, message: 'Discount cannot exceed 100%' }
              })}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500"
              placeholder="e.g., 10"
            />
            <p className="mt-1 text-sm text-gray-500">
              Enter discount percentage (0-100%)
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Minimum Participants
            </label>
            <input
              type="number"
              min={1}
              value={minPax}
              onChange={(e) => setMinPax(parseInt(e.target.value) || 2)}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Maximum Participants (optional)
            </label>
            <input
              type="number"
              min={1}
              value={maxPax || ''}
              onChange={(e) => setMaxPax(e.target.value ? parseInt(e.target.value) : null)}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Minimum Nights
            </label>
            <input
              type="number"
              min={1}
              value={minNights}
              onChange={(e) => setMinNights(parseInt(e.target.value) || 2)}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Maximum Nights (optional)
            </label>
            <input
              type="number"
              min={1}
              value={maxNights || ''}
              onChange={(e) => setMaxNights(e.target.value ? parseInt(e.target.value) : null)}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
          </div>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            WhatsApp Contact Number
          </label>
          <select
            value={whatsappNumber}
            onChange={(e) => setWhatsappNumber(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500"
          >
            <option value="+639617928834">+639617928834 (English/Italian)</option>
            <option value="+79096556608">+79096556608 (Russian)</option>
          </select>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center">
            <input
              type="checkbox"
              id="is_sold_out"
              {...register('is_sold_out')}
              className="rounded border-gray-300 text-amber-600 focus:ring-amber-500"
            />
            <label htmlFor="is_sold_out" className="ml-2 text-sm text-gray-700">
              Sold Out
            </label>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Description
          </label>
          <div className="h-40">
            <RichTextEditor 
              content={description} 
              onChange={setDescription}
            />
          </div>
        </div>

        <div>
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
                <p className="text-gray-500">
                  {isDragActive
                    ? 'Drop the image here...'
                    : 'Drag & drop an image here, or click to select one'}
                </p>
              </div>
            </div>
          )}
        </div>

        {id && (
          <div className="mb-6">
            <Button
              type="submit"
              disabled={loading}
              className="w-full"
            >
              {loading ? 'Saving...' : 'Update Package'}
            </Button>
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Activities
            <span className="ml-2 text-xs text-gray-500">(Select activities from the dropdown to add to this package)</span>
          </label>
          <Select
            options={activities}
            onChange={handleActivityChange}
            value={selectInputValue}
            className="mb-4"
            placeholder="Select an activity to add to this package..."
          />

          {selectedActivities.length > 0 ? (
            <div className="space-y-6 border rounded-lg p-4 bg-gray-50">
              <div className="flex items-center gap-2 mb-2">
                <Info className="w-5 h-5 text-amber-600" />
                <span className="text-sm font-medium text-amber-700">Selected activities ({selectedActivities.length})</span>
              </div>
              {selectedActivities.map((activity) => (
                <div 
                  key={activity.value}
                  className="bg-white border rounded-lg p-4 shadow-sm hover:shadow-md transition-all duration-300"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h4 className="font-medium text-gray-900">{activity.label}</h4>
                        <span className="bg-blue-100 text-blue-800 text-xs px-2 py-0.5 rounded-full">
                          {activity.category.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-sm text-gray-500">
                          Default price: ₱{activity.price.toLocaleString()} per {activity.min_pax > 1 ? `${activity.min_pax} pax` : 'person'}
                        </span>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeActivity(activity.value)}
                      className="text-red-500 hover:text-red-700 p-1 hover:bg-red-50 rounded-full transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="block text-sm font-medium text-gray-700">
                        Custom Price (override default)
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <DollarSign className="h-4 w-4 text-gray-400" />
                        </div>
                        <input
                          type="number"
                          min={0}
                          step="0.01"
                          value={activity.custom_price || ''}
                          onChange={(e) => handleActivityCustomPriceChange(
                            activity.value, 
                            e.target.value ? parseFloat(e.target.value) : undefined
                          )}
                          className="pl-10 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500"
                          placeholder={`Default: ₱${activity.price.toLocaleString()}`}
                        />
                      </div>
                      <p className="text-xs text-gray-500">
                        Leave empty to use default price
                      </p>
                    </div>
                  </div>
                  
                  <div className="mt-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Notes
                      </label>
                      <input
                        type="text"
                        value={activity.notes}
                        onChange={(e) => handleActivityNotesChange(activity.value, e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500"
                        placeholder="Optional notes about this activity in the package..."
                      />
                    </div>
                  </div>
                  
                  <div className="mt-4 pt-3 border-t border-gray-100 flex justify-between items-center">
                    <div className="text-sm text-gray-500">
                      Total for this activity:
                    </div>
                    <div className="font-medium text-amber-600">
                      ₱{((activity.custom_price || activity.price) * minPax).toLocaleString()}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-4">
              No activities added yet
            </p>
          )}
          
          {selectedActivities.length > 0 && (
            <>
              <div className="mt-6 bg-amber-50 p-4 rounded-lg border border-amber-200">
                <div className="flex justify-between items-center">
                  <div className="text-sm font-medium text-amber-800">
                    Activities total:
                  </div>
                  <div className="text-lg font-bold text-amber-800">
                    ₱{selectedActivities.reduce((sum, activity) => 
                      sum + ((activity.custom_price || activity.price) * minPax), 0).toLocaleString()}
                  </div>
                </div>
              </div>
              
              {/* Grand Total Display */}
              <div className="mt-6 bg-amber-50 p-4 rounded-lg">
                <div className="flex justify-between items-center">
                  <div className="text-sm font-medium text-amber-800">
                    Grand Total:
                  </div>
                  <div className="text-lg font-bold text-amber-800">
                    ₱{grandTotal.toLocaleString()}
                  </div>
                </div>
                <div className="mt-2 text-xs text-amber-700">
                  <p>Base price: ₱{((watch('base_price_php') || 0) * minPax * minNights).toLocaleString()} (₱{(watch('base_price_php') || 0).toLocaleString()} × {minPax} {minPax === 1 ? 'person' : 'people'} × {minNights} {minNights === 1 ? 'night' : 'nights'})</p>
                  <p>For {minPax} {minPax === 1 ? 'person' : 'people'}</p>
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      <div className="flex items-center gap-4 mt-4">
        <div className="flex items-center">
          <input
            type="checkbox" 
            id="is_sold_out" 
            checked={isSoldOut} 
            onChange={(e) => setIsSoldOut(e.target.checked)} 
            className="rounded border-gray-300 text-amber-600 focus:ring-amber-500" 
          />
          <label htmlFor="is_sold_out" className="ml-2 text-sm text-gray-700">
            Mark as Sold Out
          </label>
        </div>
      </div>

      <div className="flex justify-end space-x-4">
        <Button
          type="button"
          variant="outline"
          onClick={() => navigate('/admin/packages')}
        >
          Cancel
        </Button>
        <Button
          type="submit"
          disabled={loading}
        >
          {loading ? 'Saving...' : id ? 'Update Package' : 'Create Package'}
        </Button>
      </div>
    </form>
  );
};

export default PackageForm;