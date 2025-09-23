import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Home, BookOpen, Star, Activity, Package, ShoppingCart, Bed, Users, ClipboardList, Droplets, ListTodo, CalendarCheck, LayoutDashboard, CalendarDays, Trophy, Phone, DollarSign } from 'lucide-react';
import { useBidNotification } from '../../context/BidNotificationContext'; // NEW: Import useBidNotification

const AdminHomeDashboard: React.FC = () => {
  const { hasNewBids, setHasNewBids } = useBidNotification(); // NEW: Use the context hook

  // No need for useEffect for subscription here anymore, it's in the context provider

  const dashboardItems = [
    // Keep: Checkins (first position)
    { title: 'Check-ins', icon: <CalendarCheck className="w-8 h-8 text-blue-600" />, link: '/admin/checkins', description: 'Manage guest check-ins', mobileHidden: false },
    // NEW: Schedule button
    { title: 'Schedule', icon: <CalendarDays className="w-8 h-8 text-purple-600" />, link: '/admin/schedule', description: 'Manage staff schedules', mobileHidden: false },
    // Keep: Dashboard
    { title: 'Dashboard', icon: <LayoutDashboard className="w-8 h-8 text-gray-600" />, link: '/admin', description: 'Overview of admin features', mobileHidden: false },
    // Keep: Orders
    { title: 'Orders', icon: <ShoppingCart className="w-8 h-8 text-indigo-600" />, link: '/admin/orders', description: 'View and process customer orders', mobileHidden: false },
    // Keep: Rooms
    { title: 'Rooms', icon: <Bed className="w-8 h-8 text-pink-600" />, link: '/admin/rooms', description: 'Manage room details', mobileHidden: false },
    // Keep: Staff
    { title: 'Staff', icon: <Users className="w-8 h-8 text-teal-600" />, link: '/admin/staff', description: 'Manage staff profiles', mobileHidden: false },
    // Keep: Checklists
    { title: 'Checklists', icon: <ClipboardList className="w-8 h-8 text-orange-600" />, link: '/admin/checklists', description: 'Review room checklists', mobileHidden: false },
    // Removed: { title: 'Checklists 2', icon: <ClipboardList className="w-8 h-8 text-purple-600" />, link: '/admin/checklists2', description: 'View all checklists (Admin)', mobileHidden: false },
    // Keep: Pool Cleaning
    { title: 'Pool Cleaning', icon: <Droplets className="w-8 h-8 text-cyan-600" />, link: '/admin/pool-cleaning', description: 'Manage pool maintenance records', mobileHidden: false },
    // Keep: To-Dos
    { title: 'To-Dos', icon: <ListTodo className="w-8 h-8 text-lime-600" />, link: '/admin/todos', description: 'Assign and track staff tasks', mobileHidden: false },
    // Keep: Important Numbers
    { title: 'Important Numbers', icon: <Phone className="w-8 h-8 text-blue-500" />, link: '/admin/important-numbers', description: 'Access and manage important contact numbers', mobileHidden: false },
    // Keep: Staff Bonuses
    { title: 'Staff Bonuses', icon: <DollarSign className="w-8 h-8 text-yellow-500" />, link: '/admin/staff-bonuses', description: 'Manage staff bonus records', mobileHidden: false },
    // NEW: Dream Bids
    { title: 'Dream Bids', icon: <Trophy className="w-8 h-8 text-amber-500" />, link: '/admin/bids', description: 'View and manage dream bid submissions', mobileHidden: false, hasIndicator: true },

    // Remove from mobile: Properties
    { title: 'Properties', icon: <Home className="w-8 h-8 text-amber-600" />, link: '/admin/properties', description: 'Manage property listings', mobileHidden: true },
    // Remove from mobile: Blog Posts
    { title: 'Blog Posts', icon: <BookOpen className="w-8 h-8 text-blue-600" />, link: '/admin/blog', description: 'Create and edit blog content', mobileHidden: true },
    // Remove from mobile: Guest Reviews
    { title: 'Guest Reviews', icon: <Star className="w-8 h-8 text-purple-600" />, link: '/admin/reviews', description: 'Manage customer testimonials', mobileHidden: true },
    // Remove from mobile: Activities
    { title: 'Activities', icon: <Activity className="w-8 h-8 text-green-600" />, link: '/admin/activities', description: 'Manage bookable activities', mobileHidden: true },
    // Remove from mobile: Packages
    { title: 'Packages', icon: <Package className="w-8 h-8 text-red-600" />, link: '/admin/packages', description: 'Manage activity packages', mobileHidden: true },
  ];

  return (
    <div className="text-center py-12">
      <h2 className="text-2xl font-bold text-gray-900 mb-4">Welcome to Admin Dashboard</h2>
      <p className="text-gray-600 mb-8">
        Select a section to manage your data.
      </p>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
        {dashboardItems.map((item, index) => (
          <Link
            key={index}
            to={item.link}
            onClick={() => {
              if (item.hasIndicator) {
                setHasNewBids(false); // Reset indicator when Dream Bids is clicked
              }
            }}
            className={`bg-white border-2 border-gray-200 rounded-xl p-6 hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1 flex flex-col items-center justify-center ${item.mobileHidden ? 'hidden sm:flex' : ''}`}
          >
            <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 relative">
              {item.icon}
              {item.hasIndicator && hasNewBids && ( /* Apply the new animation class */
                <span className="absolute top-0 right-0 block h-4 w-4 rounded-full ring-2 ring-white bg-red-500 animate-ping-and-stay"></span>
              )}
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">{item.title}</h3>
            <p className="text-gray-600 text-sm">{item.description}</p>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default AdminHomeDashboard;
