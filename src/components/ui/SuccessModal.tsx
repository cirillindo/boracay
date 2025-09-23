import React, { useEffect, useState } from 'react';
import ReactDOM from 'react-dom';
import { CheckCircle2, X, Sparkles } from 'lucide-react';
import Button from './Button';
import Confetti from '../Confetti';

interface SuccessModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  message?: string;
  style?: React.CSSProperties; // ADD THIS LINE
}

const SuccessModal: React.FC<SuccessModalProps> = ({
  isOpen,
  onClose,
  title = "Message Sent Successfully!",
  message = "Thank you for reaching out! We've received your message and will get back to you within 24 hours.",
  style // ADD THIS LINE
}) => {
  const [showConfetti, setShowConfetti] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setIsVisible(true);
      // Trigger confetti after modal animation
      setTimeout(() => {
        setShowConfetti(true);
      }, 300);
    } else {
      setIsVisible(false);
      setShowConfetti(false);
    }
  }, [isOpen]);

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(() => {
      onClose();
    }, 300);
  };

  const handleConfettiComplete = () => {
    setShowConfetti(false);
  };

  if (!isOpen) return null;

  const modalRoot = document.getElementById('modal-root');
  if (!modalRoot) return null;

  return ReactDOM.createPortal(
    <div className="fixed inset-0 z-50 overflow-y-auto" style={style}> {/* APPLY STYLE HERE */}
      {/* Backdrop */}
      <div 
        className={`fixed inset-0 bg-black transition-opacity duration-300 ${
          isVisible ? 'bg-opacity-50' : 'bg-opacity-0'
        }`}
        onClick={handleClose}
      />
      
      {/* Confetti */}
      <Confetti fire={showConfetti} onComplete={handleConfettiComplete} />
      
      {/* Modal */}
      <div className="flex min-h-full items-center justify-center p-4">
        <div 
          className={`relative bg-white rounded-2xl shadow-2xl max-w-md w-full mx-auto transform transition-all duration-300 ${
            isVisible 
              ? 'scale-100 opacity-100 translate-y-0' 
              : 'scale-95 opacity-0 translate-y-4'
          }`}
        >
          {/* Close button */}
          <button
            onClick={handleClose}
            className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors duration-200 z-10"
          >
            <X className="w-6 h-6" />
          </button>

          {/* Content */}
          <div className="p-8 text-center">
            {/* Success icon with animation */}
            <div className="relative mx-auto mb-6">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto relative overflow-hidden">
                <CheckCircle2 className="w-10 h-10 text-green-600" />
                
                {/* Sparkle animations */}
                <div className="absolute inset-0">
                  <Sparkles className="w-4 h-4 text-amber-400 absolute top-2 right-3 animate-pulse" />
                  <Sparkles className="w-3 h-3 text-amber-500 absolute bottom-3 left-2 animate-pulse delay-300" />
                  <Sparkles className="w-3 h-3 text-amber-400 absolute top-4 left-4 animate-pulse delay-700" />
                </div>
              </div>
              
              {/* Ripple effect */}
              <div className="absolute inset-0 w-20 h-20 mx-auto">
                <div className="w-full h-full bg-green-200 rounded-full animate-ping opacity-20"></div>
              </div>
            </div>

            {/* Title */}
            <h3 className="text-2xl font-bold text-gray-900 mb-4">
              {title}
            </h3>

            {/* Message */}
            <p className="text-gray-600 mb-8 leading-relaxed">
              {message}
            </p>

            {/* Action buttons */}
            <div className="space-y-3">
              <Button 
                onClick={handleClose}
                className="w-full bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-medium py-3 px-6 rounded-lg transition-all duration-200 transform hover:scale-105"
              >
                Awesome! 🎉
              </Button>
              
              <p className="text-sm text-gray-500">
                We'll be in touch soon!
              </p>
            </div>
          </div>

          {/* Decorative elements */}
          <div className="absolute -top-2 -left-2 w-4 h-4 bg-amber-400 rounded-full opacity-60 animate-bounce"></div>
          <div className="absolute -top-1 -right-3 w-3 h-3 bg-green-400 rounded-full opacity-60 animate-bounce delay-200"></div>
          <div className="absolute -bottom-2 -left-3 w-3 h-3 bg-blue-400 rounded-full opacity-60 animate-bounce delay-500"></div>
          <div className="absolute -bottom-1 -right-2 w-4 h-4 bg-purple-400 rounded-full opacity-60 animate-bounce delay-700"></div>
        </div>
      </div>
    </div>,
    modalRoot
  );
};

export default SuccessModal;