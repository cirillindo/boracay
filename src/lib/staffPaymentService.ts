import { supabase } from './supabase';

export interface StaffPayment {
  id?: string;
  staff_id: string;
  payment_date: string; // YYYY-MM-DD format
  amount_php: number;
  payment_type: 'salary' | 'cash_advance' | 'bonus' | 'other';
  notes?: string | null;
  created_at?: string;
  updated_at?: string;
}

/**
 * Adds a new staff payment record to the database.
 * @param paymentData The payment data to insert.
 * @returns The inserted payment record.
 */
export const addStaffPayment = async (paymentData: Omit<StaffPayment, 'id' | 'created_at' | 'updated_at'>): Promise<StaffPayment> => {
  const { data, error } = await supabase
    .from('staff_payments')
    .insert(paymentData)
    .select()
    .single();

  if (error) {
    console.error('Error adding staff payment:', error);
    throw error;
  }
  return data;
};

/**
 * Fetches staff payments for a given month and year, optionally filtered by staff ID.
 * @param month The month (1-12).
 * @param year The year.
 * @param staffId Optional staff ID to filter payments for a specific staff member.
 * @returns An array of staff payment records.
 */
export const fetchStaffPayments = async (month: number, year: number, staffId?: string): Promise<StaffPayment[]> => {
  const startDate = `${year}-${month.toString().padStart(2, '0')}-01`;
  const lastDay = new Date(year, month, 0).getDate();
  const endDate = `${year}-${month.toString().padStart(2, '0')}-${lastDay.toString().padStart(2, '0')}`;

  let query = supabase
    .from('staff_payments')
    .select('*')
    .gte('payment_date', startDate)
    .lte('payment_date', endDate);

  if (staffId) {
    query = query.eq('staff_id', staffId);
  }

  const { data, error } = await query.order('payment_date', { ascending: true });

  if (error) {
    console.error('Error fetching staff payments:', error);
    throw error;
  }
  return data || [];
};

/**
 * Deletes a staff payment record by its ID.
 * @param id The ID of the payment record to delete.
 */
export const deleteStaffPayment = async (id: string) => {
  const { error } = await supabase
    .from('staff_payments')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Error deleting staff payment:', error);
    throw error;
  }
};
