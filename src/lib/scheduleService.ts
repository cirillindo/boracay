// src/lib/scheduleService.ts
import { supabase } from './supabase';

// Define the interface for a schedule entry (matching your table structure)
export interface StaffSchedule {
  id: string;
  schedule_date: string;
  staff_id: string;
  shift_type: string;
  is_offered: boolean;
  is_extraordinary: boolean;
  status: string;
  claimed_by_staff_id?: string | null;
  offer_type?: string | null;
  swap_target_date?: string | null;
  created_at: string;
  updated_at: string;
  staff_details: {
    id: string;
    first_name: string;
    last_name: string;
    daily_salary_php?: number;
  };
}

// Function to fetch monthly schedule data
export const fetchMonthlySchedule = async (month: number, year: number): Promise<StaffSchedule[]> => {
  // Format dates properly for Supabase query
  const startDate = `${year}-${month.toString().padStart(2, '0')}-01`;
  const lastDay = new Date(year, month, 0).getDate(); // Get last day of the month
  const endDate = `${year}-${month.toString().padStart(2, '0')}-${lastDay.toString().padStart(2, '0')}`;

  const { data, error } = await supabase
    .from('staff_schedules')
    .select(`
      *,
      staff_details!staff_schedules_staff_id_fkey (id, first_name, last_name, daily_salary_php)
    `)
    .gte('schedule_date', startDate)
    .lte('schedule_date', endDate)
    .order('schedule_date', { ascending: true });

  if (error) {
    console.error('Error fetching monthly schedule:', error);
    throw error;
  }
  return data as StaffSchedule[];
};

// Function to upsert (insert or update) a schedule assignment
export const upsertScheduleAssignment = async (assignment: any) => {
  const { id, ...rest } = assignment;
  if (id) {
    const { error } = await supabase
      .from('staff_schedules')
      .update(rest)
      .eq('id', id);
    if (error) throw error;
  } else {
    const { error } = await supabase
      .from('staff_schedules')
      .insert([rest]);
    if (error) throw error;
  }
};

// Function to delete a schedule assignment
export const deleteScheduleAssignment = async (id: string) => {
  const { error } = await supabase
    .from('staff_schedules')
    .delete()
    .eq('id', id);
  if (error) throw error;
};
