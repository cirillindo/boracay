import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Container from '../components/ui/Container';
import Button from '../components/ui/Button';
import PropertyCard from '../components/property/PropertyCard';
import SendToAgentFormModal from '../components/forms/SendToAgentFormModal';
import { supabase } from '../lib/supabase';
import { Property } from '../types';
import { Mail } from 'lucide-react';

const FavoritesPage: React.FC = () => {
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCurrency, setSelectedCurrency] = useState('EUR');
  const [showSendToAgentModal, setShowSendToAgentModal] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    loadFavorites();
  }, []);

  const loadFavorites = async () => {
    const favoritesStr = localStorage.getItem('favorites');
    const favoriteIds = favoritesStr ? JSON.parse(favoritesStr) : [];

    if (favoriteIds.length === 0) {
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('properties')
        .select('*')
        .in('id', favoriteIds);

      if (error) throw error;
      setProperties(data || []);
    } catch (error) {
      console.error('Error loading favorites:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSendToAgent = () => {
    setShowSendToAgentModal(true);
  };

  const handleModalClose = () => {
    setShowSendToAgentModal(false);
  };

  const handleModalSuccess = () => {
    // Optionally refresh the page or show additional feedback
    console.log('Properties sent successfully to agent!');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-amber-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="h-32" />
      
      <Container className="py-16">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-bold text-gray-900 mb-8">Your Saved Properties</h1>
          
          {properties.length > 0 ? (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
                {properties.map((property) => (
                  <div 
                    key={property.id}
                    className="cursor-pointer"
                  >
                    <PropertyCard 
                      property={{
                        ...property,
                        selectedCurrency
                      }}
                    />
                  </div>
                ))}
              </div>

              <div className="flex justify-center">
                <Button
                  onClick={handleSendToAgent}
                  className="flex items-center gap-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white font-medium px-8 py-3 rounded-lg transition-all duration-300 transform hover:scale-105"
                >
                  <Mail className="w-5 h-5" />
                  Send to Agent
                </Button>
              </div>
            </>
          ) : (
            <div className="text-center py-16">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">No saved properties yet</h2>
              <p className="text-gray-600 mb-8">
                Click the heart icon on any property to save it to your favorites.
              </p>
              <Button onClick={() => navigate('/for-sale')}>
                Browse Properties
              </Button>
            </div>
          )}
        </div>
      </Container>

      {/* Send to Agent Modal */}
      <SendToAgentFormModal
        isOpen={showSendToAgentModal}
        onClose={handleModalClose}
        properties={properties}
        onSuccess={handleModalSuccess}
      />
    </div>
  );
};

export default FavoritesPage;