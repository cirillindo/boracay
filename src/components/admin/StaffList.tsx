import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { Pencil, Trash2, CheckCircle, XCircle, ExternalLink, User, Phone, MessageCircle, Calendar, FileText } from 'lucide-react';
import Button from '../ui/Button';

interface Staff {
  id: string;
  user_id?: string;
  first_name: string;
  last_name: string;
  date_of_birth?: string;
  id_document_url?: string;
  phone_number?: string;
  whatsapp_number?: string;
  facebook_profile_url?: string;
  created_at: string;
  updated_at: string;
  is_active: boolean;
  users?: { email: string };
}

const StaffList: React.FC = () => {
  const [staff, setStaff] = useState<Staff[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isMobile, setIsMobile] = useState(false); // State for mobile view

  useEffect(() => {
    // Detect mobile view on mount and resize
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768); // Adjust breakpoint as needed
    };

    handleResize(); // Set initial value
    window.addEventListener('resize', handleResize); // Add event listener
    return () => window.removeEventListener('resize', handleResize); // Clean up
  }, []);

  useEffect(() => {
    loadStaff();
  }, []);

  const loadStaff = async () => {
    try {
      // Test basic connection first
      const { data: testData, error: testError } = await supabase
        .from('properties')
        .select('id')
        .limit(1);
      
      if (testError) {
        console.error('Supabase connection test failed:', testError);
        setError(`Database connection failed: ${testError.message}`);
        setLoading(false);
        return;
      }

      // Now try to fetch staff data
      const { data, error } = await supabase
        .from('staff_details')
        .select('*')
        .order('last_name', { ascending: true });

      if (error) {
        console.error('Staff fetch error:', error);
        if (error.code === 'PGRST116') {
          setError('The staff_details table does not exist. Please ensure the database migration has been run.');
        } else {
          setError(`Error loading staff: ${error.message}`);
        }
        setLoading(false);
        return;
      }
      
      setStaff(data || []);
    } catch (err) {
      console.error('Unexpected error:', err);
      setError(`Unexpected error: ${err instanceof Error ? err.message : 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this staff member?')) return;

    try {
      const { error } = await supabase
        .from('staff_details')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Delete error:', error);
        setError(`Error deleting staff: ${error.message}`);
        return;
      }
      
      setStaff(staff.filter(s => s.id !== id));
    } catch (err) {
      console.error('Unexpected delete error:', err);
      setError(`Unexpected error deleting staff: ${err instanceof Error ? err.message : 'Unknown error'}`);
    }
  };

  const toggleActiveStatus = async (id: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('staff_details')
        .update({ is_active: !currentStatus })
        .eq('id', id);

      if (error) {
        console.error('Status update error:', error);
        setError(`Error updating staff status: ${error.message}`);
        return;
      }
      
      setStaff(staff.map(s => 
        s.id === id ? { ...s, is_active: !currentStatus } : s
      ));
    } catch (err) {
      console.error('Unexpected status update error:', err);
      setError(`Unexpected error updating status: ${err instanceof Error ? err.message : 'Unknown error'}`);
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString();
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
        <h2 className="text-2xl font-bold text-gray-900">Staff Management</h2>
        <Link to="/admin/staff/new">
          <Button>Add New Staff</Button>
        </Link>
      </div>

      {staff.length === 0 ? (
        <div className="text-center py-12">
          <User className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No staff members yet</h3>
          <p className="text-gray-500 mb-4">Get started by adding your first staff member.</p>
          <Link to="/admin/staff/new">
            <Button>Add First Staff Member</Button>
          </Link>
        </div>
      ) : (
        <div className="bg-white shadow-md rounded-lg overflow-hidden">
          {isMobile ? (
            // Mobile Card View
            <div className="p-4 space-y-4">
              {staff.map((member) => (
                <div key={member.id} className="bg-gray-50 p-4 rounded-lg shadow-sm border border-gray-200">
                  <div className="flex justify-between items-center mb-3">
                    <h3 className="text-base font-bold text-gray-900">{member.first_name} {member.last_name}</h3>
                    <button
                      onClick={() => toggleActiveStatus(member.id, member.is_active)}
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        member.is_active
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                      }`}
                    >
                      {member.is_active ? (
                        <>
                          <CheckCircle className="w-3 h-3 mr-1" />
                          Active
                        </>
                      ) : (
                        <>
                          <XCircle className="w-3 h-3 mr-1" />
                          Inactive
                        </>
                      )}
                    </button>
                  </div>

                  <div className="text-sm text-gray-700 space-y-2 mb-4">
                    {member.phone_number && (
                      <div className="flex items-center gap-2">
                        <Phone className="w-4 h-4 text-gray-500" />
                        <span>{member.phone_number}</span>
                      </div>
                    )}
                    {member.whatsapp_number && (
                      <div className="flex items-center gap-2">
                        <MessageCircle className="w-4 h-4 text-gray-500" />
                        <a 
                          href={`https://wa.me/${member.whatsapp_number.replace(/\D/g, '')}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-green-600 hover:text-green-700"
                        >
                          {member.whatsapp_number}
                        </a>
                      </div>
                    )}
                    {member.facebook_profile_url && (
                      <div className="flex items-center gap-2">
                        <ExternalLink className="w-4 h-4 text-gray-500" />
                        <a 
                          href={member.facebook_profile_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:text-blue-700"
                        >
                          Facebook Profile
                        </a>
                      </div>
                    )}
                    {member.date_of_birth && (
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-gray-500" />
                        <span>DOB: {formatDate(member.date_of_birth)}</span>
                      </div>
                    )}
                    {member.id_document_url && (
                      <div className="flex items-center gap-2">
                        <FileText className="w-4 h-4 text-gray-500" />
                        <a
                          href={member.id_document_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-amber-600 hover:text-amber-900 flex items-center gap-1"
                        >
                          View ID Document <ExternalLink className="w-3 h-3" />
                        </a>
                      </div>
                    )}
                  </div>

                  <div className="flex justify-end space-x-2 pt-3 border-t border-gray-200">
                    <Link
                      to={`/admin/staff/edit/${member.id}`}
                      className="p-2 text-amber-600 hover:text-amber-900"
                      title="Edit staff"
                    >
                      <Pencil className="w-5 h-5" />
                    </Link>
                    <button
                      onClick={() => handleDelete(member.id)}
                      className="p-2 text-red-600 hover:text-red-900"
                      title="Delete staff"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            // Desktop Table View
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Name
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Contact Info
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date of Birth
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      ID Document
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {staff.map((member) => (
                    <tr key={member.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {member.first_name} {member.last_name}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <div className="space-y-1">
                          {member.phone_number && (
                            <div className="flex items-center gap-1">
                              <span>📞</span>
                              <span>{member.phone_number}</span>
                            </div>
                          )}
                          {member.whatsapp_number && (
                            <div className="flex items-center gap-1">
                              <span>💬</span>
                              <a 
                                href={`https://wa.me/${member.whatsapp_number.replace(/\D/g, '')}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-green-600 hover:text-green-700"
                              >
                                {member.whatsapp_number}
                              </a>
                            </div>
                          )}
                          {member.facebook_profile_url && (
                            <div className="flex items-center gap-1">
                              <span>📘</span>
                              <a 
                                href={member.facebook_profile_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-blue-600 hover:text-blue-700"
                              >
                                Facebook
                              </a>
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatDate(member.date_of_birth)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {member.id_document_url ? (
                          <a
                            href={member.id_document_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-amber-600 hover:text-amber-900 flex items-center gap-1"
                          >
                            View <ExternalLink className="w-4 h-4" />
                          </a>
                        ) : (
                          'N/A'
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <button
                          onClick={() => toggleActiveStatus(member.id, member.is_active)}
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            member.is_active
                              ? 'bg-green-100 text-green-800'
                              : 'bg-red-100 text-red-800'
                          }`}
                        >
                          {member.is_active ? (
                            <>
                              <CheckCircle className="w-3 h-3 mr-1" />
                              Active
                            </>
                          ) : (
                            <>
                              <XCircle className="w-3 h-3 mr-1" />
                              Inactive
                            </>
                          )}
                        </button>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex justify-end space-x-2">
                          <Link
                            to={`/admin/staff/edit/${member.id}`}
                            className="text-amber-600 hover:text-amber-900"
                            title="Edit staff"
                          >
                            <Pencil className="w-5 h-5" />
                          </Link>
                          <button
                            onClick={() => handleDelete(member.id)}
                            className="text-red-600 hover:text-red-900"
                            title="Delete staff"
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
        </div>
      )}
    </div>
  );
};

export default StaffList;
