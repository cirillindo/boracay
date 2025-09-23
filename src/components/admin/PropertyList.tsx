import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { Property } from '../../types';
import { Pencil, Trash2, ArrowUp, ArrowDown } from 'lucide-react';
import Button from '../ui/Button';

const PropertyList: React.FC = () => {
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [reorderLoading, setReorderLoading] = useState<string | null>(null);

  useEffect(() => {
    loadProperties();
  }, []);

  const loadProperties = async () => {
    try {
      const { data, error } = await supabase
        .from('properties')
        .select('*')
        .order('display_order', { ascending: true, nullsLast: true })
        .order('created_at', { ascending: false });

      if (error) throw error;
      setProperties(data || []);
    } catch (err) {
      setError('Error loading properties');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this property?')) return;

    try {
      const { error } = await supabase
        .from('properties')
        .delete()
        .eq('id', id);

      if (error) throw error;
      setProperties(properties.filter(p => p.id !== id));
    } catch (err) {
      setError('Error deleting property');
      console.error(err);
    }
  };

  const moveProperty = async (propertyId: string, direction: 'up' | 'down') => {
    try {
      setReorderLoading(propertyId);
      
      // Find the current property and its index
      const currentIndex = properties.findIndex(p => p.id === propertyId);
      if (currentIndex === -1) return;
      
      const currentProperty = properties[currentIndex];
      
      // Determine the target index based on direction
      const targetIndex = direction === 'up' 
        ? Math.max(0, currentIndex - 1) 
        : Math.min(properties.length - 1, currentIndex + 1);
      
      // If already at the top/bottom, do nothing
      if (targetIndex === currentIndex) {
        setReorderLoading(null);
        return;
      }
      
      const targetProperty = properties[targetIndex];
      
      // Use a large but safe integer value for PostgreSQL integer type
      const MAX_SAFE_INTEGER_FOR_PG = 2000000000;
      
      // Swap display_order values
      const currentOrder = currentProperty.display_order ?? MAX_SAFE_INTEGER_FOR_PG;
      const targetOrder = targetProperty.display_order ?? MAX_SAFE_INTEGER_FOR_PG;
      
      // Update the current property's display_order
      const { error: currentError } = await supabase
        .from('properties')
        .update({ display_order: targetOrder })
        .eq('id', currentProperty.id);
      
      if (currentError) throw currentError;
      
      // Update the target property's display_order
      const { error: targetError } = await supabase
        .from('properties')
        .update({ display_order: currentOrder })
        .eq('id', targetProperty.id);
      
      if (targetError) throw targetError;
      
      // Reload properties to reflect the new order
      await loadProperties();
    } catch (err) {
      setError('Error reordering properties');
      console.error(err);
    } finally {
      setReorderLoading(null);
    }
  };

  const createExcerpt = (html: string, maxLength: number = 150) => {
    // Create a temporary div to parse HTML
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = html || '';
    
    // Get text content
    let text = tempDiv.textContent || tempDiv.innerText || '';
    
    // Trim to maxLength
    if (text.length > maxLength) {
      text = text.substring(0, maxLength) + '...';
    }
    
    return text;
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
        <h2 className="text-2xl font-bold text-gray-900">Properties</h2>
        <Link to="/admin/new">
          <Button>Add New Property</Button>
        </Link>
      </div>

      <div className="bg-white shadow-md rounded-lg overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Order
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Property
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Location
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Price
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {properties.map((property, index) => (
              <tr key={property.id}>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-gray-500">{property.display_order ?? '-'}</span>
                    <div className="flex flex-col">
                      <button
                        onClick={() => moveProperty(property.id, 'up')}
                        disabled={index === 0 || reorderLoading !== null}
                        className={`p-1 rounded hover:bg-gray-100 ${index === 0 ? 'opacity-50 cursor-not-allowed' : ''}`}
                        title="Move up"
                      >
                        <ArrowUp className="w-4 h-4 text-gray-500" />
                      </button>
                      <button
                        onClick={() => moveProperty(property.id, 'down')}
                        disabled={index === properties.length - 1 || reorderLoading !== null}
                        className={`p-1 rounded hover:bg-gray-100 ${index === properties.length - 1 ? 'opacity-50 cursor-not-allowed' : ''}`}
                        title="Move down"
                      >
                        <ArrowDown className="w-4 h-4 text-gray-500" />
                      </button>
                    </div>
                    {reorderLoading === property.id && (
                      <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-amber-500"></div>
                    )}
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="text-sm font-medium text-gray-900 mb-1">
                    {property.title}
                  </div>
                  {property.description && (
                    <div className="text-sm text-gray-500 line-clamp-2">
                      {createExcerpt(property.description)}
                    </div>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {property.location}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  €{property.price.toLocaleString()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                    property.status === 'available' ? 'bg-green-100 text-green-800' :
                    property.status === 'sold' ? 'bg-red-100 text-red-800' :
                    'bg-yellow-100 text-yellow-800'
                  }`}>
                    {property.status}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <div className="flex justify-end space-x-2">
                    <Link
                      to={`/admin/edit/${property.id}`}
                      className="text-amber-600 hover:text-amber-900"
                    >
                      <Pencil className="w-5 h-5" />
                    </Link>
                    <button
                      onClick={() => handleDelete(property.id)}
                      className="text-red-600 hover:text-red-900"
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
    </div>
  );
};

export default PropertyList;