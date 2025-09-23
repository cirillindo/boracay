// src/components/client/ClientBankDetails.tsx
import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from '../../lib/supabase';
import Button from '../../components/ui/Button';
import { Banknote, Building, Code, Hash, MapPin, DollarSign, Calendar, User, Mail, FileText, Check, AlertCircle, ArrowLeft } from 'lucide-react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { useForm } from 'react-hook-form';
import { format, parseISO } from 'date-fns';

// Define the interface for the bank details data
interface BankDetailsFormData {
  bank_name: string;
  swift_code: string;
  bank_code: string;
  branch_code: string;
  account_number: string;
  location: string;
  currencies: string; // Storing as comma-separated string for simplicity
  commencement_date: string; // Storing as string for date input
  account_holder: string;
  account_holder_address: string;
  notes: string;
}

interface ClientBankDetailsProps {
  onBack: () => void;
}

const ClientBankDetails: React.FC<ClientBankDetailsProps> = ({ onBack }) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [bankDetailsId, setBankDetailsId] = useState<string | null>(null); // To track if we're updating or inserting
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  const { register, handleSubmit, setValue, reset, watch, formState: { errors } } = useForm<BankDetailsFormData>();

  const commencementDate = watch('commencement_date'); // Watch the date field for DatePicker

  // Fetch current user ID on component mount
  useEffect(() => {
    const fetchUser = async () => {
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (user && !userError) {
        setCurrentUserId(user.id);
      } else {
        setError('User not authenticated. Please log in.');
        setLoading(false);
      }
    };
    fetchUser();
  }, []);

  // Fetch bank details for the current user once user ID is available
  useEffect(() => {
    if (currentUserId) {
      loadBankDetails(currentUserId);
    }
  }, [currentUserId]);

  const loadBankDetails = async (userId: string) => {
    setLoading(true);
    setError(null);
    try {
      const { data, error } = await supabase
        .from('bank_details')
        .select('*')
        .eq('user_id', userId)
        .maybeSingle(); // Changed from .single() to .maybeSingle()

      if (error) { // No need to check for PGRST116 specifically, maybeSingle handles no rows
        throw error;
      }

      if (data) {
        setBankDetailsId(data.id);
        reset({
          ...data,
          // Convert array of strings to comma-separated string for the form field
          currencies: data.currencies ? data.currencies.join(', ') : '',
          commencement_date: data.commencement_date ? format(parseISO(data.commencement_date), 'yyyy-MM-dd') : '',
        });
      } else {
        // No existing data, reset form to defaults
        reset({
          bank_name: '',
          swift_code: '',
          bank_code: '',
          branch_code: '',
          account_number: '',
          location: '',
          currencies: '',
          commencement_date: '',
          account_holder: '',
          account_holder_address: '',
          notes: '',
        });
        setBankDetailsId(null);
      }
    } catch (err: any) {
      setError(`Failed to load bank details: ${err.message || 'Unknown error'}`);
      console.error('Error loading bank details:', err);
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = async (data: BankDetailsFormData) => {
    if (!currentUserId) {
      setError('User not authenticated. Cannot save bank details.');
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const bankDetailsToSave = {
        ...data,
        user_id: currentUserId,
        // Ensure date is stored as YYYY-MM-DD string or null
        commencement_date: data.commencement_date || null,
        // Convert currencies string to array of strings, filtering out empty strings
        currencies: data.currencies ? data.currencies.split(',').map(c => c.trim()).filter(c => c !== '') : [],
        notes: data.notes.trim() || null,
      };

      if (bankDetailsId) {
        // Update existing record
        const { error } = await supabase
          .from('bank_details')
          .update(bankDetailsToSave)
          .eq('id', bankDetailsId);
        if (error) throw error;
        setSuccess('Bank details updated successfully!');
      } else {
        // Insert new record
        const { data: newBankDetails, error } = await supabase
          .from('bank_details')
          .insert([bankDetailsToSave])
          .select('id')
          .single();
        if (error) throw error;
        setBankDetailsId(newBankDetails.id); // Store the new ID
        setSuccess('Bank details saved successfully!');
      }
      setTimeout(onBack, 1500); // Go back to dashboard after success
    } catch (err: any) {
      setError(`Failed to save bank details: ${err.message || 'Unknown error'}`);
      console.error('Error saving bank details:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 bg-white rounded-xl shadow-sm">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
          <Banknote className="w-6 h-6 text-blue-600" /> Bank Details
        </h2>
        <Button onClick={onBack} variant="outline">
          <ArrowLeft className="w-4 h-4 mr-2" /> Back to Dashboard
        </Button>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-amber-500"></div>
        </div>
      ) : error ? (
        <div className="bg-red-50 text-red-600 p-4 rounded-md flex items-center gap-2">
          <AlertCircle className="w-5 h-5" />
          <span>{error}</span>
        </div>
      ) : success ? (
        <div className="bg-green-50 text-green-600 p-4 rounded-md flex items-center gap-2">
          <Check className="w-5 h-5" />
          <span>{success}</span>
        </div>
      ) : (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div>
            <label htmlFor="bank_name" className="block text-sm font-medium text-gray-700 mb-1">Bank Name *</label>
            <div className="relative">
              <input
                type="text"
                id="bank_name"
                {...register('bank_name', { required: 'Bank Name is required' })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
              <Building className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            </div>
            {errors.bank_name && <p className="mt-1 text-sm text-red-600">{errors.bank_name.message}</p>}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="swift_code" className="block text-sm font-medium text-gray-700 mb-1">SWIFT Code</label>
              <div className="relative">
                <input
                  type="text"
                  id="swift_code"
                  {...register('swift_code')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
                <Code className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              </div>
            </div>
            <div>
              <label htmlFor="bank_code" className="block text-sm font-medium text-gray-700 mb-1">Bank Code</label>
              <div className="relative">
                <input
                  type="text"
                  id="bank_code"
                  {...register('bank_code')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
                <Hash className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="branch_code" className="block text-sm font-medium text-gray-700 mb-1">Branch Code</label>
              <div className="relative">
                <input
                  type="text"
                  id="branch_code"
                  {...register('branch_code')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
                <Code className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              </div>
            </div>
            <div>
              <label htmlFor="account_number" className="block text-sm font-medium text-gray-700 mb-1">Account Number *</label>
              <div className="relative">
                <input
                  type="text"
                  id="account_number"
                  {...register('account_number', { required: 'Account Number is required' })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
                <DollarSign className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              </div>
              {errors.account_number && <p className="mt-1 text-sm text-red-600">{errors.account_number.message}</p>}
            </div>
          </div>

          <div>
            <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-1">Location</label>
            <div className="relative">
              <input
                type="text"
                id="location"
                {...register('location')}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
              <MapPin className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            </div>
          </div>

          <div>
            <label htmlFor="currencies" className="block text-sm font-medium text-gray-700 mb-1">Currencies (comma-separated)</label>
            <div className="relative">
              <input
                type="text"
                id="currencies"
                {...register('currencies')}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500"
                placeholder="e.g., EUR, USD, PHP"
              />
              <DollarSign className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            </div>
          </div>

          <div>
            <label htmlFor="commencement_date" className="block text-sm font-medium text-gray-700 mb-1">Commencement Date</label>
            <div className="relative">
              <DatePicker
                selected={commencementDate ? parseISO(commencementDate) : null}
                onChange={(date: Date | null) => setValue('commencement_date', date ? format(date, 'yyyy-MM-dd') : '')}
                dateFormat="yyyy-MM-dd"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
              <Calendar className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            </div>
          </div>

          <div>
            <label htmlFor="account_holder" className="block text-sm font-medium text-gray-700 mb-1">Account Holder *</label>
            <div className="relative">
              <input
                type="text"
                id="account_holder"
                {...register('account_holder', { required: 'Account Holder is required' })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
              <User className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            </div>
            {errors.account_holder && <p className="mt-1 text-sm text-red-600">{errors.account_holder.message}</p>}
          </div>

          <div>
            <label htmlFor="account_holder_address" className="block text-sm font-medium text-gray-700 mb-1">Account Holder's Address</label>
            <div className="relative">
              <textarea
                id="account_holder_address"
                {...register('account_holder_address')}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500"
              ></textarea>
              <MapPin className="absolute right-3 top-3 w-5 h-5 text-gray-400" />
            </div>
          </div>

          <div>
            <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-1">Notes (Optional)</label>
            <div className="relative">
              <textarea
                id="notes"
                {...register('notes')}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500"
                placeholder="Any additional notes about this bank account..."
              ></textarea>
              <FileText className="absolute right-3 top-3 w-5 h-5 text-gray-400" />
            </div>
          </div>

          <div className="flex justify-end space-x-4">
            <Button type="button" variant="outline" onClick={onBack} disabled={loading}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Saving...' : bankDetailsId ? 'Update Details' : 'Save Details'}
            </Button>
          </div>
        </form>
      )}
    </div>
  );
};

export default ClientBankDetails;
