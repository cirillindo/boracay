import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom';
import { useNavigate } from 'react-router-dom';
import { X, CreditCard, Upload, Check, AlertCircle, Copy, ExternalLink, Info, Globe, Wallet, Banknote, RefreshCw } from 'lucide-react';
import Button from '../ui/Button';
import { supabase } from '../../lib/supabase';
import { uploadImage } from '../../lib/cloudinary';
import { useDropzone } from 'react-dropzone';
import { countryCodesList } from '../../utils/countryCodes';
import { currencies, formatCurrency, convertCurrency } from '../../utils/currency';
import axios from 'axios';
import { useShoppingCart } from '../../context/ShoppingCartContext';

interface PaymentSelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  orderId?: string | null;
  service: {
    title: string;
    price: string;
    priceUSD: string;
    currency?: string;
  };
  totalAmount: number;
  baseAmount?: number;
  processingFee?: number;
  selectedAddons: string[];
  customerName?: string;
  customerEmail?: string;
  customerWhatsapp?: string;
  initialView?: 'payment_methods' | 'upload_slip';
  paymentMethod?: string;
  shouldClearCart?: boolean;
  cartItems?: any[];
}

const PaymentSelectionModal: React.FC<PaymentSelectionModalProps> = ({
  isOpen,
  onClose,
  orderId,
  service,
  totalAmount,
  baseAmount,
  processingFee = 0,
  selectedAddons,
  customerName: initialCustomerName = '',
  customerEmail: initialCustomerEmail = '',
  customerWhatsapp: initialCustomerWhatsapp = '',
  initialView = 'payment_methods',
  paymentMethod,
  shouldClearCart = false,
  cartItems = []
}) => {
  const navigate = useNavigate();
  const { clearCart } = useShoppingCart();
  const [activeTab, setActiveTab] = useState<'stripe' | 'paypal' | 'gcash' | 'rubles' | 'revolut'>('stripe');
  const [currentView, setCurrentView] = useState<'payment_methods' | 'upload_slip'>(initialView);
  const [isVisible, setIsVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [uploadedSlipUrl, setUploadedSlipUrl] = useState<string>('');
  const [isUploading, setIsUploading] = useState(false);
  const [customerName, setCustomerName] = useState(initialCustomerName);
  const [customerEmail, setCustomerEmail] = useState(initialCustomerEmail);
  const [customerWhatsapp, setCustomerWhatsapp] = useState(initialCustomerWhatsapp);
  const [countryCode, setCountryCode] = useState('+63');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [copySuccess, setCopySuccess] = useState<{
    paypal: boolean;
    gcash: boolean;
    rubles: boolean;
    revolut: boolean;
  }>({ paypal: false, gcash: false, rubles: false, revolut: false });

  useEffect(() => {
    if (isOpen) {
      setIsVisible(true);
      if (paymentMethod) {
        setActiveTab(paymentMethod as any);
      }
      detectCountry();
    } else {
      setIsVisible(false);
    }
  }, [isOpen, paymentMethod]);

  // Auto-detect country code based on user's location
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
      console.debug('Country detection unavailable:', error);
      setCountryCode('+63');
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!customerName.trim()) {
      newErrors.customerName = 'Name is required';
    }

    if (!customerEmail.trim()) {
      newErrors.customerEmail = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(customerEmail)) {
      newErrors.customerEmail = 'Please enter a valid email address';
    }

    if (!customerWhatsapp.trim()) {
      newErrors.customerWhatsapp = 'WhatsApp number is required';
    } else if (!/^\d{7,15}$/.test(customerWhatsapp)) {
      newErrors.customerWhatsapp = 'WhatsApp number must be 7-15 digits';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleStripePayment = async () => {
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);

    try {
      // Create order record first if not provided
      let currentOrderId = orderId;
      
      if (!currentOrderId) {
        const { data: { user } } = await supabase.auth.getUser();
        
        const { data: orderData, error: orderError } = await supabase
          .from('orders')
          .insert({
            user_id: user?.id || null,
            total_amount_php: totalAmount,
            currency: service.currency || 'EUR',
            description: service.title,
            customer_name: customerName.trim(),
            customer_email: customerEmail.trim(),
            customer_whatsapp: `${countryCode}${customerWhatsapp.trim()}`,
            status: 'pending',
            payment_method: 'stripe',
          })
          .select()
          .single();
        
        if (orderError) throw orderError;
        currentOrderId = orderData.id;
      } else {
        // Update existing order with payment method
        const { error: updateError } = await supabase
          .from('orders')
          .update({ payment_method: 'stripe' })
          .eq('id', currentOrderId);
        
        if (updateError) throw updateError;
      }

      // Add 5% surcharge for credit card payments
      const surchargedAmount = totalAmount + (totalAmount * 0.05);
      
      // Convert to cents for Stripe
      const stripeAmount = Math.round(surchargedAmount * 100);
      
      // Call the Supabase Edge Function to create a payment intent
      const { data, error } = await supabase.functions.invoke('create-payment-intent', {
        body: {
          amount: stripeAmount,
          currency: (service.currency || 'EUR').toLowerCase(),
          description: service.title,
          orderId: currentOrderId,
          email: customerEmail || undefined,
          name: customerName || undefined
        }
      });

      if (error) {
        throw new Error(`Payment service error: ${error.message}`);
      }

      if (!data || data.error) {
        throw new Error(data?.error || 'Payment service unavailable');
      }

      // Redirect to Stripe Checkout
      window.location.href = data.url;
      
      // Clear cart if needed (this will happen when user returns from Stripe)
      if (shouldClearCart) {
        clearCart();
      }
      
      // Reset form data
      setCustomerName('');
      setCustomerEmail('');
      setCustomerWhatsapp('');
    } catch (error) {
      console.error('Error creating payment:', error);
      setErrorMessage(error instanceof Error ? error.message : 'Payment failed');
    } finally {
      setIsLoading(false);
    }
  };

  const handleManualPaymentInitiation = async () => {
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);

    try {
      // Create order record if not provided
      let currentOrderId = orderId;
      
      if (!currentOrderId) {
        const { data: { user } } = await supabase.auth.getUser();
        
        const finalAmount = activeTab === 'paypal' ? totalAmount + (totalAmount * 0.05) : totalAmount;
        
        const { data: orderData, error: orderError } = await supabase
          .from('orders')
          .insert({
            user_id: user?.id || null,
            total_amount_php: finalAmount,
            currency: service.currency || 'EUR',
            description: service.title,
            customer_name: customerName.trim(),
            customer_email: customerEmail.trim(),
            customer_whatsapp: `${countryCode}${customerWhatsapp.trim()}`,
            status: 'pending_manual_review',
            payment_method: activeTab,
          })
          .select()
          .single();
        
        if (orderError) throw orderError;
        currentOrderId = orderData.id;
      } else {
        // Update existing order with payment method and final amount
        const finalAmount = activeTab === 'paypal' ? totalAmount + (totalAmount * 0.05) : totalAmount;
        
        const { error: updateError } = await supabase
          .from('orders')
          .update({ 
            payment_method: activeTab,
            total_amount_php: finalAmount,
            status: 'pending_manual_review'
          })
          .eq('id', currentOrderId);
        
        if (updateError) throw updateError;
      }
      
      // Switch to upload slip view
      setCurrentView('upload_slip');
    } catch (error) {
      console.error('Error creating order:', error);
      setErrorMessage('Failed to create order. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const onDrop = async (acceptedFiles: File[]) => {
    if (acceptedFiles.length === 0) return;
    
    setIsUploading(true);
    setErrorMessage(null);
    
    try {
      const uploadedUrl = await uploadImage(acceptedFiles[0]);
      setUploadedSlipUrl(uploadedUrl);
    } catch (err) {
      setErrorMessage('Error uploading image. Please try again.');
      console.error(err);
    } finally {
      setIsUploading(false);
    }
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.webp']
    },
    multiple: false
  });

  const handleSubmitPaymentSlip = async () => {
    if (!uploadedSlipUrl) {
      setErrorMessage('Please upload a payment slip first.');
      return;
    }

    if (!validateForm()) {
      return;
    }
    setIsLoading(true);
    setErrorMessage(null);

    try {
      // Create order record first if not provided
      let currentOrderId = orderId;
      
      if (!currentOrderId) {
        const { data: { user } } = await supabase.auth.getUser();
        
        const { data: orderData, error: orderError } = await supabase
          .from('orders')
          .insert({
            user_id: user?.id || null,
            total_amount_php: totalAmount,
            currency: service.currency || 'EUR',
            description: service.title,
            customer_name: customerName.trim(),
            customer_email: customerEmail.trim(),
            customer_whatsapp: `${countryCode}${customerWhatsapp.trim()}`,
            status: 'pending_manual_review',
            payment_method: activeTab,
          })
          .select()
          .single();
        
        if (orderError) throw orderError;
        currentOrderId = orderData.id;
        
        // Create order items for cart items
        if (cartItems && cartItems.length > 0) {
          const orderItems = cartItems.map(item => ({
            order_id: currentOrderId,
            item_id: item.id,
            item_type: item.type || 'activity',
            item_name: item.name,
            quantity: item.quantity,
            price_at_purchase_php: item.price,
            selected_date: item.selectedDate ? new Date(item.selectedDate).toISOString().split('T')[0] : null
          }));
          
          const { error: itemsError } = await supabase
            .from('order_items')
            .insert(orderItems);
          
          if (itemsError) throw itemsError;
        }
        
        // Send confirmation emails
        try {
          await fetch('/.netlify/functions/send-order-email', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              orderId: currentOrderId,
              customerName: customerName.trim(),
              customerEmail: customerEmail.trim(),
              customerWhatsapp: `${countryCode}${customerWhatsapp.trim()}`,
              cartItems: cartItems && cartItems.length > 0 ? cartItems : [],
              totalPrice: totalAmount,
            }),
          });
        } catch (emailError) {
          console.error('Email sending failed:', emailError);
          // Don't throw - we don't want to block the order process if emails fail
        }
      }

      // Update the order with the payment slip URL and ensure payment method is set
      const { error } = await supabase
        .from('orders')
        .update({
          payment_slip_url: uploadedSlipUrl,
          status: 'pending_manual_review',
          payment_method: activeTab
        })
        .eq('id', currentOrderId);

      if (error) throw error;

      // Clear cart if needed
      if (shouldClearCart) {
        clearCart();
      }
      
      // Reset form data
      setCustomerName('');
      setCustomerEmail('');
      setCustomerWhatsapp('');
      setUploadedSlipUrl('');
      
      // Navigate to success page
      setTimeout(() => {
        navigate('/payment-success');
      }, 500);
    } catch (error) {
      console.error('Error submitting payment slip:', error);
      setErrorMessage('Failed to submit payment slip. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopyToClipboard = async (text: string, type: 'paypal' | 'gcash' | 'rubles' | 'revolut') => {
    try {
      await navigator.clipboard.writeText(text);
      setCopySuccess(prev => ({ ...prev, [type]: true }));
      setTimeout(() => {
        setCopySuccess(prev => ({ ...prev, [type]: false }));
      }, 2000);
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
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
          className={`relative bg-white rounded-2xl shadow-2xl max-w-4xl w-full mx-auto transform transition-all duration-300 ${
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
                <CreditCard className="w-8 h-8" />
              </div>
              <div>
                <h2 className="text-2xl font-bold">Complete Your Payment</h2>
                <p className="text-amber-100">Choose your preferred payment method</p>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="p-6">
            {currentView === 'payment_methods' ? (
              <>
                {/* Service Summary */}
                <div className="bg-amber-50 rounded-xl p-4 mb-6">
                  <h3 className="font-semibold text-gray-900 mb-2">{service.title}</h3>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Total Amount:</span>
                    <span className="font-bold text-amber-600 text-lg">{service.price}</span>
                  </div>
                  {selectedAddons.length > 0 && (
                    <div className="mt-2">
                      <p className="text-sm text-gray-600">Includes: {selectedAddons.join(', ')}</p>
                    </div>
                  )}
                </div>

                {/* Customer Information Form */}
                <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Your Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Full Name *
                      </label>
                      <input
                        type="text"
                        value={customerName}
                        onChange={(e) => setCustomerName(e.target.value)}
                        className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500 ${
                          errors.customerName ? 'border-red-500' : 'border-gray-300'
                        }`}
                        placeholder="Enter your full name"
                      />
                      {errors.customerName && (
                        <p className="mt-1 text-sm text-red-600">{errors.customerName}</p>
                      )}
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Email Address *
                      </label>
                      <input
                        type="email"
                        value={customerEmail}
                        onChange={(e) => setCustomerEmail(e.target.value)}
                        className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500 ${
                          errors.customerEmail ? 'border-red-500' : 'border-gray-300'
                        }`}
                        placeholder="Enter your email"
                      />
                      {errors.customerEmail && (
                        <p className="mt-1 text-sm text-red-600">{errors.customerEmail}</p>
                      )}
                    </div>
                    
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        WhatsApp Number *
                      </label>
                      <div className="flex">
                        <select
                          value={countryCode}
                          onChange={(e) => setCountryCode(e.target.value)}
                          className="w-32 px-3 py-2 border border-gray-300 rounded-l-md focus:outline-none focus:ring-2 focus:ring-amber-500 text-sm"
                        >
                          {countryCodesList.map((option, index) => (
                            <option key={`${option.code}-${index}`} value={option.code}>
                              {option.flag} {option.code}
                            </option>
                          ))}
                        </select>
                        <input
                          type="tel"
                          value={customerWhatsapp}
                          onChange={(e) => setCustomerWhatsapp(e.target.value.replace(/\D/g, ''))}
                          className={`flex-1 px-3 py-2 border border-l-0 rounded-r-md focus:outline-none focus:ring-2 focus:ring-amber-500 ${
                            errors.customerWhatsapp ? 'border-red-500' : 'border-gray-300'
                          }`}
                          placeholder="Enter numbers only (7-15 digits)"
                        />
                      </div>
                      {errors.customerWhatsapp && (
                        <p className="mt-1 text-sm text-red-600">{errors.customerWhatsapp}</p>
                      )}
                      <p className="mt-1 text-xs text-gray-500">
                        Enter only numbers (7-15 digits)
                      </p>
                    </div>
                  </div>
                </div>

                {/* Payment Method Tabs */}
                <div className="grid grid-cols-2 md:grid-cols-5 gap-2 mb-6">
                  <button
                    onClick={() => setActiveTab('stripe')}
                    className={`py-6 px-4 text-lg font-bold transition-all duration-300 rounded-lg border-2 flex flex-col items-center gap-2 ${
                      activeTab === 'stripe'
                        ? 'bg-amber-500 text-white border-amber-500 shadow-lg transform scale-105'
                        : 'bg-white text-gray-700 border-gray-300 hover:border-amber-400 hover:bg-amber-50 hover:text-amber-700'
                    }`}
                  >
                    <CreditCard className="w-8 h-8" />
                    <span className="text-sm font-semibold">Credit Card</span>
                  </button>
                  <button
                    onClick={() => setActiveTab('paypal')}
                    className={`py-6 px-4 text-lg font-bold transition-all duration-300 rounded-lg border-2 flex flex-col items-center gap-2 ${
                      activeTab === 'paypal'
                        ? 'bg-amber-500 text-white border-amber-500 shadow-lg transform scale-105'
                        : 'bg-white text-gray-700 border-gray-300 hover:border-amber-400 hover:bg-amber-50 hover:text-amber-700'
                    }`}
                  >
                    <Globe className="w-8 h-8" />
                    <span className="text-sm font-semibold">PayPal</span>
                  </button>
                  <button
                    onClick={() => setActiveTab('gcash')}
                    className={`py-6 px-4 text-lg font-bold transition-all duration-300 rounded-lg border-2 flex flex-col items-center gap-2 ${
                      activeTab === 'gcash'
                        ? 'bg-amber-500 text-white border-amber-500 shadow-lg transform scale-105'
                        : 'bg-white text-gray-700 border-gray-300 hover:border-amber-400 hover:bg-amber-50 hover:text-amber-700'
                    }`}
                  >
                    <Wallet className="w-8 h-8" />
                    <span className="text-sm font-semibold">GCash</span>
                  </button>
                  <button
                    onClick={() => setActiveTab('rubles')}
                    className={`py-6 px-4 text-lg font-bold transition-all duration-300 rounded-lg border-2 flex flex-col items-center gap-2 ${
                      activeTab === 'rubles'
                        ? 'bg-amber-500 text-white border-amber-500 shadow-lg transform scale-105'
                        : 'bg-white text-gray-700 border-gray-300 hover:border-amber-400 hover:bg-amber-50 hover:text-amber-700'
                    }`}
                  >
                    <Banknote className="w-8 h-8" />
                    <span className="text-sm font-semibold">Рубли</span>
                  </button>
                  <button
                    onClick={() => setActiveTab('revolut')}
                    className={`py-6 px-4 text-lg font-bold transition-all duration-300 rounded-lg border-2 flex flex-col items-center gap-2 ${
                      activeTab === 'revolut'
                        ? 'bg-amber-500 text-white border-amber-500 shadow-lg transform scale-105'
                        : 'bg-white text-gray-700 border-gray-300 hover:border-amber-400 hover:bg-amber-50 hover:text-amber-700'
                    }`}
                  >
                    <RefreshCw className="w-8 h-8" />
                    <span className="text-sm font-semibold">Revolut</span>
                  </button>
                </div>

                {/* Payment Method Content */}
                {/* Stripe Payment */}
                {activeTab === 'stripe' && (
                  <div className="space-y-6">
                    <div className="bg-blue-50 p-4 rounded-lg">
                      <h3 className="text-lg font-medium text-blue-800 mb-2">Pay with Credit Card</h3>
                      <p className="text-blue-700 text-sm mb-4">
                        Secure payment processing via Stripe. Your card details are never stored on our servers.
                      </p>
                      <div className="flex items-start gap-2 bg-amber-50 p-3 rounded-lg border border-amber-200">
                        <Info className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                        <div>
                          <p className="text-amber-800 font-medium">5% processing fee applies</p>
                          <p className="text-amber-700 text-sm">
                            A 5% processing fee will be added to your payment amount.
                          </p>
                          <div className="mt-2 text-sm">
                            <div className="flex justify-between">
                              <span>Original amount:</span>
                              <span>{service.price}</span>
                            </div>
                            <div className="flex justify-between">
                              <span>Processing fee (5%):</span>
                              <span>{formatCurrency(totalAmount * 0.05, service.currency || 'EUR')}</span>
                            </div>
                            <div className="flex justify-between font-bold mt-1 pt-1 border-t border-amber-200">
                              <span>Total to pay:</span>
                              <span>{formatCurrency(totalAmount + (totalAmount * 0.05), service.currency || 'EUR')}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    <Button
                      onClick={handleStripePayment}
                      disabled={isLoading}
                      className="w-full flex items-center justify-center gap-2"
                    >
                      {isLoading ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                          Processing...
                        </>
                      ) : (
                        <>
                          <CreditCard className="w-5 h-5" />
                          Pay {formatCurrency(totalAmount + (totalAmount * 0.05), service.currency || 'EUR')} with Card
                        </>
                      )}
                    </Button>
                  </div>
                )}

                {/* PayPal Payment */}
                {activeTab === 'paypal' && (
                  <div className="space-y-4">
                    <div className="bg-blue-50 p-3 rounded-lg">
                      <h3 className="font-medium text-blue-800 mb-2">Pay with PayPal</h3>
                      <div className="mb-4">
                        <p className="text-blue-700 text-sm mb-2">
                          Send your payment to the following PayPal account.
                        </p>
                        <div className="bg-amber-50 p-2 rounded-lg border border-amber-200">
                          <p className="text-amber-800 font-medium">5% processing fee applies</p>
                          <p className="text-amber-700 text-sm">
                            A 5% processing fee will be added to your payment amount.
                          </p>
                        </div>
                      </div>
                      
                      <div className="bg-amber-50 p-2 rounded-lg border border-amber-200 mb-3">
                        <div className="flex justify-between text-xs text-amber-800">
                          <span>Original amount:</span>
                          <span>{service.price}</span>
                        </div>
                        <div className="flex justify-between text-xs text-amber-800">
                          <span>Processing fee (5%):</span>
                          <span>{formatCurrency(totalAmount * 0.05, service.currency || 'EUR')}</span>
                        </div>
                        <div className="flex justify-between font-bold text-amber-800 mt-1 pt-1 border-t border-amber-200 text-sm">
                          <span>Total to pay:</span>
                          <span>{formatCurrency(totalAmount + (totalAmount * 0.05), service.currency || 'EUR')}</span>
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between bg-white p-2 rounded-lg border border-blue-200">
                        <span className="font-medium text-gray-800">giorgio@schwaiger.ws</span>
                        <button 
                          onClick={() => handleCopyToClipboard('giorgio@schwaiger.ws', 'paypal')}
                          className="text-blue-600 hover:text-blue-800 transition-colors"
                          aria-label="Copy PayPal email"
                        >
                          {copySuccess.paypal ? (
                            <Check className="w-5 h-5 text-green-500" />
                          ) : (
                            <Copy className="w-5 h-5" />
                          )}
                        </button>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <Button
                        onClick={() => handleCopyToClipboard('giorgio@schwaiger.ws', 'paypal')}
                        variant="outline"
                        className="flex-1 flex items-center justify-center gap-1 py-2 text-sm"
                      >
                        <Copy className="w-4 h-4" />
                        Copy Email
                      </Button>
                      
                      <a
                        href="https://www.paypal.com/signin"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-1"
                      >
                        <Button
                          className="w-full flex items-center justify-center gap-1 bg-[#0070ba] hover:bg-[#005ea6] py-2 text-sm"
                        >
                          <ExternalLink className="w-4 h-4" />
                          Go to PayPal
                        </Button>
                      </a>
                    </div>
                    
                    <Button
                      onClick={handleManualPaymentInitiation}
                      disabled={isLoading}
                      variant="outline"
                      className="w-full mt-2 py-2 text-sm"
                    >
                      {isLoading ? 'Creating Order...' : 'I\'ve Completed My Payment'}
                    </Button>
                  </div>
                )}

                {/* GCash Payment */}
                {activeTab === 'gcash' && (
                  <div className="space-y-6">
                    <div className="bg-blue-50 p-4 rounded-lg">
                      <h3 className="text-lg font-medium text-blue-800 mb-2">Pay with GCash</h3>
                      <p className="text-blue-700 text-sm mb-4">
                        Send your payment to the following GCash number. No additional fees.
                      </p>
                      
                      <div className="bg-green-50 p-3 rounded-lg border border-green-200 mb-4">
                        <div className="flex justify-between font-bold text-green-800">
                          <span>Total to pay:</span>
                          <span>{service.price}</span>
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between bg-white p-3 rounded-lg border border-blue-200">
                        <span className="font-medium text-gray-800">09615844773</span>
                        <button 
                          onClick={() => handleCopyToClipboard('09615844773', 'gcash')}
                          className="text-blue-600 hover:text-blue-800 transition-colors"
                          aria-label="Copy GCash number"
                        >
                          {copySuccess.gcash ? (
                            <Check className="w-5 h-5 text-green-500" />
                          ) : (
                            <Copy className="w-5 h-5" />
                          )}
                        </button>
                      </div>
                      
                      <div className="mt-6 flex justify-center">
                        <img 
                          src="https://res.cloudinary.com/dq3fftsfa/image/upload/v1750802182/WhatsApp_Image_2025-06-24_at_23.56.09_jubdoi.jpg" 
                          alt="GCash QR Code" 
                          className="max-w-full h-auto max-h-64 rounded-lg border border-blue-200"
                        />
                      </div>
                    </div>

                    <div className="flex gap-4">
                      <Button
                        onClick={() => handleCopyToClipboard('09615844773', 'gcash')}
                        variant="outline"
                        className="flex-1 flex items-center justify-center gap-2"
                      >
                        <Copy className="w-5 h-5" />
                        Copy Number
                      </Button>
                      
                      <a
                        href="https://www.gcash.com/"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-1"
                      >
                        <Button
                          className="w-full flex items-center justify-center gap-2 bg-[#0070ba] hover:bg-[#005ea6]"
                        >
                          <ExternalLink className="w-5 h-5" />
                          Go to GCash
                        </Button>
                      </a>
                    </div>
                    
                    <Button
                      onClick={handleManualPaymentInitiation}
                      disabled={isLoading}
                      variant="outline"
                      className="w-full mt-4"
                    >
                      {isLoading ? 'Creating Order...' : 'I\'ve Completed My Payment'}
                    </Button>
                  </div>
                )}

                {/* Rubles Payment */}
                {activeTab === 'rubles' && (
                  <div className="space-y-6">
                    <div className="bg-blue-50 p-4 rounded-lg">
                      <h3 className="text-lg font-medium text-blue-800 mb-2">Оплата в рублях</h3>
                      <p className="text-blue-700 text-sm mb-4">
                        Если у вас есть вопросы или что-то осталось непонятным, пожалуйста, напишите мне в WhatsApp.
                      </p>
                      
                      <div className="bg-green-50 p-3 rounded-lg border border-green-200 mb-4">
                        <div className="flex justify-between font-bold text-green-800">
                          <span>Сумма к оплате:</span>
                          <span>{service.price}</span>
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between bg-white p-3 rounded-lg border border-blue-200 mb-4">
                        <span className="font-medium text-gray-800">+7 909 655-66-08</span>
                        <button 
                          onClick={() => handleCopyToClipboard('+7 909 655-66-08', 'rubles')}
                          className="text-blue-600 hover:text-blue-800 transition-colors"
                          aria-label="Copy WhatsApp number"
                        >
                          {copySuccess.rubles ? (
                            <Check className="w-5 h-5 text-green-500" />
                          ) : (
                            <Copy className="w-5 h-5" />
                          )}
                        </button>
                      </div>
                      
                      <div className="space-y-4">
                        <div className="text-center">
                          <h4 className="text-base font-medium text-blue-800 mb-2">Сканируйте QR-код:</h4>
                          <img 
                            src="https://res.cloudinary.com/dq3fftsfa/image/upload/v1753434407/WhatsApp_Image_2025-07-25_at_00.14.16_sxvd70.jpg" 
                            alt="QR код для оплаты в рублях" 
                            className="max-w-full h-auto max-h-64 rounded-lg border border-blue-200 mx-auto"
                          />
                        </div>
                        
                        <div className="text-center">
                          <p className="text-blue-700 text-sm mb-2">Или нажмите на ссылку:</p>
                          <a
                            href="https://www.sberbank.com/sms/pbpn?requisiteNumber=79096556608"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors duration-300"
                          >
                            <ExternalLink className="w-4 h-4" />
                            Перейти к оплате Сбербанк
                          </a>
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-4">
                      <Button
                        onClick={() => handleCopyToClipboard('+7 909 655-66-08', 'rubles')}
                        variant="outline"
                        className="flex-1 flex items-center justify-center gap-2"
                      >
                        <Copy className="w-5 h-5" />
                        Скопировать номер
                      </Button>
                      
                      <a
                        href="https://wa.me/79096556608?text=Если%20у%20вас%20есть%20вопросы%20или%20что-то%20осталось%20непонятным%2C%20пожалуйста%2C%20напишите%20мне%20в%20WhatsApp."
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-1"
                      >
                        <Button
                          className="w-full flex items-center justify-center gap-2 bg-[#25D366] hover:bg-[#128C7E]"
                        >
                          <ExternalLink className="w-5 h-5" />
                          WhatsApp для помощи
                        </Button>
                      </a>
                    </div>
                    
                    <Button
                      onClick={handleManualPaymentInitiation}
                      disabled={isLoading}
                      variant="outline"
                      className="w-full mt-4"
                    >
                      {isLoading ? 'Создание заказа...' : 'Я завершил(а) платеж'}
                    </Button>
                  </div>
                )}

                {/* Revolut Payment */}
                {activeTab === 'revolut' && (
                  <div className="space-y-6">
                    <div className="bg-blue-50 p-4 rounded-lg">
                      <h3 className="text-lg font-medium text-blue-800 mb-2">Pay with Revolut</h3>
                      <p className="text-blue-700 text-sm mb-4">
                        Send your payment using Revolut. No additional fees.
                      </p>
                      
                      <div className="bg-green-50 p-3 rounded-lg border border-green-200 mb-4">
                        <div className="flex justify-between font-bold text-green-800">
                          <span>Total to pay:</span>
                          <span>{service.price}</span>
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between bg-white p-3 rounded-lg border border-blue-200">
                        <span className="font-medium text-gray-800">@cirillindo</span>
                        <button 
                          onClick={() => handleCopyToClipboard('@cirillindo', 'revolut')}
                          className="text-blue-600 hover:text-blue-800 transition-colors"
                          aria-label="Copy Revolut tag"
                        >
                          {copySuccess.revolut ? (
                            <Check className="w-5 h-5 text-green-500" />
                          ) : (
                            <Copy className="w-5 h-5" />
                          )}
                        </button>
                      </div>
                      
                      <div className="mt-4 text-sm">
                        <p className="font-medium text-blue-800">Important:</p>
                        <ul className="list-disc pl-5 space-y-1 mt-2 text-blue-700">
                          <li>You can send money via this link: <a href="https://revolut.me/cirillindo" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">https://revolut.me/cirillindo</a></li>
                        </ul>
                      </div>
                      
                      <div className="mt-6 flex justify-center">
                        <img 
                          src="https://res.cloudinary.com/dq3fftsfa/image/upload/v1750802047/WhatsApp_Image_2025-06-24_at_23.52.39_l6xylt.jpg" 
                          alt="Revolut QR Code" 
                          className="max-w-full h-auto max-h-64 rounded-lg border border-blue-200"
                        />
                      </div>
                    </div>

                    <div className="flex gap-4">
                      <Button
                        onClick={() => handleCopyToClipboard('@cirillindo', 'revolut')}
                        variant="outline"
                        className="flex-1 flex items-center justify-center gap-2"
                      >
                        <Copy className="w-5 h-5" />
                        Copy Revolut Tag
                      </Button>
                      
                      <a
                        href="https://revolut.me/cirillindo"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-1"
                      >
                        <Button
                          className="w-full flex items-center justify-center gap-2 bg-[#0070ba] hover:bg-[#005ea6]"
                        >
                          <ExternalLink className="w-5 h-5" />
                          Go to Revolut
                        </Button>
                      </a>
                    </div>
                    
                    <Button
                      onClick={handleManualPaymentInitiation}
                      disabled={isLoading}
                      variant="outline"
                      className="w-full mt-4"
                    >
                      {isLoading ? 'Creating Order...' : 'I\'ve Completed My Payment'}
                    </Button>
                  </div>
                )}

                {/* Error Message */}
                {errorMessage && (
                  <div className="mt-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md flex items-start gap-2">
                    <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                    <span>{errorMessage}</span>
                  </div>
                )}
              </>
            ) : (
              /* Upload Payment Slip View */
              <div className="space-y-6">
                <div className="text-center">
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">Upload Payment Confirmation</h3>
                  <p className="text-gray-600">
                    Please upload a screenshot or photo of your payment confirmation
                  </p>
                </div>

                <div className="bg-amber-50 rounded-xl p-4">
                  <h4 className="font-semibold text-gray-900 mb-2">Payment Details</h4>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Amount Paid:</span>
                    <span className="font-bold text-amber-600">{service.price}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Payment Method:</span>
                    <span className="font-medium text-gray-800 capitalize">{activeTab}</span>
                  </div>
                </div>

                {/* File Upload Area */}
                <div
                  {...getRootProps()}
                  className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors duration-300 ${
                    isDragActive
                      ? 'border-amber-500 bg-amber-50'
                      : 'border-gray-300 hover:border-amber-500 hover:bg-gray-50'
                  }`}
                >
                  <input {...getInputProps()} />
                  <div className="flex flex-col items-center">
                    <Upload className="w-12 h-12 text-gray-400 mb-4" />
                    <p className="text-gray-600 mb-2">
                      {isDragActive
                        ? 'Drop the image here...'
                        : 'Drag & drop your payment slip here, or click to select'}
                    </p>
                    <p className="text-sm text-gray-500">
                      Supports: JPG, PNG, WebP (max 10MB)
                    </p>
                  </div>
                </div>

                {/* Uploaded Image Preview */}
                {uploadedSlipUrl && (
                  <div className="bg-green-50 p-4 rounded-lg">
                    <div className="flex items-center gap-2 mb-3">
                      <Check className="w-5 h-5 text-green-600" />
                      <span className="font-medium text-green-800">Payment slip uploaded successfully!</span>
                    </div>
                    <img
                      src={uploadedSlipUrl}
                      alt="Payment slip"
                      className="max-w-full h-auto max-h-64 rounded-lg border border-green-200"
                    />
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex gap-4">
                  <Button
                    onClick={() => setCurrentView('payment_methods')}
                    variant="outline"
                    className="flex-1"
                  >
                    Back to Payment Methods
                  </Button>
                  <Button
                    onClick={handleSubmitPaymentSlip}
                    disabled={!uploadedSlipUrl || isLoading}
                    className="flex-1"
                  >
                    {isLoading ? 'Submitting...' : 'Submit Payment Slip'}
                  </Button>
                </div>

                {/* Success Message */}
                {successMessage && (
                  <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-md flex items-start gap-2">
                    <Check className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                    <span>{successMessage}</span>
                  </div>
                )}

                {/* Error Message */}
                {errorMessage && (
                  <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md flex items-start gap-2">
                    <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                    <span>{errorMessage}</span>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>,
    modalRoot
  );
};

export default PaymentSelectionModal;