import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { Eye, Package, Calendar, User, Mail, Phone, CreditCard, Clock, CheckCircle, XCircle, AlertCircle, Trash2, ExternalLink, Image, Copy, Check } from 'lucide-react';
import Button from '../ui/Button';

interface Order {
  id: string;
  user_id: string | null;
  total_amount_php: number;
  currency: string | null;
  status: string;
  payment_method: string | null;
  payment_reference: string | null;
  customer_email: string | null;
  customer_name: string | null;
  customer_whatsapp: string | null;
  notes: string | null;
  description: string | null;
  created_at: string;
  updated_at: string;
  payment_slip_url: string | null;
}

interface OrderItem {
  id: string;
  order_id: string;
  item_id: string;
  item_type: string;
  item_name: string;
  quantity: number;
  price_at_purchase_php: number;
  selected_date: string | null;
  created_at: string;
}

const OrderList: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [orderItems, setOrderItems] = useState<OrderItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingItems, setLoadingItems] = useState(false);
  const [error, setError] = useState('');
  const [showOrderDetails, setShowOrderDetails] = useState(false);
  const [copiedEmail, setCopiedEmail] = useState(false);
  const [isMobile, setIsMobile] = useState(false); // State for mobile view

  useEffect(() => {
    // Detect mobile view on mount and resize
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768); // Tailwind's 'md' breakpoint
    };

    handleResize(); // Set initial value
    window.addEventListener('resize', handleResize); // Add event listener
    return () => window.removeEventListener('resize', handleResize); // Clean up
  }, []);

  useEffect(() => {
    loadOrders();
  }, []);

  const loadOrders = async () => {
    try {
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setOrders(data || []);
    } catch (err) {
      setError('Error loading orders');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const loadOrderItems = async (orderId: string) => {
    try {
      setLoadingItems(true);
      const { data, error } = await supabase
        .from('order_items')
        .select('*')
        .eq('order_id', orderId)
        .order('created_at', { ascending: true });

      if (error) throw error;
      setOrderItems(data || []);
    } catch (err) {
      console.error('Error loading order items:', err);
      setOrderItems([]);
    } finally {
      setLoadingItems(false);
    }
  };

  const handleViewOrder = async (order: Order) => {
    setSelectedOrder(order);
    setShowOrderDetails(true);
    await loadOrderItems(order.id);
  };

  const updateOrderStatus = async (orderId: string, newStatus: string) => {
    try {
      const { error } = await supabase
        .from('orders')
        .update({ status: newStatus, updated_at: new Date().toISOString() })
        .eq('id', orderId);

      if (error) throw error;
      
      // Refresh orders list
      loadOrders();
      
      // Update selected order if it's the one being updated
      if (selectedOrder && selectedOrder.id === orderId) {
        setSelectedOrder({ ...selectedOrder, status: newStatus });
      }
    } catch (err) {
      console.error('Error updating order status:', err);
      alert('Failed to update order status');
    }
  };

  const handleDelete = async (orderId: string) => {
    if (!window.confirm('Are you sure you want to delete this order? This action cannot be undone.')) {
      return;
    }

    try {
      const { error } = await supabase
        .from('orders')
        .delete()
        .eq('id', orderId);

      if (error) throw error;
      
      // Refresh orders list
      loadOrders();
      
      // Close modal if the deleted order was being viewed
      if (selectedOrder && selectedOrder.id === orderId) {
        setShowOrderDetails(false);
        setSelectedOrder(null);
      }
    } catch (err) {
      console.error('Error deleting order:', err);
      alert('Failed to delete order');
    }
  };

  const handleCopyEmail = async (email: string) => {
    try {
      await navigator.clipboard.writeText(email);
      setCopiedEmail(true);
      setTimeout(() => setCopiedEmail(false), 2000);
    } catch (err) {
      console.error('Failed to copy email:', err);
    }
  };

  const formatPrice = (price: number): string => {
    return `₱${price.toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  const formatPriceWithCurrency = (price: number, currency: string = 'PHP'): string => {
    // Handle undefined/null price values
    const safePrice = price ?? 0;
    
    const currencySymbols: { [key: string]: string } = {
      'EUR': '€',
      'USD': '$',
      'PHP': '₱',
      'CNY': '¥',
      'KRW': '₩',
      'RUB': '₽',
      'SGD': 'S$',
      'AUD': 'A$'
    };
    
    // Conversion rates from EUR (base currency) to other currencies
    const conversionRates: { [key: string]: number } = {
      'EUR': 1,
      'USD': 1.08,
      'PHP': 60.50,
      'CNY': 7.85,
      'KRW': 1450.25,
      'RUB': 98.50,
      'SGD': 1.45,
      'AUD': 1.65
    };
    
    // Convert from EUR (stored value) to display currency
    const rate = conversionRates[currency] || 1;
    const convertedPrice = safePrice * rate;
    
    const symbol = currencySymbols[currency] || currency;
    return `${symbol}${convertedPrice.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      timeZone: 'Asia/Manila'
    });
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
      case 'paid':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'cancelled':
        return <XCircle className="w-5 h-5 text-red-500" />;
      case 'pending_manual_review':
        return <AlertCircle className="w-5 h-5 text-yellow-500" />;
      default:
        return <Clock className="w-5 h-5 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
      case 'paid':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      case 'pending_manual_review':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-amber-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 text-red-600 p-4 rounded-md">
        {error}
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Orders</h2>
        <div className="text-sm text-gray-500">
          Total Orders: {orders.length}
        </div>
      </div>

      {isMobile ? (
        // Mobile Card View
        <div className="p-4 space-y-4">
          {orders.map((order) => (
            <div key={order.id} className="bg-gray-50 p-4 rounded-lg shadow-sm border border-gray-200">
              <div className="flex justify-between items-center mb-3">
                <h3 className="text-base font-bold text-gray-900">Order ID: {order.id.slice(0, 8)}...</h3>
                <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                  {getStatusIcon(order.status)}
                  {order.status.replace('_', ' ')}
                </span>
              </div>

              <div className="text-sm text-gray-700 space-y-2 mb-4">
                <div><strong>Customer:</strong> {order.customer_name || 'N/A'}</div>
                <div><strong>Email:</strong> {order.customer_email || 'N/A'}</div>
                <div><strong>WhatsApp:</strong> {order.customer_whatsapp || 'N/A'}</div>
                <div><strong>Amount:</strong> {formatPriceWithCurrency(order.total_amount_php, order.currency || 'EUR')}</div>
                <div><strong>Payment Method:</strong> {order.payment_method || 'N/A'}</div>
                <div><strong>Date:</strong> {formatDate(order.created_at)}</div>
                {order.description && (
                  <div><strong>Description:</strong> {order.description}</div>
                )}
              </div>

              <div className="flex justify-end space-x-2 pt-3 border-t border-gray-200">
                <button
                  onClick={() => handleViewOrder(order)}
                  className="p-2 text-amber-600 hover:text-amber-900"
                  title="View order details"
                >
                  <Eye className="w-5 h-5" />
                </button>
                <button
                  onClick={() => handleDelete(order.id)}
                  className="p-2 text-red-600 hover:text-red-900"
                  title="Delete order"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        // Desktop Table View
        <div className="bg-white shadow-md rounded-lg overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Order ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Customer
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Total Amount
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Payment Method
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {orders.map((order) => (
                <tr key={order.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-mono text-gray-900">
                      {order.id.slice(0, 8)}...
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {order.customer_name || 'N/A'}
                        </div>
                        <div className="text-sm text-gray-500">
                          {order.customer_email || 'N/A'}
                        </div>
                        {order.customer_whatsapp && (
                          <div className="text-sm text-gray-500">
                            📱 {order.customer_whatsapp}
                          </div>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {formatPriceWithCurrency(order.total_amount_php, order.currency || 'EUR')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      {getStatusIcon(order.status)}
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(order.status)}`}>
                        {order.status.replace('_', ' ')}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {order.payment_method ? (
                      <div className="flex items-center gap-1">
                        <CreditCard className="w-4 h-4" />
                        {order.payment_method}
                      </div>
                    ) : (
                      'N/A'
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {formatDate(order.created_at)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex justify-end space-x-2">
                      <button
                        onClick={() => handleViewOrder(order)}
                        className="text-amber-600 hover:text-amber-900"
                        title="View order details"
                      >
                        <Eye className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => handleDelete(order.id)}
                        className="text-red-600 hover:text-red-900"
                        title="Delete order"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Order Details Modal */}
      {showOrderDetails && selectedOrder && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4">
            <div className="fixed inset-0 bg-black bg-opacity-50" onClick={() => setShowOrderDetails(false)} />
            
            <div className="relative bg-white rounded-xl shadow-2xl max-w-6xl w-full mx-auto transform transition-all">
              <div className="bg-gradient-to-r from-amber-500 to-amber-600 text-white p-6 rounded-t-xl">
                <div className="flex justify-between items-start">
                  <div>
                    <h2 className="text-2xl font-bold">Order Details</h2>
                    <p className="text-amber-100">Order ID: {selectedOrder.id}</p>
                  </div>
                  <button
                    onClick={() => setShowOrderDetails(false)}
                    className="text-white hover:text-gray-200 transition-colors"
                  >
                    ✕
                  </button>
                </div>
              </div>

              <div className="p-6 overflow-y-auto">
                {/* Customer Information */}
                <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <User className="w-5 h-5" />
                    Customer Information
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex items-center gap-2">
                      <User className="w-4 h-4 text-gray-500" />
                      <span className="font-medium">Name:</span>
                      <span>{selectedOrder.customer_name || 'N/A'}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Mail className="w-4 h-4 text-gray-500" />
                      <span className="font-medium">Email:</span>
                      <span className="flex items-center gap-2">
                        {selectedOrder.customer_email || 'N/A'}
                        {selectedOrder.customer_email && (
                          <button
                            onClick={() => handleCopyEmail(selectedOrder.customer_email!)}
                            className="p-1 hover:bg-gray-100 rounded transition-colors"
                            title="Copy email"
                          >
                            {copiedEmail ? (
                              <Check className="w-4 h-4 text-green-500" />
                            ) : (
                              <Copy className="w-4 h-4 text-gray-500" />
                            )}
                          </button>
                        )}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Phone className="w-4 h-4 text-gray-500" />
                      <span className="font-medium">WhatsApp:</span>
                      <span>{selectedOrder.customer_whatsapp || 'N/A'}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-gray-500" />
                      <span className="font-medium">Order Date:</span>
                      <span>{formatDate(selectedOrder.created_at)}</span>
                    </div>
                  </div>
                </div>

                {/* Order Summary */}
                <div className="mb-6 p-4 bg-amber-50 rounded-lg">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <Package className="w-5 h-5" />
                    Order Summary
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <span className="font-medium">Total Amount:</span>
                      <div className="text-xl font-bold text-amber-600">
                        {formatPriceWithCurrency(selectedOrder.total_amount_php, selectedOrder.currency || 'EUR')}
                      </div>
                    </div>
                    <div>
                      <span className="font-medium">Status:</span>
                      <div className="flex items-center gap-2 mt-1">
                        {getStatusIcon(selectedOrder.status)}
                        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(selectedOrder.status)}`}>
                          {selectedOrder.status.replace('_', ' ')}
                        </span>
                      </div>
                    </div>
                    <div>
                      <span className="font-medium">Payment Method:</span>
                      <div className="flex items-center gap-1 mt-1">
                        <CreditCard className="w-4 h-4" />
                        {selectedOrder.payment_method || 'N/A'}
                      </div>
                    </div>
                  </div>
                  {selectedOrder.description && (
                    <div className="mt-4 pt-4 border-t border-amber-200">
                      <span className="font-medium">Payment Description:</span>
                      <div className="mt-1 text-gray-700">
                        {selectedOrder.description}
                      </div>
                    </div>
                  )}
                </div>

                {/* Order Items */}
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Order Items</h3>
                  {loadingItems ? (
                    <div className="flex justify-center py-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-amber-500"></div>
                    </div>
                  ) : orderItems.length > 0 ? (
                    <div className="space-y-3">
                      {orderItems.map((item) => (
                        <div key={item.id} className="border border-gray-200 rounded-lg p-4">
                          <div className="flex justify-between items-start">
                            <div className="flex-1">
                              <h4 className="font-medium text-gray-900">{item.item_name}</h4>
                              <div className="text-sm text-gray-500 mt-1">
                                <span className="inline-block bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs mr-2">
                                  {item.item_type}
                                </span>
                                Quantity: {item.quantity}
                                {item.selected_date && (
                                  <span className="ml-4">
                                    📅 {new Date(item.selected_date).toLocaleDateString()}
                                  </span>
                                )}
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="font-medium text-gray-900">
                                {formatPrice(item.price_at_purchase_php)}
                              </div>
                              <div className="text-sm text-gray-500">
                                per item
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-500 text-center py-8">No items found for this order.</p>
                  )}
                </div>

                {/* Order Status Management */}
                {selectedOrder.status !== 'completed' && selectedOrder.status !== 'cancelled' && (
                  <div className="mb-6 p-4 bg-blue-50 rounded-lg">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Update Order Status</h3>
                    <div className="flex gap-2">
                      <Button
                        onClick={() => updateOrderStatus(selectedOrder.id, 'completed')}
                        className="bg-green-600 hover:bg-green-700 text-white"
                      >
                        Mark as Completed
                      </Button>
                      <Button
                        onClick={() => updateOrderStatus(selectedOrder.id, 'cancelled')}
                        variant="outline"
                        className="border-red-300 text-red-600 hover:bg-red-50"
                      >
                        Cancel Order
                      </Button>
                    </div>
                  </div>
                )}

                {/* Payment Reference */}
                {selectedOrder.payment_reference && (
                  <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Payment Reference</h3>
                    <p className="text-sm text-gray-600 font-mono">
                      {selectedOrder.payment_reference}
                    </p>
                  </div>
                )}

                {/* Payment Slip */}
                {selectedOrder.payment_slip_url && (
                  <div className="mb-6 p-4 bg-blue-50 rounded-lg">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                      <Image className="w-5 h-5" />
                      Payment Slip
                    </h3>
                    <div className="flex items-center gap-4">
                      <a
                        href={selectedOrder.payment_slip_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
                      >
                        <ExternalLink className="w-4 h-4" />
                        View Payment Slip
                      </a>
                      <div className="text-sm text-gray-600">
                        Click to view the uploaded payment confirmation
                      </div>
                    </div>
                    <div className="mt-4">
                      <img
                        src={selectedOrder.payment_slip_url}
                        alt="Payment Slip"
                        className="max-w-full h-auto max-h-96 rounded-lg border border-gray-200 shadow-sm"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.style.display = 'none';
                        }}
                      />
                    </div>
                  </div>
                )}
                {/* Notes */}
                {selectedOrder.notes && (
                  <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Notes</h3>
                    <p className="text-sm text-gray-600">
                      {selectedOrder.notes}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrderList;
