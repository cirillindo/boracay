// src/components/admin/PropertyForm.tsx
import React, { useState, useEffect, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate, useParams } from 'react-router-dom';
import { useDropzone } from 'react-dropzone';
import { supabase } from '../../lib/supabase';
import Button from '../ui/Button';
import { Property } from '../../types';
import {
  Upload, X, Image as ImageIcon, GripVertical, Wifi, AirVent, Umbrella, Trees as Tree,
  Camera, Bed, Sofa, Briefcase, ShowerHead, Scissors, Bath, Clock, CalendarClock,
  Flame, Refrigerator, Coffee, UtensilsCrossed, Utensils, PawPrint, Key, Users,
  Home, Users2, Luggage, Cigarette, Siren as Fire, DollarSign, Stars as Stairs,
  Armchair as Wheelchair, FileIcon, Link as LinkIcon
} from 'lucide-react';
import { uploadImage, uploadPdf } from '../../lib/cloudinary';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Leaflet icon configuration
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const FEATURES_CONFIG = {
  special: {
    title: 'Special Features',
    items: {
      internet: { icon: Wifi, label: 'Internet', type: 'text', placeholder: '50-60 Mbps', default: '50-60 Mbps' },
      airConditioned: { icon: AirVent, label: 'Air-Conditioned', type: 'boolean', default: true },
      privateTerrace: { icon: Umbrella, label: 'Private Terrace', type: 'boolean', default: true },
      gardenAccess: { icon: Tree, label: 'Garden Access', type: 'boolean', default: true },
      cctv: { icon: Camera, label: 'CCTV', type: 'boolean', default: true }
    }
  },
  bedroom: {
    title: 'Bedroom',
    items: {
      kingBeds: { icon: Bed, label: 'King Beds', type: 'number', default: 1 },
      queenBeds: { icon: Bed, label: 'Queen Beds', type: 'number', default: 0 },
      sofaBeds: { icon: Sofa, label: 'Sofa Beds', type: 'number', default: 1 },
      closetStorage: { icon: Briefcase, label: 'Closet / Storage', type: 'boolean', default: true },
      workDesk: { icon: Briefcase, label: 'Work Desk', type: 'boolean', default: true }
    }
  },
  bathroom: {
    title: 'Bathroom',
    items: {
      showers: { icon: ShowerHead, label: 'Showers', type: 'number', default: 1 },
      hairDryer: { icon: Scissors, label: 'Hair Dryer', type: 'boolean', default: true },
      toiletries: { icon: Bath, label: 'Toiletries', type: 'boolean', default: true },
      towelChangeFrequency: { icon: Clock, label: 'Towel Change Frequency (days)', type: 'number', default: 4 },
      bedSheetChangeFrequency: { icon: CalendarClock, label: 'Bed Sheet Change Frequency (days)', type: 'number', default: 4 }
    }
  },
  kitchen: {
    title: 'Kitchen',
    items: {
      stoveOven: { icon: Flame, label: 'Stove + Oven', type: 'boolean', default: true },
      refrigeratorFreezer: { icon: Refrigerator, label: 'Refrigerator + Freezer', type: 'boolean', default: true },
      coffeeMaker: { icon: Coffee, label: 'Coffee Maker', type: 'boolean', default: true },
      riceCooker: { icon: UtensilsCrossed, label: 'Rice Cooker', type: 'boolean', default: true },
      cutleryPlates: { icon: Utensils, label: 'Cutlery & Plates', type: 'boolean', default: true }
    }
  },
  general: {
    title: 'General',
    items: {
      petsAllowed: { icon: PawPrint, label: 'Pets Allowed', type: 'boolean', default: false },
      selfCheckIn: { icon: Key, label: 'Self Check-In', type: 'boolean', default: true },
      staffOnSite: { icon: Users, label: 'Staff on Site', type: 'boolean', default: true },
      longTermRental: { icon: Home, label: 'Long-Term Rental Available', type: 'boolean', default: true }
    }
  },
  optional: {
    title: 'Optional',
    items: {
      maxGuests: { icon: Users2, label: 'Max Guests', type: 'number', default: 4 },
      luggageDropOff: { icon: Luggage, label: 'Luggage Drop-Off', type: 'boolean', default: true },
      smokeAlarm: { icon: Cigarette, label: 'Smoke Alarm', type: 'boolean', default: true },
      fireExtinguisher: { icon: Fire, label: 'Fire Extinguisher', type: 'boolean', default: true },
      cleaningFee: { icon: DollarSign, label: 'Cleaning Fee Applies', type: 'boolean', default: true },
      stairsElevator: { icon: Stairs, label: 'Access via', type: 'select', options: ['Stairs', 'Elevator'], default: 'Stairs' },
      wheelchairAccessible: { icon: Wheelchair, label: 'Wheelchair Accessible', type: 'boolean', default: false }
    }
  }
};

const DEFAULT_POLICY = {
  mandatoryServices: [
    {
      name: 'Final Cleaning',
      value: 'PHP 1,000 to 1,500 / Booking (depending on room size)'
    },
    {
      name: 'Linen & Towel Change',
      value: 'Every 4 days'
    },
    {
      name: 'Extra Linen/Towel Refresh',
      value: 'PHP 500 (upon request)'
    },
    {
      name: 'No Pets Allowed',
      value: 'Not permitted'
    },
    {
      name: 'Credit Card / PayPal Transaction Fee',
      value: '4.5% of total booking'
    },
    {
      name: 'Date Alteration',
      value: 'Not Allowed for Promo Rates'
    }
  ],
  schedule: {
    checkIn: 'From 14:00 to 00:00 — Every day',
    checkOut: 'Before 11:00'
  },
  cancellation: {
    policies: [
      {
        period: '14+ days before check-in',
        charge: 'Full refund'
      },
      {
        period: '7–14 days before check-in',
        charge: '50% refund'
      },
      {
        period: 'Less than 7 days before check-in',
        charge: 'No refund'
      },
      {
        period: 'Promo Rates',
        charge: 'Always non-refundable'
      }
    ]
  }
};

const LocationMarker: React.FC<{
  position: [number, number];
  onPositionChange: (position: [number, number]) => void;
}> = ({ position, onPositionChange }) => {
  useMapEvents({
    click(e) {
      onPositionChange([e.latlng.lat, e.latlng.lng]);
    },
  });

  return <Marker position={position} />;
};

const OG_LOCALES = [
  { value: 'en_PH', label: 'English (Philippines)' },
  { value: 'en_US', label: 'English (US)' },
  { value: 'ru_RU', label: 'Russian' },
  { value: 'zh_CN', label: 'Chinese (Simplified)' }
];

// Define a type for client profiles
interface ClientProfile {
  id: string;
  username: string;
  first_name?: string;
  last_name?: string;
}

export const PropertyForm: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [images, setImages] = useState<Array<{ url: string; alt: string }>>([]);
  const [gridPhoto, setGridPhoto] = useState<string>('');
  const [description, setDescription] = useState('');
  const [pdfFile, setPdfFile] = useState<{ url: string; name: string } | null>(null);
  const [markerPosition, setMarkerPosition] = useState<[number, number]>([11.9929, 121.9124]);
  const [clients, setClients] = useState<ClientProfile[]>([]); // State to store client list

  const { register, handleSubmit, reset, setValue, watch, formState: { errors } } = useForm<Property>({
    defaultValues: {
      is_for_sale: true,
      is_for_rent: false,
      rating: 5,
      og_type: 'website',
      location: 'Diniwid',
      location_name: 'Diniwid - Boracay Island',
      policy: DEFAULT_POLICY,
      monthly_income_from_rent: null,
      is_live_in_friendly: false,
      status: 'available', // Default status
      user_id: null, // Default user_id to null
    }
  });

  const isForRent = watch('is_for_rent');
  const slug = watch('slug');

  useEffect(() => {
    if (slug) {
      const baseUrl = window.location.origin;
      const ogUrl = `${baseUrl}/property/${slug}`;
      setValue('og_url', ogUrl);
    }
  }, [slug, setValue]);

  useEffect(() => {
    loadClients(); // Load clients on component mount
    if (id) {
      loadProperty();
    } else {
      Object.entries(FEATURES_CONFIG).forEach(([category, { items }]) => {
        Object.entries(items).forEach(([key, config]) => {
          setValue(`features.${category}.${key}`, config.default);
        });
      });
    }
  }, [id, setValue]); // Removed 'clients' from dependency array

  // Function to load clients from Supabase
  const loadClients = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, username, first_name, last_name')
        .eq('role', 'client')
        .order('username', { ascending: true });

      if (error) {
        console.error('Error loading clients:', error);
        setError('Failed to load client list for assignment: ' + error.message);
      } else {
        setClients(data || []);
        console.log("Loaded clients:", data); // Debugging log
      }
    } catch (err) {
      console.error('Unexpected error loading clients:', err);
      setError('An unexpected error occurred while loading clients.');
    }
  };

  const loadProperty = async () => {
    try {
      const { data, error } = await supabase
        .from('properties')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      if (data) {
        reset({
          ...data,
          monthly_income_from_rent: data.monthly_income_from_rent || null,
          is_live_in_friendly: data.is_live_in_friendly || false,
          status: data.status || 'available', // Ensure status is loaded
          user_id: data.user_id || null, // Load assigned user_id
        });

        if (data.images) {
          if (Array.isArray(data.images) && data.images.length > 0) {
            if (typeof data.images[0] === 'object' && data.images[0].url) {
              setImages(data.images);
            } else {
              const convertedImages = data.images.map((url: string, index: number) => ({
                url,
                alt: `${data.title} - Image ${index + 1}`
              }));
              setImages(convertedImages);
            }
          }
        }

        setGridPhoto(data.grid_photo || '');
        setDescription(data.description || '');

        if (data.pdf_url) {
          setPdfFile({ url: data.pdf_url, name: data.pdf_name || '' });
        }

        if (data.map_coordinates) {
          const [lng, lat] = data.map_coordinates.coordinates;
          setMarkerPosition([lat, lng]);
        }

        if (data.slug) {
          const baseUrl = window.location.origin;
          const ogUrl = `${baseUrl}/property/${data.slug}`;
          setValue('og_url', ogUrl);
        }

        if (data.features) {
          Object.entries(FEATURES_CONFIG).forEach(([category, { items }]) => {
            Object.entries(items).forEach(([key, config]) => {
              const value = data.features?.[category]?.[key];
              setValue(`features.${category}.${key}`, value ?? config.default);
            });
          });
        }

        if (!data.policy) {
          setValue('policy', DEFAULT_POLICY);
        }
      }
    } catch (err) {
      setError('Error loading property');
      console.error(err);
    }
  };

  const generateAltText = (filename: string, index: number): string => {
    const nameWithoutExt = filename.split('.')[0];
    const cleanName = nameWithoutExt
      .replace(/[_-]/g, ' ')
      .replace(/\b\w/g, l => l.toUpperCase());

    return `${cleanName} - Property Image ${index + 1}`;
  };

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    setLoading(true);
    try {
      const uploadPromises = acceptedFiles.map(async (file, index) => {
        const url = await uploadImage(file);
        const alt = generateAltText(file.name, images.length + index);

        return new Promise<{ url: string; alt: string; width: number; height: number }>((resolve) => {
          const img = new Image();
          img.onload = () => {
            resolve({
              url,
              alt,
              width: img.width,
              height: img.height
            });
          };
          img.src = url;
        });
      });

      const uploadedImages = await Promise.all(uploadPromises);
      const newImages = uploadedImages.map(({ url, alt }) => ({ url, alt }));

      setImages(prev => [...prev, ...newImages]);
      setValue('photo_dimensions', uploadedImages.map(({ width, height }) => ({ width, height })));
    } catch (err) {
      setError('Error uploading images');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [setValue, images.length]);

  const onDropGridPhoto = useCallback(async (acceptedFiles: File[]) => {
    if (acceptedFiles.length === 0) return;

    setLoading(true);
    try {
      const uploadedUrl = await uploadImage(acceptedFiles[0]);
      setGridPhoto(uploadedUrl);
      setValue('grid_photo', uploadedUrl);
      setValue('og_image', uploadedUrl);
    } catch (err) {
      setError('Error uploading grid photo');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [setValue]);

  const onDropPdf = useCallback(async (acceptedFiles: File[]) => {
    if (acceptedFiles.length === 0) return;

    setLoading(true);
    try {
      const file = acceptedFiles[0];
      const uploadedUrl = await uploadPdf(file);
      setPdfFile({ url: uploadedUrl, name: file.name });

      setValue('pdf_url', uploadedUrl);
      setValue('pdf_name', file.name);
    } catch (err) {
      setError('Error uploading PDF');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [setValue]);

  const removePdf = () => {
    setPdfFile(null);
    setValue('pdf_url', '');
    setValue('pdf_name', '');
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.webp']
    },
    multiple: true
  });

  const { getRootProps: getGridRootProps, getInputProps: getGridInputProps, isDragActive: isGridDragActive } = useDropzone({
    onDrop: onDropGridPhoto,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.webp']
    },
    multiple: false
  });

  const { getRootProps: getPdfRootProps, getInputProps: getPdfInputProps, isDragActive: isPdfDragActive } = useDropzone({
    onDrop: onDropPdf,
    accept: {
      'application/pdf': ['.pdf']
    },
    multiple: false
  });

  const removeImage = (index: number) => {
    setImages(images.filter((_, i) => i !== index));
  };

  const removeGridPhoto = () => {
    setGridPhoto('');
    setValue('grid_photo', '');
    setValue('og_image', '');
  };

  const moveImage = (fromIndex: number, toIndex: number) => {
    const newImages = [...images];
    const [movedImage] = newImages.splice(fromIndex, 1);
    newImages.splice(toIndex, 0, movedImage);
    setImages(newImages);
  };

  const updateImageAlt = (index: number, newAlt: string) => {
    const updatedImages = [...images];
    updatedImages[index] = { ...updatedImages[index], alt: newAlt };
    setImages(updatedImages);
  };

  const sanitizeNumericValue = (value: any): number | null => {
    if (value === '' || value === null || value === undefined || isNaN(Number(value))) {
      return null;
    }
    return Number(value);
  };

  const onSubmit = async (data: Property) => {
    setLoading(true);
    setError('');

    try {
      const seoKeywords = data.seo_keywords
        ? (typeof data.seo_keywords === 'string'
            ? data.seo_keywords.split(',').map(k => k.trim())
            : data.seo_keywords)
        : [];

      const sanitizedData = {
        ...data,
        price: sanitizeNumericValue(data.price),
        bedrooms: sanitizeNumericValue(data.bedrooms),
        bathrooms: sanitizeNumericValue(data.bathrooms),
        area: sanitizeNumericValue(data.area),
        land_size: sanitizeNumericValue(data.land_size),
        lot_size: sanitizeNumericValue(data.lot_size),
        nightly_rate_min: sanitizeNumericValue(data.nightly_rate_min),
        nightly_rate_max: sanitizeNumericValue(data.nightly_rate_max),
        max_occupancy: sanitizeNumericValue(data.max_occupancy),
        rating: sanitizeNumericValue(data.rating) || 5,
        monthly_income_from_rent: sanitizeNumericValue(data.monthly_income_from_rent),
        user_id: data.user_id === '' ? null : data.user_id, // Convert empty string to null for user_id
      };

      const finalSlug = data.slug || data.title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');

      const propertyData = {
        ...sanitizedData,
        images,
        grid_photo: gridPhoto,
        description,
        map_coordinates: {
          type: 'Point',
          coordinates: [markerPosition[1], markerPosition[0]]
        },
        // user_id is now taken from the form data, not current user
        location: data.location || 'Diniwid',
        location_name: data.location_name || 'Diniwid - Boracay Island',
        seo_image: gridPhoto,
        seo_keywords: seoKeywords,
        policy: data.policy || DEFAULT_POLICY,
        og_type: 'website',
        og_locale: data.og_locale || 'en_PH',
        og_url: data.og_url || `${window.location.origin}/property/${finalSlug}`,
        og_image: data.og_image || gridPhoto,
        slug: finalSlug
      };

      const { error: saveError } = id
        ? await supabase
            .from('properties')
            .update(propertyData)
            .eq('id', id)
        : await supabase
            .from('properties')
            .insert([propertyData]);

      if (saveError) throw saveError;
      navigate('/admin');
    } catch (err: any) {
      setError(`Error saving property: ${err.message}`);
      console.error('Save error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 max-w-7xl mx-auto">
      {error && (
        <div className="bg-red-50 text-red-600 p-4 rounded-md">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left Column */}
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700">Grid Layout Photo (Recommended size: 1200x800px)</label>

            {gridPhoto ? (
              <div className="relative aspect-[3/2] bg-gray-100 rounded-lg overflow-hidden mb-4">
                <img
                  src={gridPhoto}
                  alt="Grid layout"
                  className="w-full h-full object-cover"
                />
                <button
                  type="button"
                  onClick={removeGridPhoto}
                  className="absolute top-2 right-2 bg-red-500 text-white p-1.5 rounded-full"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div
                {...getGridRootProps()}
                className={`aspect-[3/2] border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors duration-300 ${
                  isGridDragActive
                    ? 'border-amber-500 bg-amber-50'
                    : 'border-gray-300 hover:border-amber-500 hover:bg-gray-50'
                }`}
              >
                <input {...getGridInputProps()} />
                <div className="flex flex-col items-center">
                  <ImageIcon className="w-10 w-10 text-gray-400 mb-3" />
                  <p className="text-gray-600">
                    {isGridDragActive
                      ? 'Drop the grid layout photo here...'
                      : 'Drag & drop grid layout photo here, or click to select'}
                  </p>
                  <p className="text-sm text-gray-500 mt-1">
                    Recommended size: 1200x800px
                  </p>
                </div>
              </div>
            )}

            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700">
                Grid Photo Overlay Text
              </label>
              <input
                type="text"
                {...register('grid_photo_overlay')}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-amber-500 focus:ring-amber-500"
                placeholder="e.g., NEARBY BEACHES"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Property Images (Recommended size: 1920x1080px)
            </label>

            {images.length > 0 && (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-4">
                {images.map((image, index) => (
                  <div
                    key={index}
                    className="relative group bg-gray-100 rounded-lg overflow-hidden"
                    draggable
                    onDragStart={(e) => {
                      e.dataTransfer.setData('text/plain', index.toString());
                    }}
                    onDragOver={(e) => {
                      e.preventDefault();
                    }}
                    onDrop={(e) => {
                      e.preventDefault();
                      const fromIndex = parseInt(e.dataTransfer.getData('text/plain'));
                      moveImage(fromIndex, index);
                    }}
                  >
                    <div className="aspect-video">
                      <img
                        src={image.url}
                        alt={image.alt}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all duration-300">
                      <button
                        type="button"
                        onClick={() => removeImage(index)}
                        className="absolute top-2 right-2 bg-red-500 text-white p-1.5 rounded-full"
                      >
                        <X className="w-4 h-4" />
                      </button>
                      <div className="absolute top-2 left-2 bg-white/80 backdrop-blur-sm p-1.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity cursor-move">
                        <GripVertical className="w-4 h-4 text-gray-600" />
                      </div>
                    </div>

                    <div className="p-2 bg-white">
                      <label className="block text-xs font-medium text-gray-700 mb-1">
                        Alt Text (for SEO):
                      </label>
                      <input
                        type="text"
                        value={image.alt}
                        onChange={(e) => updateImageAlt(index, e.target.value)}
                        placeholder="Describe this image"
                        className="w-full px-2 py-1 text-xs border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-amber-500 focus:border-amber-500"
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div
              {...getRootProps()}
              className={`w-full border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors duration-300 ${
                isDragActive
                  ? 'border-amber-500 bg-amber-50'
                  : 'border-gray-300 hover:border-amber-500 hover:bg-gray-50'
              }`}
            >
              <input {...getInputProps()} />
              <div className="flex flex-col items-center">
                {loading ? (
                  <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-amber-500"></div>
                ) : (
                  <>
                    <ImageIcon className="w-10 w-10 text-gray-400 mb-3" />
                    <p className="text-gray-600">
                      {isDragActive
                        ? 'Drop the images here...'
                        : 'Drag & drop images here, or click to select'}
                    </p>
                    <p className="text-sm text-gray-500 mt-1">
                      Recommended size: 1920x1080px (16:9 ratio)
                    </p>
                    <p className="text-sm text-gray-500 mt-1">
                      Supported formats: JPG, PNG, WebP (max 30MB each)
                    </p>
                  </>
                )}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700">Title</label>
              <input
                type="text"
                {...register('title', { required: 'Title is required' })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-amber-500 focus:ring-amber-500"
              />
              {errors.title && (
                <p className="mt-1 text-sm text-red-600">{errors.title.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Price</label>
              <input
                type="number"
                {...register('price', { required: 'Price is required' })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-amber-500 focus:ring-amber-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Bedrooms</label>
              <input
                type="number"
                {...register('bedrooms')}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-amber-500 focus:ring-amber-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Bathrooms</label>
              <input
                type="number"
                {...register('bathrooms')}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-amber-500 focus:ring-amber-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Area (sqm)</label>
              <input
                type="number"
                {...register('area')}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-amber-500 focus:ring-amber-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Lot Size (sqm)</label>
              <input
                type="number"
                {...register('lot_size')}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-amber-500 focus:ring-amber-500"
              />
            </div>
          </div>

          {/* NEW: Client Assignment Dropdown */}
          <div>
            <label className="block text-sm font-medium text-gray-700">Assign to Client</label>
            <select
              {...register('user_id')} // Register with user_id
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-amber-500 focus:ring-amber-500"
            >
              <option value="">Unassigned</option> {/* Option for no client */}
              {clients.map(client => (
                <option key={client.id} value={client.id}>
                  {client.first_name && client.last_name
                    ? `${client.first_name} ${client.last_name} (${client.username})`
                    : client.username}
                </option>
              ))}
            </select>
            <p className="mt-1 text-sm text-gray-500">
              Assign this property to a specific client.
            </p>
          </div>
          {/* END NEW: Client Assignment Dropdown */}

          <div className="space-y-6">
            <h3 className="text-xl font-semibold text-gray-900">Documentation & Information</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Earnings Information
                </label>
                <textarea
                  {...register('earnings_info')}
                  rows={5}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-amber-500 focus:ring-amber-500"
                  placeholder="Enter earnings information"
                />
                <p className="mt-1 text-sm text-gray-500">
                  Details about potential earnings, rental income, etc.
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Legal Information
                </label>
                <textarea
                  {...register('legal_info')}
                  rows={5}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-amber-500 focus:ring-amber-500"
                  placeholder="Enter legal information"
                />
                <p className="mt-1 text-sm text-gray-500">
                  Legal details, ownership documents, etc.
                </p>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Property PDF (Brochure, Legal Docs, etc.)
              </label>

              {pdfFile ? (
                <div className="mt-2 flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200">
                  <div className="flex items-center">
                    <FileIcon className="w-5 h-5 text-gray-400 mr-2" />
                    <span className="text-sm text-gray-600 truncate max-w-xs">{pdfFile.name}</span>
                  </div>
                  <button
                    type="button"
                    onClick={removePdf}
                    className="ml-2 p-1 rounded-full hover:bg-gray-200"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <div
                  {...getPdfRootProps()}
                  className={`mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-dashed rounded-lg ${
                    isPdfDragActive
                      ? 'border-amber-500 bg-amber-50'
                      : 'border-gray-300 hover:border-amber-500 hover:bg-gray-50'
                  }`}
                >
                  <input {...getPdfInputProps()} />
                  <div className="space-y-1 text-center">
                    <Upload className="mx-auto h-8 w-8 text-gray-400" />
                    <div className="flex text-sm text-gray-600">
                      <span className="relative cursor-pointer rounded-md font-medium text-amber-600 hover:text-amber-500">
                        <span>Upload a PDF file</span>
                      </span>
                      <p className="pl-1">or drag and drop</p>
                    </div>
                    <p className="text-xs text-gray-500">PDF up to 10MB</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900">Map Location</h3>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Click on the map to set the property location
              </label>
              <div className="h-[400px] rounded-lg overflow-hidden border border-gray-300">
                <MapContainer
                  center={markerPosition}
                  zoom={16}
                  scrollWheelZoom={false}
                  style={{ height: '100%', width: '100%' }}
                >
                  <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  />
                  <LocationMarker
                    position={markerPosition}
                    onPositionChange={setMarkerPosition}
                  />
                </MapContainer>
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description (Paste HTML from Word) <a href="https://wordtohtml.net/" target="_blank" rel="noopener noreferrer" className="text-primary hover:text-primary-600">wordtohtml.net</a>
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-amber-500 focus:ring-amber-500 min-h-[200px] font-mono text-sm"
              placeholder="Paste your HTML content here..."
            />
            <p className="mt-2 text-sm text-gray-500">
              Tip: Write and format your content in Word, then paste the HTML here.
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Location Name</label>
            <input
              type="text"
              {...register('location_name')}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-amber-500 focus:ring-amber-500"
              placeholder="e.g., Diniwid Beach"
              defaultValue="Diniwid - Boracay Island"
            />
          </div>

          <input
            type="hidden"
            {...register('location')}
            defaultValue="Diniwid"
          />

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700">Property Type</label>
              <select
                {...register('property_type', { required: 'Property type is required' })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-amber-500 focus:ring-amber-500"
              >
                <option value="">Select type</option>
                <option value="house">House</option>
                <option value="villa">Villa</option>
                <option value="apartment">Apartment</option>
                <option value="land">Land</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Property Category</label>
              <select
                {...register('property_category')}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-amber-500 focus:ring-amber-500"
              >
                <option value="Residential">Residential</option>
                <option value="Commercial">Commercial</option>
                <option value="Residential and Commercial">Residential and Commercial</option>
                <option value="Lot">Lot</option>
              </select>
            </div>

            {/* NEW STATUS DROPDOWN */}
            <div>
              <label className="block text-sm font-medium text-gray-700">Status</label>
              <select
                {...register('status', { required: 'Status is required' })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-amber-500 focus:ring-amber-500"
              >
                <option value="available">Available</option>
                <option value="sold">Sold</option>
                <option value="pending">Pending</option>
                <option value="rented">Rented</option> {/* Added 'rented' status */}
              </select>
              {errors.status && (
                <p className="mt-1 text-sm text-red-600">{errors.status.message}</p>
              )}
            </div>
            {/* END NEW STATUS DROPDOWN */}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Rating (1-5 stars)</label>
            <input
              type="number"
              min="1"
              max="5"
              step="0.1"
              {...register('rating')}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-amber-500 focus:ring-amber-500"
              placeholder="5"
            />
            <p className="mt-1 text-sm text-gray-500">
              Leave empty for default 5-star rating
            </p>
          </div>

          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                {...register('is_for_sale')}
                className="rounded border-gray-300 text-amber-600 focus:ring-amber-500"
              />
              <label className="text-sm font-medium text-gray-700">
                List for Sale
              </label>
            </div>

            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                {...register('is_for_rent')}
                className="rounded border-gray-300 text-amber-600 focus:ring-amber-500"
              />
              <label className="text-sm font-medium text-gray-700">
                List for Rent (Airbnb)
              </label>
            </div>
          </div>

          {isForRent && (
            <div className="space-y-4 p-4 bg-amber-50 rounded-lg">
              <h3 className="font-medium text-amber-900">Airbnb Details</h3>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Airbnb Listing URL
                </label>
                <input
                  type="url"
                  {...register('airbnb_url')}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-amber-500 focus:ring-amber-500"
                  placeholder="https://airbnb.com/your-listing"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Minimum Nightly Rate
                  </label>
                  <input
                    type="number"
                    {...register('nightly_rate_min')}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-amber-500 focus:ring-amber-500"
                    placeholder="100"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Maximum Nightly Rate
                  </label>
                  <input
                    type="number"
                    {...register('nightly_rate_max')}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-amber-500 focus:ring-amber-500"
                    placeholder="200"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                    Maximum Occupancy
                </label>
                <input
                  type="number"
                  {...register('max_occupancy')}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-amber-500 focus:ring-amber-500"
                  placeholder="4"
                />
                <p className="mt-1 text-sm text-gray-500">
                  Maximum number of guests allowed
                </p>
              </div>
            </div>
          )}

          <div className="space-y-4 p-4 bg-blue-50 rounded-lg">
            <h3 className="font-medium text-blue-900">Monthly Income</h3>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Monthly Income from Rent (PHP)
              </label>
              <input
                type="number"
                {...register('monthly_income_from_rent')}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-amber-500 focus:ring-amber-500"
                placeholder="e.g., 50000"
              />
              <p className="mt-1 text-sm text-gray-500">
                Estimated monthly income from rental
              </p>
            </div>
          </div>
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          <div className="bg-white rounded-xl shadow-lg p-8 space-y-6">
            <h3 className="text-xl font-bold mb-6">Property Features</h3>

            {Object.entries(FEATURES_CONFIG).map(([category, { title, items }]) => (
              <div key={category} className="space-y-4">
                <h4 className="text-lg font-semibold">{title}</h4>
                <div className="grid grid-cols-2 gap-4">
                  {Object.entries(items).map(([key, config]) => {
                    const Icon = config.icon;
                    const fieldName = `features.${category}.${key}`;

                    return (
                      <div key={key} className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
                        <Icon className="w-5 h-5 text-amber-600" />
                        <div className="flex-1">
                          <label className="block text-sm font-medium text-gray-700">
                            {config.label}
                          </label>
                          {config.type === 'boolean' && (
                            <input
                              type="checkbox"
                              {...register(fieldName)}
                              className="mt-1 rounded border-gray-300 text-amber-600 focus:ring-amber-500"
                            />
                          )}
                          {config.type === 'number' && (
                            <input
                              type="number"
                              {...register(fieldName)}
                              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-amber-500 focus:ring-amber-500 sm:text-sm"
                            />
                          )}
                          {config.type === 'text' && (
                            <input
                              type="text"
                              {...register(fieldName)}
                              placeholder={config.placeholder}
                              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-amber-500 focus:ring-amber-500 sm:text-sm"
                            />
                          )}
                          {config.type === 'select' && (
                            <select
                              {...register(fieldName)}
                              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-amber-500 focus:ring-amber-500 sm:text-sm"
                            >
                              {config.options?.map(option => (
                                <option key={option} value={option}>{option}</option>
                              ))}
                            </select>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>

          <div className="bg-white rounded-xl shadow-lg p-8 space-y-6">
            <h3 className="text-xl font-bold mb-6">Property Policy</h3>

            <div className="space-y-6">
              <div>
                <h4 className="text-lg font-semibold mb-4">Mandatory Services</h4>
                {watch('policy.mandatoryServices')?.map((service, index) => (
                  <div key={index} className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Service Name</label>
                      <input
                        type="text"
                        {...register(`policy.mandatoryServices.${index}.name`)}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-amber-500 focus:ring-amber-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Value</label>
                      <input
                        type="text"
                        {...register(`policy.mandatoryServices.${index}.value`)}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-amber-500 focus:ring-amber-500"
                      />
                    </div>
                  </div>
                ))}
              </div>

              <div>
                <h4 className="text-lg font-semibold mb-4">Schedule</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Check-in Time</label>
                    <input
                      type="text"
                      {...register('policy.schedule.checkIn')}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-amber-500 focus:ring-amber-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Check-out Time</label>
                    <input
                      type="text"
                      {...register('policy.schedule.checkOut')}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-amber-500 focus:ring-amber-500"
                    />
                  </div>
                </div>
              </div>

              <div>
                <h4 className="text-lg font-semibold mb-4">Cancellation Policies</h4>
                {watch('policy.cancellation.policies')?.map((policy, index) => (
                  <div key={index} className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Period</label>
                      <input
                        type="text"
                        {...register(`policy.cancellation.policies.${index}.period`)}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-amber-500 focus:ring-amber-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Charge</label>
                      <input
                        type="text"
                        {...register(`policy.cancellation.policies.${index}.charge`)}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-amber-500 focus:ring-amber-500"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="bg-amber-50 p-6 rounded-lg">
            <h3 className="text-lg font-medium text-amber-900 mb-4">SEO Settings</h3>

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Page Title (SEO)
                </label>
                <input
                  type="text"
                  {...register('seo_title')}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-amber-500 focus:ring-amber-500"
                  placeholder="Enter SEO title"
                />
                <p className="mt-1 text-sm text-gray-500">
                  Recommended length: 50-60 characters
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Meta Description
                </label>
                <textarea
                  {...register('seo_description')}
                  rows={3}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-amber-500 focus:ring-amber-500"
                  placeholder="Enter a compelling description for search results"
                />
                <p className="mt-1 text-sm text-gray-500">
                  Recommended length: 150-160 characters
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Focus Keywords (comma-separated)
                </label>
                <input
                  type="text"
                  {...register('seo_keywords')}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-amber-500 focus:ring-amber-500"
                  placeholder="e.g., luxury villa, beachfront property, Boracay"
                />
                <p className="mt-1 text-sm text-gray-500">
                  Add your main keywords, separated by commas
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Canonical URL
                </label>
                <input
                  type="url"
                  {...register('canonical_url')}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-amber-500 focus:ring-amber-500"
                  placeholder="https://www.boracay.house/property/your-property"
                />
                <p className="mt-1 text-sm text-gray-500">
                  Set the canonical URL to prevent duplicate content issues
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Slug (URL Identifier)
                </label>
                <input
                  type="text"
                  {...register('slug', {
                    pattern: {
                      value: /^[a-z0-9-]+$/,
                      message: "Only lowercase letters, numbers, and hyphens allowed"
                    }
                  })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-amber-500 focus:ring-amber-500"
                  placeholder="e.g., beachfront-villa-diniwid"
                />
                {errors.slug && (
                  <p className="mt-1 text-sm text-red-600">{errors.slug.message}</p>
                )}
                <p className="mt-1 text-sm text-gray-500">
                  Unique URL identifier for this property (auto-generated if empty)
                </p>
              </div>

              <div className="border-t border-amber-100 pt-6">
                <h4 className="text-base font-medium text-amber-900 mb-4">Open Graph Tags (Social Sharing)</h4>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      OG Title
                    </label>
                    <input
                      type="text"
                      {...register('og_title')}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-amber-500 focus:ring-amber-500"
                      placeholder="Property Name – Unique Feature in Location"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      OG Description
                    </label>
                    <textarea
                      {...register('og_description')}
                      rows={2}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-amber-500 focus:ring-amber-500"
                      placeholder="Brief, compelling description for social media"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      OG URL (Actual Property URL)
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <LinkIcon className="h-5 w-5 text-gray-400" />
                      </div>
                      <input
                        type="url"
                        {...register('og_url', { required: 'OG URL is required' })}
                        className="mt-1 block w-full pl-10 rounded-md border-gray-300 shadow-sm focus:border-amber-500 focus:ring-amber-500"
                        placeholder="https://boracay.house/property/your-property"
                      />
                    </div>
                    {errors.og_url && (
                      <p className="mt-1 text-sm text-red-600">{errors.og_url.message}</p>
                    )}
                    <p className="mt-1 text-sm text-gray-500">
                      The actual URL where this property will be accessed
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      OG Image (Uses Grid Photo by Default)
                    </label>
                    <input
                      type="url"
                      {...register('og_image')}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-amber-500 focus:ring-amber-500"
                      placeholder="https://www.boracay.house/images/your-property-og.jpg"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      OG Locale
                    </label>
                    <select
                      {...register('og_locale')}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-amber-500 focus:ring-amber-500"
                    >
                      {OG_LOCALES.map(locale => (
                        <option key={locale.value} value={locale.value}>
                          {locale.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              <div className="border border-gray-200 rounded-lg p-4 bg-white">
                <h4 className="text-sm font-medium text-gray-700 mb-3">Google Search Preview</h4>
                <div className="space-y-1">
                  <div className="text-[#1a0dab] text-xl hover:underline cursor-pointer overflow-hidden text-ellipsis">
                    {watch('seo_title') || watch('title') || 'Page Title'}
                  </div>
                  <div className="text-[#006621] text-sm">
                    {window.location.origin}/property/{watch('slug') || id || 'property-url'}
                  </div>
                  <div className="text-sm text-gray-600 line-clamp-2">
                    {watch('seo_description') || 'Add a meta description to see how your page will appear in search results.'}
                  </div>
                </div>
              </div>

              <div className="border border-gray-200 rounded-lg p-4 bg-white">
                <h4 className="text-sm font-medium text-gray-700 mb-3">Social Media Preview</h4>
                <div className="border rounded-lg overflow-hidden">
                  {gridPhoto ? (
                    <img
                      src={watch('og_image') || gridPhoto}
                      alt="Social media preview"
                      className="w-full aspect-[1.91/1] object-cover"
                    />
                  ) : (
                    <div className="w-full aspect-[1.91/1] bg-gray-100 flex items-center justify-center">
                      <p className="text-gray-400 text-sm">Add a Grid Layout Photo</p>
                    </div>
                  )}
                  <div className="p-3 space-y-1">
                    <div className="text-sm text-gray-500 uppercase">boracay.house</div>
                    <div className="font-medium line-clamp-1">
                      {watch('og_title') || watch('seo_title') || watch('title') || 'Page Title'}
                    </div>
                    <div className="text-sm text-gray-600 line-clamp-2">
                      {watch('og_description') || watch('seo_description') || 'Add a meta description to see how your page will appear when shared.'}
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-blue-50 p-4 rounded-lg">
                <h4 className="text-sm font-medium text-blue-900 mb-2">SEO Image</h4>
                <p className="text-sm text-blue-700">
                  The Grid Layout Photo will automatically be used for SEO and social sharing. Recommended size: 1200x630px (1.91:1 ratio)
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="flex justify-end space-x-4">
        <Button
          type="button"
          variant="outline"
          onClick={() => navigate('/admin')}
        >
          Cancel
        </Button>
        <Button
          type="submit"
          disabled={loading}
        >
          {loading ? 'Saving...' : 'Save Property'}
        </Button>
      </div>
    </form>
  );
};

export default PropertyForm;
