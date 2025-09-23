// src/pages/ClientDashboard.tsx
import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import ClientProfileForm from '../components/client/ClientProfileForm';
import ClientBankDetails from '../components/client/ClientBankDetails';
import ClientCalendar from '../components/client/ClientCalendar';
import ClientIncomePage from '../components/client/ClientIncomePage'; // NEW: Import ClientIncomePage
import { useNavigate } from 'react-router-dom';
import { format, startOfMonth, endOfMonth, differenceInDays } from 'date-fns';
import { User, Banknote, CalendarDays, DollarSign } from 'lucide-react'; // Import DollarSign for income
import { Property as PropertyType } from '../types'; // Import the Property interface from types

// Define interfaces for your data types
interface Profile {
  id: string;
  username: string;
  role: string;
  first_name?: string;
  last_name?: string;
  phone_number?: string;
  whatsapp_number?: string;
  address?: string;
  country?: string;
}

interface Booking {
  id: string;
  check_in_date: string;
  check_out_date: string;
  arrival_time?: string;
  notes?: string;
  status: string;
  total_amount_eur?: number; // Added total_amount_eur
  checkin_room_details?: {
    room_id: string;
    pax_count: number;
    price_per_night_eur?: number; // Added price_per_night_eur
    rooms?: { room_name: string };
  }[];
  // Add property details directly to Booking interface for easier display in flat list
  property_id?: string;
  property_title?: string;
}

// Extend the PropertyType from src/types/index.ts to include checkins
interface PropertyWithCheckins extends PropertyType {
  checkins: Booking[];
}

const ClientDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [clientProperties, setClientProperties] = useState<PropertyWithCheckins[]>([]);
  const [allClientCheckins, setAllClientCheckins] = useState<Booking[]>([]);
  const [showCheckedOutGuests, setShowCheckedOutGuests] = useState(false);

  const [activeView, setActiveView] = useState<'overview' | 'profile' | 'bank' | 'calendar' | 'income'>('overview'); // ADDED 'income'

  // NEW: State for client income summary
  interface ClientPropertyIncome {
    id: string;
    title: string;
    monthly_income_from_rent: number;
  }
  const [clientIncomeSummary, setClientIncomeSummary] = useState<ClientPropertyIncome[]>([]);
  const [totalAllTimeIncome, setTotalAllTimeIncome] = useState<number>(0); // NEW: State for total all-time income

  const loadClientData = useCallback(async () => {
    console.log("DEBUG: Entering loadClientData function.");
    setLoading(true);
    setError(null);
    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) {
        throw new Error('User not authenticated. Please log in.');
      }

      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();
      
      if (profileError) {
        throw profileError;
      }
      
      const fullProfile: Profile = { ...profileData };
      setProfile(fullProfile);

      const today = new Date();
      const firstDayOfMonth = format(startOfMonth(today), 'yyyy-MM-dd');
      const lastDayOfMonth = format(endOfMonth(today), 'yyyy-MM-dd');

      console.log("DEBUG: Step 1 - Fetching client properties... (with more details)");
      // MODIFIED: Select more property details
      const { data: clientPropertiesData, error: propertiesError } = await supabase
        .from('properties')
        .select('id, title, user_id, monthly_income_from_rent, price, location, property_type, bedrooms, bathrooms, area, land_size, lot_size')
        .eq('user_id', user.id);

      console.log("DEBUG: Supabase query result for client properties:", clientPropertiesData);
      console.log("DEBUG: Supabase query error for client properties:", propertiesError);

      if (propertiesError) {
        console.error("DEBUG: Step 1 Error - clientPropertiesData:", propertiesError);
        throw propertiesError;
      }
      console.log("DEBUG: Step 1 Result - clientPropertiesData:", clientPropertiesData);
      const propertyIds = clientPropertiesData.map(p => p.id);

      // NEW: Process income data
      const incomeData: ClientPropertyIncome[] = clientPropertiesData.map(p => ({
        id: p.id,
        title: p.title,
        monthly_income_from_rent: p.monthly_income_from_rent || 0
      }));
      setClientIncomeSummary(incomeData);

      // Initialize propertiesMap with all client properties first, including new details
      const propertiesMap = new Map<string, PropertyWithCheckins>();
      clientPropertiesData.forEach(prop => {
        propertiesMap.set(prop.id, {
          ...prop, // Spread all properties from the fetched data
          checkins: [] // Initialize with an empty array
        });
      });

      if (propertyIds.length === 0) {
        console.log("DEBUG: No properties found for this client. Skipping further checkin fetches.");
        setLoading(false);
        setTotalAllTimeIncome(0); // NEW: Set total to 0 if no properties
        setClientProperties([]); // Ensure clientProperties is empty if no properties found
        return;
      }

      console.log("DEBUG: Step 2 - Fetching rooms for client properties...");
      const { data: roomsData, error: roomsError } = await supabase
        .from('rooms')
        .select('id, room_name, property_id')
        .in('property_id', propertyIds);

      if (roomsError) {
        console.error("DEBUG: Step 2 Error - roomsData:", roomsError);
        throw roomsError;
      }
      console.log("DEBUG: Step 2 Result - roomsData:", roomsData);
      const roomIds = roomsData.map(r => r.id);
      const roomMap = new Map(roomsData.map(r => [r.id, r.room_name]));
      const roomPropertyMap = new Map(roomsData.map(r => [r.id, r.property_id]));


      if (roomIds.length === 0) {
        console.log("DEBUG: No rooms found for client properties. Skipping further checkin fetches.");
        setLoading(false);
        setTotalAllTimeIncome(0); // NEW: Set total to 0 if no rooms
        return;
      }

      console.log("DEBUG: Step 3 - Fetching checkin_room_details for client rooms...");
      const { data: checkinRoomDetailsData, error: checkinRoomDetailsError } = await supabase
        .from('checkin_room_details')
        .select('checkin_id, room_id, pax_count, price_per_night_eur') // Select price_per_night_eur
        .in('room_id', roomIds);

      if (checkinRoomDetailsError) {
        console.error("DEBUG: Step 3 Error - checkinRoomDetailsData:", checkinRoomDetailsError);
        throw checkinRoomDetailsError;
      }
      console.log("DEBUG: Step 3 Result - checkinRoomDetailsData:", checkinRoomDetailsData);
      const checkinIds = [...new Set(checkinRoomDetailsData.map(d => d.checkin_id))];

      if (checkinIds.length === 0) {
        console.log("DEBUG: No checkin_room_details found for client rooms. Skipping checkin fetch.");
        setLoading(false);
        setTotalAllTimeIncome(0); // NEW: Set total to 0 if no checkin details
        return;
      }

      // NEW: Fetch ALL checkins for total income calculation
      const { data: allCheckinsForTotal, error: allCheckinsError } = await supabase
        .from('checkins')
        .select('id, total_amount_eur')
        .in('id', checkinIds); // Filter by checkin_ids associated with client's rooms

      if (allCheckinsError) {
        console.error("DEBUG: Error fetching all checkins for total:", allCheckinsError);
        throw allCheckinsError;
      }
      const calculatedTotalAllTimeIncome = allCheckinsForTotal.reduce((sum, checkin) => sum + (checkin.total_amount_eur || 0), 0);
      setTotalAllTimeIncome(calculatedTotalAllTimeIncome); // NEW: Set the total all-time income

      console.log("DEBUG: Step 4 - Fetching checkins based on collected IDs (for current month display)...");
      const { data: checkinsData, error: checkinsError } = await supabase
        .from('checkins')
        .select('*')
        .in('id', checkinIds)
        .gte('check_in_date', firstDayOfMonth)
        .lte('check_out_date', lastDayOfMonth)
        .order('check_in_date', { ascending: false });

      if (checkinsError) {
        console.error("DEBUG: Step 4 Error - checkinsData:", checkinsError);
        throw checkinsError;
      }
      console.log("DEBUG: Step 4 Result - checkinsData:", checkinsData);

      const flatListOfClientCheckins: Booking[] = []; 

      checkinsData.forEach(checkin => {
        const processedCheckinRoomDetails: Booking['checkin_room_details'] = [];
        let checkinPropertyId: string | undefined;
        let checkinPropertyTitle: string | undefined;

        checkinRoomDetailsData.filter(d => d.checkin_id === checkin.id).forEach(detail => {
            const roomId = detail.room_id;
            const propertyId = roomPropertyMap.get(roomId);
            const propertyTitle = clientPropertiesData.find(p => p.id === propertyId)?.title;

            if (propertyId && propertyTitle) {
                checkinPropertyId = propertyId;
                checkinPropertyTitle = propertyTitle;

                processedCheckinRoomDetails.push({
                    room_id: roomId,
                    pax_count: detail.pax_count,
                    price_per_night_eur: detail.price_per_night_eur, // Include price_per_night_eur
                    rooms: { room_name: roomMap.get(roomId) || 'Unknown Room' }
                });

                // Add checkin to the property's list if it exists in the map
                const existingProperty = propertiesMap.get(propertyId);
                if (existingProperty && !existingProperty.checkins.some(c => c.id === checkin.id)) {
                    existingProperty.checkins.push({
                        id: checkin.id,
                        check_in_date: checkin.check_in_date,
                        check_out_date: checkin.check_out_date,
                        arrival_time: checkin.arrival_time,
                        notes: checkin.notes,
                        status: checkin.status,
                        total_amount_eur: checkin.total_amount_eur, // Include total_amount_eur
                        checkin_room_details: processedCheckinRoomDetails
                    });
                }
            }
        });

        if (checkinPropertyId) {
            flatListOfClientCheckins.push({
                id: checkin.id,
                check_in_date: checkin.check_in_date,
                check_out_date: checkin.check_out_date,
                arrival_time: checkin.arrival_time,
                notes: checkin.notes,
                status: checkin.status,
                total_amount_eur: checkin.total_amount_eur, // Include total_amount_eur
                checkin_room_details: processedCheckinRoomDetails,
                property_id: checkinPropertyId,
                property_title: checkinPropertyTitle
            });
        }
      });

      setClientProperties(Array.from(propertiesMap.values()));
      setAllClientCheckins(flatListOfClientCheckins);
      console.log("DEBUG: clientProperties (grouped by property):", Array.from(propertiesMap.values()));
      console.log("DEBUG: allClientCheckins (flat list):", flatListOfClientCheckins);

    } catch (err: any) {
      setError(err.message || 'Failed to load client data.');
    } finally {
      setLoading(false);
    }
  }, []); // Removed clientPropertiesData from dependencies

  useEffect(() => {
    loadClientData();
  }, [loadClientData]);

  const handleProfileUpdateSuccess = useCallback(() => {
    setActiveView('overview');
  }, []);

  const handleBackToOverview = useCallback(() => {
    setActiveView('overview');
  }, []);

  // Helper to calculate nights
  const calculateNights = (checkIn: string, checkOut: string) => {
    const start = new Date(checkIn);
    const end = new Date(checkOut);
    return differenceInDays(end, start);
  };

  // Helper to get status display
  const getStatusDisplay = (status: string) => {
    switch (status) {
      case 'pending': return { text: 'WAITING', color: 'bg-blue-500 text-white' };
      case 'checked_in': return { text: 'IN HOUSE', color: 'bg-green-500 text-white' };
      case 'checked_out': return { text: 'CHECKED OUT', color: 'bg-red-500 text-white' };
      case 'cancelled': return { text: 'CANCELLED', color: 'bg-gray-500 text-white' };
      default: return { text: 'UNKNOWN', color: 'bg-gray-300 text-gray-800' };
    }
  };

  // NEW: Filtered checkins based on showCheckedOutGuests state
  const filteredCheckins = showCheckedOutGuests
    ? allClientCheckins
    : allClientCheckins.filter(checkin => checkin.status !== 'checked_out');

  // NEW: Calculate total expected monthly income
  const totalExpectedMonthlyIncome = clientIncomeSummary.reduce((sum, prop) => sum + prop.monthly_income_from_rent, 0);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="h-32" />
      <div className="pb-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">Client Dashboard</h1>

          {loading && (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-amber-500"></div>
            </div>
          )}

          {error && (
            <div className="bg-red-50 text-red-600 p-4 rounded-md">
              {error}
            </div>
          )}

          {!loading && !error && (
            <div className="bg-white rounded-xl shadow-sm p-8">
              {profile && activeView === 'overview' && (
                <>
                  <div className="mb-6">
                    <h2 className="text-2xl font-bold text-gray-800">Welcome, {profile.username}!</h2>
                    <p className="text-gray-600">Your role: {profile.role}</p>
                  </div>

                  <h2 className="text-2xl font-bold text-gray-800 mb-4">Your Dashboard</h2>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Client Details Button */}
                    <button
                      onClick={() => setActiveView('profile')}
                      className="bg-blue-50 border-2 border-blue-200 rounded-xl p-6 hover:shadow-lg transition-all duration-300 transform hover:scale-105 flex flex-col items-center text-center"
                    >
                      <User className="w-12 h-12 text-blue-600 mb-3" />
                      <span className="text-xl font-bold text-gray-900">Client Details</span>
                      <p className="text-gray-600 text-sm mt-1">Manage your personal information</p>
                    </button>

                    {/* Bank Details Button */}
                    <button
                      onClick={() => setActiveView('bank')}
                      className="bg-green-50 border-2 border-green-200 rounded-xl p-6 hover:shadow-lg transition-all duration-300 transform hover:scale-105 flex flex-col items-center text-center"
                    >
                      <Banknote className="w-12 h-12 text-green-600 mb-3" />
                      <span className="text-xl font-bold text-gray-900">Bank Details</span>
                      <p className="text-gray-600 text-sm mt-1">Manage your payout information</p>
                    </button>

                    {/* Calendar Button */}
                    <button
                      onClick={() => setActiveView('calendar')}
                      className="bg-purple-50 border-2 border-purple-200 rounded-xl p-6 hover:shadow-lg transition-all duration-300 transform hover:scale-105 flex flex-col items-center text-center"
                    >
                      <CalendarDays className="w-12 h-12 text-purple-600 mb-3" />
                      <span className="text-xl font-bold text-gray-900">Calendar</span>
                      <p className="text-gray-600 text-sm mt-1">View your property's bookings</p>
                    </button>

                    {/* NEW: Income Button */}
                    <button
                      onClick={() => setActiveView('income')}
                      className="bg-yellow-50 border-2 border-yellow-200 rounded-xl p-6 hover:shadow-lg transition-all duration-300 transform hover:scale-105 flex flex-col items-center text-center"
                    >
                      <DollarSign className="w-12 h-12 text-yellow-600 mb-3" />
                      <span className="text-xl font-bold text-gray-900">Income</span>
                      <p className="text-gray-600 text-sm mt-1">View your property income</p>
                    </button>
                    
                    {/* NEW: Total All-Time Income Card */}
                    <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-6 hover:shadow-lg transition-all duration-300 flex flex-col items-center text-center">
                      <DollarSign className="w-12 h-12 text-blue-600 mb-3" />
                      <span className="text-xl font-bold text-gray-900">Total All-Time Income</span>
                      <p className="text-2xl font-bold text-blue-900">€{totalAllTimeIncome.toFixed(2)}</p>
                    </div>
                  </div>
                </>
              )}

              {profile && activeView === 'profile' && (
                <>
                  <h2 className="text-2xl font-bold text-gray-800 mb-4">Personal Details</h2>
                  <ClientProfileForm
                    userId={profile.id}
                    initialProfileData={profile}
                    onProfileUpdated={loadClientData}
                    onSuccess={handleProfileUpdateSuccess}
                    onBack={handleBackToOverview}
                  />
                </>
              )}

              {activeView === 'bank' && (
                <ClientBankDetails onBack={handleBackToOverview} />
              )}

              {activeView === 'calendar' && (
                <ClientCalendar onBack={handleBackToOverview} />
              )}

              {/* NEW: Income View */}
              {activeView === 'income' && (
                <ClientIncomePage
                  clientUserId={profile?.id || ''} // Pass clientUserId
                  clientIncomeSummary={clientIncomeSummary} // Pass income summary
                  onBack={handleBackToOverview}
                />
              )}

              {profile && activeView === 'overview' && (
                <>
                  {/* Original "Your Properties" section (grouped by property) */}
                  <h2 className="text-2xl font-bold text-gray-800 mb-4 mt-8">Your Properties (Grouped)</h2>
                  {clientProperties.length > 0 ? (
                    <div className="space-y-6">
                      {clientProperties.map(property => (
                        <div key={property.id} className="p-4 border rounded-lg bg-green-50">
                          <h3 className="text-xl font-semibold text-green-800">{property.title}</h3>
                          <p className="text-gray-600">Property ID: {property.id}</p>
                          <p className="text-gray-600">Type: {property.property_type}</p>
                          <p className="text-gray-600">Location: {property.location}</p>
                          <p className="text-gray-600">Price: €{property.price?.toLocaleString()}</p>
                          {property.bedrooms && <p className="text-gray-600">Bedrooms: {property.bedrooms}</p>}
                          {property.bathrooms && <p className="text-gray-600">Bathrooms: {property.bathrooms}</p>}
                          {property.area && <p className="text-gray-600">Built Area: {property.area} m²</p>}
                          {(property.land_size || property.lot_size) && <p className="text-gray-600">Land Size: {(property.land_size || property.lot_size)} m²</p>}
                          
                          <h4 className="text-lg font-semibold text-green-700 mt-4">Check-ins/Check-outs (Current Month)</h4>
                          {property.checkins.length > 0 ? (
                            <ul className="list-disc list-inside ml-4 space-y-2">
                              {property.checkins.map(checkin => (
                                <li key={checkin.id} className="text-gray-700">
                                  <strong>{format(new Date(checkin.check_in_date), 'MMM dd')}</strong> (In) - 
                                  <strong> {format(new Date(checkin.check_out_date), 'MMM dd')}</strong> (Out)
                                  <br />
                                  Rooms: {checkin.checkin_room_details?.map(d => d.rooms?.room_name).join(', ')} (Pax: {checkin.checkin_room_details?.reduce((sum, d) => sum + d.pax_count, 0)})
                                  {checkin.arrival_time && ` | Arrival: ${checkin.arrival_time}`}
                                  {checkin.notes && ` | Notes: ${checkin.notes}`}
                                  <br />
                                  Status: <span className="capitalize">{checkin.status.replace('_', ' ')}</span>
                                </li>
                              ))}
                            </ul>
                          ) : (
                            <p className="text-gray-700">No check-ins for the current month.</p>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-600">You don't have any properties listed yet.</p>
                  )}

                  {/* NEW: Dedicated Check-ins and Check-outs Section (Flat List - Table View) */}
                  <h2 className="text-2xl font-bold text-gray-800 mb-4 mt-8">Your Check-ins and Check-outs</h2>
                  {/* NEW: Checkbox for filtering */}
                  <div className="mb-4 flex items-center">
                    <input
                      type="checkbox"
                      id="showCheckedOutGuests"
                      checked={showCheckedOutGuests}
                      onChange={(e) => setShowCheckedOutGuests(e.target.checked)}
                      className="rounded border-gray-300 text-amber-600 focus:ring-amber-500"
                    />
                    <label htmlFor="showCheckedOutGuests" className="ml-2 text-sm font-medium text-gray-700">
                      Show Checked Out Guests
                    </label>
                  </div>

                  {filteredCheckins.length > 0 ? (
                    <div className="bg-white shadow-md rounded-lg overflow-hidden">
                      <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                          <thead className="bg-gray-50">
                            <tr>
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
                                Rooms (PAX)
                              </th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Arrival Time
                              </th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Status
                              </th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Notes
                              </th>
                            </tr>
                          </thead>
                          <tbody className="bg-white divide-y divide-gray-200">
                            {filteredCheckins.map(checkin => {
                              const statusDisplay = getStatusDisplay(checkin.status);
                              return (
                                <tr key={checkin.id} className="hover:bg-gray-50">
                                  <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="text-sm font-medium text-gray-900">
                                      {format(new Date(checkin.check_in_date), 'MMM dd, yyyy')}
                                    </div>
                                  </td>
                                  <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="text-sm text-gray-900">
                                      {format(new Date(checkin.check_out_date), 'MMM dd, yyyy')}
                                    </div>
                                  </td>
                                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                    {calculateNights(checkin.check_in_date, checkin.check_out_date)}
                                  </td>
                                  <td className="px-6 py-4">
                                    <ul className="list-disc list-inside text-sm text-gray-500">
                                      {checkin.checkin_room_details?.map((detail, idx) => (
                                        <li key={idx}>{detail.rooms?.room_name || 'Unknown Room'} ({detail.pax_count} PAX)</li>
                                      ))}
                                    </ul>
                                  </td>
                                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                    {checkin.arrival_time || 'N/A'}
                                  </td>
                                  <td className="px-6 py-4 whitespace-nowrap">
                                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${statusDisplay.color}`}>
                                      {statusDisplay.text}
                                    </span>
                                  </td>
                                  <td className="px-6 py-4 text-sm text-gray-500 max-w-xs truncate">
                                    {checkin.notes || 'N/A'}
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  ) : (
                    <p className="text-gray-600">No check-ins or check-outs for the current month across your properties.</p>
                  )}
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ClientDashboard;
