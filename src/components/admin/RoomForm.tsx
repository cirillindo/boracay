import React, { useState, useEffect, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate, useParams } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import Button from '../ui/Button';
import { Property } from '../../types';

interface Room {
  id?: string;
  room_name: string;
  property_id: string;
  number_of_beds: number;
  bed_type?: string;
  has_cabinet: boolean;
  has_sofas: boolean;
  has_balcony: boolean;
  has_stairs: boolean;
}

const RoomForm: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [properties, setProperties] = useState<Property[]>([]);
  const { register, handleSubmit, setValue, reset } = useForm<Room>();

  useEffect(() => {
    loadProperties();
    if (id) {
      loadRoom();
    }
  }, [id]);

  const loadProperties = async () => {
    try {
      const { data, error } = await supabase
        .from('properties')
        .select('id, title')
        .order('title', { ascending: true });
      if (error) throw error;
      setProperties(data || []);
    } catch (err) {
      console.error('Error loading properties:', err);
      setError('Failed to load properties for selection.');
    }
  };

  const loadRoom = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('rooms')
        .select('*')
        .eq('id', id)
        .single();
      if (error) throw error;
      if (data) {
        reset(data);
      }
    } catch (err) {
      setError('Error loading room data.');
      console.error(err);
    }
  }, [id, reset]);

  const onSubmit = async (data: Room) => {
    setLoading(true);
    setError('');

    try {
      const roomData = {
        ...data,
        number_of_beds: Number(data.number_of_beds),
        has_cabinet: Boolean(data.has_cabinet),
        has_sofas: Boolean(data.has_sofas),
        has_balcony: Boolean(data.has_balcony),
        has_stairs: Boolean(data.has_stairs),
      };

      const { error: saveError } = id
        ? await supabase.from('rooms').update(roomData).eq('id', id)
        : await supabase.from('rooms').insert([roomData]);

      if (saveError) throw saveError;
      navigate('/admin/rooms');
    } catch (err: any) {
      setError(`Error saving room: ${err.message}`);
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

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Room Name
        </label>
        <input
          type="text"
          {...register('room_name', { required: 'Room name is required' })}
          className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Associated Property
        </label>
        <select
          {...register('property_id', { required: 'Property is required' })}
          className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500"
        >
          <option value="">Select a property</option>
          {properties.map((property) => (
            <option key={property.id} value={property.id}>
              {property.title}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Number of Beds
        </label>
        <input
          type="number"
          {...register('number_of_beds', {
            required: 'Number of beds is required',
            valueAsNumber: true,
            min: { value: 0, message: 'Number of beds cannot be negative' },
          })}
          className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Bed Type (e.g., King, Queen, Twin)
        </label>
        <input
          type="text"
          {...register('bed_type')}
          className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <label className="flex items-center space-x-2">
          <input
            type="checkbox"
            {...register('has_cabinet')}
            className="rounded border-gray-300 text-amber-600 focus:ring-amber-500"
          />
          <span className="text-sm font-medium text-gray-700">Has Cabinet</span>
        </label>
        <label className="flex items-center space-x-2">
          <input
            type="checkbox"
            {...register('has_sofas')}
            className="rounded border-gray-300 text-amber-600 focus:ring-amber-500"
          />
          <span className="text-sm font-medium text-gray-700">Has Sofas</span>
        </label>
        <label className="flex items-center space-x-2">
          <input
            type="checkbox"
            {...register('has_balcony')}
            className="rounded border-gray-300 text-amber-600 focus:ring-amber-500"
          />
          <span className="text-sm font-medium text-gray-700">Has Balcony</span>
        </label>
        <label className="flex items-center space-x-2">
          <input
            type="checkbox"
            {...register('has_stairs')}
            className="rounded border-gray-300 text-amber-600 focus:ring-amber-500"
          />
          <span className="text-sm font-medium text-gray-700">Has Stairs</span>
        </label>
      </div>

      <div className="flex justify-end space-x-4">
        <Button
          type="button"
          variant="outline"
          onClick={() => navigate('/admin/rooms')}
        >
          Cancel
        </Button>
        <Button type="submit" disabled={loading}>
          {loading ? 'Saving...' : id ? 'Update Room' : 'Create Room'}
        </Button>
      </div>
    </form>
  );
};

export default RoomForm;