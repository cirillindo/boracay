import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import Button from '../ui/Button';
import { Pencil, Trash2, CheckCircle, XCircle, Clock, Droplets, DollarSign } from 'lucide-react';

interface PoolCleaningRecord {
  id: string;
  created_at: string;
  staff_id: string;
  net_cleaning_done: boolean;
  pump_cleaning_done: boolean;
  chlorine_added: boolean;
  muriatic_added: boolean;
  remarks: string | null;
  staff_details?: { first_name: string; last_name: string };
  pool_cleaning_payments?: {
    id: string;
    amount_paid_php: number;
    payment_date: string;
    paid_by_user_id: string;
    notes?: string;
  }[];
}

interface PoolCleaningListProps {
  hideAddButton?: boolean; // New prop
}

const PoolCleaningList: React.FC<PoolCleaningListProps> = ({ hideAddButton = false }) => {
  const [records, setRecords] = useState<PoolCleaningRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [paymentLoading, setPaymentLoading] = useState<string | null>(null);
  const [isMobile, setIsMobile] = useState(false); // State for mobile view
  const [showPaid, setShowPaid] = useState(false); // New state for hiding paid records

  useEffect(() => {
    // Detect mobile view on mount and resize
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768); // Adjust breakpoint as needed
    };

    handleResize(); // Set initial value
    window.addEventListener('resize', handleResize); // Add event listener
    return () => window.removeEventListener('resize', handleResize); // Clean up
  }, []);

  useEffect(() => {
    loadRecords();
  }, []);

  const loadRecords = async () => {
    setLoading(true);
    setError('');
    
    try {
      let query = supabase
        .from('pool_cleaning_records')
        .select(`
          *,
          staff_details (first_name, last_name),
          pool_cleaning_payments (
            id,
            amount_paid_php,
            payment_date,
            paid_by_user_id,
            notes
          )
        `)
        .order('created_at', { ascending: false });

      const { data, error } = await query;

      if (error) {
        console.error('Supabase query error details:', error);
        throw error;
      }
      setRecords(data || []);
    } catch (err) {
      setError('Error loading pool cleaning records');
      console.error('Detailed error loading records:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this pool cleaning record?')) return;

    try {
      const { error } = await supabase
        .from('pool_cleaning_records')
        .delete()
        .eq('id', id);

      if (error) throw error;
      setRecords(records.filter(r => r.id !== id));
    } catch (err) {
      setError('Error deleting pool cleaning record');
      console.error(err);
    }
  };

  const handleMarkAsPaid = async (recordId: string) => {
    if (!window.confirm('Mark this pool cleaning record as paid (PHP 10)?')) return;

    try {
      setPaymentLoading(recordId);
      setError('');

      // Get current user
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) {
        throw new Error('You must be logged in to mark payments');
      }

      // Insert payment record
      const { error: paymentError } = await supabase
        .from('pool_cleaning_payments')
        .insert({
          record_id: recordId,
          amount_paid_php: 10,
          paid_by_user_id: user.id,
          notes: 'Marked as paid from admin dashboard'
        });

      if (paymentError) throw paymentError;

      // Reload records to reflect the payment status
      await loadRecords();
    } catch (err) {
      console.error('Error marking as paid:', err);
      setError('Error marking pool cleaning record as paid');
    } finally {
      setPaymentLoading(null);
    }
  };

  const handleMarkAsUnpaid = async (recordId: string, paymentId: string) => {
    if (!window.confirm('Are you sure you want to mark this pool cleaning record as unpaid? This will delete the payment record.')) return;

    try {
      setPaymentLoading(recordId);
      setError('');

      const { error: deleteError } = await supabase
        .from('pool_cleaning_payments')
        .delete()
        .eq('id', paymentId);

      if (deleteError) throw deleteError;

      await loadRecords(); // Reload records to reflect the change
    } catch (err) {
      console.error('Error marking as unpaid:', err);
      setError('Error marking pool cleaning record as unpaid');
    } finally {
      setPaymentLoading(null);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      timeZone: 'Asia/Manila'
    });
  };

  const getCompletionStatus = (record: PoolCleaningRecord) => {
    const completedTasks = [
      record.net_cleaning_done,
      record.pump_cleaning_done,
      record.chlorine_added,
      record.muriatic_added
    ].filter(Boolean).length;
    
    return `${completedTasks}/4 tasks completed`;
  };

  const getStatusIcon = (record: PoolCleaningRecord) => {
    const completedTasks = [
      record.net_cleaning_done,
      record.pump_cleaning_done,
      record.chlorine_added,
      record.muriatic_added
    ].filter(Boolean).length;
    
    if (completedTasks === 4) {
      return <CheckCircle className="w-5 h-5 text-green-500" />;
    } else if (completedTasks > 0) {
      return <Clock className="w-5 h-5 text-yellow-500" />;
    } else {
      return <XCircle className="w-5 h-5 text-red-500" />;
    }
  };

  const getStatusColor = (record: PoolCleaningRecord) => {
    const completedTasks = [
      record.net_cleaning_done,
      record.pump_cleaning_done,
      record.chlorine_added,
      record.muriatic_added
    ].filter(Boolean).length;
    
    if (completedTasks === 4) {
      return 'bg-green-100 text-green-800';
    } else if (completedTasks > 0) {
      return 'bg-yellow-100 text-yellow-800';
    } else {
      return 'bg-red-100 text-red-800';
    }
  };

  const getPaymentStatus = (record: PoolCleaningRecord) => {
    return record.pool_cleaning_payments && record.pool_cleaning_payments.length > 0;
  };

  const getPaymentIcon = (record: PoolCleaningRecord) => {
    const isPaid = getPaymentStatus(record);
    return isPaid ? (
      <CheckCircle className="w-5 h-5 text-green-500" />
    ) : (
      <XCircle className="w-5 h-5 text-red-500" />
    );
  };

  const getPaymentColor = (record: PoolCleaningRecord) => {
    const isPaid = getPaymentStatus(record);
    return isPaid ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800';
  };

  // Filter records based on showPaid state
  const filteredRecords = showPaid ? records : records.filter(record => !getPaymentStatus(record));

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
        <h2 className="text-2xl font-bold text-gray-900">Pool Cleaning Records</h2>
        {!hideAddButton && ( // Conditionally render the button
          <Link to="/staff/pool-cleaning/new">
            <Button>Add New Record</Button>
          </Link>
        )}
      </div>

      {/* Show Paid Checkbox */}
      <div className="mb-4 flex items-center">
        <input
          type="checkbox"
          id="showPaid"
          checked={showPaid}
          onChange={(e) => setShowPaid(e.target.checked)}
          className="rounded border-gray-300 text-amber-600 focus:ring-amber-500"
        />
        <label htmlFor="showPaid" className="ml-2 text-sm font-medium text-gray-700">
          Show Paid Records
        </label>
      </div>

      {filteredRecords.length === 0 ? (
        <div className="text-center py-12">
          <Droplets className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No pool cleaning records yet</h3>
          <p className="text-gray-500 mb-4">Get started by adding your first pool cleaning record.</p>
          {!hideAddButton && (
            <Link to="/staff/pool-cleaning/new">
              <Button>Create First Record</Button>
            </Link>
          )}
        </div>
      ) : (
        <div className="bg-white shadow-md rounded-lg overflow-hidden">
          {isMobile ? (
            // Mobile Card View
            <div className="p-4 space-y-4">
              {filteredRecords.map((record) => (
                <div key={record.id} className="bg-gray-50 p-4 rounded-lg shadow-sm border border-gray-200">
                  <div className="flex justify-between items-center mb-3">
                    {/* Removed Record ID from mobile view */}
                    <h3 className="text-base font-bold text-gray-900">Pool Cleaning</h3>
                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(record)}`}>
                      {getStatusIcon(record)}
                      {getCompletionStatus(record)}
                    </span>
                  </div>

                  <div className="text-sm text-gray-700 space-y-1 mb-4">
                    <div><strong>Date:</strong> {formatDate(record.created_at)}</div>
                    <div><strong>Staff:</strong> {record.staff_details?.first_name} {record.staff_details?.last_name}</div>
                    <div className="mt-2">
                      <strong>Cleaning Tasks:</strong>
                      <ul className="list-disc list-inside ml-2 text-xs">
                        <li className="flex items-center gap-1">
                          {record.net_cleaning_done ? <CheckCircle className="w-3 h-3 text-green-500" /> : <XCircle className="w-3 h-3 text-red-500" />}
                          Net Cleaning
                        </li>
                        <li className="flex items-center gap-1">
                          {record.pump_cleaning_done ? <CheckCircle className="w-3 h-3 text-green-500" /> : <XCircle className="w-3 h-3 text-red-500" />}
                          Pump Cleaning
                        </li>
                      </ul>
                    </div>
                    <div className="mt-2">
                      <strong>Chemical Treatment:</strong>
                      <ul className="list-disc list-inside ml-2 text-xs">
                        <li className="flex items-center gap-1">
                          {record.chlorine_added ? <CheckCircle className="w-3 h-3 text-green-500" /> : <XCircle className="w-3 h-3 text-red-500" />}
                          Chlorine Added
                        </li>
                        <li className="flex items-center gap-1">
                          {record.muriatic_added ? <CheckCircle className="w-3 h-3 text-green-500" /> : <XCircle className="w-3 h-3 text-red-500" />}
                          Muriatic Added
                        </li>
                      </ul>
                    </div>
                    {record.remarks && (
                      <div className="mt-2 text-xs"><strong>Remarks:</strong> {record.remarks}</div>
                    )}
                  </div>

                  <div className="flex justify-between items-center pt-3 border-t border-gray-200">
                    <div className="flex items-center gap-2">
                      {getPaymentIcon(record)}
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getPaymentColor(record)}`}>
                        {getPaymentStatus(record) ? 'Paid' : 'Unpaid'}
                      </span>
                    </div>
                    <div className="flex space-x-2">
                      {getPaymentStatus(record) ? (
                        <button
                          onClick={() => handleMarkAsUnpaid(record.id, record.pool_cleaning_payments![0].id)}
                          disabled={paymentLoading === record.id}
                          className="p-3 text-red-600 hover:text-red-900 disabled:opacity-50"
                          title="Mark as Unpaid"
                        >
                          {paymentLoading === record.id ? (
                            <div className="animate-spin rounded-full h-5 w-5 border-2 border-red-500 border-t-transparent"></div>
                          ) : (
                            <DollarSign className="w-5 h-5" />
                          )}
                        </button>
                      ) : (
                        <button
                          onClick={() => handleMarkAsPaid(record.id)}
                          disabled={paymentLoading === record.id}
                          className="p-3 text-green-600 hover:text-green-900 disabled:opacity-50"
                          title="Mark as Paid (PHP 10)"
                        >
                          {paymentLoading === record.id ? (
                            <div className="animate-spin rounded-full h-5 w-5 border-2 border-green-500 border-t-transparent"></div>
                          ) : (
                            <DollarSign className="w-5 h-5" />
                          )}
                        </button>
                      )}
                      <button
                        onClick={() => handleDelete(record.id)}
                        className="p-3 text-red-600 hover:text-red-900"
                        title="Delete Record"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
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
                      Date & Time
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Staff
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Cleaning Tasks
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Chemical Treatment
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Payment
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredRecords.map((record) => (
                    <tr key={record.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {formatDate(record.created_at)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {record.staff_details?.first_name} {record.staff_details?.last_name}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex flex-col space-y-1">
                          <div className="flex items-center gap-2">
                            {record.net_cleaning_done ? (
                              <CheckCircle className="w-4 h-4 text-green-500" />
                            ) : (
                              <XCircle className="w-4 h-4 text-red-500" />
                            )}
                            <span className="text-xs text-gray-600">Net Cleaning</span>
                          </div>
                          <div className="flex items-center gap-2">
                            {record.pump_cleaning_done ? (
                              <CheckCircle className="w-4 h-4 text-green-500" />
                            ) : (
                              <XCircle className="w-4 h-4 text-red-500" />
                            )}
                            <span className="text-xs text-gray-600">Pump Cleaning</span>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex flex-col space-y-1">
                          <div className="flex items-center gap-2">
                            {record.chlorine_added ? (
                              <CheckCircle className="w-4 h-4 text-green-500" />
                            ) : (
                              <XCircle className="w-4 h-4 text-red-500" />
                            )}
                            <span className="text-xs text-gray-600">Chlorine</span>
                          </div>
                          <div className="flex items-center gap-2">
                            {record.muriatic_added ? (
                              <CheckCircle className="w-4 h-4 text-green-500" />
                            ) : (
                              <XCircle className="w-4 h-4 text-red-500" />
                            )}
                            <span className="text-xs text-gray-600">Muriatic</span>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          {getStatusIcon(record)}
                          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(record)}`}>
                            {getCompletionStatus(record)}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          {getPaymentIcon(record)}
                          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getPaymentColor(record)}`}>
                            {getPaymentStatus(record) ? 'Paid' : 'Unpaid'}
                          </span>
                        </div>
                        {getPaymentStatus(record) && record.pool_cleaning_payments?.[0] && (
                          <div className="text-xs text-gray-500 mt-1">
                            ₱{record.pool_cleaning_payments[0].amount_paid_php} on {formatDate(record.pool_cleaning_payments[0].payment_date)}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex justify-end space-x-2">
                          {getPaymentStatus(record) ? (
                            <button
                              onClick={() => handleMarkAsUnpaid(record.id, record.pool_cleaning_payments![0].id)}
                              disabled={paymentLoading === record.id}
                              className="p-2 text-red-600 hover:text-red-900 disabled:opacity-50"
                              title="Mark as Unpaid"
                            >
                              {paymentLoading === record.id ? (
                                <div className="animate-spin rounded-full h-5 w-5 border-2 border-red-500 border-t-transparent"></div>
                              ) : (
                                <DollarSign className="w-5 h-5" />
                              )}
                            </button>
                          ) : (
                            <button
                              onClick={() => handleMarkAsPaid(record.id)}
                              disabled={paymentLoading === record.id}
                              className="p-2 text-green-600 hover:text-green-900 disabled:opacity-50"
                              title="Mark as Paid (PHP 10)"
                            >
                              {paymentLoading === record.id ? (
                                <div className="animate-spin rounded-full h-5 w-5 border-2 border-green-500 border-t-transparent"></div>
                              ) : (
                                <DollarSign className="w-5 h-5" />
                              )}
                            </button>
                          )}
                          <button
                            onClick={() => handleDelete(record.id)}
                            className="p-2 text-red-600 hover:text-red-900"
                            title="Delete Record"
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

export default PoolCleaningList;
