import React from 'react';
import Container from '../ui/Container';

const PropertyListings: React.FC = () => {
  return (
    <section className="bg-white py-16">
      <Container>
        <div className="text-center">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            DISCOVER YOUR <span className="font-licorice text-[3.5rem] text-amber-600">Ideal</span> HOME
          </h2>
          <p className="text-lg text-gray-600">
            Latest Homes & Properties for You
          </p>
        </div>
      </Container>
    </section>
  );
};

export default PropertyListings;