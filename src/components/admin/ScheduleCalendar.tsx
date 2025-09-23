import React, { useState, useEffect, useCallback } from 'react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, addMonths, subMonths } from 'date-fns';
import { ChevronLeft, ChevronRight, Plus, Star, User, Clock, CheckCircle, XCircle, DollarSign } from 'lucide-react';
import Container from '../ui/Container';
import Button from '../ui/Button';
import { fetchMonthlySchedule, StaffSchedule, deleteScheduleAssignment } from '../../lib/scheduleService';
import { fetchStaffPayments } from '../../lib/staffPaymentService';
import ScheduleAssignmentForm from './ScheduleAssignmentForm';
import StaffPaymentForm from './StaffPaymentForm';
import StaffPaymentDetailsModal from './StaffPaymentDetailsModal';
import { supabase } from '../../lib/supabase';

// Helper to get staff initials
const getStaffInitials = (firstName: string, lastName: string) => {
  return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
};

// Define a color palette for staff members - STRICTLY GREEN, BLUE, YELLOW
const STAFF_COLORS = [
  'bg-green-300', // Green
  'bg-blue-300',  // Blue
  'bg-yellow-500', // Yellow
  // Fallback colors if you have more than 3 unique staff IDs, these will be used in rotation
  'bg-purple-600',
  'bg-red-600',
  'bg-teal-600',
  'bg-orange-600',
  'bg-cyan-600',
  'bg-lime-600'
];

// Function to get a deterministic color for a staff ID
const getStaffColor = (staffId: string) => {
  let hash = 0;
  for (let i = 0; i < staffId.length; i++) {
    hash = staffId.charCodeAt(i) + ((hash << 5) - hash);
  }
  const index = Math.abs(hash % STAFF_COLORS.length);
  return STAFF_COLORS[index];
};


const ScheduleCalendar: React.FC = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [schedules, setSchedules] = useState<StaffSchedule[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [monthlyEarnings, setMonthlyEarnings] = useState<Record<string, { name: string; totalEarned: number; totalPaid: number; checklistCount: number; poolCleaningCount: number; totalTaskPayments: number; totalBonuses: number }>>({});

  // State for modal control
  const [isAssignmentModalOpen, setIsAssignmentModalOpen] = useState(false);
  const [selectedAssignment, setSelectedAssignment] = useState<StaffSchedule | undefined>(undefined);
  const [selectedDateForNewAssignment, setSelectedDateForNewAssignment] = useState<Date | undefined>(undefined);

  // State for payment modal
  const [isPaymentModalOpen, setIsPaymentModal] = useState(false);
  const [selectedStaffForPayment, setSelectedStaffForPayment] = useState<{ id: string; name: string } | null>(null);

  // State for payment details modal
  const [showPaymentDetailsModal, setShowPaymentDetailsModal] = useState(false);
  const [staffToViewPayments, setStaffToViewPayments] = useState<{ id: string; name: string } | null>(null);


  // User-specific states
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [currentStaffId, setCurrentStaffId] = useState<string | null>(null);
  const [currentUserRole, setCurrentUserRole] = useState<string | null>(null);

  // This useEffect fetches user and role once on mount
  useEffect(() => {
    const fetchUserAndRole = async () => {
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (user && !userError) {
        setCurrentUserId(user.id);
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', user.id)
          .single();
        
        if (profileData && !profileError) {
          setCurrentUserRole(profileData.role);
          const { data: staffData, error: staffDetailsError } = await supabase
            .from('staff_details')
            .select('id')
            .eq('user_id', user.id)
            .maybeSingle();
          if (staffData && !staffDetailsError) {
            setCurrentStaffId(staffData.id);
          } else {
            // If no staff profile found for the user, set currentStaffId to null
            setCurrentStaffId(null);
          }
        } else {
          // If no profile data or error fetching profile, set role to null
          setCurrentUserRole(null);
        }
      } else {
        // If no user or error fetching user, set all to null
        setCurrentUserId(null);
        setCurrentUserRole(null);
        setCurrentStaffId(null);
      }
    };
    fetchUserAndRole();
  }, []);

  const loadSchedule = useCallback(async () => {
    setLoading(true);
    setError(null);

    // CRITICAL: Only proceed if currentUserRole is determined (not null)
    // If it's null, it means the user context is not yet loaded.
    if (currentUserRole === null) {
      setLoading(false);
      return;
    }

    try {
      const year = currentDate.getFullYear();
      const month = currentDate.getMonth() + 1;
      const lastDay = new Date(year, month, 0).getDate();
      const startDate = `${year}-${month.toString().padStart(2, '0')}-01`;
      const endDate = `${year}-${month.toString().padStart(2, '0')}-${lastDay.toString().padStart(2, '0')}`;

      // Pass filterStaffId only if it's a staff view AND currentStaffId is available
      const filterId = currentUserRole === 'staff' && currentStaffId ? currentStaffId : undefined;
      
      const fetchedSchedules = await fetchMonthlySchedule(month, year, filterId);
      const fetchedManualPayments = await fetchStaffPayments(month, year, filterId);

      setSchedules(fetchedSchedules || []);

      // Initialize earnings structure with default counts and new totalTaskPayments
      const earnings: Record<string, { name: string; totalEarned: number; totalPaid: number; checklistCount: number; poolCleaningCount: number; totalTaskPayments: number; totalBonuses: number }> = {};
      
      // Populate staff names and earned amounts from schedules
      fetchedSchedules.forEach(schedule => {
        const staffId = schedule.staff_id;
        const dailySalary = schedule.staff_details?.daily_salary_php || 0;
        const staffName = schedule.staff_details ? `${schedule.staff_details.first_name} ${schedule.staff_details.last_name}` : 'Unknown Staff';

        if (!earnings[staffId]) {
          earnings[staffId] = { name: staffName, totalEarned: 0, totalPaid: 0, checklistCount: 0, poolCleaningCount: 0, totalTaskPayments: 0, totalBonuses: 0 };
        }
        if (schedule.shift_type !== 'Off') {
          earnings[staffId].totalEarned += dailySalary;
        }
      });

      // Fetch and add staff bonuses to totalEarned AND totalPaid (if paid)
      console.log('Fetching staff bonuses for period:', startDate, 'to', endDate);
      const { data: staffBonusesData, error: staffBonusesError } = await supabase
        .from('staff_bonuses')
        .select('staff_id, amount_php, is_paid') // Include is_paid
        .gte('bonus_date', startDate)
        .lte('bonus_date', endDate);

      if (staffBonusesError) {
        console.error('Error fetching staff bonuses:', staffBonusesError);
        throw staffBonusesError;
      }
      console.log('Fetched staff bonuses data:', staffBonusesData);

      staffBonusesData?.forEach(bonus => {
        const staffId = bonus.staff_id;
        console.log(`Processing bonus for staffId: ${staffId}, amount: ${bonus.amount_php}, is_paid: ${bonus.is_paid}`);
        if (earnings[staffId]) {
          console.log('Before bonus update for', staffId, ':', earnings[staffId]);
          earnings[staffId].totalEarned += bonus.amount_php;
          earnings[staffId].totalBonuses += bonus.amount_php;
          if (bonus.is_paid) { // Only add to totalPaid if the bonus is marked as paid
            earnings[staffId].totalPaid += bonus.amount_php;
          }
          console.log('After bonus update for', staffId, ':', earnings[staffId]);
        } else {
          // If a bonus exists for a staff not in schedules, add them
          console.log('No existing earnings entry for staffId:', staffId, 'from schedules. Initializing for bonus.');
          const staffName = fetchedSchedules.find(s => s.staff_id === staffId)?.staff_details ? 
                             `${fetchedSchedules.find(s => s.staff_id === staffId)?.staff_details?.first_name} ${fetchedSchedules.find(s => s.staff_id === staffId)?.staff_details?.last_name}` : 
                             'Unknown Staff';
          let bonusPaidAmount = bonus.is_paid ? bonus.amount_php : 0;
          earnings[staffId] = { name: staffName, totalEarned: bonus.amount_php, totalPaid: bonusPaidAmount, checklistCount: 0, poolCleaningCount: 0, totalTaskPayments: 0, totalBonuses: 0 };
          console.log('Initialized earnings for', staffId, ':', earnings[staffId]);
        }
      });

      // Add manual payments to totalPaid
      fetchedManualPayments.forEach(payment => {
        const staffId = payment.staff_id;
        if (earnings[staffId]) {
          earnings[staffId].totalPaid += payment.amount_php;
        } else {
          // If a payment exists for a staff not in schedules, add them
          const staffName = fetchedSchedules.find(s => s.staff_id === staffId)?.staff_details ? 
                             `${fetchedSchedules.find(s => s.staff_id === staffId)?.staff_details?.first_name} ${fetchedSchedules.find(s => s.staff_id === staffId)?.staff_details?.last_name}` : 
                             'Unknown Staff';
          earnings[staffId] = { name: staffName, totalEarned: 0, totalPaid: payment.amount_php, checklistCount: 0, poolCleaningCount: 0, totalTaskPayments: 0, totalBonuses: 0 };
        }
      });

      // Fetch and add checklist payments to totalPaid AND count checklists AND sum their payments for totalTaskPayments
      const { data: checklistSubmissionsData, error: checklistError } = await supabase
        .from('checklist_submissions')
        .select(`
          id,
          submission_time,
          staff_id,
          checklist_payments (amount_paid_php)
        `)
        .gte('submission_time', startDate)
        .lte('submission_time', endDate);

      if (checklistError) throw checklistError;
      checklistSubmissionsData?.forEach(submission => {
        const staffId = submission.staff_id;
        if (earnings[staffId]) {
          earnings[staffId].checklistCount += 1;
          submission.checklist_payments?.forEach(payment => {
            earnings[staffId].totalPaid += payment.amount_paid_php;
            earnings[staffId].totalTaskPayments += payment.amount_paid_php;
          });
        } else {
          // If a checklist exists for a staff not in schedules, add them
          const staffName = fetchedSchedules.find(s => s.staff_id === staffId)?.staff_details ? 
                             `${fetchedSchedules.find(s => s.staff_id === staffId)?.staff_details?.first_name} ${fetchedSchedules.find(s => s.staff_id === staffId)?.staff_details?.last_name}` : 
                             'Unknown Staff';
          let totalPaidForChecklist = 0;
          submission.checklist_payments?.forEach(payment => {
            totalPaidForChecklist += payment.amount_paid_php;
          });
          earnings[staffId] = { name: staffName, totalEarned: 0, totalPaid: totalPaidForChecklist, checklistCount: 1, poolCleaningCount: 0, totalTaskPayments: totalPaidForChecklist, totalBonuses: 0 };
        }
      });

      // Fetch and add pool cleaning payments to totalPaid AND count pool cleaning records AND sum their payments for totalTaskPayments
      const { data: poolCleaningRecordsData, error: poolCleaningError } = await supabase
        .from('pool_cleaning_records')
        .select(`
          id,
          created_at,
          staff_id,
          pool_cleaning_payments (amount_paid_php)
        `)
        .gte('created_at', startDate)
        .lte('created_at', endDate);

      if (poolCleaningError) throw poolCleaningError;
      poolCleaningRecordsData?.forEach(record => {
        const staffId = record.staff_id;
        if (earnings[staffId]) {
          earnings[staffId].poolCleaningCount += 1;
          record.pool_cleaning_payments?.forEach(payment => {
            earnings[staffId].totalPaid += payment.amount_paid_php;
            earnings[staffId].totalTaskPayments += payment.amount_paid_php; // FIX: Changed from payment.amount_php to payment.amount_paid_php
          });
        } else {
          // If a pool cleaning record exists for a staff not in schedules, add them
          const staffName = fetchedSchedules.find(s => s.staff_id === staffId)?.staff_details ? 
                             `${fetchedSchedules.find(s => s.staff_id === staffId)?.staff_details?.first_name} ${fetchedSchedules.find(s => s.staff_id === staffId)?.staff_details?.last_name}` : 
                             'Unknown Staff';
          let totalPaidForPoolCleaning = 0;
          record.pool_cleaning_payments?.forEach(payment => {
            totalPaidForPoolCleaning += payment.amount_paid_php;
          });
          earnings[staffId] = { name: staffName, totalEarned: 0, totalPaid: totalPaidForPoolCleaning, checklistCount: 0, poolCleaningCount: 1, totalTaskPayments: totalPaidForPoolCleaning, totalBonuses: 0 };
        }
      });

      console.log('Final monthlyEarnings object:', earnings);
      setMonthlyEarnings(earnings);

    } catch (err: any) {
      console.error('Failed to load schedules:', err);
      setError(`Failed to load schedules: ${err.message || 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  }, [currentDate, currentUserRole, currentStaffId]);

  // This useEffect triggers loadSchedule whenever currentDate, currentUserRole, or currentStaffId changes
  useEffect(() => {
    loadSchedule();
  }, [currentDate, currentUserRole, currentStaffId, loadSchedule]);

  const daysInMonth = eachDayOfInterval({
    start: startOfMonth(currentDate),
    end: endOfMonth(currentDate),
  });

  // Pad the start of the month grid with empty cells for the days before the 1st
  const firstDayOfMonth = startOfMonth(currentDate).getDay(); // 0 for Sunday, 1 for Monday
  const startingEmptyCells = Array.from({ length: firstDayOfMonth === 0 ? 6 : firstDayOfMonth - 1 }, (_, i) => i); // Adjust for Monday start

  const handlePrevMonth = () => {
    setCurrentDate(subMonths(currentDate, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(addMonths(currentDate, 1));
  };

  const handleDeleteAssignment = async (id: string) => {
    setLoading(true);
    setError(null);
    try {
      await deleteScheduleAssignment(id);
      loadSchedule(); // Reload the calendar data
      setIsAssignmentModalOpen(false); // Close the modal
      setSelectedAssignment(undefined); // Clear selected assignment
    } catch (err: any) {
      setError(`Failed to delete assignment: ${err.message || 'Unknown error'}`);
      console.error('Delete assignment error:', err);
    } finally {
      setLoading(false);
    }
  };

  // Calculate total amount to pay all staff
  const totalAmountToPayAllStaff = Object.values(monthlyEarnings).reduce((total, staff) => {
    return total + (staff.totalEarned - staff.totalPaid);
  }, 0);

  // Function to render a schedule chip
  const renderScheduleChip = (schedule: StaffSchedule) => {
    const staffName = schedule.staff_details ? `${schedule.staff_details.first_name} ${schedule.staff_details.last_name}` : 'Unknown Staff';
    const initials = schedule.staff_details ? getStaffInitials(schedule.staff_details.first_name, schedule.staff_details.last_name) : '??';
    const staffColorClass = getStaffColor(schedule.staff_id); // e.g., 'bg-green-600'

    // Base classes for the chip
    let chipClasses = `
      flex items-center justify-between px-2 py-1 text-sm rounded-md mb-1 cursor-pointer text-white
      ${staffColorClass} // Apply the staff-specific background color
    `;

    // Add border for 'is_offered'
    if (schedule.is_offered) {
      chipClasses += ' border-2 border-dashed border-white'; // Add a white dashed border for offered shifts
    }

    // Add font-weight for 'published' status
    if (schedule.status === 'published') {
      chipClasses += ' font-semibold';
    } else {
      chipClasses += ' font-normal'; // Ensure font-normal is applied if not published
    }

    // Determine if the chip is clickable for editing
    const isEditable = currentUserRole === 'admin' || (currentUserRole === 'staff' && schedule.staff_id === currentStaffId);

    return (
      <div
        key={schedule.id}
        className={chipClasses}
        onClick={() => {
          if (isEditable) {
            setSelectedAssignment(schedule);
            setSelectedDateForNewAssignment(undefined); // Clear selected date for new assignment
            setIsAssignmentModalOpen(true);
          } else {
            // Optionally show a message that they can't edit this shift
            console.log("You don't have permission to edit this shift.");
          }
        }}
      >
        <span className="flex items-center">
          {/* The inner circle for initials should also use the staff color for consistency */}
          <span className={`w-5 h-5 ${staffColorClass} text-white rounded-full flex items-center justify-center mr-1 text-xs`}>
            {initials}
          </span>
          {schedule.shift_type}
        </span>
        {/* Star icon color changed to text-white for better contrast on colored backgrounds */}
        {schedule.is_extraordinary && <Star className="w-3 h-3 text-white ml-1" />} 
      </div>
    );
  };

  return (
    <Container>
      <div className="flex flex-col items-center mb-6 md:flex-row md:justify-between">
        <h2 className="text-2xl font-bold text-gray-900 mb-4 md:mb-0">Schedule Calendar</h2>
        
        <div className="flex items-center space-x-4 md:space-x-6">
          <Button onClick={handlePrevMonth} variant="outline" size="sm">
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <span className="text-lg font-semibold min-w-[120px] text-center">
            {format(currentDate, 'MMMM yyyy')}
          </span>
          <Button onClick={handleNextMonth} variant="outline" size="sm">
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
        
        {currentUserRole === 'admin' && (
          <div className="mt-4 md:mt-0">
            <Button variant="primary">Publish Draft</Button>
          </div>
        )}
      </div>

      {/* Total Amount to Pay All Staff (Admin Only) */}
      {currentUserRole === 'admin' && (
        <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
          <h3 className="text-xl font-bold text-gray-900 mb-4">Total Amount to Pay All Staff</h3>
          <div className="flex justify-between items-center">
            <span className="text-lg font-medium text-gray-700">Net Amount Due:</span>
            <span className="font-bold text-3xl text-red-600">
              ₱{totalAmountToPayAllStaff.toLocaleString()} PHP
            </span>
          </div>
          {totalAmountToPayAllStaff < 0 && (
            <p className="text-sm text-green-600 mt-2">
              (You have overpaid by ₱{Math.abs(totalAmountToPayAllStaff).toLocaleString()} PHP)
            </p>
          )}
        </div>
      )}

      {/* Monthly Earnings Summary */}
      <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
        <h3 className="text-xl font-bold text-gray-900 mb-4">Monthly Staff Earnings</h3>
        {Object.keys(monthlyEarnings).length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Object.entries(monthlyEarnings).map(([staffId, staff], index) => {
              const amountLeftToPay = staff.totalEarned - staff.totalPaid;
              const amountLeftToPayColor = amountLeftToPay > 0 ? 'text-red-600' : 'text-green-600';
              const amountLeftToPayText = amountLeftToPay > 0 ? `₱${amountLeftToPay.toLocaleString()} PHP` : `₱${Math.abs(amountLeftToPay).toLocaleString()} PHP (Overpaid)`;

              return (
                // Conditionally render earnings card based on user role
                (currentUserRole === 'admin' || staffId === currentStaffId) && (
                  <div key={staffId} className={`p-4 rounded-lg flex flex-col justify-between ${getStaffColor(staffId)} text-white`}>
                    <span className="font-medium text-lg">{staff.name}</span>
                    <div className="flex justify-between items-center mt-2">
                      <div>
                        <div className="text-sm">Earned:</div>
                        <div className="font-bold text-xl">₱{staff.totalEarned.toLocaleString()} PHP</div>
                      </div>
                      <div>
                        <div className="text-sm">Paid:</div>
                        <div className="font-bold text-xl">₱{staff.totalPaid.toLocaleString()} PHP</div>
                      </div>
                    </div>
                    {/* New: Display Amount Left to Pay */}
                    <div className="flex justify-between items-center mt-2">
                      <div className="text-base font-semibold">Left to Pay:</div>
                      <div className={`font-bold text-xl ${amountLeftToPayColor}`}>
                        {amountLeftToPayText}
                      </div>
                    </div>
                    {/* New: Display Checklist and Pool Cleaning Counts */}
                    <div className="flex justify-between items-center mt-2 text-sm">
                      <div>Checklists: {staff.checklistCount}</div>
                      <div>Pool Records: {staff.poolCleaningCount}</div>
                    </div>
                    {/* New: Display Total Bonuses */}
                    <div className="flex justify-between items-center mt-2 text-sm">
                      <div className="font-semibold">BONUS:</div>
                      <div className="font-bold">₱{staff.totalBonuses?.toLocaleString() || 0} PHP</div>
                    </div>
                    {/* Extra Earnings from Tasks */}
                    <div className="flex justify-between items-center mt-2">
                      <div className="text-base font-semibold">Extra Earnings from Tasks:</div>
                      <div className="font-bold text-xl">₱{staff.totalTaskPayments.toLocaleString()} PHP</div>
                    </div>
                    {currentUserRole === 'admin' && ( // Only admin can record payments
                      <Button
                        onClick={() => {
                          setSelectedStaffForPayment({ id: staffId, name: staff.name });
                          setIsPaymentModal(true);
                        }}
                        variant="outline"
                        className="mt-4 border-white text-white hover:bg-white hover:text-gray-800"
                      >
                        <DollarSign className="w-4 h-4 mr-2" /> Record Payment
                      </Button>
                    )}
                    {/* Button to view payment details */}
                    {staff.totalPaid > 0 && (
                      <Button
                        onClick={() => {
                          setStaffToViewPayments({ id: staffId, name: staff.name });
                          setShowPaymentDetailsModal(true);
                        }}
                        variant="outline"
                        className="mt-2 border-white text-white hover:bg-white hover:text-gray-800"
                      >
                        View Details
                      </Button>
                    )}
                  </div>
                )
              );
            })}
          </div>
        ) : (
          <p className="text-gray-600">No staff scheduled or salary data available for this month.</p>
        )}
      </div>
      {/* END Monthly Earnings Summary */}

      {error && (
        <div className="bg-red-50 text-red-600 p-4 rounded-md mb-4">
          {error}
        </div>
      )}

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-amber-500"></div>
        </div>
      ) : (
        <div className="grid grid-cols-7 gap-1">
          {/* Day names */}
          {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day) => (
            <div key={day} className="text-center font-semibold text-gray-600 py-2">
              {day}
            </div>
          ))}

          {/* Empty cells for days before the 1st */}
          {startingEmptyCells.map((_, index) => (
            <div key={`empty-${index}`} className="bg-gray-100 rounded-md p-2 min-h-[100px]"></div>
          ))}

          {/* Calendar days */}
          {daysInMonth.map((day) => {
            const daySchedules = schedules.filter((s) =>
              isSameDay(new Date(s.schedule_date), day)
            );
            return (
              <div key={format(day, 'yyyy-MM-dd')} className="bg-white rounded-md p-2 min-h-[100px] shadow-sm border border-gray-200 relative">
                <div className="text-right font-bold text-gray-800 text-sm mb-1">
                  {format(day, 'd')}
                </div>
                <div className="space-y-1">
                  {daySchedules.map((schedule) => renderScheduleChip(schedule))}
                </div>
                {/* Add Assignment Button - visible only to admins */}
                {currentUserRole === 'admin' && (
                  <button
                    onClick={() => {
                      setSelectedDateForNewAssignment(day);
                      setSelectedAssignment(undefined); // Clear selected assignment for new entry
                      setIsAssignmentModalOpen(true);
                    }}
                    className="absolute bottom-1 right-1 p-1 bg-gray-100 hover:bg-gray-200 rounded-full text-gray-600"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Schedule Assignment Modal */}
      {isAssignmentModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <ScheduleAssignmentForm
            initialData={selectedAssignment}
            selectedDate={selectedDateForNewAssignment}
            onSuccess={() => {
              setIsAssignmentModalOpen(false);
              setSelectedAssignment(undefined);
              setSelectedDateForNewAssignment(undefined);
              loadSchedule(); // Reload data after successful submission
            }}
            onCancel={() => {
              setIsAssignmentModalOpen(false);
              setSelectedAssignment(undefined);
              setSelectedDateForNewAssignment(undefined);
            }}
            onDelete={handleDeleteAssignment}
          />
        </div>
      )}

      {/* Staff Payment Modal */}
      {isPaymentModalOpen && selectedStaffForPayment && (
        <StaffPaymentForm
          staffId={selectedStaffForPayment.id}
          staffName={selectedStaffForPayment.name}
          onSuccess={() => {
            setIsPaymentModal(false);
            setSelectedStaffForPayment(null);
            loadSchedule();
          }}
          onCancel={() => {
            setIsPaymentModal(false);
            setSelectedStaffForPayment(null);
          }}
        />
      )}

      {/* Staff Payment Details Modal */}
      {showPaymentDetailsModal && staffToViewPayments && (
        <StaffPaymentDetailsModal
          staffId={staffToViewPayments.id}
          staffName={staffToViewPayments.name}
          month={currentDate.getMonth() + 1}
          year={currentDate.getFullYear()}
          onClose={() => {
            setShowPaymentDetailsModal(false);
            setStaffToViewPayments(null);
          }}
        />
      )}
    </Container>
  );
};

export default ScheduleCalendar;
