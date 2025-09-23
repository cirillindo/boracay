import { supabase } from './supabase';

// Define the interface for a staff bonus entry
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

// Define the interface for staff details
export interface Staff {
  id: string;
  first_name: string;
  last_name: string;
}

/**
 * Fetches all staff bonuses with staff details.
 * @returns An array of staff bonus records with staff details.
 */
export const fetchStaffBonuses = async (): Promise<StaffBonus[]> => {
  const { data, error } = await supabase
    .from('staff_bonuses')
    .select(`
      *,
      staff_details:staff_id (
        first_name,
        last_name
      )
    `)
    .order('bonus_date', { ascending: false });

  if (error) {
    console.error('Error fetching staff bonuses:', error);
    throw new Error(error.message);
  }

  return data || [];
};

/**
 * Fetches a single staff bonus by ID.
 * @param id The ID of the bonus record to fetch.
 * @returns The staff bonus record.
 */
export const fetchStaffBonusById = async (id: string): Promise<StaffBonus | null> => {
  const { data, error } = await supabase
    .from('staff_bonuses')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    console.error('Error fetching staff bonus:', error);
    throw new Error(error.message);
  }

  return data;
};

/**
 * Adds a new staff bonus record.
 * @param bonusData The data for the new bonus record.
 * @returns The newly created staff bonus record.
 */
export const addStaffBonus = async (bonusData: Omit<StaffBonus, 'id' | 'created_at' | 'updated_at' | 'staff_details'>): Promise<StaffBonus> => {
  const { data, error } = await supabase
    .from('staff_bonuses')
    .insert({
      staff_id: bonusData.staff_id,
      amount_php: bonusData.amount_php,
      bonus_date: bonusData.bonus_date,
      description: bonusData.description,
      is_paid: bonusData.is_paid,
    })
    .select()
    .single();

  if (error) {
    console.error('Error adding staff bonus:', error);
    throw new Error(error.message);
  }

  return data;
};

/**
 * Updates an existing staff bonus record.
 * @param id The ID of the bonus record to update.
 * @param bonusData The updated data for the bonus record.
 * @returns The updated staff bonus record.
 */
export const updateStaffBonus = async (id: string, bonusData: Partial<Omit<StaffBonus, 'id' | 'created_at' | 'updated_at' | 'staff_details'>>): Promise<StaffBonus> => {
  const { data, error } = await supabase
    .from('staff_bonuses')
    .update(bonusData)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('Error updating staff bonus:', error);
    throw new Error(error.message);
  }

  return data;
};

/**
 * Deletes a staff bonus record.
 * @param id The ID of the bonus record to delete.
 */
export const deleteStaffBonus = async (id: string): Promise<void> => {
  const { error } = await supabase
    .from('staff_bonuses')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Error deleting staff bonus:', error);
    throw new Error(error.message);
  }
};

/**
 * Fetches all staff members for dropdown selection.
 * @returns An array of staff records.
 */
export const fetchStaffMembers = async (): Promise<Staff[]> => {
  const { data, error } = await supabase
    .from('staff_details')
    .select('id, first_name, last_name')
    .eq('is_active', true)
    .order('first_name');

  if (error) {
    console.error('Error fetching staff members:', error);
    throw new Error(error.message);
  }

  return data || [];
};

/**
 * Fetches bonuses for the currently authenticated staff member.
 * @returns An array of staff bonus records for the current user.
 */
export const fetchMyBonuses = async (): Promise<StaffBonus[]> => {
  const { data, error } = await supabase
    .from('staff_bonuses')
    .select(`
      *,
      staff_details:staff_id (
        first_name,
        last_name
      )
    `)
    .order('bonus_date', { ascending: false });

  if (error) {
    console.error('Error fetching my bonuses:', error);
    throw new Error(error.message);
  }

  return data || [];
};