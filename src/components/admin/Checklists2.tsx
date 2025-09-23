import React from 'react';
import ChecklistList from '../../components/staff/ChecklistList'; // Import ChecklistList

const Checklists2: React.FC = () => {
  return (
    // Render ChecklistList with isAdminView prop set to true
    <ChecklistList isAdminView={true} />
  );
};

export default Checklists2;
