// src/components/client/ClientProfileForm.tsx
import React, { useState, useEffect, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { supabase } from '../../lib/supabase'; // Adjust path if necessary
import Button from '../ui/Button'; // Adjust path if necessary
import { countryCodesList } from '../../utils/countryCodes'; // Adjust path if necessary
import { User, Phone, MessageCircle, MapPin, Globe, Mail, Check, AlertCircle, ArrowLeft } from 'lucide-react'; // NEW: Import ArrowLeft

interface ProfileFormData {
  first_name: string;
  last_name: string;
  phone_number: string;
  whatsapp_number: string;
  address: string;
  country: string;
}

interface ClientProfileFormProps {
  userId: string;
  initialProfileData: any; // Data fetched from profiles table
  onProfileUpdated: () => void; // Callback to refresh data in parent
  onSuccess: () => void; // Callback for successful submission
  onBack: () => void; // NEW: Callback to go back to dashboard overview
}

const ClientProfileForm: React.FC<ClientProfileFormProps> = ({ userId, initialProfileData, onProfileUpdated, onSuccess, onBack }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [countryCode, setCountryCode] = useState('+63'); // For phone/whatsapp
  const { register, handleSubmit, setValue, reset, watch, formState: { errors } } = useForm<ProfileFormData>();

  const watchedCountry = watch('country'); // Watch country to set default phone code

  useEffect(() => {
    if (initialProfileData) {
      reset(initialProfileData);
      // Set initial country code for phone/whatsapp if country is available
      const defaultCountryCode = countryCodesList.find(c => c.country === initialProfileData.country)?.code || '+63';
      setCountryCode(defaultCountryCode);
    }
  }, [initialProfileData, reset]);

  // Update phone country code when selected country changes
  useEffect(() => {
    const newCountryCode = countryCodesList.find(c => c.country === watchedCountry)?.code;
    if (newCountryCode) {
      setCountryCode(newCountryCode);
    }
  }, [watchedCountry]);

  const onSubmit = async (data: ProfileFormData) => {
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const { error: updateError } = await supabase
        .from('profiles')
        .update({
          first_name: data.first_name,
          last_name: data.last_name,
          phone_number: data.phone_number,
          whatsapp_number: data.whatsapp_number,
          address: data.address,
          country: data.country,
        })
        .eq('id', userId);

      if (updateError) throw updateError;

      setSuccess('Profile updated successfully!');
      onProfileUpdated(); // Trigger parent to refresh data
      setTimeout(() => {
        onSuccess(); // Call onSuccess to trigger navigation back to overview
      }, 1500); // Delay redirection by 1.5 seconds
    } catch (err: any) {
      setError(`Failed to update profile: ${err.message}`);
      console.error('Profile update error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {success && (
        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-md flex items-center gap-2">
          <Check className="w-5 h-5" />
          <span>{success}</span>
        </div>
      )}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md flex items-center gap-2">
          <AlertCircle className="w-5 h-5" />
          <span>{error}</span>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">First Name</label>
          <div className="relative">
            <input
              type="text"
              {...register('first_name', { required: 'First name is required' })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
            <User className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          </div>
          {errors.first_name && <p className="mt-1 text-sm text-red-600">{errors.first_name.message}</p>}
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
          <div className="relative">
            <input
              type="text"
              {...register('last_name', { required: 'Last name is required' })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
            <User className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          </div>
          {errors.last_name && <p className="mt-1 text-sm text-red-600">{errors.last_name.message}</p>}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
          <div className="flex">
            <select
              value={countryCode}
              onChange={(e) => setCountryCode(e.target.value)}
              className="w-24 px-2 py-2 border border-gray-300 rounded-l-md focus:outline-none focus:ring-2 focus:ring-amber-500 text-sm"
            >
              {countryCodesList.map((option, index) => (
                <option key={`${option.code}-${index}`} value={option.code}>
                  {option.flag} {option.code}
                </option>
              ))}
            </select>
            <div className="relative flex-1">
              <input
                type="tel"
                {...register('phone_number')}
                className="w-full px-3 py-2 border border-l-0 border-gray-300 rounded-r-md focus:outline-none focus:ring-2 focus:ring-amber-500"
                placeholder="Enter numbers only"
              />
              <Phone className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            </div>
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">WhatsApp Number</label>
          <div className="flex">
            <select
              value={countryCode}
              onChange={(e) => setCountryCode(e.target.value)}
              className="w-24 px-2 py-2 border border-gray-300 rounded-l-md focus:outline-none focus:ring-2 focus:ring-amber-500 text-sm"
            >
              {countryCodesList.map((option, index) => (
                <option key={`whatsapp-${option.code}-${index}`} value={option.code}>
                  {option.flag} {option.code}
                </option>
              ))}
            </select>
            <div className="relative flex-1">
              <input
                type="tel"
                {...register('whatsapp_number')}
                className="w-full px-3 py-2 border border-l-0 border-gray-300 rounded-r-md focus:outline-none focus:ring-2 focus:ring-amber-500"
                placeholder="Enter numbers only"
              />
              <MessageCircle className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            </div>
          </div>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
        <div className="relative">
          <textarea
            {...register('address')}
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500"
            placeholder="Street, City, Postal Code"
          ></textarea>
          <MapPin className="absolute right-3 top-3 w-5 h-5 text-gray-400" />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Country</label>
        <div className="relative">
          <select
            {...register('country')}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500"
          >
            <option value="">Select your country</option>
            {countryCodesList.map((option, index) => (
              <option key={`country-${option.country}-${index}`} value={option.country}>
                {option.country}
              </option>
            ))}
          </select>
          <Globe className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
        </div>
      </div>

      <div className="flex justify-end space-x-4">
        <Button type="button" variant="outline" onClick={onBack}> {/* NEW: Back button */}
          <ArrowLeft className="w-5 h-5 mr-2" /> Back to Dashboard
        </Button>
        <Button type="submit" disabled={loading}>
          {loading ? 'Saving...' : 'Save Profile'}
        </Button>
      </div>
    </form>
  );
};

export default ClientProfileForm;
