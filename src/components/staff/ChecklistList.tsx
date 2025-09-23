import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import Button from '../ui/Button';
import { Pencil, Trash2, Eye, CheckCircle, XCircle, Clock, Droplets, DollarSign, AlertCircle, ListChecks } from 'lucide-react';
import DatePicker from 'react-datepicker'; // Import DatePicker
import 'react-datepicker/dist/react-datepicker.css'; // Import DatePicker styles
import { format } from 'date-fns'; // Import format from date-fns

// Define interfaces for data structures
interface ChecklistSubmission {
  id: string;
  room_id: string;
  staff_id: string;
  submission_time: string;
  overall_remarks: string | null;
  status: 'pending' | 'completed' | 'issues_found' | 'pending_review';
  rooms?: { room_name: string } | null;
  staff_details?: { first_name: string; last_name: string } | null;
  checklist_payments?: {
    id: string;
    amount_paid_php: number;
    payment_date: string;
    paid_by_user_id: string;
    notes?: string;
  }[];
  checklist_item_responses?: {
    checklist_templates?: {
      section_name: string;
    } | null;
  }[];
  display_section_name?: string;
}

interface ChecklistListProps {
  hideAddButton?: boolean;
  hideViewButton?: boolean;
  sectionName?: string;
  isAdminView?: boolean; // Added isAdminView prop
}

const ChecklistList: React.FC<ChecklistListProps> = ({ 
  hideAddButton = false, 
  hideViewButton = false,
  sectionName,
  isAdminView = false // Default to false
}) => {
  const [submissions, setSubmissions] = useState<ChecklistSubmission[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [paymentLoading, setPaymentLoading] = useState<string | null>(null);
  const [isMobile, setIsMobile] = useState(false);

  // Filter states
  const [filterStartDate, setFilterStartDate] = useState<Date | null>(null);
  const [filterEndDate, setFilterEndDate] = useState<Date | null>(null);
  const [filterStaffId, setFilterStaffId] = useState<string>('');
  const [filterRoomId, setFilterRoomId] = useState<string>('');
  const [filterPaymentStatus, setFilterPaymentStatus] = useState<'all' | 'paid' | 'unpaid'>('all');
  const [roomOptions, setRoomOptions] = useState<{ id: string; room_name: string }[]>([]);
  const [staffOptions, setStaffOptions] = useState<{ id: string; first_name: string; last_name: string }[]>([]);
  const [showPaid, setShowPaid] = useState(false); // New state for hiding paid records

  // Detect mobile view
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Load filter options (rooms and staff)
  useEffect(() => {
    const fetchFilterOptions = async () => {
      try {
        const { data: roomsData, error: roomsError } = await supabase.from('rooms').select('id, room_name').order('room_name');
        if (roomsError) throw roomsError;
        setRoomOptions(roomsData || []);

        const { data: staffData, error: staffError } = await supabase.from('staff_details').select('id, first_name, last_name').order('first_name');
        if (staffError) throw staffError;
        setStaffOptions(staffData || []);
      } catch (err) {
        console.error('Error fetching filter options:', err);
      }
    };
    fetchFilterOptions();
  }, []);

  // Load submissions
  useEffect(() => {
    loadSubmissions();
  }, [sectionName, isAdminView, filterStartDate, filterEndDate, filterStaffId, filterRoomId, filterPaymentStatus]); // Added filter dependencies

  const loadSubmissions = async () => {
    console.log("--- loadSubmissions called ---");
    setLoading(true);
    setError('');
    
    try {
      // Check authentication
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) {
        console.log("User not authenticated:", userError);
        setError("User not authenticated. Please log in.");
        setLoading(false);
        return;
      }
      console.log("Authenticated user ID:", user.id);

      // Fetch user role
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single();

      if (profileError || !profileData) {
        console.log("Error fetching user profile or role:", profileError);
        setError("Could not fetch user role. Please check profile setup.");
        setLoading(false);
        return;
      }
      console.log("User role (as seen by component):", profileData.role); // CRITICAL LOG

      // Build the base query
      let query = supabase
        .from('checklist_submissions')
        .select(`
          *,
          rooms (room_name),
          staff_details (first_name, last_name),
          checklist_payments (
            id,
            amount_paid_php,
            payment_date,
            paid_by_user_id,
            notes
          ),
          checklist_item_responses (
            checklist_templates (section_name)
          )
        `)
        .order('submission_time', { ascending: false });

      // Apply filters only if isAdminView is true
      if (isAdminView) {
        if (filterStartDate) {
          query = query.gte('submission_time', format(filterStartDate, 'yyyy-MM-dd\'T\'00:00:00\'Z\''));
        }
        if (filterEndDate) {
          query = query.lte('submission_time', format(filterEndDate, 'yyyy-MM-dd\'T\'23:59:59\'Z\''));
        }
        if (filterStaffId) {
          query = query.eq('staff_id', filterStaffId);
        }
        if (filterRoomId) {
          query = query.eq('room_id', filterRoomId);
        }
      }

      console.log("Executing Supabase query...");
      const { data, error } = await query;
      console.log("Supabase query result - RAW DATA:", data); // CRITICAL LOG
      console.log("Supabase query result - ERROR:", error); // CRITICAL LOG

      if (error) {
        console.error('Supabase query error details:', error);
        setError(`Error fetching data: ${error.message}`); 
        setLoading(false);
        return;
      }
      
      let processedSubmissions: ChecklistSubmission[] = [];

      if (data) {
        // Process each submission to extract section name
        processedSubmissions = (data || []).map(submission => {
          // Get section name from the first checklist item response
          let sectionNameFromItem = 'N/A';
          if (submission.checklist_item_responses && submission.checklist_item_responses.length > 0) {
            sectionNameFromItem = submission.checklist_item_responses[0]?.checklist_templates?.section_name || 'N/A'; // Corrected access
          }
          
          return {
            ...submission,
            display_section_name: sectionNameFromItem
          };
        });

        // Apply section filter (always applies if sectionName is provided)
        if (sectionName) {
          processedSubmissions = processedSubmissions.filter(
            submission => submission.display_section_name === sectionName
          );
        }

        // Apply payment status filter in memory if isAdminView
        if (isAdminView && filterPaymentStatus !== 'all') {
          processedSubmissions = processedSubmissions.filter(submission => {
            const isPaid = submission.checklist_payments && submission.checklist_payments.length > 0;
            return filterPaymentStatus === 'paid' ? isPaid : !isPaid;
          });
        }
      }
      setSubmissions(processedSubmissions);
    } catch (err) {
      console.error('Error loading submissions in catch block:', err);
      setError('An unexpected error occurred while loading submissions.');
    } finally {
      setLoading(false);
      console.log("--- loadSubmissions finished ---");
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this checklist submission?')) return;

    try {
      const { error } = await supabase
        .from('checklist_submissions')
        .delete()
        .eq('id', id);

      if (error) throw error;
      setSubmissions(submissions.filter(sub => sub.id !== id));
    } catch (err) {
      setError('Error deleting submission');
      console.error(err);
    }
  };

  const handleMarkAsPaid = async (submissionId: string) => {
    if (!window.confirm('Mark this checklist as paid (PHP 10)?')) return;

    try {
      setPaymentLoading(submissionId);
      setError('');

      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) {
        throw new Error('You must be logged in to mark payments');
      }

      // Insert payment record
      const { error: paymentError } = await supabase
        .from('checklist_payments')
        .insert({
          submission_id: submissionId,
          amount_paid_php: 10,
          paid_by_user_id: user.id,
          notes: 'Marked as paid from admin dashboard'
        });

      if (paymentError) throw paymentError;

      await loadSubmissions();
    } catch (err) {
      console.error('Error marking as paid:', err);
      setError('Error marking checklist as paid');
    } finally {
      setPaymentLoading(null);
    }
  };

  const handleMarkAsUnpaid = async (submissionId: string, paymentId: string) => {
    if (!window.confirm('Are you sure you want to mark this checklist as unpaid? This will delete the payment record.')) return;

    try {
      setPaymentLoading(submissionId);
      setError('');

      const { error: deleteError } = await supabase
        .from('checklist_payments')
        .delete()
        .eq('id', paymentId);

      if (deleteError) throw deleteError;

      await loadSubmissions(); // Reload submissions to reflect the change
    } catch (err) {
      console.error('Error marking as unpaid:', err);
      setError('Error marking checklist as unpaid');
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

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'pending_review':
        return <AlertCircle className="w-5 h-5 text-yellow-500" />;
      case 'issues_found':
        return <XCircle className="w-5 h-5 text-red-500" />;
      default:
        return <Clock className="w-5 h-5 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'pending_review':
        return 'bg-yellow-100 text-yellow-800';
      case 'issues_found':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getPaymentStatus = (submission: ChecklistSubmission) => {
    return submission.checklist_payments && submission.checklist_payments.length > 0;
  };

  const getPaymentIcon = (submission: ChecklistSubmission) => {
    const isPaid = getPaymentStatus(submission);
    return isPaid ? (
      <CheckCircle className="w-5 h-5 text-green-500" />
    ) : (
      <XCircle className="w-5 h-5 text-red-500" />
    );
  };

  const getPaymentColor = (submission: ChecklistSubmission) => {
    const isPaid = getPaymentStatus(submission);
    return isPaid ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800';
  };

  // Determine the base path for links
  const basePath = isAdminView ? '/admin/checklists' : '/staff/checklists';

  // Filter submissions based on showPaid state
  const filteredSubmissions = showPaid ? submissions : submissions.filter(submission => !getPaymentStatus(submission));

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-amber-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 text-red-600 p-4 rounded-md mb-4">
        <div className="flex items-center">
          <AlertCircle className="w-5 h-5 mr-2" />
          {error}
        </div>
        <button
          onClick={loadSubmissions}
          className="mt-2 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Checklist Submissions</h2>
        {!hideAddButton && (
          <Link to={`${basePath}/new`}>
            <Button>Add New Checklist</Button>
          </Link>
        )}
      </div>

      {isAdminView && (
        <div className="bg-white p-6 rounded-xl shadow-sm mb-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Filter Submissions</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {/* Date Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
              <DatePicker
                selected={filterStartDate}
                onChange={(date: Date | null) => setFilterStartDate(date)}
                dateFormat="yyyy/MM/dd"
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                placeholderText="Select start date"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
              <DatePicker
                selected={filterEndDate}
                onChange={(date: Date | null) => setFilterEndDate(date)}
                dateFormat="yyyy/MM/dd"
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                placeholderText="Select end date"
              />
            </div>

            {/* Staff Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Staff</label>
              <select
                value={filterStaffId}
                onChange={(e) => setFilterStaffId(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              >
                <option value="">All Staff</option>
                {staffOptions.map(staff => (
                  <option key={staff.id} value={staff.id}>{staff.first_name} {staff.last_name}</option>
                ))}
              </select>
            </div>

            {/* Room Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Room</label>
              <select
                value={filterRoomId}
                onChange={(e) => setFilterRoomId(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              >
                <option value="">All Rooms</option>
                {roomOptions.map(room => (
                  <option key={room.id} value={room.id}>{room.room_name}</option>
                ))}
              </select>
            </div>

            {/* Payment Status Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Payment Status</label>
              <select
                value={filterPaymentStatus}
                onChange={(e) => setFilterPaymentStatus(e.target.value as 'all' | 'paid' | 'unpaid')}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              >
                <option value="all">All</option>
                <option value="paid">Paid</option>
                <option value="unpaid">Unpaid</option>
              </select>
            </div>

            {/* Action Buttons */}
            <div className="md:col-span-3 lg:col-span-4 flex gap-4 mt-4">
              <Button onClick={loadSubmissions} className="flex-1">Apply Filters</Button>
              <Button onClick={() => {
                setFilterStartDate(null);
                setFilterEndDate(null);
                setFilterStaffId('');
                setFilterRoomId('');
                setFilterPaymentStatus('all');
                // Trigger loadSubmissions after state update
                // No need for setTimeout here, useEffect will react to state changes
              }} variant="outline" className="flex-1">Clear Filters</Button>
            </div>
          </div>
        </div>
      )}

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

      {filteredSubmissions.length === 0 ? (
        <div className="text-center py-12">
          <ListChecks className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No checklist submissions found</h3>
          <p className="text-gray-500 mb-4">
            {sectionName ? `No submissions found for ${sectionName}` : 'Get started by adding your first checklist submission.'}
          </p>
          {!hideAddButton && (
            <Link to={`${basePath}/new`}>
              <Button>Create First Submission</Button>
            </Link>
          )}
        </div>
      ) : (
        <div className="bg-white shadow-md rounded-lg overflow-hidden">
          {isMobile ? (
            // Mobile Card View
            <div className="p-4 space-y-4">
              {filteredSubmissions.map((submission) => (
                <div key={submission.id} className="bg-gray-50 p-4 rounded-lg shadow-sm border border-gray-200">
                  <div className="flex justify-between items-center mb-3">
                    {/* Removed Record ID from mobile view */}
                    <h3 className="text-base font-bold text-gray-900">
                      {submission.rooms?.room_name || `Room ${submission.room_id?.slice(0, 8)}`} - {submission.display_section_name}
                    </h3>
                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(submission.status)}`}>
                      {getStatusIcon(submission.status)}
                      {submission.status.replace('_', ' ')}
                    </span>
                  </div>

                  <div className="text-sm text-gray-700 space-y-1 mb-4">
                    <div><strong>Date:</strong> {formatDate(submission.submission_time)}</div>
                    <div>
                      <strong>Staff:</strong> 
                      {submission.staff_details ? 
                        ` ${submission.staff_details.first_name} ${submission.staff_details.last_name}` : 
                        `Staff ${submission.staff_id?.slice(0, 8)}`
                      }
                    </div>
                    {submission.overall_remarks && (
                      <div><strong>Remarks:</strong> {submission.overall_remarks}</div>
                    )}
                  </div>

                  <div className="flex justify-between items-center pt-3 border-t border-gray-200">
                    <div className="flex items-center gap-2">
                      {getPaymentIcon(submission)}
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getPaymentColor(submission)}`}>
                        {getPaymentStatus(submission) ? 'Paid' : 'Unpaid'}
                      </span>
                    </div>
                    <div className="flex space-x-2">
                      {!hideViewButton && (
                        <Link
                          to={`${basePath}/edit/${submission.id}`}
                          className="p-3 text-amber-600 hover:text-amber-900"
                          title="View/Edit Submission"
                        >
                          <Eye className="w-5 h-5" />
                        </Link>
                      )}
                      {getPaymentStatus(submission) ? (
                        <button
                          onClick={() => handleMarkAsUnpaid(submission.id, submission.checklist_payments![0].id)}
                          disabled={paymentLoading === submission.id}
                          className="p-3 text-red-600 hover:text-red-900 disabled:opacity-50"
                          title="Mark as Unpaid"
                        >
                          {paymentLoading === submission.id ? (
                            <div className="animate-spin rounded-full h-5 w-5 border-2 border-red-500 border-t-transparent"></div>
                          ) : (
                            <DollarSign className="w-5 h-5" />
                          )}
                        </button>
                      ) : (
                        <button
                          onClick={() => handleMarkAsPaid(submission.id)}
                          disabled={paymentLoading === submission.id}
                          className="p-3 text-green-600 hover:text-green-900 disabled:opacity-50"
                          title="Mark as Paid (PHP 10)"
                        >
                          {paymentLoading === submission.id ? (
                            <div className="animate-spin rounded-full h-5 w-5 border-2 border-green-500 border-t-transparent"></div>
                          ) : (
                            <DollarSign className="w-5 h-5" />
                          )}
                        </button>
                      )}
                      <button
                        onClick={() => handleDelete(submission.id)}
                        className="p-3 text-red-600 hover:text-red-900"
                        title="Delete Submission"
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
                      Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Room
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Staff
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Section
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
                  {filteredSubmissions.map((submission) => (
                    <tr key={submission.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {formatDate(submission.submission_time)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {submission.rooms?.room_name || 'N/A'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {submission.staff_details ? 
                          ` ${submission.staff_details.first_name} ${submission.staff_details.last_name}` : 
                          `Staff ${submission.staff_id?.slice(0, 8)}`
                        }
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {submission.display_section_name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          {getStatusIcon(submission.status)}
                          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(submission.status)}`}>
                            {submission.status.replace('_', ' ')}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          {getPaymentIcon(submission)}
                          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getPaymentColor(submission)}`}>
                            {getPaymentStatus(submission) ? 'Paid' : 'Unpaid'}
                          </span>
                        </div>
                        {getPaymentStatus(submission) && submission.checklist_payments?.[0] && (
                          <div className="text-xs text-gray-500 mt-1">
                            ₱{submission.checklist_payments[0].amount_paid_php} on {formatDate(submission.checklist_payments[0].payment_date)}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex justify-end space-x-2">
                          {!hideViewButton && (
                            <Link
                              to={`${basePath}/edit/${submission.id}`}
                              className="p-2 text-amber-600 hover:text-amber-900"
                              title="View/Edit Submission"
                            >
                              <Eye className="w-5 h-5" />
                            </Link>
                          )}
                          {getPaymentStatus(submission) ? (
                            <button
                              onClick={() => handleMarkAsUnpaid(submission.id, submission.checklist_payments![0].id)}
                              disabled={paymentLoading === submission.id}
                              className="p-2 text-red-600 hover:text-red-900 disabled:opacity-50"
                              title="Mark as Unpaid"
                            >
                              {paymentLoading === submission.id ? (
                                <div className="animate-spin rounded-full h-5 w-5 border-2 border-red-500 border-t-transparent"></div>
                              ) : (
                                <DollarSign className="w-5 h-5" />
                              )}
                            </button>
                          ) : (
                            <button
                              onClick={() => handleMarkAsPaid(submission.id)}
                              disabled={paymentLoading === submission.id}
                              className="p-2 text-green-600 hover:text-green-900 disabled:opacity-50"
                              title="Mark as Paid (PHP 10)"
                            >
                              {paymentLoading === submission.id ? (
                                <div className="animate-spin rounded-full h-5 w-5 border-2 border-green-500 border-t-transparent"></div>
                              ) : (
                                <DollarSign className="w-5 h-5" />
                              )}
                            </button>
                          )}
                          <button
                            onClick={() => handleDelete(submission.id)}
                            className="p-2 text-red-600 hover:text-red-900"
                            title="Delete Submission"
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

export default ChecklistList;

