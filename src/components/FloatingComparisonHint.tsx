import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom';
import { Heart, X } from 'lucide-react';

interface FloatingComparisonHintProps {
  isVisible: boolean;
  onDismiss: () => void;
}

const FloatingComparisonHint: React.FC<FloatingComparisonHintProps> = ({ isVisible, onDismiss }) => {
  const [showHint, setShowHint] = useState(isVisible);

  useEffect(() => {
    setShowHint(isVisible);
  }, [isVisible]);

  const handleDismiss = () => {
    setShowHint(false);
    onDismiss();
  };

  if (!showHint) return null;

  const modalRoot = document.getElementById('modal-root');
  if (!modalRoot) return null;

  return ReactDOM.createPortal(
    <div
      className={`fixed z-50 p-2 pr-1 bg-gradient-to-r from-amber-400 to-amber-500 rounded-full shadow-lg flex items-center gap-1 transition-all duration-500 ease-out border-2 border-amber-600
        ${isVisible ? 'opacity-100 translate-x-0 animate-elegant-pulse' : 'opacity-0 -translate-x-full'}
        `}
      style={{
        top: '30%', // Adjust vertical position as needed
        left: '2%', // Adjust horizontal position as needed
        transform: 'translateY(-50%)',
        minWidth: '160px', // Reduced min-width
        whiteSpace: 'nowrap',
        pointerEvents: isVisible ? 'auto' : 'none', // Allow clicks only when visible
      }}
    >
      <Heart className="w-6 h-6 text-red-600 fill-red-600 animate-pumping" /> {/* Reduced icon size */}
      <span className="text-sm font-bold text-white">Click heart to compare!</span> {/* Reduced font size */}
      <button
        onClick={handleDismiss}
        className="ml-1 p-0.5 rounded-full hover:bg-white/20 text-white transition-colors"
        aria-label="Dismiss hint"
      >
        <X className="w-4 h-4" /> {/* Reduced icon size */}
      </button>
    </div>,
    modalRoot
  );
};

export default FloatingComparisonHint;
