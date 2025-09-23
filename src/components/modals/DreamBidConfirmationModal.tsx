import React from 'react';
import ReactDOM from 'react-dom';
import { X } from 'lucide-react';
import Button from '../ui/Button';

interface DreamBidConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  message?: string;
}

const DreamBidConfirmationModal: React.FC<DreamBidConfirmationModalProps> = ({ isOpen, onClose, message = "This is a test modal!" }) => {
  if (!isOpen) return null;

  const modalRoot = document.getElementById('modal-root');
  if (!modalRoot) return null;

  return ReactDOM.createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black bg-opacity-50"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-white rounded-2xl shadow-2xl max-w-sm w-full mx-auto p-6 text-center">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-400 hover:text-gray-600 transition-colors duration-200"
        >
          <X className="w-5 h-5" />
        </button>

        <h3 className="text-xl font-bold text-gray-900 mb-4">
          Test Modal
        </h3>

        <p className="text-gray-600 mb-6">
          {message}
        </p>

        <Button onClick={onClose} className="w-full">
          Close
        </Button>
      </div>
    </div>,
    modalRoot
  );
};

export default DreamBidConfirmationModal;
