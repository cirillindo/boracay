import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import Container from '../components/ui/Container';
import Button from '../components/ui/Button';
import PropertyCard from '../components/property/PropertyCard';
import { AlertTriangle, Calendar, Check, CheckCircle, CheckCircle2, ChevronDown, ChevronUp, Clock, CreditCard, DollarSign, ExternalLink, Heart, HelpCircle, MapPin, MessageCircle, Settings, Shield, Star, TrendingUp, Users, X, Zap, ArrowRight, Upload, Globe, Wallet, Banknote, RefreshCw, Info, Copy } from 'lucide-react';
import PromoPackageCard from '../components/shared/PromoPackageCard';
import SEO from '../components/SEO';
import SEOJson from '../components/SEOJson';
import GuestReviews from '../components/home/GuestReviews';
import { supabase } from '../lib/supabase';
import { Property } from '../types';
import PaymentSelectionModal from '../components/modals/PaymentSelectionModal';
import { currencies, formatCurrency, convertCurrency } from '../utils/currency';
import { countryCodesList } from '../utils/countryCodes';
import axios from 'axios';
import { useDropzone } from 'react-dropzone';
import { uploadImage } from '../lib/cloudinary';

interface Package {
  id: string;
  name: string;
  description: string;
  hero_image: string;
  base_price_php: number;
  is_top_product: boolean;
  is_most_sold: boolean;
  is_sold_out?: boolean;
  min_pax?: number;
  max_pax?: number;
  min_nights?: number;
  max_nights?: number;
  whatsapp_number?: string;
  slug?: string;
  promo_code?: string;
  promo_discount_percentage?: number;
}

const PAGE_URL = 'https://boracay.house/direct';
const OG_1200 = 'https://res.cloudinary.com/dq3fftsfa/image/upload/c_fill,g_auto,f_auto,q_auto:eco,w_1200,h_630/v1747139974/Boracay_opportunities_for_sale_jb1kzj.avif';
const OG_2400 = 'https://res.cloudinary.com/dq3fftsfa/image/upload/c_fill,g_auto,f_auto,q_auto:good,w_2400,h_1260/v1747139974/Boracay_opportunities_for_sale_jb1kzj.avif';

const BookDirectPage: React.FC = () => {
  const [properties, setProperties] = useState<Property[]>([]);
  const [packages, setPackages] = useState<Package[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingPackages, setLoadingPackages] = useState(true);
  const [isVisible, setIsVisible] = useState(false);
  const [sectionsVisible, setSectionsVisible] = useState<Record<string, boolean>>({});
  const [showFloatingButton, setShowFloatingButton] = useState(false); // New state for floating button visibility

  // Payment form states
  const [amount, setAmount] = useState<number>(0);
  const [selectedCurrency, setSelectedCurrency] = useState<string>('EUR');
  const [description, setDescription] = useState<string>('');
  const [customerName, setCustomerName] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [customerWhatsapp, setCustomerWhatsapp] = useState('');
  const [countryCode, setCountryCode] = useState<string>('+63');
  const [surchargeAmount, setSurchargeAmount] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [currentOrderId, setCurrentOrderId] = useState<string | null>(null);
  const [selectedServiceForPayment, setSelectedServiceForPayment] = useState<{
    title: string;
    price: string;
    priceUSD: string;
    currency?: string;
  } | null>(null);
  const [totalAmountForPayment, setTotalAmountForPayment] = useState(0);
  const [selectedAddonsForPayment, setSelectedAddonsForPayment] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState<'stripe' | 'paypal' | 'gcash' | 'rubles' | 'revolut'>('stripe');
  const [uploadedSlipUrl, setUploadedSlipUrl] = useState<string>('');
  const [isUploading, setIsUploading] = useState(false);
  const [copySuccess, setCopySuccess] = useState<{
    paypal: boolean;
    gcash: boolean;
    rubles: boolean;
    revolut: boolean;
  }>({ paypal: false, gcash: false, rubles: false, revolut: false });

  useEffect(() => {
    setIsVisible(true);
    loadProperties();
    loadPackages();
    detectCountry(); // Detect country on component mount

    // Scroll event listener for floating button
    const handleScroll = () => {
      const heroSectionHeight = window.innerHeight * 0.6; // Approximate height of the hero section
      if (window.scrollY > heroSectionHeight) {
        setShowFloatingButton(true);
      } else {
        setShowFloatingButton(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
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

  const loadProperties = async () => {
    try {
      const { data, error } = await supabase
        .from('properties')
        .select('*')
        .eq('is_for_rent', true)
        .not('nightly_rate_min', 'is', null)
        .order('nightly_rate_min', { ascending: true })
        .limit(6);

      if (error) throw error;
      setProperties(data || []);
    } catch (error) {
      console.error('Error loading properties:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadPackages = async () => {
    try {
      const { data, error } = await supabase
        .from('packages')
        .select('*')
        .eq('is_sold_out', false)
        .order('created_at', { ascending: false })
        .limit(3);

      if (error) throw error;
      setPackages(data || []);
    } catch (error) {
      console.error('Error loading packages:', error);
    } finally {
      setLoadingPackages(false);
    }
  };

  // Payment form handlers
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

    if (!customerName.trim()) {
      newErrors.customerName = 'Please enter your name';
    }

    if (!customerEmail.trim()) {
      newErrors.customerEmail = 'Please enter your email address';
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
      const { data: { user } } = await supabase.auth.getUser();
      
      const { data: orderData, error: orderError } = await supabase
        .from('orders')
        .insert({
          user_id: user?.id || null,
          total_amount_php: totalAmount,
          currency: selectedCurrency,
          description: description.trim(),
          customer_name: customerName.trim(),
          customer_email: customerEmail.trim(),
          customer_whatsapp: `${countryCode}${customerWhatsapp.trim()}`,
          status: 'pending',
          payment_method: 'stripe',
        })
        .select()
        .single();
      
      if (orderError) throw orderError;

      const surchargedAmount = amount + surchargeAmount;
      const stripeAmount = Math.round(surchargedAmount * 100);
      
      const { data, error } = await supabase.functions.invoke('create-payment-intent', {
        body: {
          amount: stripeAmount,
          currency: selectedCurrency.toLowerCase(),
          description: description || 'Payment to Boracay.house',
          orderId: orderData.id,
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

      window.location.href = data.url;
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
      const { data: { user } = {} } = await supabase.auth.getUser(); // Destructure with default empty object
      
      const finalAmount = activeTab === 'paypal' ? amount + surchargeAmount : amount;
      
      const { data: orderData, error: orderError } = await supabase
        .from('orders')
        .insert({
          user_id: user?.id || null,
          total_amount_php: finalAmount,
          currency: selectedCurrency,
          description: description.trim(),
          customer_name: customerName.trim(),
          customer_email: customerEmail.trim(),
          customer_whatsapp: `${countryCode}${customerWhatsapp.trim()}`,
          status: 'pending_manual_review',
          payment_method: activeTab,
        })
        .select()
        .single();
      
      if (orderError) throw orderError;
      
      setCurrentOrderId(orderData.id);
      
      setSelectedServiceForPayment({
        title: description || 'Payment to Boracay.house',
        price: formatCurrency(finalAmount, selectedCurrency),
        priceUSD: formatCurrency(convertCurrency(finalAmount, selectedCurrency, 'USD'), 'USD'),
        currency: selectedCurrency
      });
      
      setTotalAmountForPayment(finalAmount);
      setSelectedAddonsForPayment([]); // No specific addons for this general payment form
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

  const jsonLdSchemas = [
    {
      "@context": "https://schema.org",
      "@type": "WebPage",
      "name": "Book Direct in Boracay — Save Platform Fees (Best Rate Guarantee)",
      "url": PAGE_URL,
      "description": "Book villas & apartments direct with secure Stripe/PayPal. Save platform fees, best rate guarantee, flexible cancellation, and instant support."
    },
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      "itemListElement": [
        {"@type":"ListItem","position":1,"name":"Home","item":"https://boracay.house/"},
        {"@type":"ListItem","position":2,"name":"Book Direct","item": PAGE_URL}
      ]
    },
    {
      "@context": "https://schema.org",
      "@type": "HowTo",
      "name": "How to Book Direct with Boracay.house",
      "step": [
        {"@type":"HowToStep","name":"Check availability","text":"Choose your dates and preferred villa. We confirm availability quickly."},
        {"@type":"HowToStep","name":"Choose payment","text":"Pay securely by card via Stripe, PayPal Goods & Services, or choose pay-on-arrival with a small card pre-authorization."},
        {"@type":"HowToStep","name":"Get confirmation","text":"Receive a signed confirmation and official receipt by email."},
        {"@type":"HowToStep","name":"Optional verification","text":"Join a short video call or virtual tour if you'd like to verify details before payment."}
      ]
    },
    {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      "mainEntity": [
        {"@type":"Question","name":"Is it safe to book direct?","acceptedAnswer":{"@type":"Answer","text":"Yes. You can pay by Stripe or PayPal Goods & Services (both include buyer protections), receive a signed confirmation and official receipt, and choose a flexible cancellation policy."}},
        {"@type":"Question","name":"Do I save the platform service fee?","acceptedAnswer":{"@type":"Answer","text":"Direct bookings don't include third-party guest service fees, so your total is typically lower. We also offer a best rate guarantee for the same dates and terms found elsewhere."}},
        {"@type":"Question","name":"Can you move an active Airbnb chat off-platform?","acceptedAnswer":{"@type":"Answer","text":"We follow platform terms and won't move active reservations off-platform. For new or future stays, booking direct on our site is welcomed and cheaper."}},
        {"@type":"Question","name":"What are the cancellation and refund terms?","acceptedAnswer":{"@type":"Answer","text":"Pick a flexible policy that fits your trip. We state the policy clearly on your confirmation and honor it."}}
      ]
    },
    {
      "@context": "https://schema.org",
      "@type": "Organization",
      "name": "Boracay.house",
      "url": "https://boracay.house",
      "logo": "https://boracay.house/logo.png",
      "sameAs": [
        "https://www.facebook.com/boracaybedandbreakfast",
        "https://www.instagram.com/ilawilawvillas/"
      ],
      "contactPoint": [{
        "@type":"ContactPoint",
        "contactType":"customer support",
        "areaServed": "PH",
        "availableLanguage": ["en","tl","ru"],
        "telephone":"+63-961-792-8834"
      }]
    }
  ];

  return (
    <>
      <SEO
        title="Book Direct in Boracay — Save Platform Fees (Best Rate Guarantee)"
        description="Book villas & apartments direct with secure Stripe/PayPal. Save platform fees, best rate guarantee, flexible cancellation, and instant WhatsApp support."
        keywords="book direct boracay, boracay direct booking, save airbnb fees, boracay villa direct, book without platform fees"
        ogImage={OG_1200}
        url={PAGE_URL}
        canonical={PAGE_URL}
        type="website"
      />

      <Helmet>
        <meta property="og:type" content="website" />
        <meta property="og:image" content={OG_2400} />
        <meta property="og:image:alt" content="Boracay villa exterior at sunset — book direct and save fees" />
        <meta name="twitter:card" content="summary_large_image" />
      </Helmet>

      <SEOJson graphs={jsonLdSchemas} />

      <div className="min-h-screen bg-white">
        <div className="h-32" />
        
        {/* HERO */}
        <section className="relative w-full min-h-[60vh] flex items-center justify-center overflow-hidden">
          <div className="absolute inset-0">
            <video
              className="absolute inset-0 w-full h-full object-cover"
              autoPlay
              loop
              muted
              playsInline
            >
              <source src="https://res.cloudinary.com/dq3fftsfa/video/upload/v1755099521/Anna_and_Giorgio_kkscwt.mp4" type="video/mp4" />
              Your browser does not support the video tag.
            </video>
            <div className="absolute inset-0 bg-black/40" />
          </div>

          <div className="theater-curtain" />

          <Container className="relative z-10">
            <div 
              className="max-w-4xl mx-auto text-center"
              style={{
                opacity: isVisible ? 1 : 0,
                transform: isVisible ? 'translateY(0)' : 'translateY(20px)',
                transition: 'all 1s ease-out'
              }}
            >
              <h1 className="text-5xl font-bold text-white mb-6">
                Book Direct & Save the Platform Fee
              </h1>
              <p className="text-xl text-gray-200 max-w-3xl mx-auto mb-8">
                Best Rate Guarantee. Secure Stripe/PayPal checkout. Flexible cancellation. Instant WhatsApp support.
              </p>
              <div className="flex flex-col sm:flex-row justify-center gap-4">
                <Link to="/airbnb" data-cta="cta_click" data-label="direct_check_availability" data-page="direct">
                  <Button 
                    className="text-lg px-8 py-4"
                  >
                    Check Availability
                  </Button>
                </Link>
                <a 
                  href="https://wa.me/79096556608?text=Hi%20Boracay.house%2C%20I%20want%20to%20book%20direct"
                  target="_blank" 
                  rel="noopener noreferrer"
                  data-cta="whatsapp_click" 
                  data-page="direct"
                >
                  <Button 
                    variant="outline"
                    className="text-lg px-8 py-4"
                  >
                    <MessageCircle className="w-5 h-5 mr-2" />
                    WhatsApp Us
                  </Button>
                </a>
              </div>
              <p className="text-sm text-gray-300 mt-4">
                We respect all platform terms. For new or future stays, booking direct on our official site is easy and secure.
              </p>
            </div>
          </Container>
        </section>

        {/* WHY BOOK DIRECT - MOVED FROM LATER IN PAGE */}
        <section className="py-16 bg-white">
          <Container>
            <div className="max-w-4xl mx-auto">
              <h2 className="text-3xl font-bold text-center mb-8">Why Book Direct?</h2>
              <div className="overflow-x-auto">
                <table className="w-full border border-gray-200 rounded-lg overflow-hidden">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="p-4 text-left font-semibold text-gray-900"></th>
                      <th className="p-4 text-left font-semibold text-gray-900">On a Platform</th>
                      <th className="p-4 text-left font-semibold text-gray-900">Book Direct</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    <tr>
                      <td className="p-4 font-medium text-gray-900">Guest service fee</td>
                      <td className="p-4 text-gray-600">Usually added</td>
                      <td className="p-4 font-bold text-green-600">₱0</td>
                    </tr>
                    <tr className="bg-gray-50">
                      <td className="p-4 font-medium text-gray-900">Room rate</td>
                      <td className="p-4 text-gray-600">Same</td>
                      <td className="p-4 text-gray-600">Same or lower</td>
                    </tr>
                    <tr>
                      <td className="p-4 font-medium text-gray-900">Support</td>
                      <td className="p-4 text-gray-600">Platform chat</td>
                      <td className="p-4 font-bold text-green-600">Direct host (24/7)</td>
                    </tr>
                    <tr className="bg-gray-50">
                      <td className="p-4 font-medium text-gray-900">Payment options</td>
                      <td className="p-4 text-gray-600">Limited</td>
                      <td className="p-4 font-bold text-green-600">Stripe • PayPal G&S • Pay on arrival*</td>
                    </tr>
                  </tbody>
                </table>
                <p className="text-sm text-gray-500 mt-4">
                  * Pay-on-arrival uses a small card pre-authorization to secure your dates.
                </p>
              </div>
            </div>
          </Container>
        </section>

        {/* How Direct Booking Works Section */}
        <section className="py-16 bg-gray-50">
          <Container>
            <div className="max-w-4xl mx-auto">
              <h2 className="text-3xl font-bold text-center mb-8">How Direct Booking Works</h2>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="text-center">
                  <div className="bg-amber-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-2xl font-bold text-amber-600">1</span>
                  </div>
                  <h3 className="text-lg font-semibold mb-2">Pick Your Dates</h3>
                  <p className="text-gray-600">Choose your dates and villa — we confirm availability quickly.</p>
                </div>
                <div className="text-center">
                  <div className="bg-amber-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-2xl font-bold text-amber-600">2</span>
                  </div>
                  <h3 className="text-lg font-semibold mb-2">Choose Payment</h3>
                  <p className="text-gray-600">Pay by card (Stripe), PayPal Goods & Services, or choose pay-on-arrival with pre-auth.</p>
                </div>
                <div className="text-center">
                  <div className="bg-amber-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-2xl font-bold text-amber-600">3</span>
                  </div>
                  <h3 className="text-lg font-semibold mb-2">Get Confirmation</h3>
                  <p className="text-gray-600">Receive a signed confirmation and official receipt by email.</p>
                </div>
                <div className="text-center">
                  <div className="bg-amber-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-2xl font-bold text-amber-600">4</span>
                  </div>
                  <h3 className="text-lg font-semibold mb-2">Optional Verification</h3>
                  <p className="text-gray-600">Join a short video call or virtual tour if you'd like to verify details.</p>
                </div>
              </div>
            </div>
          </Container>
        </section>

        {/* Payment Form Section */}
        <section className="py-16 bg-white">
          <Container>
            <div className="max-w-3xl mx-auto">
              <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">
                Make a Payment
              </h2>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto text-center mb-8">
                Use this form to make payments for deposits, room upgrades, or any other services.
              </p>
              {/* Updated paragraph for deposit and availability check */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-8 flex items-start gap-3">
                <Info className="w-6 h-6 text-blue-600 flex-shrink-0 mt-1" />
                <p className="text-base text-blue-800 font-semibold leading-relaxed">
                  For bookings we require <strong>35% deposit</strong> and the <strong>rest to be paid at arrival</strong>.
                  <br />
                  Please always check with us availability before any payment.
                </p>
              </div>
              
              <div className="bg-white rounded-xl shadow-lg overflow-hidden">
                {/* Customer Information Section */}
                <div className="p-6 md:p-8 border-b border-gray-200">
                  <h3 className="text-xl font-bold text-gray-900 mb-6">Payment Information</h3>
                  
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
                      <label htmlFor="customerName" className="block text-sm font-medium text-gray-700 mb-1">
                        Your Name *
                      </label>
                      <input
                        type="text"
                        id="customerName"
                        name="customerName"
                        value={customerName}
                        onChange={(e) => setCustomerName(e.target.value)}
                        required
                        className={`block w-full rounded-md border-gray-300 shadow-sm focus:border-amber-500 focus:ring-amber-500 sm:text-sm ${
                          errors.customerName ? 'border-red-500' : ''
                        }`}
                        placeholder="John Doe"
                      />
                      {errors.customerName && (
                        <p className="mt-1 text-sm text-red-600">{errors.customerName}</p>
                      )}
                    </div>
                    
                    <div>
                      <label htmlFor="customerEmail" className="block text-sm font-medium text-gray-700 mb-1">
                        Email for Receipt *
                      </label>
                      <input
                        type="email"
                        id="customerEmail"
                        name="customerEmail"
                        value={customerEmail}
                        onChange={(e) => setCustomerEmail(e.target.value)}
                        required
                        className={`block w-full rounded-md border-gray-300 shadow-sm focus:border-amber-500 focus:ring-amber-500 sm:text-sm ${
                          errors.customerEmail ? 'border-red-500' : ''
                        }`}
                        placeholder="your@email.com"
                      />
                      {errors.customerEmail && (
                        <p className="mt-1 text-sm text-red-600">{errors.customerEmail}</p>
                      )}
                    </div>

                    <div>
                      <label htmlFor="customerWhatsapp" className="block text-sm font-medium text-gray-700 mb-1">
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
                          id="customerWhatsapp"
                          name="customerWhatsapp"
                          value={customerWhatsapp}
                          onChange={(e) => setCustomerWhatsapp(e.target.value.replace(/\D/g, ''))}
                          required
                          className={`flex-1 px-3 py-2 border border-l-0 rounded-r-md focus:outline-none focus:ring-2 focus:ring-amber-500 ${
                            errors.customerWhatsapp ? 'border-red-500' : ''
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
                    <AlertTriangle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                    <span>{errorMessage}</span>
                  </div>
                )}
              </div>
            </div>
          </Container>
        </section>
        {/* END Payment Form Section */}

        {/* NEW: Browse Properties Section */}
        <section className="py-16 bg-gradient-to-r from-blue-600 to-blue-800 rounded-xl shadow-xl mx-auto max-w-6xl p-8 md:p-12 flex flex-col md:flex-row items-center justify-between">
          <div className="md:w-2/3 text-center md:text-left mb-6 md:mb-0">
            <p className="text-2xl md:text-3xl font-bold text-white leading-tight">
              Explore housing options and find your home in the Philippines.
            </p>
          </div>
          <div className="md:w-1/3 flex justify-center md:justify-end">
            <Link to="/airbnb">
              <Button
                className="bg-amber-500 hover:bg-amber-600 text-white font-bold px-8 py-4 rounded-full shadow-md hover:shadow-lg text-lg flex items-center gap-2"
              >
                Browse properties <ArrowRight className="w-5 h-5" />
              </Button>
            </Link>
          </div>
        </section>
        {/* END NEW: Browse Properties Section */}

        {/* GUARANTEE */}
        <section className="py-16 bg-white">
          <Container>
            <div className="max-w-4xl mx-auto">
              <h2 className="text-3xl font-bold text-center mb-8">Direct Booking Guarantee</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <Shield className="w-6 h-6 text-green-600 flex-shrink-0 mt-1" />
                    <div>
                      <h3 className="font-semibold text-gray-900">Best Rate</h3>
                      <p className="text-gray-600">We match the same dates & terms found elsewhere within 24 hours.</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <CreditCard className="w-6 h-6 text-green-600 flex-shrink-0 mt-1" />
                    <div>
                      <h3 className="font-semibold text-gray-900">Secure Checkout</h3>
                      <p className="text-gray-600">Stripe/PayPal with buyer protections.</p>
                    </div>
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <Clock className="w-6 h-6 text-green-600 flex-shrink-0 mt-1" />
                    <div>
                      <h3 className="font-semibold text-green-600">Flexible Cancellation</h3>
                      <p className="text-gray-600">Choose the policy that fits your trip.</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <CheckCircle className="w-6 h-6 text-green-600 flex-shrink-0 mt-1" />
                    <div>
                      <h3 className="font-semibold text-green-600">Proof & Receipts</h3>
                      <p className="text-gray-600">Signed confirmation and official receipt via email.</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </Container>
        </section>

        {/* QUICK TAKE */}
        <section className="py-16 bg-amber-50">
          <Container>
            <div className="max-w-4xl mx-auto text-center">
              <h2 className="text-3xl font-bold text-gray-900 mb-6">Quick Take</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="bg-white p-6 rounded-xl shadow-md">
                  <div className="flex items-center gap-3 mb-4">
                    <Heart className="w-8 h-8 text-amber-600" />
                    <h3 className="text-xl font-bold text-gray-900">Direct Booking</h3>
                  </div>
                  <p className="text-gray-700">
                    Usually <strong>cheaper + more flexible</strong>, but trust must be earned (show proof + safe payments).
                  </p>
                </div>
                <div className="bg-white p-6 rounded-xl shadow-md">
                  <div className="flex items-center gap-3 mb-4">
                    <Shield className="w-8 h-8 text-blue-600" />
                    <h3 className="text-xl font-bold text-gray-900">Platform Booking</h3>
                  </div>
                  <p className="text-gray-700">
                    Built-in <strong>buyer protections + standardization</strong>, but you pay platform fees and have less flexibility.
                  </p>
                </div>
              </div>
            </div>
          </Container>
        </section>

        {/* VERIFY US IN SECONDS */}
        <section className="py-16 bg-white">
          <Container>
            <div className="max-w-4xl mx-auto">
              <h2 className="text-3xl font-bold text-center mb-8">Verify Us in Seconds</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center p-6 bg-gray-50 rounded-lg">
                  <Shield className="w-12 h-12 text-blue-500 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Airbnb Profile</h3>
                  <p className="text-gray-600 mb-4">Check our verified Airbnb host profile and guest reviews.</p>
                  <a 
                    href="https://www.airbnb.com/users/show/24129286" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:text-blue-700 flex items-center justify-center gap-1"
                  >
                    View Airbnb Profile <ExternalLink className="w-4 h-4" />
                  </a>
                </div>
                <div className="text-center p-6 bg-gray-50 rounded-lg">
                  <MessageCircle className="w-12 h-12 text-blue-500 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Social Media</h3>
                  <p className="text-gray-600 mb-4">Follow us on Instagram and Facebook for daily updates.</p>
                  <div className="flex justify-center gap-4">
                    <a 
                      href="https://www.instagram.com/ilawilawvillas/" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-pink-600 hover:text-pink-700"
                    >
                      Instagram
                    </a>
                    <a 
                      href="https://www.facebook.com/boracaybedandbreakfast" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:text-blue-700"
                    >
                      Facebook
                    </a>
                  </div>
                </div>
                <div className="text-center p-6 bg-gray-50 rounded-lg">
                  <MessageCircle className="w-12 h-12 text-green-500 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Direct Contact</h3>
                  <p className="text-gray-600 mb-4">Message us directly for instant support and verification.</p>
                  <a 
                    href="https://wa.me/79096556608?text=Hi%2C%20I%20want%20to%20verify%20your%20property%20before%20booking%20direct"
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-green-600 hover:text-green-700 flex items-center justify-center gap-1"
                  >
                    WhatsApp Us <ExternalLink className="w-4 h-4" />
                  </a>
                </div>
              </div>
            </div>
          </Container>
        </section>

        {/* PROMO PACKAGES SECTION */}
        <section className="py-16 bg-gray-50">
          <Container>
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                Enhance Your Stay with Our Exclusive Packages
              </h2>
              <p className="text-lg text-gray-600 max-w-3xl mx-auto">
                Make your Boracay experience unforgettable with our curated packages and activities. 
                From adventure bundles to relaxation retreats, we have everything you need for the perfect getaway.
              </p>
            </div>

            {loadingPackages ? (
              <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-amber-500"></div>
              </div>
            ) : packages.length > 0 ? (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-8">
                  {packages.map((pkg, index) => (
                    <div 
                      key={pkg.id}
                      style={{
                        opacity: isVisible ? 1 : 0,
                        transform: `translateY(${isVisible ? '0' : '40px'})`,
                        transition: `all 0.8s cubic-bezier(0.4, 0, 0.2, 1) ${index * 0.15}s`
                      }}
                    >
                      <PromoPackageCard pkg={pkg} />
                    </div>
                  ))}
                </div>
                <div className="text-center">
                  <Link to="/promos">
                    <Button className="text-lg px-8 py-4">
                      View All Promos & Activities →
                    </Button>
                  </Link>
                </div>
              </>
            ) : (
              <div className="text-center py-12">
                <p className="text-gray-600">No packages available at the moment.</p>
              </div>
            )}
          </Container>
        </section>

        {/* OUR RENTAL LISTING OPTIONS */}
        <section className="py-16 bg-gray-50">
          <Container>
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                Our Rental Listing Options
              </h2>
              <p className="text-lg text-gray-600 max-w-3xl mx-auto">
                Browse our handpicked selection of villas and apartments available for direct booking.
              </p>
            </div>

            {loading ? (
              <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-amber-500"></div>
              </div>
            ) : properties.length > 0 ? (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-8">
                  {properties.map((property, index) => (
                    <div 
                      key={property.id}
                      style={{
                        opacity: isVisible ? 1 : 0,
                        transform: `translateY(${isVisible ? '0' : '40px'})`,
                        transition: `all 0.8s cubic-bezier(0.4, 0, 0.2, 1) ${index * 0.15}s`
                      }}
                    >
                      <PropertyCard
                        property={{ ...property, selectedCurrency: 'EUR' }}
                        showNightlyRate={true}
                      />
                    </div>
                  ))}
                </div>
                <div className="text-center">
                  <Link to="/airbnb">
                    <Button className="text-lg px-8 py-4">
                     Check our Airbnbs
                    </Button>
                  </Link>
                </div>
              </>
            ) : (
              <div className="text-center py-12">
                <p className="text-gray-600">No rental properties available at the moment.</p>
              </div>
            )}
          </Container>
        </section>

        {/* WHAT OUR GUESTS SAY */}
        <GuestReviews />

        {/* FAQ */}
        <section className="py-16 bg-gray-50" id="faq">
          <Container>
            <div className="max-w-4xl mx-auto">
              <h2 className="text-3xl font-bold text-center mb-8">FAQs — Booking Direct</h2>
              <div className="space-y-4">
                <details className="bg-white p-6 rounded-lg shadow-sm">
                  <summary className="font-semibold text-gray-900 cursor-pointer">Is it safe to book direct?</summary>
                  <p className="mt-4 text-gray-600">Yes. You can pay by card via Stripe or PayPal Goods & Services (both include buyer protections). You'll receive a signed confirmation and official receipt by email, plus a clear cancellation policy.</p>
                </details>

                <details className="bg-white p-6 rounded-lg shadow-sm">
                  <summary className="font-semibold text-gray-900 cursor-pointer">How do payments work?</summary>
                  <p className="mt-4 text-gray-600">Choose: (1) Card via Stripe, (2) PayPal Goods & Services, or (3) pay on arrival with a small card pre-authorization. All options generate a confirmation and receipt.</p>
                </details>

                <details className="bg-white p-6 rounded-lg shadow-sm">
                  <summary className="font-semibold text-gray-900 cursor-pointer">Can I pay on arrival?</summary>
                  <p className="mt-4 text-gray-600">Yes. We place a small card pre-authorization to secure your booking, then you settle at check-in. This lets you verify us in person while keeping your dates reserved.</p>
                </details>

                <details className="bg-white p-6 rounded-lg shadow-sm">
                  <summary className="font-semibold text-gray-900 cursor-pointer">Do I really save the platform service fee?</summary>
                  <p className="mt-4 text-gray-600">Direct bookings don't include third-party guest service fees, so your total is typically lower. We also offer a best-rate guarantee for the same dates and terms found elsewhere.</p>
                </details>

                <details className="bg-white p-6 rounded-lg shadow-sm">
                  <summary className="font-semibold text-gray-900 cursor-pointer">Can you move my current Airbnb/Booking chat off-platform?</summary>
                  <p className="mt-4 text-gray-600">We follow platform terms and won't move active reservations off-platform. For new or future stays, booking direct on our official site is welcomed and cheaper.</p>
                </details>

                <details className="bg-white p-6 rounded-lg shadow-sm">
                  <summary className="font-semibold text-gray-900 cursor-pointer">How can I verify you're real before paying?</summary>
                  <p className="mt-4 text-gray-600">Check our Google Business profile and socials, or book a short live video tour. You can also use the pay-on-arrival option with pre-auth.</p>
                </details>

                <details className="bg-white p-6 rounded-lg shadow-sm">
                  <summary className="font-semibold text-gray-900 cursor-pointer">What's the cancellation policy?</summary>
                  <p className="mt-4 text-gray-600">Choose a flexible policy (e.g., free cancellation until X days before arrival). The exact terms appear on your confirmation and we honor them.</p>
                </details>

                <details className="bg-white p-6 rounded-lg shadow-sm">
                  <summary className="font-semibold text-gray-900 cursor-pointer">How are refunds handled?</summary>
                  <p className="mt-4 text-gray-600">Refunds follow your chosen policy. Card payments are refunded via Stripe; PayPal via PayPal; on-arrival bookings have no capture until check-in (only a pre-auth).</p>
                </details>

                <details className="bg-white p-6 rounded-lg shadow-sm">
                  <summary className="font-semibold text-gray-900 cursor-pointer">Do you issue official receipts/invoices?</summary>
                  <p className="mt-4 text-gray-600">Yes. We email a signed confirmation and official receipt. We can invoice under a company name—just send the billing details.</p>
                </details>

                <details className="bg-white p-6 rounded-lg shadow-sm">
                  <summary className="font-semibold text-gray-900 cursor-pointer">Is my card data secure?</summary>
                  <p className="mt-4 text-gray-600">Card data is processed by Stripe/PayPal on their PCI-compliant systems—we never store card numbers on our servers.</p>
                </details>

                <details className="bg-white p-6 rounded-lg shadow-sm">
                  <summary className="font-semibold text-gray-900 cursor-pointer">Do you take a security deposit?</summary>
                  <p className="mt-4 text-gray-600">Some stays require a refundable deposit or a card hold. If applicable, it's stated clearly on your confirmation and released after check-out inspection.</p>
                </details>

                <details className="bg-white p-6 rounded-lg shadow-sm">
                  <summary className="font-semibold text-gray-900 cursor-pointer">Can I change dates after booking?</summary>
                  <p className="mt-4 text-gray-600">Yes, subject to availability and your chosen policy. Message us and we'll do our best to accommodate.</p>
                </details>
              </div>
            </div>
          </Container>
        </section>

        {/* FINAL CTA */}
        <section className="py-16 bg-white">
          <Container>
            <div className="max-w-4xl mx-auto text-center">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                Ready to Book Direct?
              </h2>
              <p className="text-lg text-gray-600 mb-8">
                Save platform fees, get instant support, and enjoy the best rate guarantee.
              </p>
              <div className="flex flex-col sm:flex-row justify-center gap-4">
                <Link to="/airbnb">
                  <Button className="text-lg px-8 py-4">
                    Check Availability
                  </Button>
                </Link>
                <a 
                  href="https://wa.me/639617928834?text=Hi%20Boracay.house%2C%20I%20want%20to%20book%20direct"
                  target="_blank" 
                  rel="noopener noreferrer"
                >
                  <Button 
                    variant="outline"
                    className="text-lg px-8 py-4"
                  >
                    <MessageCircle className="w-5 h-5 mr-2" />
                    WhatsApp Us
                  </Button>
                </a>
              </div>
            </div>
          </Container>
        </section>
      </div>
      {isPaymentModalOpen && selectedServiceForPayment && (
        <PaymentSelectionModal
          isOpen={isPaymentModalOpen}
          onClose={handlePaymentModalClose}
          orderId={currentOrderId}
          service={selectedServiceForPayment}
          totalAmount={totalAmountForPayment}
          selectedAddons={selectedAddonsForPayment}
          customerName={customerName}
          customerEmail={customerEmail}
          customerWhatsapp={customerWhatsapp}
          initialView="payment_methods"
          paymentMethod={activeTab}
          shouldClearCart={false}
          cartItems={[]} // No cart items for this general payment form
        />
      )}
      {/* Floating "Book and Pay Here" button */}
      {showFloatingButton && (
        <Link 
          to="/payment" 
          className="fixed top-1/2 -translate-y-1/2 left-6 z-50 bg-amber-500 text-white rounded-full px-6 py-3 shadow-xl hover:bg-amber-600 transition-all duration-300 flex items-center justify-center gap-2 text-lg font-bold animate-pumping"
        >
          <DollarSign className="w-6 h-6" />
          Book and Pay Here
        </Link>
      )}
    </>
  );
};

export default BookDirectPage;
