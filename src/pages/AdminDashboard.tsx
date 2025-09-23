import React from 'react';
import { Routes, Route, Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import Container from '../components/ui/Container';
import Button from '../components/ui/Button';
import { PropertyForm } from '../components/admin/PropertyForm';
import PropertyList from '../components/admin/PropertyList';
import ActivityForm from '../components/admin/ActivityForm';
import ActivityList from '../components/admin/ActivityList';
import PackageForm from '../components/admin/PackageForm';
import PackageList from '../components/admin/PackageList';
import BlogPostForm from '../components/admin/BlogPostForm';
import BlogPostList from '../components/admin/BlogPostList';
import GuestReviewForm from '../components/admin/GuestReviewForm';
import GuestReviewList from '../components/admin/GuestReviewList';
import OrderList from '../components/admin/OrderList';
import RoomForm from '../components/admin/RoomForm';
import RoomList from '../components/admin/RoomList';
import StaffForm from '../components/admin/StaffForm';
import StaffList from '../components/admin/StaffList';
import ChecklistList from '../components/staff/ChecklistList';
import PoolCleaningList from '../components/staff/PoolCleaningList';
import TodoForm from '../components/admin/TodoForm';
import TodoList from '../components/admin/TodoList';
import CheckinForm from '../components/admin/CheckinForm';
import CheckinList from '../components/shared/CheckinList';
// Import the new components from the shared folder
import ImportantNumbersList from '../components/shared/ImportantNumbersList';
import ImportantNumberForm from '../components/shared/ImportantNumberForm';
// Import the new ScheduleCalendar component
import ScheduleCalendar from '../components/admin/ScheduleCalendar';
// Import the new StaffBonusList and StaffBonusForm components
import StaffBonusList from '../components/admin/StaffBonusList';
import StaffBonusForm from '../components/admin/StaffBonusForm';
import AdminHomeDashboard from '../components/admin/AdminHomeDashboard';
import BidList from '../components/admin/BidList'; // NEW: Import BidList

import { Home, BookOpen, Star, Activity, Package, ShoppingCart, Bed, Users, ClipboardList, Droplets, ListTodo, LayoutDashboard, CalendarCheck, Phone, CalendarDays, DollarSign, Trophy } from 'lucide-react'; // Added Trophy icon

const AdminDashboard: React.FC = () => {
  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="h-32" />
      <div className="pb-20">
        <Container>
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
            <Button onClick={handleLogout} variant="outline">
              Logout
            </Button>
          </div>

          <div className="mb-8">
            <nav className="flex flex-col space-y-2 md:flex-row md:flex-wrap md:gap-x-4 md:gap-y-2 pb-2">
              {/* NEW MOBILE-ONLY DASHBOARD BUTTON */}
              <Link
                to="/admin"
                className="w-full sm:w-auto flex-shrink-0 text-center px-4 py-3 rounded-lg font-semibold transition-all duration-300 focus:outline-none border-2 border-gray-200 text-gray-700 hover:bg-amber-50 hover:border-amber-300 hover:text-amber-700 shadow-sm hover:shadow-md flex items-center justify-center gap-2 whitespace-nowrap sm:hidden"
              >
                <LayoutDashboard className="w-5 h-5" />
                Dashboard
              </Link>

              {/* Check-ins (now visible on mobile) */}
              <Link
                to="/admin/checkins"
                className="w-full sm:w-auto flex-shrink-0 text-center px-4 py-3 rounded-lg font-semibold transition-all duration-300 focus:outline-none border-2 border-gray-200 text-gray-700 hover:bg-amber-50 hover:border-amber-300 hover:text-amber-700 shadow-sm hover:shadow-md flex items-center justify-center gap-2 whitespace-nowrap"
              >
                <CalendarCheck className="w-5 h-5" />
                Check-ins
              </Link>

              {/* Schedule (NEW LINK) */}
              <Link
                to="/admin/schedule"
                className="w-full sm:w-auto flex-shrink-0 text-center px-4 py-3 rounded-lg font-semibold transition-all duration-300 focus:outline-none border-2 border-gray-200 text-gray-700 hover:bg-amber-50 hover:border-amber-300 hover:text-amber-700 shadow-sm hover:shadow-md flex items-center justify-center gap-2 whitespace-nowrap"
              >
                <CalendarDays className="w-5 h-5" />
                Schedule
              </Link>

              {/* Dashboard (hidden on mobile, visible on desktop) */}
              <Link
                to="/admin"
                className="w-full sm:w-auto flex-shrink-0 text-center px-4 py-3 rounded-lg font-semibold transition-all duration-300 focus:outline-none border-2 border-gray-200 text-gray-700 hover:bg-amber-50 hover:border-amber-300 hover:text-amber-700 shadow-sm hover:shadow-md flex items-center justify-center gap-2 whitespace-nowrap hidden sm:flex"
              >
                <LayoutDashboard className="w-5 h-5" />
                Dashboard
              </Link>

              {/* Orders (visible on mobile) */}
              <Link
                to="/admin/orders"
                className="w-full sm:w-auto flex-shrink-0 text-center px-4 py-3 rounded-lg font-semibold transition-all duration-300 focus:outline-none border-2 border-gray-200 text-gray-700 hover:bg-amber-50 hover:border-amber-300 hover:text-amber-700 shadow-sm hover:shadow-md flex items-center justify-center gap-2 whitespace-nowrap"
              >
                <ShoppingCart className="w-5 h-5" />
                Orders
              </Link>

              {/* Rooms (visible on mobile) */}
              <Link
                to="/admin/rooms"
                className="w-full sm:w-auto flex-shrink-0 text-center px-4 py-3 rounded-lg font-semibold transition-all duration-300 focus:outline-none border-2 border-gray-200 text-gray-700 hover:bg-amber-50 hover:border-amber-300 hover:text-amber-700 shadow-sm hover:shadow-md flex items-center justify-center gap-2 whitespace-nowrap"
              >
                <Bed className="w-5 h-5" />
                Rooms
              </Link>

              {/* Staff (visible on mobile) */}
              <Link
                to="/admin/staff"
                className="w-full sm:w-auto flex-shrink-0 text-center px-4 py-3 rounded-lg font-semibold transition-all duration-300 focus:outline-none border-2 border-gray-200 text-gray-700 hover:bg-amber-50 hover:border-amber-300 hover:text-amber-700 shadow-sm hover:shadow-md flex items-center justify-center gap-2 whitespace-nowrap"
              >
                <Users className="w-5 h-5" />
                Staff
              </Link>

              {/* Checklists (visible on mobile) */}
              <Link
                to="/admin/checklists"
                className="w-full sm:w-auto flex-shrink-0 text-center px-4 py-3 rounded-lg font-semibold transition-all duration-300 focus:outline-none border-2 border-gray-200 text-gray-700 hover:bg-amber-50 hover:border-amber-300 hover:text-amber-700 shadow-sm hover:shadow-md flex items-center justify-center gap-2 whitespace-nowrap"
              >
                <ClipboardList className="w-5 h-5" />
                Checklists
              </Link>

              {/* Pool Cleaning (visible on mobile) */}
              <Link
                to="/admin/pool-cleaning"
                className="w-full sm:w-auto flex-shrink-0 text-center px-4 py-3 rounded-lg font-semibold transition-all duration-300 focus:outline-none border-2 border-gray-200 text-gray-700 hover:bg-amber-50 hover:border-amber-300 hover:text-amber-700 shadow-sm hover:shadow-md flex items-center justify-center gap-2 whitespace-nowrap"
              >
                <Droplets className="w-5 h-5" />
                Pool Cleaning
              </Link>

              {/* To-Dos (visible on mobile) */}
              <Link
                to="/admin/todos"
                className="w-full sm:w-auto flex-shrink-0 text-center px-4 py-3 rounded-lg font-semibold transition-all duration-300 focus:outline-none border-2 border-gray-200 text-gray-700 hover:bg-amber-50 hover:border-amber-300 hover:text-amber-700 shadow-sm hover:shadow-md flex items-center justify-center gap-2 whitespace-nowrap"
              >
                <ListTodo className="w-5 h-5" />
                To-Dos
              </Link>

              {/* Important Numbers (NEW BUTTON) */}
              <Link
                to="/admin/important-numbers"
                className="w-full sm:w-auto flex-shrink-0 text-center px-4 py-3 rounded-lg font-semibold transition-all duration-300 focus:outline-none border-2 border-gray-200 text-gray-700 hover:bg-amber-50 hover:border-amber-300 hover:text-amber-700 shadow-sm hover:shadow-md flex items-center justify-center gap-2 whitespace-nowrap"
              >
                <Phone className="w-5 h-5" />
                Important Numbers
              </Link>

              {/* Staff Bonuses (NEW BUTTON) */}
              <Link
                to="/admin/staff-bonuses"
                className="w-full sm:w-auto flex-shrink-0 text-center px-4 py-3 rounded-lg font-semibold transition-all duration-300 focus:outline-none border-2 border-gray-200 text-gray-700 hover:bg-amber-50 hover:border-amber-300 hover:text-amber-700 shadow-sm hover:shadow-md flex items-center justify-center gap-2 whitespace-nowrap"
              >
                <DollarSign className="w-5 h-5" />
                Staff Bonuses
              </Link>

              {/* Dream Bids (NEW BUTTON) */}
              <Link
                to="/admin/bids"
                className="w-full sm:w-auto flex-shrink-0 text-center px-4 py-3 rounded-lg font-semibold transition-all duration-300 focus:outline-none border-2 border-gray-200 text-gray-700 hover:bg-amber-50 hover:border-amber-300 hover:text-amber-700 shadow-sm hover:shadow-md flex items-center justify-center gap-2 whitespace-nowrap"
              >
                <Trophy className="w-5 h-5" />
                Dream Bids
              </Link>

              {/* Properties (hidden on mobile, visible on desktop) */}
              <Link
                to="/admin/properties"
                className="w-full sm:w-auto flex-shrink-0 text-center px-4 py-3 rounded-lg font-semibold transition-all duration-300 focus:outline-none border-2 border-gray-200 text-gray-700 hover:bg-amber-50 hover:border-amber-300 hover:text-amber-700 shadow-sm hover:shadow-md flex items-center justify-center gap-2 whitespace-nowrap hidden sm:flex"
              >
                <Home className="w-5 h-5" />
                Properties
              </Link>

              {/* Blog Posts (hidden on mobile, visible on desktop) */}
              <Link
                to="/admin/blog"
                className="w-full sm:w-auto flex-shrink-0 text-center px-4 py-3 rounded-lg font-semibold transition-all duration-300 focus:outline-none border-2 border-gray-200 text-gray-700 hover:bg-amber-50 hover:border-amber-300 hover:text-amber-700 shadow-sm hover:shadow-md flex items-center justify-center gap-2 whitespace-nowrap hidden sm:flex"
              >
                <BookOpen className="w-5 h-5" />
                Blog Posts
              </Link>

              {/* Guest Reviews (hidden on mobile, visible on desktop) */}
              <Link
                to="/admin/reviews"
                className="w-full sm:w-auto flex-shrink-0 text-center px-4 py-3 rounded-lg font-semibold transition-all duration-300 focus:outline-none border-2 border-gray-200 text-gray-700 hover:bg-amber-50 hover:border-amber-300 hover:text-amber-700 shadow-sm hover:shadow-md flex items-center justify-center gap-2 whitespace-nowrap hidden sm:flex"
              >
                <Star className="w-5 h-5" />
                Guest Reviews
              </Link>

              {/* Activities (hidden on mobile, visible on desktop) */}
              <Link
                to="/admin/activities"
                className="w-full sm:w-auto flex-shrink-0 text-center px-4 py-3 rounded-lg font-semibold transition-all duration-300 focus:outline-none border-2 border-gray-200 text-gray-700 hover:bg-amber-50 hover:border-amber-300 hover:text-amber-700 shadow-sm hover:shadow-md flex items-center justify-center gap-2 whitespace-nowrap hidden sm:flex"
              >
                <Activity className="w-5 h-5" />
                Activities
              </Link>

              {/* Packages (hidden on mobile, visible on desktop) */}
              <Link
                to="/admin/packages"
                className="w-full sm:w-auto flex-shrink-0 text-center px-4 py-3 rounded-lg font-semibold transition-all duration-300 focus:outline-none border-2 border-gray-200 text-gray-700 hover:bg-amber-50 hover:border-amber-300 hover:text-amber-700 shadow-sm hover:shadow-md flex items-center justify-center gap-2 whitespace-nowrap hidden sm:flex"
              >
                <Package className="w-5 h-5" />
                Packages
              </Link>
            </nav>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-8">
            <Routes>
              <Route index element={<AdminHomeDashboard />} />
              <Route path="properties" element={<PropertyList />} />
              <Route path="new" element={<PropertyForm />} />
              <Route path="edit/:id" element={<PropertyForm />} />
              <Route path="blog" element={<BlogPostList />} />
              <Route path="blog/new" element={<BlogPostForm />} />
              <Route path="blog/edit/:id" element={<BlogPostForm />} />
              <Route path="reviews" element={<GuestReviewList />} />
              <Route path="reviews/new" element={<GuestReviewForm />} />
              <Route path="activities" element={<ActivityList />} />
              <Route path="activities/new" element={<ActivityForm />} />
              <Route path="activities/edit/:id" element={<ActivityForm />} />
              <Route path="packages" element={<PackageList />} />
              <Route path="packages/new" element={<PackageForm />} />
              <Route path="packages/edit/:id" element={<PackageForm />} />
              <Route path="orders" element={<OrderList />} />
              <Route path="reviews/edit/:id" element={<GuestReviewForm />} />
              <Route path="rooms" element={<RoomList />} />
              <Route path="rooms/new" element={<RoomForm />} />
              <Route path="rooms/edit/:id" element={<RoomForm />} />
              <Route path="staff" element={<StaffList />} />
              <Route path="staff/new" element={<StaffForm />} />
              <Route path="staff/edit/:id" element={<StaffForm />} />
              <Route path="checklists" element={<ChecklistList isAdminView={true} />} />
              <Route path="pool-cleaning" element={<PoolCleaningList hideAddButton={true} />} />
              <Route path="todos" element={<TodoList />} />
              <Route path="todos/new" element={<TodoForm dashboardType="admin" />} />
              <Route path="todos/edit/:id" element={<TodoForm dashboardType="admin" />} />
              <Route path="checkins" element={<CheckinList isAdminView={true} />} />
              <Route path="checkins/new" element={<CheckinForm />} />
              <Route path="checkins/edit/:id" element={<CheckinForm />} />
              {/* NEW ROUTES FOR IMPORTANT NUMBERS */}
              <Route path="important-numbers" element={<ImportantNumbersList dashboardType="admin" />} />
              <Route path="important-numbers/new" element={<ImportantNumberForm dashboardType="admin" />} />
              <Route path="important-numbers/edit/:id" element={<ImportantNumberForm dashboardType="admin" />} />
              {/* NEW ROUTE FOR SCHEDULE CALENDAR */}
              <Route path="schedule" element={<ScheduleCalendar />} />
              {/* NEW ROUTES FOR STAFF BONUSES */}
              <Route path="staff-bonuses" element={<StaffBonusList />} />
              <Route path="staff-bonuses/new" element={<StaffBonusForm />} />
              <Route path="staff-bonuses/edit/:id" element={<StaffBonusForm />} />
              <Route path="bids" element={<BidList />} /> {/* NEW: Route for BidList */}
            </Routes>
          </div>
        </Container>
      </div>
    </div>
  );
};

export default AdminDashboard;

