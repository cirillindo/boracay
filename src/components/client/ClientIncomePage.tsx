// src/components/client/ClientIncomePage.tsx
import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from '../../lib/supabase';
import { format, startOfMonth, endOfMonth, parseISO, addMonths, subMonths, differenceInDays, isSameMonth } from 'date-fns';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { DollarSign, CalendarDays, Home, Users, Clock, TrendingUp, BarChart2, ChevronLeft, ChevronRight } from 'lucide-react';
import Button from '../ui/Button';

interface CheckinDetail {
  id: string;
  check_in_date: string;
  check_out_date: string;
  arrival_time: string | null;
  notes: string | null;
  status: string;
  total_amount_eur: number | null;
  checkin_room_details: {
    room_id: string;
    pax_count: number;
    price_per_night_eur: number;
    rooms: { room_name: string };
  }[];
  property_id: string;
  property_title: string;
  profiles?: { username: string | null; first_name: string | null; last_name: string | null } | null; // NEW: Add profiles data
}

interface MonthlyIncomeData {
  month: string;
  totalIncome: number;
}

interface ClientIncomePageProps {
  clientUserId: string;
  onBack: () => void;
}

const ClientIncomePage: React.FC<ClientIncomePageProps> = ({ clientUserId, onBack }) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [checkins, setCheckins] = useState<CheckinDetail[]>([]);
  const [monthlyIncomeData, setMonthlyIncomeData] = useState<MonthlyIncomeData[]>([]);
  const [currentMonth, setCurrentMonth] = useState(new Date()); // For table filtering and chart window

  // Summary card states
  const [totalOverallIncome, setTotalOverallIncome] = useState(0);
  const [actualMonthlyIncomeGenerated, setActualMonthlyIncomeGenerated] = useState(0);
  const [isMobile, setIsMobile] = useState(false); // State for mobile view

  // Detect mobile view on mount and resize
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768); // Tailwind's 'md' breakpoint
    };
    handleResize(); // Set initial value
    window.addEventListener('resize', handleResize); // Add event listener
    return () => window.removeEventListener('resize', handleResize); // Clean up
  }, []);


  const fetchIncomeData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      // Get properties owned by the current client
      const { data: clientProperties, error: propertiesError } = await supabase
        .from('properties')
        .select('id, title')
        .eq('user_id', clientUserId);

      if (propertiesError) throw propertiesError;
      const propertyIds = clientProperties.map(p => p.id);
      const propertyMap = new Map(clientProperties.map(p => [p.id, p.title]));

      if (propertyIds.length === 0) {
        setCheckins([]);
        setMonthlyIncomeData([]);
        setTotalOverallIncome(0);
        setActualMonthlyIncomeGenerated(0);
        setLoading(false);
        return;
      }

      // Fetch checkin_room_details for these properties
      const { data: checkinRoomDetails, error: checkinRoomDetailsError } = await supabase
        .from('checkin_room_details')
        .select(`
          checkin_id,
          room_id,
          pax_count,
          price_per_night_eur,
          rooms (room_name, property_id) // Select property_id from rooms
        `)
        .in('rooms.property_id', propertyIds); // Filter by property_id in related rooms table

      if (checkinRoomDetailsError) throw checkinRoomDetailsError;
      const checkinIds = [...new Set(checkinRoomDetails.map(d => d.checkin_id))];

      if (checkinIds.length === 0) {
        setCheckins([]);
        setMonthlyIncomeData([]);
        setTotalOverallIncome(0);
        setActualMonthlyIncomeGenerated(0);
        setLoading(false);
        return;
      }

      // Fetch ALL checkins for the client's properties (no date filtering here)
      const { data: checkinsData, error: checkinsError } = await supabase
        .from('checkins')
        .select(`
          *,
          profiles(username, first_name, last_name) // NEW: Select client profile data
        `)
        .in('id', checkinIds)
        .order('check_in_date', { ascending: false }); // Order for consistent processing

      if (checkinsError) throw checkinsError;

      const processedCheckins: CheckinDetail[] = checkinsData.map(checkin => {
        const relatedRoomDetails = checkinRoomDetails.filter(d => d.checkin_id === checkin.id);
        const firstRoomDetail = relatedRoomDetails[0];
        const propertyIdForCheckin = firstRoomDetail?.rooms?.property_id; // Get property_id from room
        const propertyTitle = propertyMap.get(propertyIdForCheckin) || 'Unknown Property';

        return {
          ...checkin,
          property_id: propertyIdForCheckin || '',
          property_title: propertyTitle,
          checkin_room_details: relatedRoomDetails,
        };
      });

      setCheckins(processedCheckins); // Store all checkins
      processMonthlyIncome(processedCheckins); // Process all checkins for monthly data

    } catch (err: any) {
      console.error('Error fetching income data:', err);
      setError(`Failed to load income data: ${err.message || 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  }, [clientUserId, currentMonth]); // Added currentMonth to dependencies

  useEffect(() => {
    fetchIncomeData();
  }, [fetchIncomeData]);

  const processMonthlyIncome = (allCheckinsData: CheckinDetail[]) => {
    // 1. Calculate Total Income (All Time)
    const totalIncomeAllTime = allCheckinsData.reduce((sum, checkin) => sum + (checkin.total_amount_eur || 0), 0);
    setTotalOverallIncome(totalIncomeAllTime);

    // 2. Calculate Monthly Income Generated (for the current month)
    const monthlyTotalsForChart: { [key: string]: number } = {};

    // Initialize monthly totals for the current month and the next 5 months
    for (let i = 0; i < 6; i++) { // Loop for 6 months
      const month = addMonths(currentMonth, i); // Start from currentMonth and add i months
      const monthKey = format(month, 'MMM yyyy');
      monthlyTotalsForChart[monthKey] = 0;
    }

    allCheckinsData.forEach(checkin => {
      const checkInDate = parseISO(checkin.check_in_date);
      const monthKey = format(checkInDate, 'MMM yyyy');

      // Only add income if the month is within our initialized chart range
      if (monthlyTotalsForChart.hasOwnProperty(monthKey)) {
        monthlyTotalsForChart[monthKey] += checkin.total_amount_eur || 0;
      }
    });

    const sortedMonthsForChart: MonthlyIncomeData[] = Object.keys(monthlyTotalsForChart)
      .sort((a, b) => parseISO(a.replace(' ', ' 1, ')).getTime() - parseISO(b.replace(' ', ' 1, ')).getTime()) // Sorts chronologically
      .map(month => ({
        month: month,
        totalIncome: monthlyTotalsForChart[month]
      }));

    setMonthlyIncomeData(sortedMonthsForChart);

    // Calculate actual monthly income generated for the current month
    const currentMonthKey = format(currentMonth, 'MMM yyyy');
    setActualMonthlyIncomeGenerated(monthlyTotalsForChart[currentMonthKey] || 0);
  };

  const calculateNights = (checkIn: string, checkOut: string) => {
    const start = parseISO(checkIn);
    const end = parseISO(checkOut);
    return differenceInDays(end, start);
  };

  const getStatusDisplay = (status: string) => {
    switch (status) {
      case 'pending': return { text: 'WAITING', color: 'bg-blue-500 text-white' };
      case 'checked_in': return { text: 'IN HOUSE', color: 'bg-green-500 text-white' };
      case 'checked_out': return { text: 'CHECKED OUT', color: 'bg-red-500 text-white' };
      case 'cancelled': return { text: 'CANCELLED', color: 'bg-gray-500 text-white' };
      default: return { text: 'UNKNOWN', color: 'bg-gray-300 text-gray-800' };
    }
  };

  // Filter checkins for the table based on currentMonth
  const checkinsForTable = checkins.filter(checkin =>
    isSameMonth(parseISO(checkin.check_in_date), currentMonth)
  );

  return (
    <div className="p-6 bg-white rounded-xl shadow-sm">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
          <DollarSign className="w-6 h-6 text-yellow-600" /> Your Property Income
        </h2>
        <Button onClick={onBack} variant="outline">
          ← Back to Dashboard
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
        <>
          <p className="text-gray-600 mb-6">
            Here's a detailed overview of your property income from check-ins.
          </p>

          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
              <h3 className="text-sm font-medium text-blue-600">Total Income (All Time)</h3>
              <p className="text-2xl font-bold text-blue-900">€{totalOverallIncome.toFixed(2)}</p>
            </div>
            <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
              <h3 className="text-sm font-medium text-purple-600">Monthly Income Generated</h3>
              <p className="text-2xl font-bold text-purple-900">€{actualMonthlyIncomeGenerated.toFixed(2)}</p>
            </div>
          </div>

          {/* Monthly Income Bar Chart */}
          <div className="bg-white shadow-md rounded-lg p-6 mb-8">
            <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <BarChart2 className="w-5 h-5" /> Monthly Income Overview
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={monthlyIncomeData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis tickFormatter={(value) => `€${value.toFixed(0)}`} />
                <Tooltip formatter={(value: number) => [`€${value.toFixed(2)}`, 'Income']} />
                <Legend />
                <Bar dataKey="totalIncome" fill="#8884d8" name="Total Income" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Checkins Table */}
          <div className="bg-white shadow-md rounded-lg p-6">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-4"> {/* Added flex-col and sm:flex-row */}
              <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2 mb-2 sm:mb-0"> {/* Added mb-2 sm:mb-0 */}
                <CalendarDays className="w-5 h-5" /> Check-ins for {format(currentMonth, 'MMMM yyyy')}
              </h3>
              <div className="flex gap-2 w-full sm:w-auto"> {/* Added w-full sm:w-auto */}
                <Button onClick={() => setCurrentMonth(subMonths(currentMonth, 1))} variant="outline" size="sm" className="flex-1 sm:flex-none"> {/* Added flex-1 sm:flex-none */}
                  <ChevronLeft className="w-4 h-4" /> Prev Month
                </Button>
                <Button onClick={() => setCurrentMonth(addMonths(currentMonth, 1))} variant="outline" size="sm" className="flex-1 sm:flex-none"> {/* Added flex-1 sm:flex-none */}
                  Next Month <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
            
            {checkinsForTable.length === 0 ? (
              <p className="text-gray-600 text-center py-8">No check-ins found for this month.</p>
            ) : isMobile ? (
              // Mobile Card View
              <div className="space-y-4">
                {checkinsForTable.map((checkin) => {
                  const statusDisplay = getStatusDisplay(checkin.status);
                  const amountPerNight = checkin.checkin_room_details.reduce((sum, detail) => sum + detail.price_per_night_eur, 0);
                  return (
                    <div key={checkin.id} className="bg-gray-50 p-4 rounded-lg shadow-sm border border-gray-200">
                      <div className="flex justify-between items-center mb-3">
                        <h3 className="text-base font-bold text-gray-900">
                          {checkin.property_title}
                        </h3>
                        <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${statusDisplay.color}`}>
                          {statusDisplay.text}
                        </span>
                      </div>

                      <div className="text-sm text-gray-700 space-y-2 mb-4">
                        <div>
                          <strong>Check-in:</strong> {format(parseISO(checkin.check_in_date), 'MMM dd, yyyy')}
                        </div>
                        <div>
                          <strong>Check-out:</strong> {format(parseISO(checkin.check_out_date), 'MMM dd, yyyy')}
                        </div>
                        <div>
                          <strong>Nights:</strong> {calculateNights(checkin.check_in_date, checkin.check_out_date)}
                        </div>
                        <div>
                          <strong>Rooms:</strong>
                          <ul className="list-disc list-inside ml-2 text-xs">
                            {checkin.checkin_room_details.map((detail, idx) => (
                              <li key={idx}>{detail.rooms.room_name} ({detail.pax_count} PAX)</li>
                            ))}
                          </ul>
                        </div>
                        <div>
                          <strong>Amount/Night:</strong> €{amountPerNight.toFixed(2)}
                        </div>
                        <div>
                          <strong>Total Amount:</strong> €{(checkin.total_amount_eur || 0).toFixed(2)}
                        </div>
                        <div>
                          <strong>Arrival Time:</strong> {checkin.arrival_time || 'N/A'}
                        </div>
                        {checkin.notes && (
                          <div>
                            <strong>Notes:</strong> {checkin.notes}
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
                        Property
                      </th>
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
                        Rooms (Pax)
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Amount/Night
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Total Amount
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {checkinsForTable.map(checkin => {
                      const statusDisplay = getStatusDisplay(checkin.status);
                      const amountPerNight = checkin.checkin_room_details.reduce((sum, detail) => sum + detail.price_per_night_eur, 0);
                      return (
                        <tr key={checkin.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {checkin.property_title}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {format(parseISO(checkin.check_in_date), 'MMM dd, yyyy')}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {format(parseISO(checkin.check_out_date), 'MMM dd, yyyy')}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {calculateNights(checkin.check_in_date, checkin.check_out_date)}
                          </td>
                          <td className="px-6 py-4">
                            <ul className="list-disc list-inside text-sm text-gray-500">
                              {checkin.checkin_room_details.map((detail, idx) => (
                                <li key={idx}>{detail.rooms.room_name} ({detail.pax_count} PAX)</li>
                              ))}
                            </ul>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            €{amountPerNight.toFixed(2)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-bold">
                            €{(checkin.total_amount_eur || 0).toFixed(2)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${statusDisplay.color}`}>
                              {statusDisplay.text}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default ClientIncomePage;
