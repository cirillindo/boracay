import React from 'react';
import { Helmet } from 'react-helmet-async';

interface SEOJsonProps {
  graphs: Record<string, any>[];
}

const SEOJson: React.FC<SEOJsonProps> = ({ graphs }) => {
  return (
    <Helmet>
      {graphs.map((schema, index) => (
        <script key={index} type="application/ld+json">
          {JSON.stringify(schema)}
        </script>
      ))}
    </Helmet>
  );
};

export default SEOJson;