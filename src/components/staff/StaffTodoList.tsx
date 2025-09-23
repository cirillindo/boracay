// src/components/staff/StaffTodoList.tsx
import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import Button from '../ui/Button';
import { CheckCircle, XCircle, Clock, FileText } from 'lucide-react';
import { useTodoNotification } from '../../context/TodoNotificationContext'; // NEW: Import useTodoNotification

interface TodoItem {
  id: string;
  assigned_to_staff_id: string;
  task_description: string;
  due_date: string | null;
  is_completed: boolean;
  completed_at: string | null;
  admin_remarks: string | null;
  created_at: string;
  assigned_to_staff: { first_name: string; last_name: string } | null;
}

const StaffTodoList: React.FC = () => {
  const [todos, setTodos] = useState<TodoItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [currentUserStaffId, setCurrentUserStaffId] = useState<string | null>(null);
  // Use a Set to store IDs of expanded tasks
  const { setHasNewTodos } = useTodoNotification(); // NEW: Use setHasNewTodos
  const [expandedTodoIds, setExpandedTodoIds] = useState<Set<string>>(new Set());
  const [isMobile, setIsMobile] = useState(false);
  const [showCompleted, setShowCompleted] = useState(false); // New state for filter

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768); // Adjust breakpoint as needed
    };

    handleResize(); // Set initial value
    window.addEventListener('resize', handleResize); // Add event listener
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    const fetchUserAndTodos = async () => {
      setLoading(true);
      setError('');
      try {
        const { data: { user }, error: userError } = await supabase.auth.getUser();
        if (userError || !user) {
          setError('You must be logged in to view your todo items.');
          setLoading(false);
          return;
        }

        const { data: staffData, error: staffError } = await supabase
          .from('staff_details')
          .select('id')
          .eq('user_id', user.id)
          .single();

        if (staffError || !staffData) {
          setError('No staff profile found linked to your user account. Please contact an administrator.');
          setLoading(false);
          return;
        }
        setCurrentUserStaffId(staffData.id);
        loadTodos(staffData.id);
      } catch (err) {
        console.error('Error fetching user or staff ID:', err);
        setError('Failed to load user or staff information.');
        setLoading(false);
      }
    };

    fetchUserAndTodos();
  }, []);

  const loadTodos = async (staffId: string) => {
    try {
      const { data, error } = await supabase
        .from('staff_todo_items')
        .select(`
          id, created_at, assigned_to_staff_id, task_description, due_date, is_completed, completed_at, admin_remarks,
          assigned_to_staff:staff_details(first_name, last_name)
        `)
        .eq('assigned_to_staff_id', staffId)
        .order('is_completed', { ascending: true }) // Show incomplete tasks first
        .order('due_date', { ascending: true, nullsLast: true }) // Then by due date
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      setTodos(data || []);

      // Initialize expandedTodoIds: pending tasks are open by default
      setHasNewTodos(false); // NEW: Clear notification when todos are loaded
      const initialExpanded = new Set<string>();
      data?.forEach(todo => {
        if (!todo.is_completed) {
          initialExpanded.add(todo.id);
        }
      });
      setExpandedTodoIds(initialExpanded);

    } catch (err) {
      setError('Error loading your todo items.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const toggleCompletionStatus = async (id: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('staff_todo_items')
        .update({ 
          is_completed: !currentStatus,
          completed_at: !currentStatus ? new Date().toISOString() : null
        })
        .eq('id', id);

      if (error) throw error;
      
      // Optimistically update UI
      setTodos(prevTodos => prevTodos.map(todo => 
        todo.id === id ? { ...todo, is_completed: !currentStatus, completed_at: !currentStatus ? new Date().toISOString() : null } : todo
      ));

      // Update expanded state based on new completion status
      setExpandedTodoIds(prevExpandedIds => {
        const newSet = new Set(prevExpandedIds);
        if (!currentStatus) { // If task is becoming completed, collapse it
          newSet.delete(id);
        } else { // If task is becoming pending, expand it
          newSet.add(id);
        }
        return newSet;
      });

    } catch (err) {
      setError('Error updating completion status.');
      console.error(err);
    }
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Toggle manual expansion/collapse
  const toggleExpand = (id: string) => {
    setExpandedTodoIds(prevExpandedIds => {
      const newSet = new Set(prevExpandedIds);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  const getStatusClasses = (isCompleted: boolean) =>
    isCompleted
      ? 'bg-green-100 text-green-800'
      : 'bg-yellow-100 text-yellow-800';

  const getStatusIcon = (isCompleted: boolean) =>
    isCompleted ? <CheckCircle className="w-4 h-4 mr-1" /> : <Clock className="w-4 h-4 mr-1" />;

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

  // Filter todos based on showCompleted state
  const filteredTodos = showCompleted ? todos : todos.filter(todo => !todo.is_completed);

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900">My To-Do List</h2>
      </div>

      {/* Filter Checkbox */}
      <div className="mb-4 flex items-center">
        <input
          type="checkbox"
          id="showCompleted"
          checked={showCompleted}
          onChange={(e) => setShowCompleted(e.target.checked)}
          className="rounded border-gray-300 text-amber-600 focus:ring-amber-500"
        />
        <label htmlFor="showCompleted" className="ml-2 text-sm font-medium text-gray-700">
          Show Completed Tasks
        </label>
      </div>

      {filteredTodos.length === 0 && !loading ? (
        <div className="text-center py-12">
          <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No tasks assigned to you</h3>
          <p className="text-gray-500 mb-4">Check back later or contact your administrator.</p>
        </div>
      ) : (
        <div className="bg-white shadow-md rounded-lg overflow-hidden">
          {isMobile ? (
            // Mobile Card View
            <div className="p-4 space-y-4">
              {filteredTodos.map((todo) => {
                const isExpanded = expandedTodoIds.has(todo.id);
                return (
                  <div key={todo.id} className="bg-gray-50 p-4 rounded-lg shadow-sm border border-gray-200">
                    <div className="flex justify-between items-center mb-2">
                      <h3 className="text-base font-bold text-gray-900">Task Details</h3>
                      <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusClasses(todo.is_completed)}`}>
                        {getStatusIcon(todo.is_completed)}
                        {todo.is_completed ? 'Completed' : 'Pending'}
                      </span>
                    </div>

                    <div
                      className="text-sm text-gray-700 mb-3 cursor-pointer"
                      onClick={() => toggleExpand(todo.id)}
                    >
                      <p className={`font-medium ${isExpanded ? '' : 'line-clamp-3'} break-words whitespace-normal`}>
                        {todo.task_description}
                      </p>
                      {todo.admin_remarks && (
                        <p className={`${isExpanded ? '' : 'hidden'} text-xs text-gray-500 mt-1 break-words whitespace-normal`}>
                          Remarks: {todo.admin_remarks}
                        </p>
                      )}
                      {/* Show Read More/Less button only if content is truncated or remarks exist */}
                      {(!isExpanded || todo.admin_remarks) && (
                        <button
                          onClick={() => toggleExpand(todo.id)}
                          className="text-amber-600 hover:text-amber-700 text-xs font-medium mt-2"
                        >
                          {isExpanded ? 'Read Less' : 'Read More'}
                        </button>
                      )}
                    </div>

                    <div className="text-xs text-gray-600 mb-4">
                      <div><strong>Due Date:</strong> {formatDate(todo.due_date)}</div>
                      {/* Removed Assigned By from mobile card */}
                    </div>

                    <Button
                      onClick={() => toggleCompletionStatus(todo.id, todo.is_completed)}
                      size="md"
                      variant={todo.is_completed ? "outline" : "primary"}
                      className="w-full justify-center"
                    >
                      {todo.is_completed ? "Mark Pending" : "Mark Complete"}
                    </Button>
                  </div>
                );
              })}
            </div>
          ) : (
            // Desktop Table View
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[250px]">
                      Task
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[100px]">
                      Due Date
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[100px]">
                      Status
                    </th>
                    {/* Removed Assigned By header */}
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[150px]">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredTodos.map((todo) => (
                    <tr key={todo.id} className="hover:bg-gray-50">
                      <td className="px-4 py-4 align-top">
                        <div className="text-sm font-medium text-gray-900 break-words">
                          {todo.task_description}
                        </div>
                        {todo.admin_remarks && (
                          <div className="text-xs text-gray-500 mt-1 break-words">
                            Remarks: {todo.admin_remarks}
                          </div>
                        )}
                      </td>
                      <td className="px-4 py-4 align-top text-sm text-gray-500">
                        {formatDate(todo.due_date)}
                      </td>
                      <td className="px-4 py-4 align-top">
                        <button
                          onClick={() => toggleCompletionStatus(todo.id, todo.is_completed)}
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            getStatusClasses(todo.is_completed)
                          }`}
                        >
                          {getStatusIcon(todo.is_completed)}
                          {todo.is_completed ? 'Completed' : 'Pending'}
                        </button>
                        {todo.completed_at && todo.is_completed && (
                          <div className="text-xs text-gray-500 mt-1">
                            on {formatDate(todo.completed_at)}
                          </div>
                        )}
                      </td>
                      {/* Removed Assigned By data cell */}
                      <td className="px-4 py-4 align-top text-right text-sm font-medium">
                        <div className="flex flex-col space-y-2 items-end">
                          <Button
                            onClick={() => toggleCompletionStatus(todo.id, todo.is_completed)}
                            size="md"
                            variant={todo.is_completed ? "outline" : "primary"}
                            className="w-full justify-center whitespace-normal break-words"
                          >
                            {todo.is_completed ? "Mark Pending" : "Mark Complete"}
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default StaffTodoList;
