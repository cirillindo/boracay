// src/components/DreamBidModal.tsx
import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom';
import { X, DollarSign, User, Mail, Phone, CheckCircle, AlertCircle } from 'lucide-react';
import Button from './ui/Button';
import { supabase } from '../lib/supabase';
import { Property } from '../types';
import { countryCodesList } from '../utils/countryCodes';

interface DreamBidModalProps {
  isOpen: boolean;
  onClose: () => void;
  property: Property;
  onBidSuccess: () => void;
}

const DreamBidModal: React.FC<DreamBidModalProps> = ({ isOpen, onClose, property, onBidSuccess }) => {
  const [userName, setUserName] = useState('');
  const [userEmail, setUserEmail] = useState('');
  const [userPhone, setUserPhone] = useState('');
  const [countryCode, setCountryCode] = useState('+63');
  const [bidAmount, setBidAmount] = useState<number | ''>('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (isOpen) {
      // Reset form when modal opens
      setUserName('');
      setUserEmail('');
      setUserPhone('');
      setBidAmount('');
      setError(null);
      setFormErrors({});
    }
  }, [isOpen]);

  const validateForm = () => {
    const errors: Record<string, string> = {};
    if (!userName.trim()) errors.userName = 'Name is required';
    if (!userEmail.trim()) {
      errors.userEmail = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(userEmail)) {
      errors.userEmail = 'Email is invalid';
    }
    if (!userPhone.trim()) {
      errors.userPhone = 'Phone number is required';
    } else if (!/^\d{7,15}$/.test(userPhone)) {
      errors.userPhone = 'Phone number must be 7-15 digits';
    }
    if (!bidAmount || bidAmount <= 0) errors.bidAmount = 'Bid amount must be greater than 0';
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);
    setError(null);

    try {
      const { error: bidError } = await supabase
        .from('bids')
        .insert({
          property_id: property.id,
          user_name: userName,
          user_email: userEmail,
          user_phone: `${countryCode}${userPhone}`,
          bid_amount: bidAmount,
        });

      if (bidError) throw bidError;

      onBidSuccess();
    } catch (err: any) {
      setError(err.message || 'Failed to place bid');
      console.error('Bid submission error:', err);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  const modalRoot = document.getElementById('modal-root');
  if (!modalRoot) return null;

  console.log("DreamBidModal is attempting to render!"); // ADD THIS LINE
  console.log("Property passed to modal:", property); // ADD THIS LINE

  return ReactDOM.createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black bg-opacity-50"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-white rounded-2xl shadow-2xl max-w-md w-full mx-auto p-6">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-400 hover:text-gray-600 transition-colors duration-200"
        >
          <X className="w-5 h-5" />
        </button>

        <h2 className="text-2xl font-bold text-gray-900 mb-4 text-center">Place Your Dream Bid</h2>

        {error && (
          <div className="bg-red-50 text-red-600 p-4 rounded-md mb-4 flex items-center gap-2">
            <AlertCircle className="w-5 h-5" />
            {error}
          </div>
        )}

        <div className="bg-amber-50 p-4 rounded-lg mb-6">
          <h3 className="font-semibold text-gray-900 mb-2">Property: {property.title}</h3>
          <p className="text-sm text-gray-600">Current Price: €{property.price?.toLocaleString() || 'N/A'}</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="userName" className="block text-sm font-medium text-gray-700 mb-1">Your Name *</label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                id="userName"
                value={userName}
                onChange={(e) => setUserName(e.target.value)}
                className={`w-full pl-10 pr-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500 ${formErrors.userName ? 'border-red-500' : 'border-gray-300'}`}
                placeholder="John Doe"
                required
              />
            </div>
            {formErrors.userName && <p className="text-red-500 text-xs mt-1">{formErrors.userName}</p>}
          </div>

          <div>
            <label htmlFor="userEmail" className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="email"
                id="userEmail"
                value={userEmail}
                onChange={(e) => setUserEmail(e.target.value)}
                className={`w-full pl-10 pr-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500 ${formErrors.userEmail ? 'border-red-500' : 'border-gray-300'}`}
                placeholder="john.doe@example.com"
                required
              />
            </div>
            {formErrors.userEmail && <p className="text-red-500 text-xs mt-1">{formErrors.userEmail}</p>}
          </div>

          <div>
            <label htmlFor="userPhone" className="block text-sm font-medium text-gray-700 mb-1">WhatsApp Number *</label>
            <div className="flex">
              <select
                value={countryCode}
                onChange={(e) => setCountryCode(e.target.value)}
                className="w-24 px-2 py-2 border border-gray-300 rounded-l-md focus:outline-none focus:ring-2 focus:ring-amber-500 text-sm"
              >
                {countryCodesList.map((option, index) => (
                  <option key={`${option.code}-${index}`} value={option.code}>
                    {option.flag} {option.code}
                  </option>
                ))}
              </select>
              <div className="relative flex-1">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="tel"
                  id="userPhone"
                  value={userPhone}
                  onChange={(e) => setUserPhone(e.target.value.replace(/\D/g, ''))}
                  className={`w-full pl-10 pr-4 py-2 border border-l-0 rounded-r-md focus:outline-none focus:ring-2 focus:ring-amber-500 ${formErrors.userPhone ? 'border-red-500' : 'border-gray-300'}`}
                  placeholder="Enter numbers only (7-15 digits)"
                  required
                />
              </div>
            </div>
            {formErrors.userPhone && <p className="text-red-500 text-xs mt-1">{formErrors.userPhone}</p>}
          </div>

          <div>
            <label htmlFor="bidAmount" className="block text-sm font-medium text-gray-700 mb-1">Your Dream Bid (EUR) *</label>
            <div className="relative">
              <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="number"
                id="bidAmount"
                value={bidAmount}
                onChange={(e) => setBidAmount(parseFloat(e.target.value))}
                className={`w-full pl-10 pr-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500 ${formErrors.bidAmount ? 'border-red-500' : 'border-gray-300'}`}
                placeholder="e.g., 150000"
                min="1"
                required
              />
            </div>
            {formErrors.bidAmount && <p className="text-red-500 text-xs mt-1">{formErrors.bidAmount}</p>}
          </div>

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? 'Placing Bid...' : 'Place Bid'}
          </Button>
          <Button type="button" variant="outline" onClick={onClose} className="w-full mt-2">
            Cancel
          </Button>
        </form>
      </div>
    </div>,
    modalRoot
  );
};

export default DreamBidModal;
