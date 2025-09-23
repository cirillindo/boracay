import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import Button from '../ui/Button';
import { AlertCircle, Check, User, Clock, Droplets, Settings } from 'lucide-react';

interface Staff {
  id: string;
  first_name: string;
  last_name: string;
  user_id: string;
}

const PoolCleaningForm: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  // Form data
  const [netCleaningDone, setNetCleaningDone] = useState(false);
  const [pumpCleaningDone, setPumpCleaningDone] = useState(false);
  const [chlorineAdded, setChlorineAdded] = useState(false);
  const [muriaticAdded, setMuriaticAdded] = useState(false);
  const [remarks, setRemarks] = useState('');
  
  // Current user state
  const [currentUserStaffId, setCurrentUserStaffId] = useState<string | null>(null);
  const [currentUserStaffName, setCurrentUserStaffName] = useState<string | null>(null);
  const [hasStaffProfile, setHasStaffProfile] = useState(true);

  useEffect(() => {
    loadCurrentUserStaffId();
  }, []);

  const loadCurrentUserStaffId = async () => {
    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) {
        setError('You must be logged in to submit a pool cleaning record.');
        setHasStaffProfile(false);
        return;
      }

      const { data: staffData, error: staffError } = await supabase
        .from('staff_details')
        .select('id, first_name, last_name')
        .eq('user_id', user.id)
        .maybeSingle(); // Changed from .single() to .maybeSingle()
      
      if (staffError && staffError.code !== 'PGRST116') {
        throw staffError;
      }
      
      if (!staffData) {
        setError('No staff profile found linked to your user account. Please create one in the Admin Dashboard → Staff section.');
        setHasStaffProfile(false);
        setCurrentUserStaffId(null);
        setCurrentUserStaffName(null);
        return;
      }
      
      // Clear any previous errors and set staff data
      setError('');
      setCurrentUserStaffId(staffData.id);
      setCurrentUserStaffName(`${staffData.first_name} ${staffData.last_name}`);
      setHasStaffProfile(true);
    } catch (err) {
      console.error('Error loading current user staff ID:', err);
      setError('Failed to determine your staff profile. Please ensure your staff profile is correctly linked to your user account.');
      setHasStaffProfile(false);
      setCurrentUserStaffId(null);
      setCurrentUserStaffName(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!currentUserStaffId) {
      setError('No staff profile found linked to your user account. Please create one in the Admin Dashboard → Staff section.');
      return;
    }
    if (!hasStaffProfile) {
      setError('Cannot submit: No staff profile linked to your user account. Please create one.');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      console.log('Attempting to submit pool cleaning record...');
      console.log('Current User Staff ID:', currentUserStaffId);
      console.log('Net Cleaning Done:', netCleaningDone);
      console.log('Pump Cleaning Done:', pumpCleaningDone);
      console.log('Chlorine Added:', chlorineAdded);
      console.log('Muriatic Added:', muriaticAdded);
      console.log('Remarks:', remarks);

      const { data: recordData, error: recordError } = await supabase
        .from('pool_cleaning_records')
        .insert({
          staff_id: currentUserStaffId,
          net_cleaning_done: netCleaningDone,
          pump_cleaning_done: pumpCleaningDone,
          chlorine_added: chlorineAdded,
          muriatic_added: muriaticAdded,
          remarks: remarks.trim() || null
        })
        .select()
        .single();

      if (recordError) throw recordError;

      setSuccess('Pool cleaning record submitted successfully!');
      
      // Reset form
      setNetCleaningDone(false);
      setPumpCleaningDone(false);
      setChlorineAdded(false);
      setMuriaticAdded(false);
      setRemarks('');
      
      setTimeout(() => {
        navigate('/staff/pool-cleaning');
      }, 2000);

    } catch (err: any) {
      console.error('Error submitting pool cleaning record:', err);
      setError(`Failed to submit pool cleaning record: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md mb-6 flex items-center gap-2">
          <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}
      {success && (
        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-md mb-6 flex items-center gap-2">
          <Check className="w-5 h-5 text-green-500 flex-shrink-0" />
          <span>{success}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4 pb-2 border-b-2 border-amber-500">
            Swimming Pool Cleaning Record
          </h2>
          
          {/* Date and Time Display */}
          <div className="mb-6 p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <Clock className="w-5 h-5 text-gray-600" />
              <span className="font-medium text-gray-700">Date & Time</span>
            </div>
            <p className="text-gray-600">
              {new Date().toLocaleDateString('en-US', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              })}
            </p>
            <p className="text-sm text-gray-500 mt-1">
              This will be automatically recorded when you submit the form
            </p>
          </div>

          {/* Staff Member Display */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Staff Member <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              {currentUserStaffName ? (
                <div className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100 text-gray-700 flex items-center justify-between">
                  <span>{currentUserStaffName}</span>
                  <Check className="w-5 h-5 text-green-500" />
                </div>
              ) : (
                <div className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100 text-gray-700">
                  Loading staff information...
                </div>
              )}
              <User className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            </div>
            {!hasStaffProfile && (
              <p className="mt-1 text-sm text-red-600">
                No staff profile found linked to your user account. Please create one in the Admin Dashboard {'>'}  Staff section.
              </p>
            )}
            {currentUserStaffName && (
              <p className="mt-1 text-sm text-green-600">
                Staff automatically selected based on your logged-in account.
              </p>
            )}
          </div>
        </div>

        {/* Swimming Pool Cleaning Section */}
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <Droplets className="w-5 h-5 text-blue-500" />
            Swimming Pool Cleaning
          </h3>
          
          <div className="space-y-4">
            <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
              <input
                type="checkbox"
                id="netCleaning"
                checked={netCleaningDone}
                onChange={(e) => setNetCleaningDone(e.target.checked)}
                className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <label htmlFor="netCleaning" className="text-gray-700 font-medium cursor-pointer flex-1">
                Net Cleaning Done
              </label>
              {netCleaningDone && (
                <Check className="w-5 h-5 text-green-500 flex-shrink-0" />
              )}
            </div>

            <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
              <input
                type="checkbox"
                id="pumpCleaning"
                checked={pumpCleaningDone}
                onChange={(e) => setPumpCleaningDone(e.target.checked)}
                className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <label htmlFor="pumpCleaning" className="text-gray-700 font-medium cursor-pointer flex-1">
                Pump Cleaning Done
              </label>
              {pumpCleaningDone && (
                <Check className="w-5 h-5 text-green-500 flex-shrink-0" />
              )}
            </div>
          </div>
        </div>

        {/* Chemical Treatment Section */}
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <Settings className="w-5 h-5 text-amber-500" />
            Chemical Treatment
          </h3>
          
          <div className="space-y-4">
            <div className="flex items-center gap-3 p-3 bg-amber-50 rounded-lg">
              <input
                type="checkbox"
                id="chlorineAdded"
                checked={chlorineAdded}
                onChange={(e) => setChlorineAdded(e.target.checked)}
                className="w-5 h-5 text-amber-600 border-gray-300 rounded focus:ring-amber-500"
              />
              <label htmlFor="chlorineAdded" className="text-gray-700 font-medium cursor-pointer flex-1">
                Chlorine Added
              </label>
              {chlorineAdded && (
                <Check className="w-5 h-5 text-green-500 flex-shrink-0" />
              )}
            </div>

            <div className="flex items-center gap-3 p-3 bg-amber-50 rounded-lg">
              <input
                type="checkbox"
                id="muriaticAdded"
                checked={muriaticAdded}
                onChange={(e) => setMuriaticAdded(e.target.checked)}
                className="w-5 h-5 text-amber-600 border-gray-300 rounded focus:ring-amber-500"
              />
              <label htmlFor="muriaticAdded" className="text-gray-700 font-medium cursor-pointer flex-1">
                Muriatic Acid Added
              </label>
              {muriaticAdded && (
                <Check className="w-5 h-5 text-green-500 flex-shrink-0" />
              )}
            </div>
          </div>
        </div>

        {/* Remarks Section */}
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Remarks</h3>
          <textarea
            id="remarks"
            value={remarks}
            onChange={(e) => setRemarks(e.target.value)}
            rows={4}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500"
            placeholder="Any additional observations or notes about the pool cleaning..."
          />
        </div>

        <div className="flex justify-end space-x-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate('/staff/pool-cleaning')}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={loading || !hasStaffProfile || !currentUserStaffId}
          >
            {loading ? 'Submitting...' : 'Submit Pool Cleaning Record'}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default PoolCleaningForm;
