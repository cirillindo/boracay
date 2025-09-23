// src/components/client/ClientCalendar.tsx
import React, { useState, useEffect, useCallback } from 'react';
import Container from '../../components/ui/Container';
import { CalendarDays, ChevronLeft, ChevronRight, Home, Users, Clock } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, addMonths, subMonths, parseISO, isBefore, isAfter, isEqual } from 'date-fns';
import Button from '../../components/ui/Button';

interface CheckinEvent {
  id: string;
  check_in_date: string;
  check_out_date: string;
  arrival_time: string | null;
  notes: string | null;
  status: string;
  rooms: { room_name: string }[]; // Simplified for display
  pax_count: number; // Total pax for the checkin
}

interface ClientCalendarProps {
  onBack: () => void;
}

const ClientCalendar: React.FC<ClientCalendarProps> = ({ onBack }) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [checkinEvents, setCheckinEvents] = useState<CheckinEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentClientUserId, setCurrentClientUserId] = useState<string | null>(null);

  // Fetch current user's ID on component mount
  useEffect(() => {
    const fetchUser = async () => {
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (user && !userError) {
        setCurrentClientUserId(user.id);
      } else {
        setError('User not authenticated. Please log in.');
        setLoading(false);
      }
    };
    fetchUser();
  }, []);

  // Fetch check-in data when currentClientUserId or currentDate changes
  useEffect(() => {
    if (!currentClientUserId) return;

    const fetchClientCheckins = async () => {
      setLoading(true);
      setError(null);
      try {
        const year = currentDate.getFullYear();
        const month = currentDate.getMonth() + 1;
        const firstDay = format(startOfMonth(currentDate), 'yyyy-MM-dd');
        const lastDay = format(endOfMonth(currentDate), 'yyyy-MM-dd');

        // 1. Get properties owned by the current client
        const { data: clientProperties, error: propertiesError } = await supabase
          .from('properties')
          .select('id')
          .eq('user_id', currentClientUserId);

        if (propertiesError) throw propertiesError;
        const propertyIds = clientProperties.map(p => p.id);

        if (propertyIds.length === 0) {
          setCheckinEvents([]);
          setLoading(false);
          return;
        }

        // 2. Get rooms associated with these properties
        const { data: roomsData, error: roomsError } = await supabase
          .from('rooms')
          .select('id, room_name')
          .in('property_id', propertyIds);

        if (roomsError) throw roomsError;
        const roomIds = roomsData.map(r => r.id);
        const roomMap = new Map(roomsData.map(r => [r.id, r.room_name]));

        if (roomIds.length === 0) {
          setCheckinEvents([]);
          setLoading(false);
          return;
        }

        // 3. Get checkin_room_details for these rooms within the current month
        const { data: checkinRoomDetails, error: checkinRoomDetailsError } = await supabase
          .from('checkin_room_details')
          .select('checkin_id, room_id, pax_count')
          .in('room_id', roomIds)
          .gte('created_at', firstDay) // Filter details by month of creation/update
          .lte('created_at', lastDay);

        if (checkinRoomDetailsError) throw checkinRoomDetailsError;
        const checkinIds = [...new Set(checkinRoomDetails.map(d => d.checkin_id))]; // Unique checkin IDs

        if (checkinIds.length === 0) {
          setCheckinEvents([]);
          setLoading(false);
          return;
        }

        // 4. Get the actual checkins using the unique checkin IDs
        const { data: checkinsData, error: checkinsError } = await supabase
          .from('checkins')
          .select('*')
          .in('id', checkinIds)
          .gte('check_in_date', firstDay) // Filter checkins by their actual dates
          .lte('check_out_date', lastDay);

        if (checkinsError) throw checkinsError;

        // --- CONSOLE.LOG FOR DEBUGGING FETCHED DATA ---
        console.log("--- Fetched Checkins Data from Supabase ---");
        checkinsData.forEach(checkin => {
          console.log(`Checkin ID: ${checkin.id}, Check-in Date: ${checkin.check_in_date}, Check-out Date: ${checkin.check_out_date}`);
        });
        console.log("-----------------------------------");
        // --- END CONSOLE.LOG ---

        // Combine data for display
        const events: CheckinEvent[] = checkinsData.map(checkin => {
          const relatedRoomDetails = checkinRoomDetails.filter(d => d.checkin_id === checkin.id);
          const roomsForEvent = relatedRoomDetails.map(d => ({
            room_name: roomMap.get(d.room_id) || 'Unknown Room'
          }));
          const totalPax = relatedRoomDetails.reduce((sum, d) => sum + d.pax_count, 0);

          return {
            ...checkin,
            rooms: roomsForEvent,
            pax_count: totalPax
          };
        });

        setCheckinEvents(events);
      } catch (err: any) {
        console.error('Error fetching client checkins:', err);
        setError(`Failed to load check-ins: ${err.message || 'Unknown error'}`);
      } finally {
        setLoading(false);
      }
    };

    fetchClientCheckins();
  }, [currentClientUserId, currentDate]);

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

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-blue-500';
      case 'checked_in': return 'bg-green-500';
      case 'checked_out': return 'bg-gray-500';
      case 'cancelled': return 'bg-red-500';
      default: return 'bg-gray-300';
    }
  };

  return (
    <div className="p-6 bg-white rounded-xl shadow-sm">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
          <CalendarDays className="w-6 h-6 text-purple-600" /> Your Property Calendar
        </h2>
        <Button onClick={onBack} variant="outline">
          ← Back to Dashboard
        </Button>
      </div>

      <div className="flex items-center justify-center space-x-4 mb-6">
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

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-amber-500"></div>
        </div>
      ) : error ? (
        <div className="bg-red-50 text-red-600 p-4 rounded-md">
          {error}
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
            const dayEvents = checkinEvents.filter(event => {
              const currentDayDate = day; // `day` is already a Date object from eachDayOfInterval
              const eventCheckInDate = parseISO(event.check_in_date);
              const eventCheckOutDate = parseISO(event.check_out_date);

              // Highlight days from check-in date up to (but not including) check-out date
              // This means: currentDayDate >= eventCheckInDate AND currentDayDate < eventCheckOutDate
              const isWithinRange = (isEqual(currentDayDate, eventCheckInDate) || isAfter(currentDayDate, eventCheckInDate)) && isBefore(currentDayDate, eventCheckOutDate);

              // --- DETAILED CONSOLE.LOG FOR DEBUGGING COMPARISON ---
              console.log(`Comparing calendar day ${format(currentDayDate, 'yyyy-MM-dd')} with event ID ${event.id} (Check-in: ${format(eventCheckInDate, 'yyyy-MM-dd')}, Check-out: ${format(eventCheckOutDate, 'yyyy-MM-dd')})`);
              console.log(`  -> isAfter(currentDayDate, eventCheckInDate): ${isAfter(currentDayDate, eventCheckInDate)}`);
              console.log(`  -> isEqual(currentDayDate, eventCheckInDate): ${isEqual(currentDayDate, eventCheckInDate)}`);
              console.log(`  -> isBefore(currentDayDate, eventCheckOutDate): ${isBefore(currentDayDate, eventCheckOutDate)}`);
              console.log(`  -> Result: ${isWithinRange}`);
              // --- END DETAILED CONSOLE.LOG ---

              return isWithinRange;
            });
            return (
              <div
                key={format(day, 'yyyy-MM-dd')}
                className={`rounded-md p-2 min-h-[100px] shadow-sm border border-gray-200 relative ${
                  dayEvents.length > 0 ? 'bg-blue-50' : 'bg-white' // Apply blue background if there are events
                }`}
              >
                <div className="text-right font-bold text-gray-800 text-sm mb-1">
                  {format(day, 'd')}
                </div>
                <div className="space-y-1">
                  {checkinEvents.map(event => {
                    const currentDayDate = day; // `day` is already a Date object from eachDayOfInterval
                    const eventCheckInDate = parseISO(event.check_in_date);
                    const eventCheckOutDate = parseISO(event.check_out_date);

                    // Render the booking chip only on the check-in or check-out day
                    if (isSameDay(eventCheckInDate, currentDayDate) || isSameDay(eventCheckOutDate, currentDayDate)) {
                      return (
                        <div
                          key={event.id}
                          className={`flex flex-col items-start px-2 py-1 rounded-md text-white text-xs ${getStatusColor(event.status)}`}
                        >
                          <span className="font-semibold">
                            {event.rooms.map(r => r.room_name).join(', ')}
                          </span>
                          <div className="flex items-center gap-1">
                            {isSameDay(eventCheckInDate, currentDayDate) && (
                              <span className="flex items-center gap-0.5">
                                <Home className="w-3 h-3" /> In
                              </span>
                            )}
                            {isSameDay(eventCheckOutDate, currentDayDate) && (
                              <span className="flex items-center gap-0.5">
                                <Home className="w-3 h-3" /> Out
                              </span>
                            )}
                            <Users className="w-3 h-3" /> {event.pax_count}
                            {event.arrival_time && isSameDay(eventCheckInDate, currentDayDate) && (
                              <span className="flex items-center gap-0.5">
                                <Clock className="w-3 h-3" /> {event.arrival_time}
                              </span>
                            )}
                          </div>
                        </div>
                      );
                    }
                    return null; // Don't render chip on other days
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default ClientCalendar;
