import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import Button from '../ui/Button';
import { Pencil, Trash2, CheckCircle, XCircle, Clock, User, Calendar, FileText } from 'lucide-react';

interface TodoItem {
  id: string;
  assigned_to_staff_id: string;
  assigned_by_user_id: string;
  task_description: string;
  due_date: string | null;
  is_completed: boolean;
  completed_at: string | null;
  admin_remarks: string | null;
  created_at: string;
  assigned_to_staff: { first_name: string; last_name: string } | null;
  assigned_by_username: string | null;
}

const TodoList: React.FC = () => {
  const [todos, setTodos] = useState<TodoItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isMobile, setIsMobile] = useState(false);
  const [expandedTodoIds, setExpandedTodoIds] = useState<Set<string>>(new Set());
  const [showCompleted, setShowCompleted] = useState(false); // New state for filter

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768); // Adjust breakpoint as needed
    };

    handleResize(); // Set initial value
    window.addEventListener('resize', handleResize); // Add event listener
    return () => window.removeEventListener('resize', handleResize); // Clean up
  }, []);

  useEffect(() => {
    loadTodos();
  }, []); // This useEffect runs only once on mount.

  const loadTodos = async () => {
    try {
      const { data, error } = await supabase
        .from('staff_todo_items')
        .select(`
          id, created_at, assigned_to_staff_id, assigned_by_user_id, task_description, due_date, is_completed, completed_at, admin_remarks,
          assigned_to_staff:staff_details(first_name, last_name)
        `)
        .order('is_completed', { ascending: true }) // Show incomplete tasks first
        .order('due_date', { ascending: true, nullsLast: true }) // Then by due date
        .order('created_at', { ascending: false });

      if (error) throw error;

      let todosWithUsernames: TodoItem[] = [];

      if (data) {
        // Collect all unique assigned_by_user_id values
        const userIds = [...new Set(data.map(todo => todo.assigned_by_user_id).filter(Boolean))];
        let usersMap: Map<string, string> = new Map();

        // Fetch usernames from the 'profiles' table for these user IDs
        if (userIds.length > 0) {
          const { data: profilesData, error: profilesError } = await supabase
            .from('profiles')
            .select('id, username')
            .in('id', userIds);

          if (profilesError) {
            console.error('Error fetching profiles for assigned_by_users:', profilesError);
          } else {
            profilesData?.forEach(profile => {
              usersMap.set(profile.id, profile.username);
            });
          }
        }

        // Map fetched usernames back to the todo items
        todosWithUsernames = data.map(todo => ({
          ...todo,
          assigned_by_username: todo.assigned_by_user_id ? usersMap.get(todo.assigned_by_user_id) || null : null
        }));
      }
      
      setTodos(todosWithUsernames);

      // Initialize expandedTodoIds: pending tasks are open by default on mobile
      const initialExpanded = new Set<string>();
      if (isMobile) {
        todosWithUsernames?.forEach(todo => {
          if (!todo.is_completed) {
            initialExpanded.add(todo.id);
          }
        });
      }
      setExpandedTodoIds(initialExpanded);

    } catch (err) {
      setError('Error loading todo items.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this todo item?')) return;

    try {
      const { error } = await supabase
        .from('staff_todo_items')
        .delete()
        .eq('id', id);

      if (error) throw error;
      setTodos(todos.filter(todo => todo.id !== id));
    } catch (err) {
      setError('Error deleting todo item.');
      console.error(err);
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
      setTodos(todos.map(todo =>
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

  const getStatusClasses = (isCompleted: boolean) =>
    isCompleted
      ? 'bg-green-100 text-green-800'
      : 'bg-yellow-100 text-yellow-800';

  const getStatusIcon = (isCompleted: boolean) =>
    isCompleted ? <CheckCircle className="w-4 h-4 mr-1" /> : <Clock className="w-4 h-4 mr-1" />;

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

  // Filter todos based on showCompleted state
  const filteredTodos = showCompleted ? todos : todos.filter(todo => !todo.is_completed);

  // Add console logs for debugging
  useEffect(() => {
    console.log("showCompleted state:", showCompleted);
    console.log("Total todos:", todos.length);
    console.log("Filtered todos count:", filteredTodos.length);
    todos.forEach(todo => {
      console.log(`Task ID: ${todo.id}, Description: "${todo.task_description}", Is Completed: ${todo.is_completed}`);
    });
  }, [showCompleted, todos, filteredTodos]);


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
        <h2 className="text-2xl font-bold text-gray-900">Staff To-Do List</h2>
        <Link to="/admin/todos/new">
          <Button>Assign New Task</Button>
        </Link>
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
          <h3 className="text-lg font-medium text-gray-900 mb-2">No tasks assigned yet</h3>
          <p className="text-gray-500 mb-4">Assign your first task to a staff member.</p>
          <Link to="/admin/todos/new">
            <Button>Assign First Task</Button>
          </Link>
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

                    <div className="flex justify-between items-center pt-3 border-t border-gray-200">
                      <Button
                        onClick={() => toggleCompletionStatus(todo.id, todo.is_completed)}
                        size="md"
                        variant={todo.is_completed ? "outline" : "primary"}
                        className="flex-1 justify-center"
                      >
                        {todo.is_completed ? "Mark Pending" : "Mark Complete"}
                      </Button>
                      <div className="flex space-x-2 ml-2">
                        <Link
                          to={`/admin/todos/edit/${todo.id}`}
                          className="p-2 text-amber-600 hover:text-amber-900"
                          title="Edit task"
                        >
                          <Pencil className="w-5 h-5" />
                        </Link>
                        <button
                          onClick={() => handleDelete(todo.id)}
                          className="p-2 text-red-600 hover:text-red-900"
                          title="Delete task"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
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
                          <div className="flex justify-end space-x-2"> {/* Added this div for edit/delete buttons */}
                            <Link
                              to={`/admin/todos/edit/${todo.id}`}
                              className="p-2 text-amber-600 hover:text-amber-900"
                              title="Edit task"
                            >
                              <Pencil className="w-5 h-5" />
                            </Link>
                            <button
                              onClick={() => handleDelete(todo.id)}
                              className="p-2 text-red-600 hover:text-red-900"
                              title="Delete task"
                            >
                              <Trash2 className="w-5 h-5" />
                            </button>
                          </div>
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

export default TodoList;
