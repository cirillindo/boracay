import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Container from '../components/ui/Container';
import Button from '../components/ui/Button';
import SEO from '../components/SEO';
import { useShoppingCart } from '../context/ShoppingCartContext';
import { Trash2, Plus, Minus, ShoppingCart as ShoppingCartIcon } from 'lucide-react';
import PaymentSelectionModal from '../components/modals/PaymentSelectionModal';
import ProductCarousel from '../components/shared/ProductCarousel';
import axios from 'axios';
import { supabase } from '../lib/supabase';
import { useState } from 'react';

interface Activity {
  id: string;
  name: string;
  hero_image: string;
  price_php: number;
  is_most_sold: boolean;
  is_top_product: boolean;
  category: string;
  min_pax: number;
}

interface Package {
  id: string;
  name: string;
  hero_image: string;
  base_price_php: number;
  is_most_sold: boolean;
  is_top_product: boolean;
  min_pax: number;
}

interface Product {
  id: string;
  name: string;
  hero_image?: string;
  price_php?: number;
  base_price_php?: number;
  is_most_sold: boolean;
  is_top_product: boolean;
  type: 'activity' | 'package';
  min_pax?: number;
  category?: string;
}

const ShoppingCartPage: React.FC = () => {
  const navigate = useNavigate();
  const { cartItems, updateQuantity, removeFromCart, clearCart, getTotalPrice, addToCart } = useShoppingCart();
  const [customerName, setCustomerName] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [customerWhatsapp, setCustomerWhatsapp] = useState('');
  const [isPaymentModalOpen, setIsPaymentModalOpen] = React.useState(false);
  const [currentOrderId, setCurrentOrderId] = React.useState<string | null>(null);
  const [selectedServiceForPayment, setSelectedServiceForPayment] = React.useState<{
    title: string;
    price: string;
    priceUSD: string;
  } | null>(null);
  const [totalAmountForPayment, setTotalAmountForPayment] = React.useState(0);
  const [selectedAddonsForPayment, setSelectedAddonsForPayment] = React.useState<string[]>([]);
  const [bestSellers, setBestSellers] = React.useState<Product[]>([]);
  const [loadingBestSellers, setLoadingBestSellers] = React.useState(false);
  const [creatingOrder, setCreatingOrder] = React.useState(false);
  const [selectedCurrency, setSelectedCurrency] = React.useState('PHP');

  // Validation state
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Promo code state
  const [promoCodeInput, setPromoCodeInput] = useState('');
  const [appliedDiscount, setAppliedDiscount] = useState(0);
  const [promoCodeError, setPromoCodeError] = useState('');
  const [promoCodeSuccess, setPromoCodeSuccess] = useState('');
  const [applyingPromoCode, setApplyingPromoCode] = useState(false);

  // Load best sellers when component mounts
  React.useEffect(() => {
    loadBestSellers();
  }, []);

  const loadBestSellers = async () => {
    try {
      setLoadingBestSellers(true);
      
      // Load best-selling activities
      const { data: activitiesData, error: activitiesError } = await supabase
        .from('activities')
        .select('id, name, hero_image, price_php, is_most_sold, is_top_product, category, min_pax')
        .eq('is_online', true)
        .eq('is_top_product', true);

      if (activitiesError) throw activitiesError;

      // Load best-selling packages
      const { data: packagesData, error: packagesError } = await supabase
        .from('packages')
        .select('id, name, hero_image, base_price_php, is_most_sold, is_top_product, min_pax')
        .eq('is_top_product', true);

      if (packagesError) throw packagesError;

      // Combine and format the data
      const combinedProducts: Product[] = [
        ...(activitiesData || []).map(activity => ({
          ...activity,
          type: 'activity' as const,
          price_php: activity.price_php
        })),
        ...(packagesData || []).map(pkg => ({
          ...pkg,
          type: 'package' as const,
          base_price_php: pkg.base_price_php
        }))
      ];

      setBestSellers(combinedProducts);
    } catch (error) {
      console.error('Error loading best sellers:', error);
    } finally {
      setLoadingBestSellers(false);
    }
  };

  const formatPrice = (price: number): string => {
    return `₱${price.toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  const applyPromoCode = async () => {
    if (!promoCodeInput.trim()) {
      setPromoCodeError('Please enter a promo code');
      return;
    }

    setApplyingPromoCode(true);
    setPromoCodeError('');
    setPromoCodeSuccess('');

    try {
      // Query packages table for matching promo code
      const { data: packageData, error } = await supabase
        .from('packages')
        .select('id, name, promo_discount_percentage')
        .eq('promo_code', promoCodeInput.trim())
        .single();

      if (error || !packageData) {
        setPromoCodeError('Invalid promo code');
        return;
      }

      // Check if the package is in the cart
      const packageInCart = cartItems.find(item => item.id === packageData.id);
      
      if (!packageInCart) {
        setPromoCodeError('This promo code is not applicable to items in your cart');
        return;
      }

      // Check if package has a discount percentage
      if (!packageData.promo_discount_percentage || packageData.promo_discount_percentage <= 0) {
        setPromoCodeError('This promo code is not currently active');
        return;
      }

      // Calculate discount amount for this specific package
      const packageTotal = packageInCart.price * packageInCart.quantity;
      const discountAmount = packageTotal * (packageData.promo_discount_percentage / 100);
      
      setAppliedDiscount(discountAmount);
      setPromoCodeSuccess(`Promo code applied! ${packageData.promo_discount_percentage}% off ${packageData.name}`);
      setPromoCodeError('');
    } catch (error) {
      console.error('Error applying promo code:', error);
      setPromoCodeError('Error applying promo code. Please try again.');
    } finally {
      setApplyingPromoCode(false);
    }
  };

  const removePromoCode = () => {
    setAppliedDiscount(0);
    setPromoCodeInput('');
    setPromoCodeSuccess('');
    setPromoCodeError('');
  };

  const validateCustomerInfo = () => {
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

  const createOrder = async () => {
    if (!validateCustomerInfo()) {
      return null;
    }

    try {
      setCreatingOrder(true);
      
      // Get current user (if logged in)
      const { data: { user } } = await supabase.auth.getUser();
      
      const totalPrice = getTotalPrice() - appliedDiscount;
      
      // Create the order record
      const { data: orderData, error: orderError } = await supabase
        .from('orders')
        .insert({
          user_id: user?.id || null,
          total_amount_php: totalPrice,
          customer_name: customerName.trim(),
          customer_email: customerEmail.trim(),
          customer_whatsapp: customerWhatsapp.trim(),
          status: 'pending',
          payment_method: null, // Will be updated when payment method is selected
        })
        .select()
        .single();
      
      if (orderError) throw orderError;
      
      // Create order items for each cart item
      const orderItems = cartItems.map(item => ({
        order_id: orderData.id,
        item_id: item.id,
        item_type: 'activity', // Assuming all cart items are activities for now
        item_name: item.name,
        quantity: item.quantity,
        price_at_purchase_php: item.price,
        selected_date: item.selectedDate ? new Date(item.selectedDate).toISOString().split('T')[0] : null
      }));
      
      const { error: itemsError } = await supabase
        .from('order_items')
        .insert(orderItems);
      
      if (itemsError) throw itemsError;
      
      return orderData.id;
    } catch (error) {
      console.error('Error creating order:', error);
      alert('Failed to create order. Please try again.');
      return null;
    } finally {
      setCreatingOrder(false);
    }
  };

  const sendOrderConfirmationEmails = async (orderId: string, totalPrice: number) => {
    try {
      const response = await axios.post('/.netlify/functions/send-order-email', {
        orderId,
        customerName,
        customerEmail,
        customerWhatsapp,
        cartItems, // Pass the cart items directly
        totalPrice,
      }, {
        headers: {
          'Content-Type': 'application/json',
        },
        timeout: 30000, // 30 second timeout
      });

      if (response.status === 200) {
        console.log('Emails sent successfully via Netlify Function!');
      } else {
        throw new Error(response.data?.message || 'Failed to send emails via Netlify Function');
      }
    } catch (error) {
      console.error('Failed to send order confirmation emails:', error);
      
      // Show user-friendly error message
      if (axios.isAxiosError(error)) {
        if (error.code === 'ECONNABORTED') {
          console.error('Email sending timed out - but order was created successfully');
        } else if (error.response) {
          console.error('Email service error:', error.response.data);
        } else if (error.request) {
          console.error('Network error while sending emails');
        }
      }
      
      // Don't throw the error - we don't want to block the checkout process
      // The order was already created successfully
    }
  };

  const handleProceedToCheckout = async () => {
    if (!validateCustomerInfo()) {
      return;
    }

    // Create order record first
    const orderId = await createOrder();
    if (!orderId) return;
    
    // Send confirmation emails
    await sendOrderConfirmationEmails(orderId, getTotalPrice() - appliedDiscount);

    setCurrentOrderId(orderId);
    
    const totalPrice = getTotalPrice() - appliedDiscount;
    const totalPriceUSD = totalPrice * 0.0175; // Convert PHP to USD
    
    // Create a list of cart items for display in the modal
    const cartItemsList = cartItems.map(item => 
      `${item.name} (${item.quantity}x)`
    );
    
    setSelectedServiceForPayment({
      title: 'Your Shopping Cart Order',
      price: `₱${totalPrice.toLocaleString()}`,
      priceUSD: `$${totalPriceUSD.toFixed(2)}`
    });
    
    setTotalAmountForPayment(totalPrice);
    setSelectedAddonsForPayment(cartItemsList);
    setIsPaymentModalOpen(true);
  };

  const handlePaymentModalClose = () => {
    setIsPaymentModalOpen(false);
    setCurrentOrderId(null);
  };

  const handleAddToCartFromCarousel = (product: Product) => {
    addToCart({
      id: product.id,
      name: product.name,
      price: product.price_php || product.base_price_php || 0,
      selectedDate: new Date(),
      hero_image: product.hero_image,
      min_pax: product.min_pax,
      type: product.type
    }, product.min_pax || 1);
  };

  const handleViewPackage = (packageId: string) => {
    navigate('/promos'); // Navigate to promos page where packages are displayed
  };

  return (
    <>
      <SEO
        title="Your Shopping Cart – Boracay.House Activities"
        description="Review your selected activities and packages before checkout. Adjust quantities or remove items from your cart."
        keywords="boracay shopping cart, activities cart, boracay booking, checkout"
        ogImage="https://res.cloudinary.com/dq3fftsfa/image/upload/v1750524212/Boracay_activities_map_tfdy1l.png"
        url="https://boracay.house/cart"
        type="website"
      />

      <div className="min-h-screen bg-white">
        <div className="h-32" /> {/* Spacer for fixed navbar */}

        <Container className="py-16">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-8 text-center">
            Your Shopping Cart
          </h1>

          {cartItems.length === 0 ? (
            <div className="text-center py-16">
              <ShoppingCartIcon className="w-24 h-24 text-gray-300 mx-auto mb-6" />
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                Your cart is empty
              </h2>
              <p className="text-gray-600 mb-8">
                Looks like you haven't added any activities yet.
              </p>
              <Link to="/activities">
                <Button>Browse Activities</Button>
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 space-y-6">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-2xl font-bold text-gray-900">Your Items</h2>
                  <Link to="/activities">
                    <Button variant="outline" className="flex items-center gap-2">
                      ← Back to Activities
                    </Button>
                  </Link>
                </div>
                
                {cartItems.map(item => (
                  <div key={item.id} className="flex items-center bg-gray-50 rounded-lg shadow-sm p-4">
                    <img
                      src={item.hero_image || 'https://res.cloudinary.com/dq3fftsfa/image/upload/v1747143041/Boracay_sunset_afw4zm.jpg'}
                      alt={item.name}
                      className="w-24 h-24 object-cover rounded-md mr-4 flex-shrink-0"
                    />
                    <div className="flex-grow">
                      <h3 className="text-lg font-semibold text-gray-900">{item.name}</h3>
                      <p className="text-sm text-gray-600">
                        {item.selectedDate ? new Date(item.selectedDate).toLocaleDateString() : 'No date selected'}
                      </p>
                      <p className="text-sm text-gray-600">Price: {formatPrice(item.price)}</p>
                    </div>
                    <div className="flex items-center space-x-2 flex-shrink-0">
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        className="p-2 rounded-full bg-white hover:bg-gray-100 border border-gray-200"
                      >
                        <Minus className="w-4 h-4 text-gray-600" />
                      </button>
                      <span className="font-medium text-gray-900 w-8 text-center">{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        className="p-2 rounded-full bg-white hover:bg-gray-100 border border-gray-200"
                      >
                        <Plus className="w-4 h-4 text-gray-600" />
                      </button>
                      <button
                        onClick={() => removeFromCart(item.id)}
                        className="p-2 rounded-full bg-red-100 hover:bg-red-200 text-red-600"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              <div className="lg:col-span-1">
                <div className="bg-white rounded-lg shadow-lg p-6 sticky top-32">
                  <h2 className="text-2xl font-bold text-gray-900 mb-4">Order Summary</h2>
                  
                  {/* Customer Information Form */}
                  <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Your Information</h3>
                    <div className="space-y-4">
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
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          WhatsApp Number *
                        </label>
                        <input
                          type="tel"
                          value={customerWhatsapp}
                          onChange={(e) => setCustomerWhatsapp(e.target.value.replace(/\D/g, ''))}
                          className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500 ${
                            errors.customerWhatsapp ? 'border-red-500' : 'border-gray-300'
                          }`}
                          placeholder="Enter numbers only (7-15 digits)"
                        />
                        {errors.customerWhatsapp && (
                          <p className="mt-1 text-sm text-red-600">{errors.customerWhatsapp}</p>
                        )}
                        <p className="mt-1 text-xs text-gray-500">
                          Enter only numbers (7-15 digits)
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Promo Code Section */}
                  <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Promo Code</h3>
                    <div className="space-y-3">
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={promoCodeInput}
                          onChange={(e) => setPromoCodeInput(e.target.value.toUpperCase())}
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500"
                          placeholder="Enter promo code"
                          disabled={appliedDiscount > 0}
                        />
                        {appliedDiscount > 0 ? (
                          <Button
                            type="button"
                            onClick={removePromoCode}
                            variant="outline"
                            className="text-red-600 border-red-300 hover:bg-red-50"
                          >
                            Remove
                          </Button>
                        ) : (
                          <Button
                            type="button"
                            onClick={applyPromoCode}
                            disabled={applyingPromoCode || !promoCodeInput.trim()}
                            className="whitespace-nowrap"
                          >
                            {applyingPromoCode ? 'Applying...' : 'Apply'}
                          </Button>
                        )}
                      </div>
                      
                      {promoCodeError && (
                        <p className="text-sm text-red-600">{promoCodeError}</p>
                      )}
                      
                      {promoCodeSuccess && (
                        <p className="text-sm text-green-600">{promoCodeSuccess}</p>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex justify-between items-center mb-4">
                    <span className="text-gray-700">Total Items:</span>
                    <span className="font-semibold text-gray-900">{cartItems.length}</span>
                  </div>
                  
                  {appliedDiscount > 0 && (
                    <div className="flex justify-between items-center mb-4">
                      <span className="text-green-700">Discount Applied:</span>
                      <span className="font-semibold text-green-700">-{formatPrice(appliedDiscount)}</span>
                    </div>
                  )}
                  
                  <div className="flex justify-between items-center mb-6">
                    <span className="text-xl font-bold text-gray-900">Grand Total:</span>
                    <span className="text-2xl font-bold text-amber-600">{formatPrice(getTotalPrice() - appliedDiscount)}</span>
                  </div>
                  <Button
                    onClick={handleProceedToCheckout}
                    disabled={creatingOrder}
                    className="w-full mb-3"
                  >
                    {creatingOrder ? 'Creating Order...' : 'Proceed to Checkout'}
                  </Button>
                  <Link to="/activities">
                    <Button
                      variant="outline"
                      className="w-full mb-3"
                    >
                      Add More Activities
                    </Button>
                  </Link>
                  <Button
                    onClick={clearCart}
                    variant="outline"
                    className="w-full text-red-600 border-red-300 hover:bg-red-50"
                  >
                    Clear Cart
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* Best Sellers Section */}
          {cartItems.length > 0 && bestSellers.length > 0 && (
            <div className="mt-16">
              <ProductCarousel
                products={bestSellers}
                onAddToCart={handleAddToCartFromCarousel}
                onViewPackage={handleViewPackage}
                selectedCurrency={selectedCurrency}
              />
            </div>
          )}
        </Container>
      </div>

      {/* Payment Selection Modal */}
      {selectedServiceForPayment && (
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
          shouldClearCart={true}
          cartItems={cartItems}
        />
      )}
    </>
  );
};

export default ShoppingCartPage;