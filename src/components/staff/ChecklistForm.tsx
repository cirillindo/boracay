// src/components/staff/ChecklistForm.tsx
import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import Button from '../ui/Button';
import { AlertCircle, Check, Home, User, Clock } from 'lucide-react';

interface ChecklistTemplate {
  id: string;
  section_name: string;
  item_name: string;
  item_type: 'section' | 'group' | 'boolean' | 'number' | 'text';
  parent_item_id: string | null;
  display_order: number;
}

interface ChecklistSubmission {
  id: string;
  room_id: string;
  staff_id: string;
  submission_time: string;
  overall_remarks: string | null;
  status: 'pending' | 'completed' | 'issues_found' | 'pending_review';
  rooms?: { room_name: string };
  staff_details?: { first_name: string; last_name: string };
}

interface ChecklistItemResponse {
  id: string;
  submission_id: string;
  template_item_id: string;
  response_value: string | null;
  item_remarks: string | null;
}

interface Room {
  id: string;
  room_name: string;
}

interface Staff {
  id: string;
  first_name: string;
  last_name: string;
  user_id: string;
}

interface ChecklistFormProps {
  sectionName?: string;
  isGardenChecklist?: boolean;
  hideOverallRemarks?: boolean;
}

const ChecklistForm: React.FC<ChecklistFormProps> = ({ 
  sectionName, 
  isGardenChecklist = false, 
  hideOverallRemarks = false 
}) => {
  // console.log('ChecklistForm component rendered'); // Keeping original log, but it runs on every render

  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  // Form data
  const [selectedRoomId, setSelectedRoomId] = useState('');
  const [overallRemarks, setOverallRemarks] = useState('');
  const [status, setStatus] = useState<'pending' | 'completed' | 'issues_found' | 'pending_review'>('pending');
  
  // Checklist data
  const [templates, setTemplates] = useState<ChecklistTemplate[]>([]);
  const [responses, setResponses] = useState<Record<string, string>>({});
  const [itemRemarks, setItemRemarks] = useState<Record<string, string>>({});
  
  // Dropdown data
  const [rooms, setRooms] = useState<Room[]>([]);
  const [staffOptions, setStaffOptions] = useState<Staff[]>([]);
  
  // View mode for existing submissions
  const [isViewMode, setIsViewMode] = useState(false);
  const [submission, setSubmission] = useState<ChecklistSubmission | null>(null);

  // Current user state
  const [currentUserStaffId, setCurrentUserStaffId] = useState<string | null>(null);
  const [currentUserStaffName, setCurrentUserStaffName] = useState<string | null>(null);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null); // Added to get user ID for payment
  const [hasStaffProfile, setHasStaffProfile] = useState(true);
  
  // Garden room state
  const [gardenRoomId, setGardenRoomId] = useState<string | null>(null);
  
  // Group check states
  const [groupCheckStates, setGroupCheckStates] = useState<Record<string, boolean>>({});
  
  useEffect(() => {
    loadTemplates();
    loadRooms();
    loadStaffOptions();
    
    if (isGardenChecklist) {
      loadGardenRoom();
    }
    
    if (isGardenChecklist) {
      loadGardenRoom();
    }
    
    if (id) {
      loadSubmission();
    } else {
      loadCurrentUserStaffId();
    }
  }, [id]);

  const loadCurrentUserStaffId = async () => {
    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) {
        setError('You must be logged in to submit a checklist.');
        setHasStaffProfile(false);
        return;
      }
      setCurrentUserId(user.id); // Set current user ID

      const { data: staffData, error: staffError } = await supabase
        .from('staff_details')
        .select('id, first_name, last_name')
        .eq('user_id', user.id)
        .single();

      if (staffError && staffError.code !== 'PGRST116') {
        throw staffError;
      }
      
      if (!staffData) {
        setError('No staff profile found linked to your user account. Please create one in the Admin Dashboard > Staff section.');
        setHasStaffProfile(false);
        setCurrentUserStaffId(null);
        setCurrentUserStaffName(null);
        return;
      }
      
      // Clear any previous errors and set staff data
      setError('');
      setCurrentUserStaffId(staffData.id);
      setCurrentUserStaffName(`${staffData.first_name} ${staffData.last_name}`);
      setHasStaffProfile(true);
    } catch (err) {
      console.error('Error loading current user staff ID:', err);
      setError('Failed to determine your staff profile. Please ensure your staff profile is correctly linked to your user account.');
      setHasStaffProfile(false);
      setCurrentUserStaffId(null);
      setCurrentUserStaffName(null);
    }
  };

  const loadGardenRoom = async () => {
    try {
      const { data, error } = await supabase
        .from('rooms')
        .select('id')
        .eq('room_name', 'Garden')
        .single();

      if (error) {
        console.error('Error loading garden room:', error);
        setError('Garden room not found. Please create a room named "Garden" in the database.');
        return;
      }
      
      if (data) {
        setGardenRoomId(data.id);
        setSelectedRoomId(data.id); // Automatically select the garden room
      }
    } catch (err) {
      console.error('Error loading garden room:', err);
      setError('Failed to load garden room configuration.');
    }
  };

  const loadTemplates = async () => {
    try {
      let query = supabase
        .from('checklist_templates')
        .select('*');
      
      if (sectionName) {
        // If a specific sectionName is provided (e.g., "Pulang Garden Checklist"), filter by it
        query = query.eq('section_name', sectionName);
      } else {
        // If no specific sectionName is provided (general room checklist form),
        // exclude "Pulang Garden Checklist"
        query = query.neq('section_name', 'Pulang Garden Checklist');
      }
      
      const { data, error } = await query
        .order('section_name')
        .order('display_order');

      if (error) throw error;
      setTemplates(data || []);
    } catch (err) {
      console.error('Error loading checklist templates:', err);
      setError('Failed to load checklist templates');
    }
  };

  const loadRooms = async () => {
    try {
      const { data, error } = await supabase
        .from('rooms')
        .select('id, room_name')
        .order('room_name');

      if (error) throw error;
      setRooms(data || []);
    } catch (err) {
      console.error('Error loading rooms:', err);
      setError('Failed to load rooms');
    }
  };

  const loadStaffOptions = async () => {
    try {
      const { data, error } = await supabase
        .from('staff_details')
        .select('id, first_name, last_name, user_id')
        .eq('is_active', true)
        .order('first_name');

      if (error) throw error;
      setStaffOptions(data || []);
    } catch (err) {
      console.error('Error loading staff options:', err);
      setError('Failed to load staff options');
    }
  };

  const loadSubmission = async () => {
    if (!id) return;
    
    try {
      setIsViewMode(true);
      
      const { data: submissionData, error: submissionError } = await supabase
        .from('checklist_submissions')
        .select(`
          *,
          rooms (room_name),
          staff_details (first_name, last_name)
        `)
        .eq('id', id)
        .single();

      if (submissionError) throw submissionError;
      setSubmission(submissionData);
      setSelectedRoomId(submissionData.room_id);
      setOverallRemarks(submissionData.overall_remarks || '');
      setStatus(submissionData.status);
      
      setCurrentUserStaffId(submissionData.staff_id);
      setCurrentUserStaffName(`${submissionData.staff_details?.first_name || ''} ${submissionData.staff_details?.last_name || ''}`);
      
      const responsesMap: Record<string, string> = {};
      const remarksMap: Record<string, string> = {};
      
      const { data: responsesData, error: responsesError } = await supabase
        .from('checklist_item_responses')
        .select('*')
        .eq('submission_id', id);

      if (responsesError) throw responsesError;
      
      responsesData?.forEach(response => {
        responsesMap[response.template_item_id] = response.response_value || '';
        if (response.item_remarks) {
          remarksMap[response.template_item_id] = response.item_remarks;
        }
      });
      
      setResponses(responsesMap);
      setItemRemarks(remarksMap);
    } catch (err) {
      console.error('Error loading submission:', err);
      setError('Failed to load checklist submission');
    }
  };

  const handleResponseChange = (templateId: string, value: string) => {
    setResponses(prev => ({
      ...prev,
      [templateId]: value
    }));
  };

  const handleItemRemarksChange = (templateId: string, remarks: string) => {
    setItemRemarks(prev => ({
      ...prev,
      [templateId]: remarks
    }));
  };

  const handleGroupCheckAll = (groupKey: string, templates: ChecklistTemplate[]) => {
    const booleanTemplates = templates.filter(t => t.item_type === 'boolean');
    const isChecked = !groupCheckStates[groupKey];
    
    // Update group check state
    setGroupCheckStates(prev => ({
      ...prev,
      [groupKey]: isChecked
    }));
    
    // Update all boolean items in this group
    const newResponses = { ...responses };
    booleanTemplates.forEach(template => {
      newResponses[template.id] = isChecked ? 'true' : 'false';
    });
    setResponses(newResponses);
  };

  // Update group check state when individual items change
  const updateGroupCheckState = (groupKey: string, templates: ChecklistTemplate[]) => {
    const booleanTemplates = templates.filter(t => t.item_type === 'boolean');
    const checkedCount = booleanTemplates.filter(t => responses[t.id] === 'true').length;
    const isAllChecked = checkedCount === booleanTemplates.length && booleanTemplates.length > 0;
    
    setGroupCheckStates(prev => ({
      ...prev,
      [groupKey]: isAllChecked
    }));
  };

  // Update group check states when responses change
  useEffect(() => {
    const organizedTemplates = organizeTemplates();
    Object.keys(organizedTemplates).forEach(sectionName => {
      updateGroupCheckState(sectionName, organizedTemplates[sectionName]);
    });
  }, [responses, templates]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedRoomId) {
      setError('Please select a room.');
      return;
    }
    if (isGardenChecklist && !gardenRoomId) {
      setError('Garden room not found. Please ensure a room named "Garden" exists in the database.');
      return;
    }
    if (!currentUserStaffId || !currentUserId) { // Ensure currentUserId is also available
      setError('User or staff profile not found. Please log in.');
      return;
    }
    if (!hasStaffProfile) {
      setError('Cannot submit: No staff profile linked to your user account. Please create one.');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      console.log('--- Attempting to submit checklist ---');
      console.log('Form Data Snapshot:');
      console.log('  Selected Room ID:', selectedRoomId);
      console.log('  Garden Room ID:', gardenRoomId);
      console.log('  Current User Staff ID:', currentUserStaffId);
      console.log('  Overall Remarks:', overallRemarks);
      console.log('  Status:', status);
      console.log('  Is Garden Checklist:', isGardenChecklist);
      console.log('  Garden Room ID:', gardenRoomId);
      console.log('  Responses:', responses);
      console.log('  Item Remarks:', itemRemarks);
      console.log('Supabase client object:', supabase); // Log Supabase client

      // First create the submission
      console.log("Attempting Supabase insert for checklist_submissions...");
      const { data: submissionData, error: submissionError } = await supabase
        .from('checklist_submissions')
        .insert({
          room_id: isGardenChecklist ? gardenRoomId : selectedRoomId, // Use garden room ID if garden checklist
          staff_id: currentUserStaffId,
          overall_remarks: hideOverallRemarks ? null : overallRemarks,
          status: 'completed', // Always set to completed on submission
          submission_time: new Date().toISOString()
        })
        .select()
        .single();

      if (submissionError) {
        console.error("Error inserting checklist_submissions:", submissionError);
        throw submissionError;
      }
      console.log("Checklist submission successful:", submissionData);

      // Then create the responses
      const responseRecords = Object.entries(responses)
        .filter(([_, value]) => value !== '' && value !== undefined)
        .map(([templateId, value]) => ({
          submission_id: submissionData.id,
          template_item_id: templateId,
          response_value: value,
          item_remarks: itemRemarks[templateId] || null
        }));

      if (responseRecords.length > 0) {
        console.log("Attempting Supabase insert for checklist_item_responses:", responseRecords);
        const { error: responsesError } = await supabase
          .from('checklist_item_responses')
          .insert(responseRecords);

        if (responsesError) {
          console.error("Error inserting checklist_item_responses:", responsesError);
          throw responsesError;
        }
        console.log("Checklist item responses successful.");
      } else {
        console.log("No checklist item responses to insert.");
      }

      // NEW: Create a payment record for the checklist submission
      console.log("Attempting Supabase insert for checklist_payments...");
      const { error: paymentError } = await supabase
        .from('checklist_payments')
        .insert({
          submission_id: submissionData.id,
          amount_paid_php: 10, // Default payment for a checklist
          payment_date: new Date().toISOString(),
          paid_by_user_id: currentUserId, // Use the current user's ID
          notes: `Payment for ${submissionData.rooms?.room_name || 'Checklist'} submission`
        });

      if (paymentError) {
        console.error("Error inserting checklist_payments:", paymentError);
        // Decide if this error should prevent success or just be logged
        // For now, we'll log it but still consider the checklist submitted
        setError(`Checklist submitted, but failed to record payment: ${paymentError.message}`);
      } else {
        console.log("Checklist payment recorded successfully.");
      }

      setSuccess('Checklist submitted successfully!');
      console.log("Checklist submitted successfully, navigating...");
      
      // Navigate after a short delay
      setTimeout(() => {
        navigate('/staff/checklists');
      }, 2000);

    } catch (err: any) {
      console.error('Full error object in catch block:', err);
      setError(`Failed to submit checklist: ${err.message || 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  const renderChecklistItem = (template: ChecklistTemplate) => {
    const value = responses[template.id] || '';

    if (template.item_type === 'section') {
      return (
        <div key={template.id} className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            {template.item_name}
          </h2>
        </div>
      );
    }

    if (template.item_type === 'group') {
      return (
        <div key={template.id} className="mb-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-3">
            {template.item_name}
          </h3>
        </div>
      );
    }

    // For garden checklist, force all items to be checkboxes
    const itemType = isGardenChecklist ? 'boolean' : template.item_type;

    return (
      <div key={template.id} className="mb-4 p-4 bg-white rounded-lg border border-gray-200 hover:border-amber-300 transition-colors">
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0 mt-1">
            {itemType === 'boolean' ? (
              <input
                type="checkbox"
                id={template.id}
                checked={value === 'true'}
                onChange={(e) => handleResponseChange(template.id, e.target.checked ? 'true' : 'false')}
                disabled={isViewMode}
                className="w-5 h-5 text-amber-600 border-gray-300 rounded focus:ring-amber-500"
              />
            ) : itemType === 'number' ? (
              <input
                type="number"
                id={template.id}
                value={value}
                onChange={(e) => handleResponseChange(template.id, e.target.value)}
                disabled={isViewMode}
                className="w-20 px-3 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500"
                min="0"
              />
            ) : (
              <input
                type="text"
                id={template.id}
                value={value}
                onChange={(e) => handleResponseChange(template.id, e.target.value)}
                disabled={isViewMode}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            )}
          </div>
          
          <div className="flex-1">
            <label 
              htmlFor={template.id} 
              className="text-gray-700 font-medium cursor-pointer"
              dangerouslySetInnerHTML={{ __html: template.item_name }}
            >
            </label>
          </div>
          
          {value === 'true' && (
            <Check className="w-5 h-5 text-green-500 flex-shrink-0 mt-1" />
          )}
        </div>
        {isGardenChecklist && (
          <div className="mt-3">
            <textarea
              value={itemRemarks[template.id] || ''}
              onChange={(e) => handleItemRemarksChange(template.id, e.target.value)}
              disabled={isViewMode}
              placeholder="Add remarks for this item (optional)"
              rows={2}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500 text-sm"
            />
          </div>
        )}
        
        {/* Remarks section for garden checklist items */}
        {isGardenChecklist && (
          <div className="mt-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Remarks (optional)
            </label>
            <input
              type="text"
              value={itemRemarks[template.id] || ''}
              onChange={(e) => handleItemRemarksChange(template.id, e.target.value)}
              disabled={isViewMode}
              className="w-full px-3 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500 text-sm"
              placeholder="Add any notes about this item..."
            />
          </div>
        )}
      </div>
    );
  };

  const organizeTemplates = () => {
    const sections: Record<string, ChecklistTemplate[]> = {};
    
    templates.forEach(template => {
      if (!sections[template.section_name]) {
        sections[template.section_name] = [];
      }
      sections[template.section_name].push(template);
    });
    
    const sortedSectionNames = Object.keys(sections).sort((a, b) => {
      const orderA = sections[a][0]?.display_order || Infinity;
      const orderB = sections[b][0]?.display_order || Infinity;
      return orderA - orderB;
    });

    const sortedSections: Record<string, ChecklistTemplate[]> = {};
    sortedSectionNames.forEach(name => {
      sortedSections[name] = sections[name].sort((a, b) => a.display_order - b.display_order);
    });
    
    return sortedSections;
  };

  const organizedTemplates = organizeTemplates();

  return (
    <div className="max-w-4xl mx-auto">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md mb-6 flex items-center gap-2">
          <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}
      {success && (
        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-md mb-6 flex items-center gap-2">
          <Check className="w-5 h-5 text-green-500 flex-shrink-0" />
          <span>{success}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-8">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4 pb-2 border-b-2 border-amber-500">Checklist Details</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
            {!isGardenChecklist && (
              <div className="md:col-span-1">
                <label htmlFor="room" className="block text-sm font-medium text-gray-700 mb-1">
                  Room <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <select
                    id="room"
                    value={selectedRoomId}
                    onChange={(e) => setSelectedRoomId(e.target.value)}
                    disabled={isViewMode}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500"
                  >
                    <option value="">Select a room</option>
                    {rooms.map(room => (
                      <option key={room.id} value={room.id}>{room.room_name}</option>
                    ))}
                  </select>
                  <Home className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                </div>
              </div>
            )}
            {isGardenChecklist && (
              <div className="md:col-span-1">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Area <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <div className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100 text-gray-700 flex items-center justify-between">
                    <span>Garden Area</span>
                    <Check className="w-5 h-5 text-green-500" />
                  </div>
                  <Home className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                </div>
                {!gardenRoomId && (
                  <p className="mt-1 text-sm text-red-600">
                    Garden room not found. Please create a room named "Garden" in the database.
                  </p>
                )}
              </div>
            )}
            <div className={isGardenChecklist ? "md:col-span-2" : "md:col-span-1"}>
              <label htmlFor="staff" className="block text-sm font-medium text-gray-700 mb-1">
                Staff Member <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                {!isViewMode && currentUserStaffName ? (
                  <div className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100 text-gray-700 flex items-center justify-between">
                    <span>{currentUserStaffName}</span>
                    <Check className="w-5 h-5 text-green-500" />
                  </div>
                ) : (
                  <select
                    id="staff"
                    value={currentUserStaffId || ''}
                    onChange={() => {}}
                    disabled={true}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500 bg-gray-100 text-gray-700"
                  >
                    {isViewMode && submission?.staff_details ? (
                      <option value={submission.staff_id}>
                        {submission.staff_details.first_name} {submission.staff_details.last_name}
                      </option>
                    ) : (
                      <option value="">Loading staff...</option>
                    )}
                  </select>
                )}
                <User className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              </div>
              {!hasStaffProfile && !isViewMode && (
                <p className="mt-1 text-sm text-red-600">
                  No staff profile found linked to your user account. Please create one in the Admin Dashboard &gt; Staff section.
                </p>
              )}
              {currentUserStaffName && !isViewMode && (
                <p className="mt-1 text-sm text-green-600">
                  Staff automatically selected based on your logged-in account.
                </p>
              )}
            </div>
          </div>
        </div>

        {templates.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <Clock className="w-12 h-12 mx-auto mb-4" />
            <p>No checklist templates found. Please add templates in the database.</p>
          </div>
        ) : (
          <div className="space-y-8 mb-8">
            {Object.keys(organizedTemplates).map(sectionName => (
              <div key={sectionName} className="bg-white">
                <div className="flex items-center justify-between mb-4 pb-2 border-b-2 border-amber-500">
                  <h2 className="text-2xl font-bold text-gray-900">
                    {sectionName}
                  </h2>
                  {organizedTemplates[sectionName].some(t => t.item_type === 'boolean') && (
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        id={`check-all-${sectionName}`}
                        checked={groupCheckStates[sectionName] || false}
                        onChange={() => handleGroupCheckAll(sectionName, organizedTemplates[sectionName])}
                        disabled={isViewMode}
                        className="w-5 h-5 text-amber-600 border-gray-300 rounded focus:ring-amber-500"
                      />
                      <label 
                        htmlFor={`check-all-${sectionName}`} 
                        className="text-sm font-medium text-amber-700 cursor-pointer"
                      >
                        Check All
                      </label>
                    </div>
                  )}
                </div>
                <div className="space-y-4 bg-white">
                  {organizedTemplates[sectionName].map(template => renderChecklistItem(template))}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Overall Remarks - Only show if not hidden */}
        {!hideOverallRemarks && (
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4 pb-2 border-b-2 border-amber-500">Overall Remarks</h2>
            <div className="mb-4">
              <textarea
                id="overallRemarks"
                value={overallRemarks}
                onChange={(e) => setOverallRemarks(e.target.value)}
                disabled={isViewMode}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500"
              ></textarea>
            </div>
          </div>
        )}

        {!isViewMode && (
          <div className="mt-8 flex justify-end space-x-4">
            <Button type="button" variant="outline" onClick={() => navigate('/staff/checklists')}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading || !hasStaffProfile || !currentUserStaffId || !currentUserId || (isGardenChecklist && !gardenRoomId)}>
              {loading ? 'Submitting...' : 'Submit Checklist'}
            </Button>
          </div>
        )}
        {isViewMode && (
          <div className="mt-8 flex justify-end space-x-4">
            <Button type="button" variant="outline" onClick={() => navigate('/staff/checklists')}>
              Back to Checklists
            </Button>
          </div>
        )}
      </form>
    </div>
  );
};

export default ChecklistForm;
