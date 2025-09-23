// src/components/DreamBidExitPopup.tsx
import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom';
import { Link } from 'react-router-dom';
import { X, Trophy } from 'lucide-react';
import Button from './ui/Button';

interface DreamBidExitPopupProps {
  isOpen: boolean;
  onClose: () => void;
}

const DreamBidExitPopup: React.FC<DreamBidExitPopupProps> = ({ isOpen, onClose }) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setIsVisible(true);
    } else {
      setIsVisible(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const modalRoot = document.getElementById('modal-root');
  if (!modalRoot) return null;

  return ReactDOM.createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className={`absolute inset-0 bg-black transition-opacity duration-300 ${
          isVisible ? 'bg-opacity-50' : 'bg-opacity-0'
        }`}
        onClick={onClose}
      />

      {/* Modal */}
      <div
        className={`relative bg-white rounded-2xl shadow-2xl max-w-md w-full mx-auto transform transition-all duration-300 ${
          isVisible
            ? 'scale-100 opacity-100 translate-y-0'
            : 'scale-95 opacity-0 translate-y-4'
        }`}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors duration-200 z-10"
        >
          <X className="w-6 h-6" />
        </button>

        {/* Content */}
        <div className="p-8 text-center">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-amber-100 rounded-full mb-6">
            <Trophy className="w-10 h-10 text-amber-600" />
          </div>

          <h3 className="text-2xl font-bold text-gray-900 mb-4">
            Don't Leave Empty-Handed!
          </h3>

          <p className="text-gray-600 mb-8 leading-relaxed">
            Did you know you can place a non-binding "Dream Bid" on properties you love? Tell us your ideal price!
          </p>

          <div className="space-y-3">
            <Link to="/dream-bid" onClick={onClose} className="block">
              <Button className="w-full bg-amber-600 hover:bg-amber-700 text-white font-medium py-3 px-6 rounded-lg transition-all duration-200 transform hover:scale-105">
                Explore Dream Bids
              </Button>
            </Link>

            <Button
              onClick={onClose}
              variant="outline"
              className="w-full text-gray-700 border-gray-300 hover:bg-gray-100 font-medium py-3 px-6 rounded-lg transition-all duration-200"
            >
              No Thanks
            </Button>
          </div>
        </div>
      </div>
    </div>,
    modalRoot
  );
};

export default DreamBidExitPopup;
