import React, { useState, useEffect } from 'react';
import { StaffBonus, fetchMyBonuses } from '../../lib/staffBonusService';
import { DollarSign, Calendar, User, CheckCircle, XCircle } from 'lucide-react';

export interface StaffBonus {
  id?: string;
  staff_id: string;
  amount_php: number;
  bonus_date: string;
  description: string;
  is_paid: boolean;
  created_at?: string;
  updated_at?: string;
  staff_details?: {
    first_name: string;
    last_name: string;
  };
}

const MyBonusList: React.FC = () => {
  const [bonuses, setBonuses] = useState<StaffBonus[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    loadBonuses();
  }, []);

  const loadBonuses = async () => {
    try {
      setLoading(true);
      const data = await fetchMyBonuses();
      setBonuses(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load bonuses');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const totalBonuses = bonuses.reduce((sum, bonus) => sum + bonus.amount_php, 0);
  const paidBonuses = bonuses.filter(bonus => bonus.is_paid).reduce((sum, bonus) => sum + bonus.amount_php, 0);
  const unpaidBonuses = totalBonuses - paidBonuses;

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-600"></div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800 mb-4">My Bonuses</h1>
        
        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
            <h3 className="text-sm font-medium text-blue-600">Total Bonuses</h3>
            <p className="text-2xl font-bold text-blue-900">₱{totalBonuses.toLocaleString()}</p>
          </div>
          <div className="bg-green-50 p-4 rounded-lg border border-green-200">
            <h3 className="text-sm font-medium text-green-600">Paid Bonuses</h3>
            <p className="text-2xl font-bold text-green-900">₱{paidBonuses.toLocaleString()}</p>
          </div>
          <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
            <h3 className="text-sm font-medium text-yellow-600">Unpaid Bonuses</h3>
            <p className="text-2xl font-bold text-yellow-900">₱{unpaidBonuses.toLocaleString()}</p>
          </div>
        </div>
      </div>

      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-md">
          <p className="text-red-600 text-sm">{error}</p>
        </div>
      )}

      {bonuses.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg">No bonuses found</p>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          {isMobile ? (
            <div className="divide-y divide-gray-200">
              {bonuses.map((bonus) => (
                <div key={bonus.id} className="bg-gray-50 p-4 rounded-lg shadow-sm border border-gray-200">
                  <div className="flex justify-between items-center mb-3">
                    <h3 className="text-base font-bold text-gray-900">Bonus Details</h3>
                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${bonus.is_paid ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                      {bonus.is_paid ? <CheckCircle className="w-3 h-3 mr-1" /> : <XCircle className="w-3 h-3 mr-1" />}
                      {bonus.is_paid ? 'Paid' : 'Unpaid'}
                    </span>
                  </div>

                  <div className="text-sm text-gray-700 space-y-2 mb-4">
                    <div className="flex items-center gap-2">
                      <DollarSign className="w-4 h-4 text-gray-500" />
                      <span>Amount: ₱{bonus.amount_php.toLocaleString()}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-gray-500" />
                      <span>Date: {formatDate(bonus.bonus_date)}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <User className="w-4 h-4 text-gray-500" />
                      <span>Reason: {bonus.description}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Amount (PHP)
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Bonus Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Reason
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {bonuses.map((bonus) => (
                  <tr key={bonus.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      ₱{bonus.amount_php.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(bonus.bonus_date)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {bonus.description}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${bonus.is_paid ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                        {bonus.is_paid ? 'Paid' : 'Unpaid'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}
    </div>
  );
};

export default MyBonusList;