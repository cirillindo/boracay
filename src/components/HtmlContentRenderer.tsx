import React from 'react';

interface HtmlContentRendererProps {
  htmlContent: string;
}

const HtmlContentRenderer: React.FC<HtmlContentRendererProps> = ({ htmlContent }) => {
  return (
    <div className="bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div 
          className="bg-white rounded-lg shadow-lg p-8" 
          dangerouslySetInnerHTML={{ __html: htmlContent }} 
        />
      </div>
    </div>
  );
};

export default HtmlContentRenderer;