// src/components/shared/CheckinList.tsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import Button from '../ui/Button';
import { Pencil, Trash2, Calendar, Clock, Users, Home, FileText, DollarSign } from 'lucide-react';
import { format, differenceInDays } from 'date-fns';

interface Checkin {
  id: string;
  check_in_date: string;
  check_out_date: string;
  arrival_time: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
  user_id: string | null;
  status: 'pending' | 'checked_in' | 'checked_out' | 'cancelled';
  checkin_room_details?: {
    id: string;
    room_id: string;
    pax_count: number;
    price_per_night_eur?: number;
    rooms?: { room_name: string };
  }[];
  total_amount_eur?: number;
}

interface CheckinListProps {
  isAdminView?: boolean;
  isStaffView?: boolean;
}

const CheckinList: React.FC<CheckinListProps> = ({ isAdminView = false, isStaffView = false }) => {
  const [checkins, setCheckins] = useState<Checkin[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isMobile, setIsMobile] = useState(false);
  const [showCheckedOut, setShowCheckedOut] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    loadCheckins();
  }, []);

  const loadCheckins = async () => {
    try {
      const { data, error } = await supabase
        .from('checkins')
        .select(`
          *,
          checkin_room_details (
            pax_count,
            price_per_night_eur,
            rooms (room_name)
          )
        `)
        .order('check_in_date', { ascending: true });

      if (error) throw error;
      setCheckins(data || []);
    } catch (err) {
      setError('Error loading check-ins');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this check-in record?')) return;

    try {
      const { error } = await supabase
        .from('checkins')
        .delete()
        .eq('id', id);

      if (error) throw error;
      setCheckins(checkins.filter(checkin => checkin.id !== id));
    } catch (err) {
      setError('Error deleting check-in');
      console.error(err);
    }
  };

  const handleUpdateStatus = async (id: string, currentStatus: Checkin['status']) => {
    let newStatus: Checkin['status'];
    if (currentStatus === 'pending') {
      newStatus = 'checked_in';
    } else if (currentStatus === 'checked_in') {
      newStatus = 'checked_out';
    } else if (currentStatus === 'checked_out') {
      newStatus = 'pending'; // Cycle back to pending if already checked out
    } else {
      newStatus = 'pending'; // Default for 'cancelled' or unknown
    }

    try {
      const { error } = await supabase
        .from('checkins')
        .update({ status: newStatus, updated_at: new Date().toISOString() })
        .eq('id', id);

      if (error) throw error;
      setCheckins(checkins.map(checkin =>
        checkin.id === id ? { ...checkin, status: newStatus } : checkin
      ));
    } catch (err) {
      setError('Error updating check-in status');
      console.error(err);
    }
  };

  const calculateNights = (checkIn: string, checkOut: string) => {
    const start = new Date(checkIn);
    const end = new Date(checkOut);
    return differenceInDays(end, start);
  };

  const getStatusDisplay = (status: Checkin['status']) => {
    switch (status) {
      case 'pending': return { text: 'WAITING', color: 'bg-blue-500 hover:bg-blue-600 text-white' };
      case 'checked_in': return { text: 'IN HOUSE', color: 'bg-green-500 hover:bg-green-600 text-white' };
      case 'checked_out': return { text: 'CHECKED OUT', color: 'bg-red-500 hover:bg-red-600 text-white' };
      case 'cancelled': return { text: 'CANCELLED', color: 'bg-gray-500 hover:bg-gray-600 text-white' };
      default: return { text: 'UNKNOWN', color: 'bg-gray-300 text-gray-800' };
    }
  };

  // Filter checkins based on showCheckedOut state
  const filteredCheckins = showCheckedOut ? checkins : checkins.filter(checkin => checkin.status !== 'checked_out');

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
        {error}
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Check-ins</h2>
        {isAdminView && ( // Only show Add New button in admin view
          <Link to="/admin/checkins/new">
            <Button>Add New Check-in</Button>
          </Link>
        )}
      </div>

      {/* Filter Checkbox */}
      <div className="mb-4 flex items-center">
        <input
          type="checkbox"
          id="showCheckedOut"
          checked={showCheckedOut}
          onChange={(e) => setShowCheckedOut(e.target.checked)}
          className="rounded border-gray-300 text-amber-600 focus:ring-amber-500"
        />
        <label htmlFor="showCheckedOut" className="ml-2 text-sm font-medium text-gray-700">
          Show Checked Out Check-ins
        </label>
      </div>

      {filteredCheckins.length === 0 ? (
        <div className="text-center py-12">
          <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No check-in records found</h3>
          <p className="text-gray-500 mb-4">Get started by adding your first check-in record.</p>
          {isAdminView && (
            <Link to="/admin/checkins/new">
              <Button>Add First Check-in</Button>
            </Link>
          )}
        </div>
      ) : (
        <div className="bg-white shadow-md rounded-lg overflow-hidden">
          {isMobile ? (
            // Mobile Card View
            <div className="p-4 space-y-4">
              {filteredCheckins.map((checkin) => {
                const statusDisplay = getStatusDisplay(checkin.status);
                return (
                  <div key={checkin.id} className="bg-gray-50 p-4 rounded-lg shadow-sm border border-gray-200">
                    <div className="flex justify-between items-center mb-3">
                      <h3 className="text-base font-bold text-gray-900">Check-in Details</h3>
                    </div>

                    <div className="text-sm text-gray-700 space-y-2 mb-4">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-gray-500" />
                        <span>{format(new Date(checkin.check_in_date), 'MMM dd, yyyy')} - {format(new Date(checkin.check_out_date), 'MMM dd, yyyy')}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-gray-500" />
                        <span>Arrival: {checkin.arrival_time || 'N/A'}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Home className="w-4 h-4 text-gray-500" />
                        <span>Nights: {calculateNights(checkin.check_in_date, checkin.check_out_date)}</span>
                      </div>
                      <div className="mt-2">
                        <strong>Rooms:</strong>
                        <ul className="list-disc list-inside ml-2 text-xs">
                          {checkin.checkin_room_details?.map((detail, idx) => (
                            <li key={idx}>
                              {detail.rooms?.room_name || 'Unknown Room'} ({detail.pax_count} PAX)
                              {/* FIX: Add null check for price_per_night_eur */}
                              {detail.price_per_night_eur !== undefined && detail.price_per_night_eur !== null ? ` - €${detail.price_per_night_eur.toFixed(2)}/night` : ''}
                            </li>
                          ))}
                        </ul>
                      </div>
                      {checkin.total_amount_eur !== undefined && checkin.total_amount_eur !== null && (
                        <div className="flex items-center gap-2 mt-2">
                          <DollarSign className="w-4 h-4 text-gray-500" />
                          <span>Total: €{checkin.total_amount_eur.toFixed(2)}</span>
                        </div>
                      )}
                      {checkin.notes && (
                        <div className="flex items-start gap-2">
                          <FileText className="w-4 h-4 text-gray-500" />
                          <span>Notes: {checkin.notes}</span>
                        </div>
                      )}
                    </div>

                    <div className="flex justify-between items-center pt-3 border-t border-gray-200">
                      <Button
                        onClick={() => handleUpdateStatus(checkin.id, checkin.status)}
                        variant="custom"
                        className={`${statusDisplay.color} text-xs py-1 px-2`}
                        disabled={checkin.status === 'cancelled'}
                      >
                        {statusDisplay.text}
                      </Button>
                      {isAdminView && (
                        <div className="flex space-x-2 ml-2">
                          <Link
                            to={`/admin/checkins/edit/${checkin.id}`}
                            className="p-2 text-amber-600 hover:text-amber-900"
                            title="Edit check-in"
                          >
                            <Pencil className="w-5 h-5" />
                          </Link>
                          <button
                            onClick={() => handleDelete(checkin.id)}
                            className="p-2 text-red-600 hover:text-red-900"
                            title="Delete check-in"
                          >
                            <Trash2 className="w-5 h-5" />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            // Desktop Table View
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Check-in Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Check-out Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Nights
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Rooms (PAX)
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Price/Night
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Total Amount
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Arrival Time
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Notes
                    </th>
                    {isAdminView && (
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    )}
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredCheckins.map((checkin) => {
                    const statusDisplay = getStatusDisplay(checkin.status);
                    return (
                      <tr key={checkin.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">
                            {format(new Date(checkin.check_in_date), 'MMM dd, yyyy')}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            {format(new Date(checkin.check_out_date), 'MMM dd, yyyy')}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {calculateNights(checkin.check_in_date, checkin.check_out_date)}
                        </td>
                        <td className="px-6 py-4">
                          <ul className="list-disc list-inside text-sm text-gray-500">
                            {checkin.checkin_room_details?.map((detail, idx) => (
                              <li key={idx}>{detail.rooms?.room_name || 'Unknown Room'} ({detail.pax_count} PAX)</li>
                            ))}
                          </ul>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          <ul className="list-disc list-inside text-sm text-gray-500">
                            {checkin.checkin_room_details?.map((detail, idx) => (
                              <li key={idx}>
                                {/* FIX: Add null check for price_per_night_eur */}
                                {detail.price_per_night_eur !== undefined && detail.price_per_night_eur !== null ? `€${detail.price_per_night_eur.toFixed(2)}` : 'N/A'}
                              </li>
                            ))}
                          </ul>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {checkin.total_amount_eur !== undefined && checkin.total_amount_eur !== null ? `€${checkin.total_amount_eur.toFixed(2)}` : 'N/A'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {checkin.arrival_time || 'N/A'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <Button
                            onClick={() => handleUpdateStatus(checkin.id, checkin.status)}
                            variant="custom"
                            className={`${statusDisplay.color} text-xs py-1 px-2`}
                            disabled={checkin.status === 'cancelled'}
                          >
                            {statusDisplay.text}
                          </Button>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-500 max-w-xs truncate">
                          {checkin.notes || 'N/A'}
                        </td>
                        {isAdminView && (
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            <div className="flex justify-end space-x-2">
                              <Link
                                to={`/admin/checkins/edit/${checkin.id}`}
                                className="p-2 text-amber-600 hover:text-amber-900"
                                title="Edit check-in"
                              >
                                <Pencil className="w-5 h-5" />
                              </Link>
                              <button
                                onClick={() => handleDelete(checkin.id)}
                                className="p-2 text-red-600 hover:text-red-900"
                                title="Delete check-in"
                              >
                                <Trash2 className="w-5 h-5" />
                              </button>
                            </div>
                          </td>
                        )}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default CheckinList;

