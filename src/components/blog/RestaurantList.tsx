import React from 'react';
import RestaurantCard from './RestaurantCard';
import { mockRestaurants } from '../../data/mockRestaurants';

const RestaurantList: React.FC = () => {
  return (
    <div className="space-y-8">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-4">
          My Favorite Food Spots in Boracay
        </h2>
        <p className="text-gray-600 max-w-3xl mx-auto">
          After years of exploring Boracay's culinary scene, I've compiled my personal favorites. 
          From beachfront bars to hidden cafés, these spots offer authentic flavors and unforgettable experiences.
        </p>
      </div>
      
      <div className="space-y-6">
        {mockRestaurants.map((restaurant) => (
          <RestaurantCard key={restaurant.id} restaurant={restaurant} />
        ))}
      </div>
    </div>
  );
};

export default RestaurantList;