// src/pages/StaffDashboard.tsx
import React from 'react';
import { Routes, Route, Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import Container from '../components/ui/Container';
import Button from '../components/ui/Button';
import ChecklistForm from '../components/staff/ChecklistForm';
import ChecklistList from '../components/staff/ChecklistList';
import PoolCleaningForm from '../components/staff/PoolCleaningForm';
import PoolCleaningList from '../components/staff/PoolCleaningList';
import StaffTodoList from '../components/staff/StaffTodoList';
import CheckinList from '../components/shared/CheckinList'; // Import the shared CheckinList
// Import the new shared components
import ImportantNumbersList from '../components/shared/ImportantNumbersList';
import ImportantNumberForm from '../components/shared/ImportantNumberForm';
import ScheduleCalendar from '../components/admin/ScheduleCalendar'; // Import ScheduleCalendar
// Import the new MyBonusList component
import MyBonusList from '../components/staff/MyBonusList';
import { useTodoNotification } from '../context/TodoNotificationContext'; // NEW: Import useTodoNotification


import { ClipboardList, Droplets, TreePine, ListTodo, LayoutDashboard, CalendarCheck, Phone, CalendarDays, DollarSign } from 'lucide-react';

const StaffDashboard: React.FC = () => {
  const { hasNewTodos, setHasNewTodos } = useTodoNotification(); // NEW: Use the context hook

  const handleLogout = async () => {
    // Clear any pending notifications on logout
    await supabase.auth.signOut();
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="h-32" />
      <div className="pb-20">
        <Container>
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Staff Dashboard</h1>
            <Button onClick={handleLogout} variant="outline">
              Logout
            </Button>
          </div>

          <div className="mb-8">
            <nav className="flex flex-col space-y-2 md:flex-row md:space-x-4 md:space-y-0 pb-2">
              {/* New Check-ins button - placed first */}
              <Link
                to="/staff/checkins"
                className="w-full text-center px-4 py-3 rounded-lg font-semibold transition-all duration-300 focus:outline-none border-2 border-gray-200 text-gray-700 hover:bg-amber-50 hover:border-amber-300 hover:text-amber-700 shadow-sm hover:shadow-md flex items-center justify-center gap-2 whitespace-nowrap"
              >
                <CalendarCheck className="w-5 h-5" />
                Check-ins
              </Link>
              {/* NEW: Schedule button for staff */}
              <Link
                to="/staff/schedule"
                className="w-full text-center px-4 py-3 rounded-lg font-semibold transition-all duration-300 focus:outline-none border-2 border-gray-200 text-gray-700 hover:bg-amber-50 hover:border-amber-300 hover:text-amber-700 shadow-sm hover:shadow-md flex items-center justify-center gap-2 whitespace-nowrap"
              >
                <CalendarDays className="w-5 h-5" />
                Schedule
              </Link>
              {/* Existing Dashboard button */}
              <Link
                to="/staff"
                className="w-full text-center px-4 py-3 rounded-lg font-semibold transition-all duration-300 focus:outline-none border-2 border-gray-200 text-gray-700 hover:bg-amber-50 hover:border-amber-300 hover:text-amber-700 shadow-sm hover:shadow-md flex items-center justify-center gap-2 whitespace-nowrap"
              >
                <LayoutDashboard className="w-5 h-5" />
                Dashboard
              </Link>
              <Link
                to="/staff/checklists"
                className="w-full text-center px-4 py-3 rounded-lg font-semibold transition-all duration-300 focus:outline-none border-2 border-gray-200 text-gray-700 hover:bg-amber-50 hover:border-amber-300 hover:text-amber-700 shadow-sm hover:shadow-md flex items-center justify-center gap-2 whitespace-nowrap"
              >
                <ClipboardList className="w-5 h-5" />
                Room Checklists
              </Link>
              <Link
                to="/staff/pool-cleaning"
                className="w-full text-center px-4 py-3 rounded-lg font-semibold transition-all duration-300 focus:outline-none border-2 border-gray-200 text-gray-700 hover:bg-amber-50 hover:border-amber-300 hover:text-amber-700 shadow-sm hover:shadow-md flex items-center justify-center gap-2 whitespace-nowrap"
              >
                <Droplets className="w-5 h-5" />
                Pool Cleaning
              </Link>
              <Link
                to="/staff/todos"
                onClick={() => { setHasNewTodos(false); }}
                className="w-full text-center px-4 py-3 rounded-lg font-semibold transition-all duration-300 focus:outline-none border-2 border-gray-200 text-gray-700 hover:bg-amber-50 hover:border-amber-300 hover:text-amber-700 shadow-sm hover:shadow-md flex items-center justify-center gap-2 whitespace-nowrap relative"
              >
                <ListTodo className="w-5 h-5" />
                My To-Dos
                {hasNewTodos && ( /* NEW: Notification dot */
                  <span className="absolute top-1 right-1 block h-3 w-3 rounded-full ring-2 ring-white bg-red-500 animate-ping-and-stay"></span>
                )}
              </Link>
              {/* NEW BUTTON FOR IMPORTANT NUMBERS */}
              <Link
                to="/staff/important-numbers"
                className="w-full text-center px-4 py-3 rounded-lg font-semibold transition-all duration-300 focus:outline-none border-2 border-gray-200 text-gray-700 hover:bg-amber-50 hover:border-amber-300 hover:text-amber-700 shadow-sm hover:shadow-md flex items-center justify-center gap-2 whitespace-nowrap"
              >
                <Phone className="w-5 h-5" />
                Important Numbers
              </Link>
              {/* NEW BUTTON FOR MY BONUSES */}
              <Link
                to="/staff/my-bonuses"
                className="w-full text-center px-4 py-3 rounded-lg font-semibold transition-all duration-300 focus:outline-none border-2 border-gray-200 text-gray-700 hover:bg-amber-50 hover:border-amber-300 hover:text-amber-700 shadow-sm hover:shadow-md flex items-center justify-center gap-2 whitespace-nowrap"
              >
                <DollarSign className="w-5 h-5" />
                My Bonuses
              </Link>
            </nav>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-8">
            <Routes>
              <Route index element={
                <div className="text-center py-12">
                  <h2 className="text-2xl font-bold text-gray-900 mb-4">Welcome to Staff Dashboard</h2>
                  <p className="text-gray-600 mb-8">
                    Choose what you'd like to work on today.
                  </p>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
                    {/* Check-ins Card - Added as the first card */}
                    <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-6 hover:shadow-lg transition-all duration-300">
                      <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                        <CalendarCheck className="w-8 h-8 text-blue-600" />
                      </div>
                      <h3 className="text-xl font-bold text-gray-900 mb-2">Check-ins</h3>
                      <p className="text-gray-600 mb-4">
                        View and manage guest check-ins and check-outs
                      </p>
                      <Link to="/staff/checkins">
                        <Button className="w-full bg-blue-500 hover:bg-blue-600 text-white">
                          View Check-ins
                        </Button>
                      </Link>
                    </div>

                    {/* NEW: Schedule Card for staff */}
                    <div className="bg-purple-50 border-2 border-purple-200 rounded-xl p-6 hover:shadow-lg transition-all duration-300">
                      <div className="bg-purple-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                        <CalendarDays className="w-8 h-8 text-purple-600" />
                      </div>
                      <h3 className="text-xl font-bold text-gray-900 mb-2">Schedule</h3>
                      <p className="text-gray-600 mb-4">
                        View your work schedule and assignments
                      </p>
                      <Link to="/staff/schedule">
                        <Button className="w-full bg-purple-500 hover:bg-purple-600 text-white">
                          View Schedule
                        </Button>
                      </Link>
                    </div>

                    {/* Room Checklists Card */}
                    <div className="bg-amber-50 border-2 border-amber-200 rounded-xl p-6 hover:shadow-lg transition-all duration-300">
                      <div className="bg-amber-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                        <ClipboardList className="w-8 h-8 text-amber-600" />
                      </div>
                      <h3 className="text-xl font-bold text-gray-900 mb-2">Room Checklists</h3>
                      <p className="text-gray-600 mb-4">
                        Submit a new room inspection checklist
                      </p>
                      <Link to="/staff/checklists/new">
                        <Button className="w-full bg-amber-500 hover:bg-amber-600 text-white">
                          Add New Checklist
                        </Button>
                      </Link>
                    </div>

                    {/* Pool Cleaning Card */}
                    <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-6 hover:shadow-lg transition-all duration-300">
                      <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Droplets className="w-8 h-8 text-blue-600" />
                      </div>
                      <h3 className="text-xl font-bold text-gray-900 mb-2">Pool Cleaning</h3>
                      <p className="text-gray-600 mb-4">
                        Record a new pool cleaning session
                      </p>
                      <Link to="/staff/pool-cleaning/new">
                        <Button className="w-full bg-blue-500 hover:bg-blue-600 text-white">
                          Add New Record
                        </Button>
                      </Link>
                    </div>

                    {/* Garden Checklist Card */}
                    <div className="bg-green-50 border-2 border-green-200 rounded-xl p-6 hover:shadow-lg transition-all duration-300">
                      <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                        <TreePine className="w-8 h-8 text-green-600" />
                      </div>
                      <h3 className="text-xl font-bold text-gray-900 mb-2">Garden Checklist</h3>
                      <p className="text-gray-600 mb-4">
                        Submit Pulang Garden maintenance checklist
                      </p>
                      <Link to="/staff/garden-checklist/new">
                        <Button className="w-full bg-green-500 hover:bg-green-600 text-white">
                          Add Garden Checklist
                        </Button>
                      </Link>
                    </div>

                    {/* My To-Dos Card */}
                    <div className="bg-purple-50 border-2 border-purple-200 rounded-xl p-6 hover:shadow-lg transition-all duration-300">
                      <div className="bg-purple-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                        <ListTodo className="w-8 h-8 text-purple-600" />
                      </div>
                      <h3 className="text-xl font-bold text-gray-900 mb-2">My To-Dos</h3>
                      <p className="text-gray-600 mb-4">
                        View and manage tasks assigned to you
                      </p>
                      <Link to="/staff/todos">
                        <Button className="w-full bg-purple-500 hover:bg-purple-600 text-white">
                          View My Tasks
                        </Button>
                      </Link>
                    </div>
                    {/* NEW CARD FOR IMPORTANT NUMBERS */}
                    <div className="bg-gray-50 border-2 border-gray-200 rounded-xl p-6 hover:shadow-lg transition-all duration-300">
                      <div className="bg-gray-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Phone className="w-8 h-8 text-gray-600" />
                      </div>
                      <h3 className="text-xl font-bold text-gray-900 mb-2">Important Numbers</h3>
                      <p className="text-gray-600 mb-4">
                        Access and manage important contact numbers
                      </p>
                      <Link to="/staff/important-numbers">
                        <Button className="w-full bg-gray-500 hover:bg-gray-600 text-white">
                          View Numbers
                        </Button>
                      </Link>
                    </div>
                    {/* NEW CARD FOR MY BONUSES */}
                    <div className="bg-yellow-50 border-2 border-yellow-200 rounded-xl p-6 hover:shadow-lg transition-all duration-300">
                      <div className="bg-yellow-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                        <DollarSign className="w-8 h-8 text-yellow-600" />
                      </div>
                      <h3 className="text-xl font-bold text-gray-900 mb-2">My Bonuses</h3>
                      <p className="text-gray-600 mb-4">
                        View your bonus records
                      </p>
                      <Link to="/staff/my-bonuses">
                        <Button className="w-full bg-yellow-500 hover:bg-yellow-600 text-white">
                          View My Bonuses
                        </Button>
                      </Link>
                    </div>
                  </div>
                </div>
              } />
              <Route path="checklists" element={<ChecklistList />} />
              <Route path="checklists/new" element={<ChecklistForm isGardenChecklist={false} hideOverallRemarks={false} />} />
              <Route path="checklists/edit/:id" element={<ChecklistForm />} />
              <Route path="garden-checklist/new" element={<ChecklistForm sectionName="Pulang Garden Checklist" isGardenChecklist={true} hideOverallRemarks={true} />} />
              <Route path="pool-cleaning" element={<PoolCleaningList />} />
              <Route path="pool-cleaning/new" element={<PoolCleaningForm />} />
              <Route path="todos" element={<StaffTodoList />} />
              <Route path="checkins" element={<CheckinList isStaffView={true} />} /> {/* New route for staff check-ins */}
              {/* NEW ROUTES FOR IMPORTANT NUMBERS */}
              <Route path="important-numbers" element={<ImportantNumbersList dashboardType="staff" />} />
              <Route path="important-numbers/new" element={<ImportantNumberForm dashboardType="staff" />} />
              <Route path="important-numbers/edit/:id" element={<ImportantNumberForm dashboardType="staff" />} />
              {/* NEW ROUTE FOR SCHEDULE CALENDAR */}
              <Route path="schedule" element={<ScheduleCalendar />} />
              {/* NEW ROUTE FOR MY BONUSES */}
              <Route path="my-bonuses" element={<MyBonusList />} />
            </Routes>
          </div>
        </Container>
      </div>
    </div>
  );
};

export default StaffDashboard;
