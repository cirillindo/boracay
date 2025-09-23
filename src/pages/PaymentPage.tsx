import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import Container from '../components/ui/Container';
import Button from '../components/ui/Button';
import { CreditCard, Check, AlertCircle, Copy, ExternalLink, Info, Globe, Wallet, Banknote, RefreshCw } from 'lucide-react';
import { supabase } from '../lib/supabase';
import Confetti from '../components/Confetti';
import PaymentSelectionModal from '../components/modals/PaymentSelectionModal';
import { countryCodesList } from '../utils/countryCodes';
import { currencies, formatCurrency, convertCurrency } from '../utils/currency';
import axios from 'axios';

const PaymentPage: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [activeTab, setActiveTab] = useState<'stripe' | 'paypal' | 'gcash' | 'rubles' | 'revolut'>('stripe');
  const [amount, setAmount] = useState<number>(0);
  const [selectedCurrency, setSelectedCurrency] = useState<string>('EUR');
  const [description, setDescription] = useState<string>('');
  const [name, setName] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [whatsappNumber, setWhatsappNumber] = useState<string>('');
  const [countryCode, setCountryCode] = useState<string>('+63');
  const [surchargeAmount, setSurchargeAmount] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [showConfetti, setShowConfetti] = useState<boolean>(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [currentOrderId, setCurrentOrderId] = useState<string | null>(null);
  const [selectedServiceForPayment, setSelectedServiceForPayment] = useState<{
    title: string;
    price: string;
    priceUSD: string;
    currency: string;
  } | null>(null);
  const [totalAmountForPayment, setTotalAmountForPayment] = useState(0);
  const [copySuccess, setCopySuccess] = useState<{
    paypal: boolean;
    gcash: boolean;
    rubles: boolean;
    revolut: boolean;
  }>({ paypal: false, gcash: false, rubles: false, revolut: false });

  useEffect(() => {
    setIsVisible(true);
    detectCountry();
  }, []);

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

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseFloat(e.target.value);
    setAmount(isNaN(value) ? 0 : value);
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (amount <= 0) {
      newErrors.amount = 'Please enter a valid amount greater than 0';
    }

    if (!description.trim()) {
      newErrors.description = 'Please enter a payment description';
    }

    if (!name.trim()) {
      newErrors.name = 'Please enter your name';
    }

    if (!email.trim()) {
      newErrors.email = 'Please enter your email address';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!whatsappNumber.trim()) {
      newErrors.whatsappNumber = 'Please enter your WhatsApp number';
    } else if (!/^\d{7,15}$/.test(whatsappNumber)) {
      newErrors.whatsappNumber = 'WhatsApp number must be 7-15 digits';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Calculate surcharge for credit card and PayPal payments (5%)
  useEffect(() => {
    if (activeTab === 'stripe' || activeTab === 'paypal') {
      const surcharge = amount * 0.05;
      setSurchargeAmount(surcharge);
    } else {
      setSurchargeAmount(0);
    }
  }, [activeTab, amount]);

  const handleStripePayment = async () => {
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);

    try {
      // Get current user (may be null for anonymous users)
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      
      if (userError) {
        console.warn('Error getting user (proceeding as anonymous):', userError);
      }
      
      // Convert amount to EUR for storage (base currency)
      const amountInEur = convertCurrency(amount + surchargeAmount, selectedCurrency, 'EUR');
      
      // Prepare order data with explicit user_id handling
      const orderDataToInsert = { // Renamed to avoid conflict with destructured orderData below
        user_id: user?.id || null, // Explicitly set to null for anonymous users
        total_amount_php: amountInEur,
        currency: selectedCurrency,
        description: description.trim(),
        customer_name: name.trim(),
        customer_email: email.trim(),
        customer_whatsapp: `${countryCode}${whatsappNumber.trim()}`,
        status: 'pending',
        payment_method: 'stripe', // Set payment method here for initial insert
      };
      
      console.log('Attempting to insert order with data:', orderDataToInsert); // ADDED CONSOLE.LOG
      
      const { data: orderData, error: orderError } = await supabase
        .from('orders')
        .insert(orderDataToInsert) // Use the renamed object here
        .select()
        .single();
      
      if (orderError) throw orderError;

      // Add 5% surcharge for credit card payments
      const surchargedAmount = amount + surchargeAmount;
      
      // Convert to cents for Stripe (based on currency)
      const stripeAmount = Math.round(surchargedAmount * 100);
      
      // Call the Supabase Edge Function to create a payment intent
      const { data, error } = await supabase.functions.invoke('create-payment-intent', {
        body: {
          amount: stripeAmount,
          currency: selectedCurrency.toLowerCase(),
          description: description || 'Payment to Boracay.house',
          orderId: orderData.id,
          email: email || undefined,
          name: name || undefined
        }
      });

      if (error) {
        throw new Error(`Payment service error: ${error.message}`);
      }

      if (!data) {
        throw new Error('No response from payment service');
      }

      if (data.error) {
        throw new Error(data.error);
      }

      // Redirect to Stripe Checkout
      window.location.href = data.url;
    } catch (error) {
      console.error('Error creating payment:', error);
      
      let errorMsg = 'An unknown error occurred';
      if (error instanceof Error) {
        errorMsg = error.message;
      }
      
      // Provide user-friendly error messages
      if (errorMsg.includes('STRIPE_SECRET_KEY')) {
        errorMsg = 'Payment service is temporarily unavailable. Please try again later or contact support.';
      } else if (errorMsg.includes('Network')) {
        errorMsg = 'Network error. Please check your connection and try again.';
      }
      
      setErrorMessage(errorMsg);
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
      // Get current user (if logged in)
      const { data: { user } } = await supabase.auth.getUser();
      
      // For manual payments, no surcharge except for PayPal
      const finalAmount = activeTab === 'paypal' ? amount + surchargeAmount : amount;
      
      // Convert amount to EUR for storage (base currency)
      const amountInEur = convertCurrency(finalAmount, selectedCurrency, 'EUR');
      
      // Create the order record
      const { data: orderData, error: orderError } = await supabase
        .from('orders')
        .insert({
          user_id: user?.id || null,
          total_amount_php: amountInEur,
          currency: selectedCurrency,
          description: description.trim(),
          customer_name: name.trim(),
          customer_email: email.trim(),
          customer_whatsapp: `${countryCode}${whatsappNumber.trim()}`,
          status: 'pending_manual_review',
          payment_method: null,
        })
        .select()
        .single();
      
      if (orderError) throw orderError;
      
      setCurrentOrderId(orderData.id);
      
      // Format prices in selected currency and USD for display
      const formattedPrice = formatCurrency(finalAmount, selectedCurrency);
      const amountInUsd = convertCurrency(finalAmount, selectedCurrency, 'USD');
      const formattedPriceUSD = formatCurrency(amountInUsd, 'USD');
      
      setSelectedServiceForPayment({
        title: description || 'Payment to Boracay.house',
        price: formattedPrice,
        priceUSD: formattedPriceUSD,
        currency: selectedCurrency
      });
      
      setTotalAmountForPayment(finalAmount);
      setIsPaymentModalOpen(true);
    } catch (error) {
      console.error('Error creating order:', error);
      setErrorMessage('Failed to create order. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePaymentModalClose = () => {
    setIsPaymentModalOpen(false);
    setCurrentOrderId(null);
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

  const simulateSuccessfulPayment = () => {
    setSuccessMessage('Payment information copied! Please complete your payment using the copied details.');
    setShowConfetti(true);
  };

  return (
    <>
      <Helmet>
        <title>Make a Payment | Boracay.house</title>
        <meta name="description" content="Make a secure payment to Boracay.house. We accept Stripe, PayPal, GCash, Rubles, and Revolut." />
        <link rel="canonical" href="https://boracay.house/payment" />
      </Helmet>

      <div className="min-h-screen bg-gray-50">
        <div className="h-32" />
        
        <Container className="py-16">
          <div 
            className="max-w-3xl mx-auto"
            style={{
              opacity: isVisible ? 1 : 0,
              transform: isVisible ? 'translateY(0)' : 'translateY(20px)',
              transition: 'all 1s ease-out'
            }}
          >
            <div className="text-center mb-12">
              <h1 className="text-4xl font-bold text-gray-900 mb-4">
                Make a Payment
              </h1>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                Use this page to make payments for deposits, room upgrades, or any other services.
              </p>
            </div>
            
            <div className="bg-white rounded-xl shadow-lg overflow-hidden">
              {/* Customer Information Section - Always Visible */}
              <div className="p-6 md:p-8 border-b border-gray-200">
                <h2 className="text-xl font-bold text-gray-900 mb-6">Payment Information</h2>
                
                <div className="space-y-4">
                  <div>
                    <label htmlFor="amount" className="block text-sm font-medium text-gray-700 mb-1">
                      Amount *
                    </label>
                    <div className="flex">
                      <select
                        value={selectedCurrency}
                        onChange={(e) => setSelectedCurrency(e.target.value)}
                        className="w-24 px-3 py-2 border border-gray-300 rounded-l-md focus:outline-none focus:ring-2 focus:ring-amber-500 text-sm"
                      >
                        {currencies.map((currency) => (
                          <option key={currency.code} value={currency.code}>
                            {currency.code}
                          </option>
                        ))}
                      </select>
                      <div className="relative flex-1">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <span className="text-gray-500 sm:text-sm">{currencies.find(c => c.code === selectedCurrency)?.symbol}</span>
                        </div>
                        <input
                          type="number"
                          id="amount"
                          name="amount"
                          min="1"
                          step="0.01"
                          value={amount || ''}
                          onChange={handleAmountChange}
                          required
                          className={`pl-7 block w-full rounded-r-md border-l-0 border-gray-300 shadow-sm focus:border-amber-500 focus:ring-amber-500 sm:text-sm ${
                            errors.amount ? 'border-red-500' : ''
                          }`}
                          placeholder="0.00"
                        />
                      </div>
                    </div>
                    {errors.amount && (
                      <p className="mt-1 text-sm text-red-600">{errors.amount}</p>
                    )}
                  </div>

                  <div>
                    <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                      Payment Description *
                    </label>
                    <input
                      type="text"
                      id="description"
                      name="description"
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      required
                      className={`block w-full rounded-md border-gray-300 shadow-sm focus:border-amber-500 focus:ring-amber-500 sm:text-sm ${
                        errors.description ? 'border-red-500' : ''
                      }`}
                      placeholder="e.g., Booking deposit, Property payment"
                    />
                    {errors.description && (
                      <p className="mt-1 text-sm text-red-600">{errors.description}</p>
                    )}
                  </div>
                  
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                      Your Name *
                    </label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required
                      className={`block w-full rounded-md border-gray-300 shadow-sm focus:border-amber-500 focus:ring-amber-500 sm:text-sm ${
                        errors.name ? 'border-red-500' : ''
                      }`}
                      placeholder="John Doe"
                    />
                    {errors.name && (
                      <p className="mt-1 text-sm text-red-600">{errors.name}</p>
                    )}
                  </div>
                  
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                      Email for Receipt *
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      className={`block w-full rounded-md border-gray-300 shadow-sm focus:border-amber-500 focus:ring-amber-500 sm:text-sm ${
                        errors.email ? 'border-red-500' : ''
                      }`}
                      placeholder="your@email.com"
                    />
                    {errors.email && (
                      <p className="mt-1 text-sm text-red-600">{errors.email}</p>
                    )}
                  </div>

                  <div>
                    <label htmlFor="whatsapp" className="block text-sm font-medium text-gray-700 mb-1">
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
                        id="whatsapp"
                        name="whatsapp"
                        value={whatsappNumber}
                        onChange={(e) => setWhatsappNumber(e.target.value.replace(/\D/g, ''))}
                        required
                        className={`flex-1 px-3 py-2 border border-l-0 rounded-r-md focus:outline-none focus:ring-2 focus:ring-amber-500 ${
                          errors.whatsappNumber ? 'border-red-500' : ''
                        }`}
                        placeholder="Enter numbers only (7-15 digits)"
                      />
                    </div>
                    {errors.whatsappNumber && (
                      <p className="mt-1 text-sm text-red-600">{errors.whatsappNumber}</p>
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

              {/* Payment Form Content */}
              <div className="p-6 md:p-8">
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
                          {amount > 0 && (
                            <div className="mt-2 text-sm">
                              <div className="flex justify-between">
                                <span>Original amount:</span>
                                <span>{formatCurrency(amount, selectedCurrency)}</span>
                              </div>
                              <div className="flex justify-between">
                                <span>Processing fee (5%):</span>
                                <span>{formatCurrency(surchargeAmount, selectedCurrency)}</span>
                              </div>
                              <div className="flex justify-between font-bold mt-1 pt-1 border-t border-amber-200">
                                <span>Total to pay:</span>
                                <span>{formatCurrency(amount + surchargeAmount, selectedCurrency)}</span>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    <Button
                      onClick={handleStripePayment}
                      disabled={isLoading || amount <= 0}
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
                          Pay {formatCurrency(amount + surchargeAmount, selectedCurrency)} with Card
                        </>
                      )}
                    </Button>
                  </div>
                )}

                {/* PayPal Payment */}
                {activeTab === 'paypal' && (
                  <div className="space-y-6">
                    <div className="bg-blue-50 p-4 rounded-lg">
                      <h3 className="text-lg font-medium text-blue-800 mb-2">Pay with PayPal</h3>
                      <div className="mb-4">
                        <p className="text-blue-700 text-sm mb-2">
                          Send your payment to the following PayPal account.
                        </p>
                        <div className="bg-amber-50 p-3 rounded-lg border border-amber-200">
                          <p className="text-amber-800 font-medium">5% processing fee applies</p>
                          <p className="text-amber-700 text-sm">
                            A 5% processing fee will be added to your payment amount.
                          </p>
                        </div>
                      </div>
                      
                      {amount > 0 && (
                        <div className="bg-amber-50 p-3 rounded-lg border border-amber-200 mb-4">
                          <div className="flex justify-between text-sm text-amber-800">
                            <span>Original amount:</span>
                            <span>{formatCurrency(amount, selectedCurrency)}</span>
                          </div>
                          <div className="flex justify-between text-sm text-amber-800">
                            <span>Processing fee (5%):</span>
                            <span>{formatCurrency(surchargeAmount, selectedCurrency)}</span>
                          </div>
                          <div className="flex justify-between font-bold text-amber-800 mt-1 pt-1 border-t border-amber-200">
                            <span>Total to pay:</span>
                            <span>{formatCurrency(amount + surchargeAmount, selectedCurrency)}</span>
                          </div>
                        </div>
                      )}
                      
                      <div className="flex items-center justify-between bg-white p-3 rounded-lg border border-blue-200">
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

                    <div className="flex gap-4">
                      <Button
                        onClick={() => handleCopyToClipboard('giorgio@schwaiger.ws', 'paypal')}
                        variant="outline"
                        className="flex-1 flex items-center justify-center gap-2"
                      >
                        <Copy className="w-5 h-5" />
                        Copy Email
                      </Button>
                      
                      <a
                        href="https://www.paypal.com/signin"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-1"
                      >
                        <Button
                          className="w-full flex items-center justify-center gap-2 bg-[#0070ba] hover:bg-[#005ea6]"
                        >
                          <ExternalLink className="w-5 h-5" />
                          Go to PayPal
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

                {/* GCash Payment */}
                {activeTab === 'gcash' && (
                  <div className="space-y-6">
                    <div className="bg-blue-50 p-4 rounded-lg">
                      <h3 className="text-lg font-medium text-blue-800 mb-2">Pay with GCash</h3>
                      <p className="text-blue-700 text-sm mb-4">
                        Send your payment to the following GCash number. No additional fees.
                      </p>
                      
                      {amount > 0 && (
                        <div className="bg-green-50 p-3 rounded-lg border border-green-200 mb-4">
                          <div className="flex justify-between font-bold text-green-800">
                            <span>Total to pay:</span>
                            <span>{formatCurrency(amount, selectedCurrency)}</span>
                          </div>
                        </div>
                      )}
                      
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
                          className="max-w-full h-auto max-h-[33.6rem] rounded-lg border border-blue-200"
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
                      
                      {amount > 0 && (
                        <div className="bg-green-50 p-3 rounded-lg border border-green-200 mb-4">
                          <div className="flex justify-between font-bold text-green-800">
                            <span>Сумма к оплате:</span>
                            <span>{formatCurrency(amount, selectedCurrency)}</span>
                          </div>
                        </div>
                      )}
                      
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
                        href="https://wa.me/79096556608?text=Если%20у%20вас%20есть%20вопросы%20или%20что-то%20осталось%20непонятным%2C%20пожалуйста%2C%20напишите%2C%20мне%20в%20WhatsApp."
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
                      
                      {amount > 0 && (
                        <div className="bg-green-50 p-3 rounded-lg border border-green-200 mb-4">
                          <div className="flex justify-between font-bold text-green-800">
                            <span>Total to pay:</span>
                            <span>{formatCurrency(amount, selectedCurrency)}</span>
                          </div>
                        </div>
                      )}
                      
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
                          className="max-w-full h-auto max-h-96 rounded-lg border border-blue-200"
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

                {/* Success Message */}
                {successMessage && (
                  <div className="mt-4 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-md flex items-start gap-2">
                    <Check className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                    <span>{successMessage}</span>
                  </div>
                )}
              </div>
            </div>
            
            <div className="mt-8 text-center">
              <p className="text-sm text-gray-500">
                For any payment-related questions, please contact us at <a href="mailto:ilawilawvilla@gmail.com" className="text-amber-600 hover:underline">ilawilawvilla@gmail.com</a>
              </p>
              <div className="flex justify-center mt-4 space-x-4">
                <img src="https://res.cloudinary.com/dq3fftsfa/image/upload/v1750677412/visa_logo_ixpfzz.png" alt="Visa" className="h-8" />
                <img src="https://res.cloudinary.com/dq3fftsfa/image/upload/v1750677412/mastercard_logo_ixpfzz.png" alt="Mastercard" className="h-8" />
                <img src="https://res.cloudinary.com/dq3fftsfa/image/upload/v1750677412/amex_logo_ixpfzz.png" alt="American Express" className="h-8" />
                <img src="https://res.cloudinary.com/dq3fftsfa/image/upload/v1751122800/paypal-logo_ixpfzz.png" alt="PayPal" className="h-8" />
                <img src="https://res.cloudinary.com/dq3fftsfa/image/upload/v1751122800/gcash-logo_ixpfzz.png" alt="GCash" className="h-8" />
              </div>
            </div>
          </div>
        </Container>
      </div>

      {/* Confetti effect for successful payments */}
      <Confetti fire={showConfetti} />

      {/* Payment Selection Modal */}
      {selectedServiceForPayment && (
        <PaymentSelectionModal
          isOpen={isPaymentModalOpen}
          onClose={handlePaymentModalClose}
          orderId={currentOrderId}
          service={selectedServiceForPayment}
          totalAmount={totalAmountForPayment}
          baseAmount={amount}
          processingFee={surchargeAmount}
          selectedAddons={[]}
          customerName={name}
          customerEmail={email}
          customerWhatsapp={whatsappNumber}
          initialView="upload_slip"
          paymentMethod={activeTab}
          shouldClearCart={false}
        />
      )}
    </>
  );
};

export default PaymentPage;
