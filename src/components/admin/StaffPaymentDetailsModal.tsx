import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom';
import { X, DollarSign, Calendar, FileText, User, AlertCircle, Trash2 } from 'lucide-react'; // Import Trash2
import { StaffBonus } from '../../lib/staffBonusService'; // Import StaffBonus interface
import Button from '../ui/Button';
import { fetchStaffPayments, StaffPayment, deleteStaffPayment } from '../../lib/staffPaymentService'; // Import deleteStaffPayment
import { supabase } from '../../lib/supabase'; // Import supabase for additional fetches
import { format } from 'date-fns';

interface StaffPaymentDetailsModalProps {
  staffId: string;
  staffName: string;
  month: number;
  year: number;
  onClose: () => void;
}

// Unified payment interface for display
interface UnifiedPayment {
  id: string;
  date: string;
  amount: number;
  type: string; // e.g., 'Salary', 'Cash Advance', 'Bonus', 'Checklist', 'Pool Cleaning'
  notes?: string | null;
  description?: string | null; // Added for bonus description
  source: 'manual' | 'checklist' | 'pool_cleaning';
}

const StaffPaymentDetailsModal: React.FC<StaffPaymentDetailsModalProps> = ({
  staffId,
  staffName,
  month,
  year,
  onClose,
}) => {
  const [payments, setPayments] = useState<UnifiedPayment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deletingPaymentId, setDeletingPaymentId] = useState<string | null>(null); // New state for loading indicator on delete

  const loadPayments = async () => {
    setLoading(true);
    setError(null);
    try {
      const fetchedManualPayments = await fetchStaffPayments(month, year, staffId);

      // Fetch staff bonuses for this staff member
      const { data: staffBonusesData, error: staffBonusesError } = await supabase
        .from('staff_bonuses')
        .select('*')
        .eq('staff_id', staffId)
        .gte('bonus_date', `${year}-${month.toString().padStart(2, '0')}-01`)
        .lte('bonus_date', `${year}-${month.toString().padStart(2, '0')}-${new Date(year, month, 0).getDate()}`);

      if (staffBonusesError) throw staffBonusesError;

      // Fetch checklist payments for this staff member
      const { data: checklistPaymentsData, error: checklistError } = await supabase
        .from('checklist_payments')
        .select(`
          id,
          payment_date,
          amount_paid_php,
          notes,
          submission_id,
          checklist_submissions (
            staff_id,
            rooms (room_name)
          )
        `)
        .eq('checklist_submissions.staff_id', staffId) // Filter by staff_id in the related submission
        .gte('payment_date', `${year}-${month.toString().padStart(2, '0')}-01`)
        .lte('payment_date', `${year}-${month.toString().padStart(2, '0')}-${new Date(year, month, 0).getDate()}`);

      if (checklistError) throw checklistError;

      // Fetch pool cleaning payments for this staff member
      const { data: poolCleaningPaymentsData, error: poolCleaningError } = await supabase
        .from('pool_cleaning_payments')
        .select(`
          id,
          payment_date,
          amount_paid_php,
          notes,
          record_id,
          pool_cleaning_records (
            staff_id
          )
        `)
        .eq('pool_cleaning_records.staff_id', staffId) // Filter by staff_id in the related record
        .gte('payment_date', `${year}-${month.toString().padStart(2, '0')}-01`)
        .lte('payment_date', `${year}-${month.toString().padStart(2, '0')}-${new Date(year, month, 0).getDate()}`);

      if (poolCleaningError) throw poolCleaningError;

      const unifiedPayments: UnifiedPayment[] = [];

      // Add manual payments
      fetchedManualPayments.forEach(p => {
        unifiedPayments.push({
          id: p.id!,
          date: p.payment_date,
          amount: p.amount_php,
          type: p.payment_type.replace('_', ' ').split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' '),
          notes: p.notes,
          source: 'manual'
        });
      });

      // Add checklist payments
      checklistPaymentsData.forEach(p => {
        unifiedPayments.push({
          id: p.id,
          date: p.payment_date,
          amount: p.amount_paid_php,
          type: `Checklist (${p.checklist_submissions?.rooms?.room_name || 'N/A'})`,
          notes: p.notes || `Submission ID: ${p.submission_id.slice(0, 8)}`,
          source: 'checklist'
        });
      });

      // Add pool cleaning payments
      poolCleaningPaymentsData.forEach(p => {
        unifiedPayments.push({
          id: p.id,
          date: p.payment_date,
          amount: p.amount_paid_php,
          type: 'Pool Cleaning',
          notes: p.notes || `Record ID: ${p.record_id.slice(0, 8)}`,
          source: 'pool_cleaning'
        });
      });

      // Add staff bonuses
      staffBonusesData.forEach((b: StaffBonus) => {
        unifiedPayments.push({
          id: b.id!,
          date: b.bonus_date,
          amount: b.amount_php,
          type: 'Bonus',
          notes: b.description, // Use description for notes
          source: 'manual' // Treat bonuses as manual payments for deletion purposes
        });
      });

      // Sort all payments by date
      unifiedPayments.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()); // Newest on top

      setPayments(unifiedPayments);
    } catch (err: any) {
      setError(`Failed to load payment details: ${err.message || 'Unknown error'}`);
      console.error('Error loading staff payment details:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPayments();
  }, [staffId, month, year]);

  const handleDeletePayment = async (paymentId: string, source: UnifiedPayment['source']) => {
    if (!window.confirm('Are you sure you want to delete this payment record? This action cannot be undone.')) {
      return;
    }

    setDeletingPaymentId(paymentId); // Set loading for this specific payment
    setError(null);
    try {
      if (source === 'manual') {
        await deleteStaffPayment(paymentId);
      } else if (source === 'checklist') {
        const { error: deleteError } = await supabase.from('checklist_payments').delete().eq('id', paymentId);
        if (deleteError) throw deleteError;
      } else if (source === 'pool_cleaning') {
        const { error: deleteError } = await supabase.from('pool_cleaning_payments').delete().eq('id', paymentId);
        if (deleteError) throw deleteError;
      }
      await loadPayments(); // Reload payments after successful deletion
    } catch (err: any) {
      setError(`Failed to delete payment: ${err.message || 'Unknown error'}`);
      console.error('Error deleting staff payment:', err);
    } finally {
      setDeletingPaymentId(null); // Clear loading
    }
  };

  const formatAmount = (amount: number) => `₱${amount.toLocaleString()}`;

  const modalRoot = document.getElementById('modal-root');
  if (!modalRoot) return null;

  return ReactDOM.createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-lg shadow-xl p-6 max-w-2xl w-full relative">
        <button onClick={onClose} className="absolute top-3 right-3 text-gray-500 hover:text-gray-700">
          <X className="w-6 h-6" />
        </button>
        <h2 className="text-2xl font-bold text-gray-900 mb-4">
          Payment Details for {staffName} ({format(new Date(year, month - 1), 'MMMM yyyy')})
        </h2>

        {loading ? (
          <div className="flex justify-center items-center h-32">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-amber-500"></div>
          </div>
        ) : error ? (
          <div className="bg-red-50 text-red-600 p-4 rounded-md flex items-center gap-2">
            <AlertCircle className="w-5 h-5" />
            {error}
          </div>
        ) : payments.length === 0 ? (
          <p className="text-gray-600">No payment records found for this staff member this month.</p>
        ) : (
          <div className="space-y-4 max-h-96 overflow-y-auto pr-2">
            {payments.map((payment) => (
              <div key={payment.id} className="bg-gray-50 p-4 rounded-md border border-gray-200">
                <div className="flex justify-between items-center mb-2">
                  <span className="font-semibold text-gray-800 flex items-center gap-2">
                    <Calendar className="w-4 h-4" /> {format(new Date(payment.date), 'MMM dd, yyyy')}
                  </span>
                  <span className="font-bold text-lg text-green-600">
                    {formatAmount(payment.amount)}
                  </span>
                </div>
                <div className="text-sm text-gray-700 flex items-center gap-2">
                  <DollarSign className="w-4 h-4" /> Type: {payment.type}
                </div>
                {payment.notes && (
                  <div className="text-sm text-gray-600 mt-1 flex items-start gap-2">
                    <FileText className="w-4 h-4 mt-1" /> Notes: {payment.notes}
                  </div>
                )}
                <div className="flex justify-end mt-3">
                  <button
                    onClick={() => handleDeletePayment(payment.id, payment.source)} // Pass source to delete function
                    disabled={deletingPaymentId === payment.id}
                    className="text-red-600 hover:text-red-800 disabled:opacity-50"
                    title="Delete Payment"
                  >
                    {deletingPaymentId === payment.id ? (
                      <div className="animate-spin rounded-full h-5 w-5 border-2 border-red-500 border-t-transparent"></div>
                    ) : (
                      <Trash2 className="w-5 h-5" />
                    )}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="mt-6 flex justify-end">
          <Button onClick={onClose}>Close</Button>
        </div>
      </div>
    </div>,
    modalRoot
  );
};

export default StaffPaymentDetailsModal;
