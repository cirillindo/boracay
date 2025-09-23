import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Cookie, X, Check, Settings } from 'lucide-react';

const CookieConsent: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [preferences, setPreferences] = useState({
    necessary: true, // Always true, can't be disabled
    analytics: true,
    marketing: true,
    functional: true
  });

  useEffect(() => {
    // Check if user has already made a choice
    const cookieConsent = localStorage.getItem('cookieConsent');
    if (!cookieConsent) {
      // Show banner after a short delay for better UX
      const timer = setTimeout(() => {
        setIsVisible(true);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleAcceptAll = () => {
    localStorage.setItem('cookieConsent', JSON.stringify({
      accepted: true,
      preferences: {
        necessary: true,
        analytics: true,
        marketing: true,
        functional: true
      },
      timestamp: new Date().toISOString()
    }));
    setIsVisible(false);
  };

  const handleDeclineAll = () => {
    localStorage.setItem('cookieConsent', JSON.stringify({
      accepted: false,
      preferences: {
        necessary: true, // Necessary cookies can't be declined
        analytics: false,
        marketing: false,
        functional: false
      },
      timestamp: new Date().toISOString()
    }));
    setIsVisible(false);
  };

  const handleSavePreferences = () => {
    localStorage.setItem('cookieConsent', JSON.stringify({
      accepted: true,
      preferences,
      timestamp: new Date().toISOString()
    }));
    setIsVisible(false);
  };

  const handlePreferenceChange = (type: keyof typeof preferences) => {
    if (type === 'necessary') return; // Can't change necessary cookies
    setPreferences(prev => ({
      ...prev,
      [type]: !prev[type]
    }));
  };

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-end justify-center p-4 pointer-events-none">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/20 backdrop-blur-sm pointer-events-auto" />
      
      {/* Cookie Banner */}
      <div 
        className="relative bg-white rounded-xl shadow-2xl max-w-2xl w-full pointer-events-auto transform transition-all duration-500 ease-out"
        style={{
          animation: 'slideUp 0.5s ease-out forwards'
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-amber-100 rounded-lg">
              <Cookie className="w-6 h-6 text-amber-600" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-900">Cookie Preferences</h3>
              <p className="text-sm text-gray-600">We value your privacy</p>
            </div>
          </div>
          <button
            onClick={() => setIsVisible(false)}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          <p className="text-gray-700 mb-4 leading-relaxed">
            We use cookies to enhance your browsing experience, serve personalized content, and analyze our traffic. 
            By clicking "Accept All", you consent to our use of cookies.
          </p>

          {showDetails && (
            <div className="space-y-4 mb-6 p-4 bg-gray-50 rounded-lg">
              <h4 className="font-semibold text-gray-900 mb-3">Cookie Categories</h4>
              
              {/* Necessary Cookies */}
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <h5 className="font-medium text-gray-900">Necessary</h5>
                  <p className="text-sm text-gray-600">Essential for the website to function properly</p>
                </div>
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    checked={preferences.necessary}
                    disabled
                    className="rounded border-gray-300 text-amber-600 focus:ring-amber-500 opacity-50"
                  />
                  <span className="ml-2 text-xs text-gray-500">Always On</span>
                </div>
              </div>

              {/* Analytics Cookies */}
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <h5 className="font-medium text-gray-900">Analytics</h5>
                  <p className="text-sm text-gray-600">Help us understand how visitors interact with our website</p>
                </div>
                <input
                  type="checkbox"
                  checked={preferences.analytics}
                  onChange={() => handlePreferenceChange('analytics')}
                  className="rounded border-gray-300 text-amber-600 focus:ring-amber-500"
                />
              </div>

              {/* Marketing Cookies */}
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <h5 className="font-medium text-gray-900">Marketing</h5>
                  <p className="text-sm text-gray-600">Used to deliver relevant advertisements and track ad performance</p>
                </div>
                <input
                  type="checkbox"
                  checked={preferences.marketing}
                  onChange={() => handlePreferenceChange('marketing')}
                  className="rounded border-gray-300 text-amber-600 focus:ring-amber-500"
                />
              </div>

              {/* Functional Cookies */}
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <h5 className="font-medium text-gray-900">Functional</h5>
                  <p className="text-sm text-gray-600">Enable enhanced functionality and personalization</p>
                </div>
                <input
                  type="checkbox"
                  checked={preferences.functional}
                  onChange={() => handlePreferenceChange('functional')}
                  className="rounded border-gray-300 text-amber-600 focus:ring-amber-500"
                />
              </div>
            </div>
          )}

          {/* Privacy Policy Link */}
          <p className="text-sm text-gray-600 mb-6">
            For more information about how we handle your data, please read our{' '}
            <Link 
              to="/privacy-policy" 
              className="text-amber-600 hover:text-amber-700 underline font-medium"
              onClick={() => setIsVisible(false)}
            >
              Privacy Policy
            </Link>
            .
          </p>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={handleAcceptAll}
              className="flex-1 bg-amber-600 hover:bg-amber-700 text-white px-6 py-3 rounded-lg font-medium transition-colors duration-200 flex items-center justify-center gap-2"
            >
              <Check className="w-4 h-4" />
              Accept All
            </button>
            
            <button
              onClick={() => setShowDetails(!showDetails)}
              className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 px-6 py-3 rounded-lg font-medium transition-colors duration-200 flex items-center justify-center gap-2"
            >
              <Settings className="w-4 h-4" />
              {showDetails ? 'Hide Details' : 'Customize'}
            </button>
            
            {showDetails && (
              <button
                onClick={handleSavePreferences}
                className="flex-1 bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-medium transition-colors duration-200"
              >
                Save Preferences
              </button>
            )}
            
            <button
              onClick={handleDeclineAll}
              className="flex-1 bg-gray-600 hover:bg-gray-700 text-white px-6 py-3 rounded-lg font-medium transition-colors duration-200"
            >
              Decline All
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CookieConsent;