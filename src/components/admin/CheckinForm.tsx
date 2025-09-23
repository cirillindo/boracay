// src/components/admin/CheckinForm.tsx
import React, { useState, useEffect, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate, useParams } from 'react-router-dom';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { supabase } from '../../lib/supabase';
import Button from '../ui/Button';
import { AlertCircle, Check, Home, User, Clock, DollarSign, Plus, Minus, Trash2 } from 'lucide-react';
import { differenceInDays, format } from 'date-fns';
import Select from 'react-select';

interface RoomOption {
  value: string;
  label: string;
}

interface RoomSelection {
  roomId: string;
  paxCount: number;
  roomName: string; // For display in the form
  pricePerNightEur: number; // NEW: Price per night for this room
}

interface CheckinFormData {
  check_in_date: Date | null;
  check_out_date: Date | null;
  arrival_time: string;
  notes: string;
  rooms: RoomSelection[]; // Array of selected rooms with pax
  total_amount_eur?: number; // NEW: Total amount for the check-in
}

const CheckinForm: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [roomOptions, setRoomOptions] = useState<RoomOption[]>([]);
  const [selectedRooms, setSelectedRooms] = useState<RoomSelection[]>([]);
  const [currentUser, setCurrentUser] = useState<string | null>(null);

  const { register, handleSubmit, setValue, watch, reset, formState: { errors: formErrors } } = useForm<CheckinFormData>({
    defaultValues: {
      check_in_date: null,
      check_out_date: null,
      arrival_time: '',
      notes: '',
      rooms: [],
      total_amount_eur: 0, // Initialize total amount
    }
  });

  const checkInDate = watch('check_in_date');
  const checkOutDate = watch('check_out_date');
  const watchedRooms = watch('rooms'); // Watch changes to the rooms array

  const numberOfNights = checkInDate && checkOutDate ? differenceInDays(checkOutDate, checkInDate) : 0;

  // Calculate total amount whenever rooms or nights change
  useEffect(() => {
    let calculatedTotal = 0;
    if (numberOfNights > 0 && watchedRooms) {
      calculatedTotal = watchedRooms.reduce((sum, room) => {
        return sum + (room.pricePerNightEur * room.paxCount * numberOfNights);
      }, 0);
    }
    setValue('total_amount_eur', calculatedTotal);
  }, [watchedRooms, numberOfNights, setValue]);

  useEffect(() => {
    loadRooms();
    loadCurrentUser();
    if (id) {
      loadCheckin();
    }
  }, [id]);

  const loadCurrentUser = async () => {
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (user) {
      setCurrentUser(user.id);
    } else {
      setError('User not logged in.');
    }
  };

  const loadRooms = async () => {
    try {
      const { data, error } = await supabase
        .from('rooms')
        .select('id, room_name')
        .order('room_name');
      if (error) throw error;
      setRoomOptions(data.map(room => ({ value: room.id, label: room.room_name })));
    } catch (err) {
      console.error('Error loading rooms:', err);
      setError('Failed to load rooms for selection.');
    }
  };

  const loadCheckin = useCallback(async () => {
    try {
      const { data: checkinData, error: checkinError } = await supabase
        .from('checkins')
        .select('*')
        .eq('id', id)
        .single();

      if (checkinError) throw checkinError;

      const { data: roomDetailsData, error: roomDetailsError } = await supabase
        .from('checkin_room_details')
        .select(`
          *,
          rooms (room_name)
        `)
        .eq('checkin_id', id);

      if (roomDetailsError) throw roomDetailsError;

      const loadedRooms: RoomSelection[] = roomDetailsData.map(detail => ({
        roomId: detail.room_id,
        paxCount: detail.pax_count,
        roomName: detail.rooms?.room_name || 'Unknown Room',
        pricePerNightEur: detail.price_per_night_eur || 0, // Load new price field
      }));

      reset({
        check_in_date: checkinData.check_in_date ? new Date(checkinData.check_in_date) : null,
        check_out_date: checkinData.check_out_date ? new Date(checkinData.check_out_date) : null,
        arrival_time: checkinData.arrival_time || '',
        notes: checkinData.notes || '',
        rooms: loadedRooms,
        total_amount_eur: checkinData.total_amount_eur || 0, // Load new total amount
      });
      setSelectedRooms(loadedRooms); // Keep local state in sync
      setValue('rooms', loadedRooms); // Crucial: Update react-hook-form's 'rooms' field

    } catch (err) {
      setError('Error loading check-in data.');
      console.error(err);
    }
  }, [id, reset, setValue]);

  const handleRoomSelect = (selectedOption: RoomOption | null) => {
    if (selectedOption && !selectedRooms.some(r => r.roomId === selectedOption.value)) {
      const newRooms = [...selectedRooms, { roomId: selectedOption.value, paxCount: 1, roomName: selectedOption.label, pricePerNightEur: 0 }];
      setSelectedRooms(newRooms);
      setValue('rooms', newRooms); // Crucial: Update react-hook-form's 'rooms' field
    }
  };

  const handlePaxChange = (roomId: string, paxCount: number) => {
    const updatedRooms = selectedRooms.map(room =>
      room.roomId === roomId ? { ...room, paxCount: Math.max(1, paxCount) } : room
    );
    setSelectedRooms(updatedRooms);
    setValue('rooms', updatedRooms); // Crucial: Update react-hook-form's 'rooms' field
  };

  const handlePriceChange = (roomId: string, price: number) => {
    const updatedRooms = selectedRooms.map(room =>
      room.roomId === roomId ? { ...room, pricePerNightEur: Math.max(0, price) } : room
    );
    setSelectedRooms(updatedRooms);
    setValue('rooms', updatedRooms); // Crucial: Update react-hook-form's 'rooms' field
  };

  const handleRemoveRoom = (roomId: string) => {
    const updatedRooms = selectedRooms.filter(room => room.roomId !== roomId);
    setSelectedRooms(updatedRooms);
    setValue('rooms', updatedRooms); // Crucial: Update react-hook-form's 'rooms' field
  };

  const onSubmit = async (data: CheckinFormData) => {
    if (!currentUser) {
      setError('User not authenticated. Please log in.');
      return;
    }
    if (selectedRooms.length === 0) {
      setError('Please select at least one room.');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const checkinData = {
        check_in_date: data.check_in_date ? format(data.check_in_date, 'yyyy-MM-dd') : null,
        check_out_date: data.check_out_date ? format(data.check_out_date, 'yyyy-MM-dd') : null,
        arrival_time: data.arrival_time,
        notes: data.notes,
        user_id: currentUser,
        total_amount_eur: data.total_amount_eur, // NEW: Save total amount
      };

      let currentCheckinId = id;

      if (id) {
        const { error: updateError } = await supabase
          .from('checkins')
          .update(checkinData)
          .eq('id', id);
        if (updateError) throw updateError;
      } else {
        const { data: newCheckin, error: insertError } = await supabase
          .from('checkins')
          .insert([checkinData])
          .select()
          .single();
        if (insertError) throw insertError;
        currentCheckinId = newCheckin.id;
      }

      // Update checkin_room_details
      if (currentCheckinId) {
        // Delete existing details
        await supabase.from('checkin_room_details').delete().eq('checkin_id', currentCheckinId);

        // Insert new details
        const roomDetailsToInsert = selectedRooms.map(room => ({
          checkin_id: currentCheckinId,
          room_id: room.roomId,
          pax_count: room.paxCount,
          price_per_night_eur: room.pricePerNightEur, // NEW: Save price per night
        }));
        if (roomDetailsToInsert.length > 0) {
          const { error: insertDetailsError } = await supabase
            .from('checkin_room_details')
            .insert(roomDetailsToInsert);
          if (insertDetailsError) throw insertDetailsError;
        }
      }

      setSuccess('Check-in saved successfully!');
      setTimeout(() => navigate('/admin/checkins'), 1500);

    } catch (err: any) {
      setError(`Error saving check-in: ${err.message}`);
      console.error('Save error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 max-w-3xl mx-auto">
      {error && (
        <div className="bg-red-50 text-red-600 p-4 rounded-md">
          {error}
        </div>
      )}
      {success && (
        <div className="bg-green-50 text-green-600 p-4 rounded-md">
          {success}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Check-in Date
          </label>
          <DatePicker
            selected={checkInDate}
            onChange={(date: Date | null) => setValue('check_in_date', date)}
            dateFormat="dd/MM/yyyy"
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500"
            required
          />
          {formErrors.check_in_date && <p className="text-red-500 text-xs mt-1">Check-in date is required</p>}
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Check-out Date
          </label>
          <DatePicker
            selected={checkOutDate}
            onChange={(date: Date | null) => setValue('check_out_date', date)}
            dateFormat="dd/MM/yyyy"
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500"
            required
          />
          {formErrors.check_out_date && <p className="text-red-500 text-xs mt-1">Check-out date is required</p>}
        </div>
      </div>

      {numberOfNights > 0 && (
        <div className="text-center text-lg font-medium text-gray-700">
          Number of Nights: {numberOfNights}
        </div>
      )}

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Select Rooms
        </label>
        <Select
          options={roomOptions}
          onChange={handleRoomSelect}
          className="basic-single"
          classNamePrefix="select"
          placeholder="Add a room..."
          isClearable
        />
        {selectedRooms.length === 0 && <p className="text-red-500 text-xs mt-1">Please select at least one room.</p>}

        <div className="mt-4 space-y-3">
          {selectedRooms.map(room => (
            <div key={room.roomId} className="flex flex-col bg-gray-50 p-3 rounded-md">
              <div className="flex items-center justify-between mb-2">
                <div className="flex-1 font-medium text-gray-800">{room.roomName}</div>
                <button
                  type="button"
                  onClick={() => handleRemoveRoom(room.roomId)}
                  className="ml-2 p-1 rounded-full bg-red-100 hover:bg-red-200 text-red-600"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Pax Count
                  </label>
                  <div className="flex items-center">
                    <button
                      type="button"
                      onClick={() => handlePaxChange(room.roomId, room.paxCount - 1)}
                      className="p-1 rounded-l-md bg-white hover:bg-gray-100 border border-gray-300"
                    >
                      <Minus className="w-4 h-4" />
                    </button>
                    <input
                      type="number"
                      value={room.paxCount}
                      onChange={(e) => handlePaxChange(room.roomId, parseInt(e.target.value) || 0)}
                      className="w-full text-center border-y border-gray-300"
                      min="1"
                    />
                    <button
                      type="button"
                      onClick={() => handlePaxChange(room.roomId, room.paxCount + 1)}
                      className="p-1 rounded-r-md bg-white hover:bg-gray-100 border border-gray-300"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Price per Night (EUR)
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      step="0.01"
                      value={room.pricePerNightEur}
                      onChange={(e) => handlePriceChange(room.roomId, parseFloat(e.target.value) || 0)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500"
                      min="0"
                    />
                    <DollarSign className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  </div>
                </div>
              </div>
              <div className="mt-2 text-right text-sm font-medium text-gray-700">
                Room Total: €{(room.pricePerNightEur * room.paxCount * numberOfNights).toFixed(2)}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="text-right text-xl font-bold text-gray-900 mt-6">
        Total Check-in Amount: €{watch('total_amount_eur')?.toFixed(2)}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Arrival Time (e.g., 14:00)
        </label>
        <input
          type="text"
          {...register('arrival_time')}
          className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500"
          placeholder="HH:MM"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Notes
        </label>
        <textarea
          {...register('notes')}
          rows={4}
          className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500"
          placeholder="Add any special requests or important details here..."
        />
      </div>

      <div className="flex justify-end space-x-4">
        <Button
          type="button"
          variant="outline"
          onClick={() => navigate('/admin/checkins')}
        >
          Cancel
        </Button>
        <Button type="submit" disabled={loading}>
          {loading ? 'Saving...' : id ? 'Update Check-in' : 'Add Check-in'}
        </Button>
      </div>
    </form>
  );
};

export default CheckinForm;
