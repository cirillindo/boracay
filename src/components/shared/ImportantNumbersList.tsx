// src/components/shared/ImportantNumbersList.tsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import Button from '../ui/Button';
import { Pencil, Trash2, Phone, MessageCircle, User, AlertCircle, Plus } from 'lucide-react';

interface ImportantNumber {
  id: string;
  job: string;
  name: string;
  phone_number: string;
  fb_link: string | null;
  created_at: string;
  updated_at: string;
  user_id: string | null;
}

interface ImportantNumbersListProps {
  dashboardType: 'admin' | 'staff'; 
}

// Define job options for the filter dropdown
const JOB_OPTIONS = [
  { value: '', label: 'All Jobs' }, // Option to show all
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

const ImportantNumbersList: React.FC<ImportantNumbersListProps> = ({ dashboardType }) => {
  const [numbers, setNumbers] = useState<ImportantNumber[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isMobile, setIsMobile] = useState(false);
  const [filterJob, setFilterJob] = useState<string>(''); // New state for job filter

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    loadNumbers();
  }, [filterJob]); // Re-load numbers when filterJob changes

  const loadNumbers = async () => {
    try {
      setLoading(true);
      setError('');
      let query = supabase
        .from('important_numbers')
        .select('*')
        .order('job', { ascending: true })
        .order('name', { ascending: true });

      // Apply filter if filterJob is not empty
      if (filterJob) {
        query = query.eq('job', filterJob);
      }

      const { data, error } = await query;

      if (error) throw error;
      setNumbers(data || []);
    } catch (err) {
      setError('Error loading important numbers.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this important number?')) return;

    try {
      const { error } = await supabase
        .from('important_numbers')
        .delete()
        .eq('id', id);

      if (error) throw error;
      setNumbers(numbers.filter(num => num.id !== id));
    } catch (err) {
      setError('Error deleting important number.');
      console.error(err);
    }
  };

  const handleClearFilters = () => {
    setFilterJob('');
    // loadNumbers will be triggered by the useEffect when filterJob changes
  };

  const getBasePath = () => `/${dashboardType}/important-numbers`;

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-amber-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 text-red-600 p-4 rounded-md">
        <div className="flex items-center">
          <AlertCircle className="w-5 h-5 mr-2" />
          {error}
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Important Numbers</h2>
        <Link to={`${getBasePath()}/new`}>
          <Button>Add New Number</Button>
        </Link>
      </div>

      {/* Filter Section */}
      <div className="bg-white p-6 rounded-xl shadow-sm mb-6">
        <h3 className="text-lg font-bold text-gray-900 mb-4">Filter by Job Title</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label htmlFor="jobFilter" className="block text-sm font-medium text-gray-700 mb-1">Job Title</label>
            <select
              id="jobFilter"
              value={filterJob}
              onChange={(e) => setFilterJob(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500"
            >
              {JOB_OPTIONS.map(option => (
                <option key={option.value} value={option.value}>{option.label}</option>
              ))}
            </select>
          </div>
          <div className="md:col-span-2 flex items-end gap-2">
            <Button onClick={loadNumbers} className="flex-1">Apply Filter</Button>
            <Button onClick={handleClearFilters} variant="outline" className="flex-1">Clear Filters</Button>
          </div>
        </div>
      </div>

      {numbers.length === 0 ? (
        <div className="text-center py-12">
          <Phone className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No important numbers found</h3>
          <p className="text-gray-500 mb-4">Get started by adding your first important number.</p>
          <Link to={`${getBasePath()}/new`}>
            <Button>Add First Number</Button>
          </Link>
        </div>
      ) : (
        <div className="bg-white shadow-md rounded-lg overflow-hidden">
          {isMobile ? (
            // Mobile Card View
            <div className="p-4 space-y-4">
              {numbers.map((num) => (
                <div key={num.id} className="bg-gray-50 p-4 rounded-lg shadow-sm border border-gray-200">
                  <div className="flex justify-between items-center mb-3">
                    <h3 className="text-base font-bold text-gray-900">{num.name}</h3>
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      {num.job}
                    </span>
                  </div>

                  <div className="text-sm text-gray-700 space-y-2 mb-4">
                    <div className="flex items-center gap-2">
                      <Phone className="w-4 h-4 text-gray-500" />
                      {/* Make phone number clickable in mobile view */}
                      <a href={`tel:${num.phone_number}`} className="hover:underline text-blue-600">
                        {num.phone_number}
                      </a>
                    </div>
                    {num.fb_link && (
                      <div className="flex items-center gap-2">
                        <MessageCircle className="w-4 h-4 text-gray-500" />
                        <a href={num.fb_link} target="_blank" rel="noopener noreferrer" className="hover:underline text-blue-600">Facebook Profile</a>
                      </div>
                    )}
                  </div>

                  <div className="flex justify-end space-x-2 pt-3 border-t border-gray-200">
                    <Link
                      to={`${getBasePath()}/edit/${num.id}`}
                      className="p-2 text-amber-600 hover:text-amber-900"
                      title="Edit number"
                    >
                      <Pencil className="w-5 h-5" />
                    </Link>
                    <button
                      onClick={() => handleDelete(num.id)}
                      className="p-2 text-red-600 hover:text-red-900"
                      title="Delete number"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            // Desktop Table View
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Job
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Name
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Phone Number
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      FB Link
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {numbers.map((num) => (
                    <tr key={num.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {num.job}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {num.name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {/* Make phone number clickable in desktop view */}
                        <a href={`tel:${num.phone_number}`} className="text-blue-600 hover:underline">
                          {num.phone_number}
                        </a>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {num.fb_link ? (
                          <a href={num.fb_link} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                            View Profile
                          </a>
                        ) : (
                          'N/A'
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex justify-end space-x-2">
                          <Link
                            to={`${getBasePath()}/edit/${num.id}`}
                            className="p-2 text-amber-600 hover:text-amber-900"
                            title="Edit number"
                          >
                            <Pencil className="w-5 h-5" />
                          </Link>
                          <button
                            onClick={() => handleDelete(num.id)}
                            className="p-2 text-red-600 hover:text-red-900"
                            title="Delete number"
                          >
                            <Trash2 className="w-5 h-5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ImportantNumbersList;

