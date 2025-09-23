// src/components/admin/RoomList.tsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { Pencil, Trash2, Bed, Bath, Home, CheckCircle, XCircle } from 'lucide-react';
import Button from '../ui/Button';

interface Room {
  id: string;
  room_name: string;
  property_id: string;
  number_of_beds: number;
  bed_type?: string;
  has_cabinet: boolean;
  has_sofas: boolean;
  has_balcony: boolean;
  has_stairs: boolean;
  properties?: { title: string };
}

const RoomList: React.FC = () => {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isMobile, setIsMobile] = useState(false); // State for mobile view

  useEffect(() => {
    // Detect mobile view on mount and resize
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768); // Adjust breakpoint as needed
    };

    handleResize(); // Set initial value
    window.addEventListener('resize', handleResize); // Add event listener
    return () => window.removeEventListener('resize', handleResize); // Clean up
  }, []);

  useEffect(() => {
    loadRooms();
  }, []);

  const loadRooms = async () => {
    try {
      const { data, error } = await supabase
        .from('rooms')
        .select(`
          *,
          properties (title)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setRooms(data || []);
    } catch (err) {
      setError('Error loading rooms');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this room?')) return;

    try {
      console.log(`Attempting to delete room with ID: ${id}`);
      const { data, error } = await supabase
        .from('rooms')
        .delete()
        .eq('id', id)
        .select(); // Add .select() to get the deleted data back

      if (error) {
        console.error('Supabase delete error:', error);
        setError(`Error deleting room: ${error.message}`);
        return; // Exit if there's a Supabase error object
      }

      // Check if any rows were actually returned (i.e., deleted)
      if (data && data.length > 0) {
        console.log(`Successfully deleted room with ID: ${id}. Deleted data:`, data);
        setRooms(rooms.filter((r) => r.id !== id));
      } else {
        // This case happens if RLS denies or FK constraint prevents deletion silently
        console.warn(`No room found or deleted for ID: ${id}. This might be due to RLS policies or foreign key constraints.`);
        setError('Failed to delete room. It might be linked to other records or you lack permissions.');
        // Reload rooms to reflect the actual state from the database
        loadRooms();
      }
    } catch (err) {
      console.error('Unexpected error during delete operation:', err);
      setError('An unexpected error occurred while deleting the room.');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-amber-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 text-red-600 p-4 rounded-md">
        {error}
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Rooms</h2>
        <Link to="/admin/rooms/new">
          <Button>Add New Room</Button>
        </Link>
      </div>

      {rooms.length === 0 ? (
        <div className="text-center py-12">
          <Home className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No rooms found</h3>
          <p className="text-gray-500 mb-4">Get started by adding your first room.</p>
          <Link to="/admin/rooms/new">
            <Button>Add First Room</Button>
          </Link>
        </div>
      ) : (
        <div className="bg-white shadow-md rounded-lg overflow-hidden">
          {isMobile ? (
            // Mobile Card View
            <div className="p-4 space-y-4">
              {rooms.map((room) => (
                <div key={room.id} className="bg-gray-50 p-4 rounded-lg shadow-sm border border-gray-200">
                  <div className="flex justify-between items-center mb-3">
                    <h3 className="text-base font-bold text-gray-900">{room.room_name}</h3>
                    {/* Removed property title from mobile view */}
                  </div>

                  <div className="text-sm text-gray-700 space-y-2 mb-4">
                    <div className="flex items-center gap-2">
                      <Bed className="w-4 h-4 text-gray-500" />
                      <span>{room.number_of_beds} Beds {room.bed_type ? `(${room.bed_type})` : ''}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Home className="w-4 h-4 text-gray-500" />
                      <span>Features:</span>
                      <div className="flex flex-wrap gap-1 ml-1">
                        {room.has_cabinet && <span className="px-2 py-0.5 bg-blue-100 text-blue-800 text-xs rounded-full">Cabinet</span>}
                        {room.has_sofas && <span className="px-2 py-0.5 bg-green-100 text-green-800 text-xs rounded-full">Sofas</span>}
                        {room.has_balcony && <span className="px-2 py-0.5 bg-purple-100 text-purple-800 text-xs rounded-full">Balcony</span>}
                        {room.has_stairs && <span className="px-2 py-0.5 bg-red-100 text-red-800 text-xs rounded-full">Stairs</span>}
                        {!room.has_cabinet && !room.has_sofas && !room.has_balcony && !room.has_stairs && (
                          <span className="text-xs text-gray-500">None</span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-end space-x-2 pt-3 border-t border-gray-200">
                    <Link
                      to={`/admin/rooms/edit/${room.id}`}
                      className="p-2 text-amber-600 hover:text-amber-900"
                      title="Edit room"
                    >
                      <Pencil className="w-5 h-5" />
                    </Link>
                    <button
                      onClick={() => handleDelete(room.id)}
                      className="p-2 text-red-600 hover:text-red-900"
                      title="Delete room"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
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
                      Room Name
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Property
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Beds
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Features
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {rooms.map((room, index) => (
                    <tr key={room.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {room.room_name}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {room.properties?.title || 'N/A'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {room.number_of_beds} {room.bed_type ? `(${room.bed_type})` : ''}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <div className="flex flex-wrap gap-1">
                          {room.has_cabinet && <span className="px-2 py-0.5 bg-blue-100 text-blue-800 text-xs rounded-full">Cabinet</span>}
                          {room.has_sofas && <span className="px-2 py-0.5 bg-green-100 text-green-800 text-xs rounded-full">Sofas</span>}
                          {room.has_balcony && <span className="px-2 py-0.5 bg-purple-100 text-purple-800 text-xs rounded-full">Balcony</span>}
                          {room.has_stairs && <span className="px-2 py-0.5 bg-red-100 text-red-800 text-xs rounded-full">Stairs</span>}
                          {!room.has_cabinet && !room.has_sofas && !room.has_balcony && !room.has_stairs && (
                            <span className="text-xs text-gray-500">None</span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex justify-end space-x-2">
                          <Link
                            to={`/admin/rooms/edit/${room.id}`}
                            className="text-amber-600 hover:text-amber-900"
                            title="Edit room"
                          >
                            <Pencil className="w-5 h-5" />
                          </Link>
                          <button
                            onClick={() => handleDelete(room.id)}
                            className="text-red-600 hover:text-red-900"
                            title="Delete room"
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

export default RoomList;

