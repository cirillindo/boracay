import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { StaffBonus, fetchStaffBonuses, deleteStaffBonus } from '../../lib/staffBonusService';
import { Plus, Edit, Trash2, DollarSign, Calendar, User, CheckCircle, XCircle } from 'lucide-react';
import { supabase } from '../../lib/supabase'; // Corrected: Added missing import for supabase

export interface StaffBonus {
  id?: string;
  staff_id: string;
  amount_php: number;
  bonus_date: string;
  description: string;
  is_paid: boolean;
  created_at?: string;
  updated_at?: string;
  staff_details?: {
    first_name: string;
    last_name: string;
  };
}

const StaffBonusList: React.FC = () => {
  const [bonuses, setBonuses] = useState<StaffBonus[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isMobile, setIsMobile] = useState(false);
  const [showPaidBonuses, setShowPaidBonuses] = useState(false); // New state for filtering paid bonuses
  const [updatingStatusId, setUpdatingStatusId] = useState<string | null>(null); // Loading state for status update

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    loadBonuses();
  }, [showPaidBonuses]); // Reload bonuses when showPaidBonuses changes

  const loadBonuses = async () => {
    try {
      setLoading(true);
      let query = supabase
        .from('staff_bonuses')
        .select(`
          *,
          staff_details:staff_id (
            first_name,
            last_name
          )
        `)
        .order('bonus_date', { ascending: false }); // Newest records on top

      // Filter out paid bonuses if showPaidBonuses is false
      if (!showPaidBonuses) {
        query = query.eq('is_paid', false);
      }

      const { data, error } = await query;

      if (error) throw error;
      setBonuses(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load bonuses');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this bonus?')) {
      try {
        await deleteStaffBonus(id);
        setBonuses(bonuses.filter(bonus => bonus.id !== id));
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to delete bonus');
      }
    }
  };

  const togglePaidStatus = async (id: string, currentStatus: boolean) => {
    setUpdatingStatusId(id); // Set loading state for this bonus
    try {
      const { error } = await supabase
        .from('staff_bonuses')
        .update({ is_paid: !currentStatus })
        .eq('id', id);

      if (error) throw error;
      
      // Optimistically update UI
      setBonuses(prevBonuses => prevBonuses.map(bonus => 
        bonus.id === id ? { ...bonus, is_paid: !currentStatus } : bonus
      ));
      
      // If we're hiding paid bonuses and this one just became paid, remove it from view
      if (!showPaidBonuses && !currentStatus) {
        setBonuses(prevBonuses => prevBonuses.filter(bonus => bonus.id !== id));
      }

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update bonus status');
    } finally {
      setUpdatingStatusId(null); // Clear loading state
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-600"></div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Staff Bonuses</h1>
        <Link
          to="/admin/staff-bonuses/new"
          className="bg-amber-600 text-white px-4 py-2 rounded-md hover:bg-amber-700 flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Add Bonus
        </Link>
      </div>

      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-md">
          <p className="text-red-600 text-sm">{error}</p>
        </div>
      )}

      {/* Filter Checkbox */}
      <div className="mb-4 flex items-center">
        <input
          type="checkbox"
          id="showPaidBonuses"
          checked={showPaidBonuses}
          onChange={(e) => setShowPaidBonuses(e.target.checked)}
          className="rounded border-gray-300 text-amber-600 focus:ring-amber-500"
        />
        <label htmlFor="showPaidBonuses" className="ml-2 text-sm font-medium text-gray-700">
          Show Paid Bonuses
        </label>
      </div>

      {bonuses.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg">No bonuses found</p>
          <Link
            to="/admin/staff-bonuses/new"
            className="mt-4 inline-flex items-center px-4 py-2 bg-amber-600 text-white rounded-md hover:bg-amber-700"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add First Bonus
          </Link>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          {isMobile ? (
            <div className="divide-y divide-gray-200">
              {bonuses.map((bonus) => (
                <div key={bonus.id} className="bg-gray-50 p-4 rounded-lg shadow-sm border border-gray-200">
                  <div className="flex justify-between items-center mb-3">
                    <h3 className="text-base font-bold text-gray-900">
                      {bonus.staff_details?.first_name} {bonus.staff_details?.last_name}
                    </h3>
                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${bonus.is_paid ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                      {bonus.is_paid ? <CheckCircle className="w-3 h-3 mr-1" /> : <XCircle className="w-3 h-3 mr-1" />}
                      {bonus.is_paid ? 'Paid' : 'Unpaid'}
                    </span>
                  </div>

                  <div className="text-sm text-gray-700 space-y-2 mb-4">
                    <div className="flex items-center gap-2">
                      <DollarSign className="w-4 h-4 text-gray-500" />
                      <span>Amount: ₱{bonus.amount_php.toLocaleString()}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-gray-500" />
                      <span>Date: {formatDate(bonus.bonus_date)}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <User className="w-4 h-4 text-gray-500" />
                      <span>Reason: {bonus.description}</span>
                    </div>
                  </div>

                  <div className="flex justify-end space-x-2 pt-3 border-t border-gray-200">
                    <button
                      onClick={() => togglePaidStatus(bonus.id!, bonus.is_paid)}
                      disabled={updatingStatusId === bonus.id}
                      className={`px-3 py-1 rounded-md text-sm font-medium ${
                        bonus.is_paid ? 'bg-yellow-500 text-white' : 'bg-green-500 text-white'
                      } hover:opacity-80 disabled:opacity-50`}
                    >
                      {updatingStatusId === bonus.id ? (
                        <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                      ) : (
                        bonus.is_paid ? 'Mark Unpaid' : 'Mark Paid'
                      )}
                    </button>
                    <Link
                      to={`/admin/staff-bonuses/edit/${bonus.id}`}
                      className="p-2 text-amber-600 hover:text-amber-900"
                      title="Edit bonus"
                    >
                      <Edit className="w-5 h-5" />
                    </Link>
                    <button
                      onClick={() => handleDelete(bonus.id!)}
                      className="p-2 text-red-600 hover:text-red-900"
                      title="Delete bonus"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Staff Member
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Amount (PHP)
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Bonus Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Reason
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {bonuses.map((bonus) => (
                  <tr key={bonus.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {bonus.staff_details?.first_name} {bonus.staff_details?.last_name}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      ₱{bonus.amount_php.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(bonus.bonus_date)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {bonus.description}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${bonus.is_paid ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                        {bonus.is_paid ? 'Paid' : 'Unpaid'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => togglePaidStatus(bonus.id!, bonus.is_paid)}
                          disabled={updatingStatusId === bonus.id}
                          className={`px-3 py-1 rounded-md text-sm font-medium ${
                            bonus.is_paid ? 'bg-yellow-500 text-white' : 'bg-green-500 text-white'
                          } hover:opacity-80 disabled:opacity-50`}
                        >
                          {updatingStatusId === bonus.id ? (
                            <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                          ) : (
                            bonus.is_paid ? 'Mark Unpaid' : 'Mark Paid'
                          )}
                        </button>
                        <Link
                          to={`/admin/staff-bonuses/edit/${bonus.id}`}
                          className="text-amber-600 hover:text-amber-900"
                        >
                          <Edit className="w-4 h-4" />
                        </Link>
                        <button
                          onClick={() => handleDelete(bonus.id!)}
                          className="text-red-600 hover:text-red-900"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}
    </div>
  );
};

export default StaffBonusList;
