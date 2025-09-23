import React, { useState, useEffect } from 'react';
import axios from 'axios';
import emailjs from '@emailjs/browser';
import Button from '../ui/Button';
import SuccessModal from '../ui/SuccessModal';
import { countryCodesList } from '../../utils/countryCodes';

interface InquireNowFormProps {
  propertyTitle?: string;
  propertyId?: string;
  defaultSubject?: string;
  className?: string;
}

const InquireNowForm: React.FC<InquireNowFormProps> = ({
  propertyTitle,
  propertyId,
  defaultSubject = '',
  className = ''
}) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    whatsappNumber: '',
    subject: defaultSubject,
    message: ''
  });
  const [countryCode, setCountryCode] = useState('+63');
  const [consent, setConsent] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

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
        // Handle rate limiting (429) and other errors gracefully
        if (axios.isAxiosError(error) && error.response?.status === 429) {
          console.warn('Country detection service rate limited. Using default country code.');
        } else {
          console.debug('Country detection unavailable:', error instanceof Error ? error.message : 'Unknown error');
        }
        // Always fall back to default Philippines country code
        setCountryCode('+63');
      }
    };

    detectCountry();
  }, []);

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

    if (!formData.subject) {
      newErrors.subject = 'Please select a subject';
    }

    if (!formData.message.trim()) {
      newErrors.message = 'Message is required';
    }

    if (!consent) {
      newErrors.consent = 'Please consent to data storage before submitting';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      setIsSubmitting(false);
      return;
    }

    // Send email using EmailJS - use the same template for both cases
    const templateId = 'template_9kmv7ie';
    
    emailjs.send(
      'service_1xtbqqn',
      templateId,
      {
        name: formData.name,
        user_email: formData.email,
        whatsapp: `${countryCode}${formData.whatsappNumber}`,
        subject: formData.subject,
        message: formData.message,
        consent: consent ? 'Yes' : 'No',
        page_url: window.location.href,
        property_title: propertyTitle || '',
        property_id: propertyId || '',
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
        subject: defaultSubject,
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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
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

  const getWhatsAppMessage = () => {
    const propertyInfo = propertyTitle ? `\nProperty: ${propertyTitle}\nID: ${propertyId}` : '';
    const formDataText = `\nName: ${formData.name}\nEmail: ${formData.email}\nPhone: ${countryCode}${formData.whatsappNumber}\nSubject: ${formData.subject}\nMessage: ${formData.message}`;
    const fullMessage = `Hello! I'm interested in your services:${propertyInfo}\n\nMy details:${formDataText}`;
    
    return encodeURIComponent(fullMessage);
  };

  return (
    <>
      <div className={`bg-white rounded-xl shadow-lg p-6 ${className}`}>
        <div className="relative inline-block mb-6">
          <h3 className="text-2xl font-bold">INQUIRE NOW</h3>
          <div className="absolute -bottom-0.5 left-0 h-0.5 bg-amber-600 w-full" />
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <input
              type="text"
              name="name"
              placeholder="Your Name"
              value={formData.name}
              onChange={handleChange}
              required
              className={`w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500 ${
                errors.name ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            {errors.name && (
              <p className="mt-1 text-sm text-red-600">{errors.name}</p>
            )}
          </div>

          <div>
            <input
              type="email"
              name="email"
              placeholder="Email Address"
              value={formData.email}
              onChange={handleChange}
              required
              className={`w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500 ${
                errors.email ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            {errors.email && (
              <p className="mt-1 text-sm text-red-600">{errors.email}</p>
            )}
          </div>

          <div>
            <div className="flex w-full">
              <select
                value={countryCode}
                onChange={(e) => setCountryCode(e.target.value)}
                className="w-20 px-2 py-2 border border-gray-300 rounded-l-md focus:outline-none focus:ring-2 focus:ring-amber-500 text-xs"
              >
                {countryCodesList.map((option, index) => (
                  <option key={`${option.code}-${index}`} value={option.code}>
                    {option.flag} {option.code}
                  </option>
                ))}
              </select>
              <input
                type="tel"
                name="whatsappNumber"
                placeholder="WhatsApp Number"
                value={formData.whatsappNumber}
                onChange={handleChange}
                required
                className={`flex-1 px-4 py-2 border border-l-0 rounded-r-md focus:outline-none focus:ring-2 focus:ring-amber-500 ${
                  errors.whatsappNumber ? 'border-red-500' : 'border-gray-300'
                }`}
              />
            </div>
            {errors.whatsappNumber && (
              <p className="mt-1 text-sm text-red-600">{errors.whatsappNumber}</p>
            )}
            <p className="mt-1 text-xs text-gray-500">
              Enter only numbers (7-15 digits)
            </p>
          </div>

          <div>
            <select
              name="subject"
              value={formData.subject}
              onChange={handleChange}
              required
              className={`w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500 ${
                errors.subject ? 'border-red-500' : 'border-gray-300'
              }`}
            >
              <option value="">Select Subject</option>
              <option value="buy">Looking to buy</option>
              <option value="rent">Looking to rent</option>
              <option value="property-management">Looking for property management</option>
              <option value="add-listing">I want to add my listing</option>
              <option value="vacation-rental-management">Vacation Rental Management</option>
              <option value="other">Other</option>
            </select>
            {errors.subject && (
              <p className="mt-1 text-sm text-red-600">{errors.subject}</p>
            )}
          </div>

          <div>
            <textarea
              name="message"
              placeholder="Your Message"
              value={formData.message}
              onChange={handleChange}
              required
              rows={4}
              className={`w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500 ${
                errors.message ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            {errors.message && (
              <p className="mt-1 text-sm text-red-600">{errors.message}</p>
            )}
          </div>

          <div className="flex items-start gap-2">
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
          
          <div className="flex items-center gap-2">
            <Button type="submit" className="flex-1" disabled={isSubmitting}>
              {isSubmitting ? 'SENDING...' : 'INQUIRE NOW'}
            </Button>
            <a
              href={`https://wa.me/${countryCode.replace('+', '')}${formData.whatsappNumber}?text=${getWhatsAppMessage()}`}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-green-500 hover:bg-green-600 text-white px-6 py-3 rounded-md flex items-center gap-2 transition-colors"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="currentColor"
                className="w-5 h-5"
              >
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
              </svg>
              WhatsApp
            </a>
          </div>
        </form>
      </div>

      {/* Success Modal */}
      <SuccessModal
        isOpen={showSuccessModal}
        onClose={() => setShowSuccessModal(false)}
        title="Message Sent Successfully! 🎉"
        message="Thank you for reaching out! We've received your message and will get back to you within 24 hours. We're excited to help you with your Boracay property needs!"
      />
    </>
  );
};

export default InquireNowForm;