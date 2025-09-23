import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom';
import { X, Mail, MessageCircle, User, Phone, Heart, Send, CheckCircle2 } from 'lucide-react';
import Button from '../ui/Button';
import SuccessModal from '../ui/SuccessModal';
import { Property } from '../../types';
import { countryCodesList } from '../../utils/countryCodes';
import emailjs from '@emailjs/browser';
import axios from 'axios';

interface SendToAgentFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  properties: Property[];
  onSuccess: () => void;
}

const SendToAgentFormModal: React.FC<SendToAgentFormModalProps> = ({
  isOpen,
  onClose,
  properties,
  onSuccess
}) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    whatsappNumber: '',
    message: ''
  });
  const [countryCode, setCountryCode] = useState('+63');
  const [consent, setConsent] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  // Auto-detect country code based on user's location
  useEffect(() => {
    const detectCountry = async () => {
      try {
        const cachedCountryCode = sessionStorage.getItem('detectedCountryCode');
        if (cachedCountryCode) {
          setCountryCode(cachedCountryCode);
          return;
        }

        const response = await axios.get('https://ipapi.co/json/');
        const detectedCode = response.data.country_calling_code;
        if (detectedCode) {
          setCountryCode(detectedCode);
          sessionStorage.setItem('detectedCountryCode', detectedCode);
        }
      } catch (error) {
        console.error('Error detecting country:', error);
        setCountryCode('+63');
      }
    };

    if (isOpen) {
      detectCountry();
      setIsVisible(true);
    } else {
      setIsVisible(false);
    }
  }, [isOpen]);

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validateWhatsAppNumber = (number: string): boolean => {
    const numberRegex = /^\d+$/;
    return numberRegex.test(number) && number.length >= 7 && number.length <= 15;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    setIsSubmitting(true);

    // Validation
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!validateEmail(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!formData.whatsappNumber.trim()) {
      newErrors.whatsappNumber = 'WhatsApp number is required';
    } else if (!validateWhatsAppNumber(formData.whatsappNumber)) {
      newErrors.whatsappNumber = 'WhatsApp number must contain only numbers (7-15 digits)';
    }

    if (!consent) {
      newErrors.consent = 'Please consent to data storage before submitting';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      setIsSubmitting(false);
      return;
    }

    // Prepare property list for email
    const propertyList = properties.map(property => 
      `• ${property.title} - €${property.price.toLocaleString()} - ${window.location.origin}/${property.slug}`
    ).join('\n');

    // Send email using EmailJS
    emailjs.send(
      'service_1xtbqqn',
      'template_o9isvah',
      {
        name: formData.name,
        user_email: formData.email,
        whatsapp: `${countryCode}${formData.whatsappNumber}`,
        message: formData.message || 'I am interested in the following properties from my favorites list.',
        property_list: propertyList,
        property_count: properties.length,
        consent: consent ? 'Yes' : 'No',
        page_url: window.location.href,
      },
      '_Wp4_GrJEdcPE3eWF'
    )
    .then(() => {
      setShowSuccessModal(true);
      // Reset form after successful submission
      setFormData({
        name: '',
        email: '',
        whatsappNumber: '',
        message: ''
      });
      setConsent(false);
      setErrors({});
    })
    .catch((error) => {
      alert('Error sending message. Please try again.');
      console.error('EmailJS error:', error);
    })
    .finally(() => {
      setIsSubmitting(false);
    });
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    
    // Special handling for WhatsApp number - only allow digits
    if (name === 'whatsappNumber') {
      const numbersOnly = value.replace(/\D/g, '');
      setFormData(prev => ({
        ...prev,
        [name]: numbersOnly
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleSuccessModalClose = () => {
    setShowSuccessModal(false);
    onClose();
    onSuccess();
  };

  if (!isOpen) return null;

  const modalRoot = document.getElementById('modal-root');
  if (!modalRoot) return null;

  return ReactDOM.createPortal(
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div 
        className={`fixed inset-0 bg-black transition-opacity duration-300 ${
          isVisible ? 'bg-opacity-50' : 'bg-opacity-0'
        }`}
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="flex min-h-full items-center justify-center p-4">
        <div 
          className={`relative bg-white rounded-2xl shadow-2xl max-w-2xl w-full mx-auto transform transition-all duration-300 ${
            isVisible 
              ? 'scale-100 opacity-100 translate-y-0' 
              : 'scale-95 opacity-0 translate-y-4'
          }`}
        >
          {/* Header */}
          <div className="relative bg-gradient-to-r from-amber-500 to-amber-600 text-white p-6 rounded-t-2xl">
            <button
              onClick={onClose}
              className="absolute top-4 right-4 text-white hover:text-gray-200 transition-colors duration-200 z-10"
            >
              <X className="w-6 h-6" />
            </button>
            
            <div className="flex items-center gap-3 mb-2">
              <div className="bg-white/20 p-3 rounded-xl">
                <Mail className="w-8 h-8" />
              </div>
              <div>
                <h2 className="text-2xl font-bold">Send to Agent</h2>
                <p className="text-amber-100">Share your favorite properties with our team</p>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="p-6">
            {/* Properties Summary */}
            <div className="bg-amber-50 rounded-xl p-4 mb-6">
              <div className="flex items-center gap-2 mb-3">
                <Heart className="w-5 h-5 text-red-500 fill-red-500" />
                <h3 className="font-semibold text-gray-900">
                  {properties.length} Favorite {properties.length === 1 ? 'Property' : 'Properties'}
                </h3>
              </div>
              <div className="space-y-2 max-h-32 overflow-y-auto">
                {properties.map((property, index) => (
                  <div key={property.id} className="flex items-center justify-between text-sm">
                    <span className="text-gray-700 truncate flex-1 mr-2">{property.title}</span>
                    <span className="font-medium text-amber-600">€{property.price.toLocaleString()}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Full Name *
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 ${
                      errors.name ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="Enter your full name"
                    required
                  />
                </div>
                {errors.name && (
                  <p className="mt-1 text-sm text-red-600">{errors.name}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email Address *
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 ${
                      errors.email ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="Enter your email address"
                    required
                  />
                </div>
                {errors.email && (
                  <p className="mt-1 text-sm text-red-600">{errors.email}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  WhatsApp Number *
                </label>
                <div className="flex">
                  <select
                    value={countryCode}
                    onChange={(e) => setCountryCode(e.target.value)}
                    className="w-32 px-3 py-3 border border-gray-300 rounded-l-lg focus:outline-none focus:ring-2 focus:ring-amber-500 text-sm"
                  >
                    {countryCodesList.map((option, index) => (
                      <option key={`${option.code}-${index}`} value={option.code}>
                        {option.flag} {option.code}
                      </option>
                    ))}
                  </select>
                  <div className="relative flex-1">
                    <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="tel"
                      name="whatsappNumber"
                      value={formData.whatsappNumber}
                      onChange={handleChange}
                      required
                      placeholder="Enter numbers only"
                      className={`w-full pl-10 pr-4 py-3 border border-l-0 rounded-r-lg focus:outline-none focus:ring-2 focus:ring-amber-500 ${
                        errors.whatsappNumber ? 'border-red-500' : 'border-gray-300'
                      }`}
                    />
                  </div>
                </div>
                {errors.whatsappNumber && (
                  <p className="mt-1 text-sm text-red-600">{errors.whatsappNumber}</p>
                )}
                <p className="mt-1 text-xs text-gray-500">
                  Enter only numbers (7-15 digits)
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Additional Message (Optional)
                </label>
                <textarea
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  rows={3}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                  placeholder="Any specific questions or requirements..."
                />
              </div>

              <div className="flex items-start gap-3">
                <input
                  type="checkbox"
                  id="consent"
                  checked={consent}
                  onChange={(e) => setConsent(e.target.checked)}
                  className="mt-1 rounded border-gray-300 text-amber-600 focus:ring-amber-500"
                />
                <label htmlFor="consent" className="text-sm text-gray-600">
                  I consent to have this website store my submitted information so they can respond to my inquiry
                </label>
              </div>
              {errors.consent && (
                <p className="text-sm text-red-600">{errors.consent}</p>
              )}

              <div className="flex gap-3 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={onClose}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white font-medium flex items-center justify-center gap-2"
                >
                  {isSubmitting ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                      Sending...
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      Send to Agent
                    </>
                  )}
                </Button>
              </div>
            </form>
          </div>
        </div>
      </div>

      {/* Success Modal */}
      <SuccessModal
        isOpen={showSuccessModal}
        onClose={handleSuccessModalClose}
        title="Properties Sent Successfully! 🎉"
        message="Thank you! We've received your favorite properties and will get back to you within 24 hours with detailed information and assistance."
      />
    </div>,
    modalRoot
  );
};

export default SendToAgentFormModal;