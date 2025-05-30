import React, { useState } from 'react';
import { User } from 'lucide-react';
import CashierSystem from './cashier';
import OnlineOrdersPage from './onlineOrders';
import OrderHistory from './orderHistory';
import Dashboard from './Sdashboard';
import StaffReservasi from './staffReservasi';

type ActivePage = 'dashboard' | 'cashier' | 'online-orders' | 'history' | 'staff-reservasi';

const StaffPage: React.FC = () => {
  const [activePage, setActivePage] = useState<ActivePage>('cashier');

  const renderContent = () => {
    switch (activePage) {
      case 'dashboard':
        return <Dashboard />;
      case 'cashier':
        return <CashierSystem />;
      case 'online-orders':
        return <OnlineOrdersPage />;
      case 'history':
        return <OrderHistory />;
      case 'staff-reservasi':
        return <StaffReservasi />;
      default:
        return null;
    }
  };

  const getButtonStyle = (page: ActivePage) => {
    return activePage === page
      ? "w-full px-4 py-3 font-medium text-left text-white bg-orange-300 rounded-lg shadow-sm"
      : "w-full px-4 py-3 font-medium text-left rounded-lg shadow-sm bg-amber-100 text-amber-800 hover:bg-amber-200 transition-colors";
  };

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <div className="flex flex-col justify-between w-56 p-4 shadow-lg bg-gradient-to-b from-yellow-50 to-green-50">
        {/* Logo and Title */}
        <div>
          <div className="flex items-center mb-8">
            <div className="flex items-center justify-center w-12 h-12 mr-3 rounded-full bg-amber-800">
              <div className="w-8 h-8 rounded-full bg-amber-600"></div>
            </div>
            <h1 className="font-serif text-xl italic text-amber-800">Cempaka Cafe & Resto</h1>
          </div>

          {/* Navigation */}
          <div className="space-y-2">
            <button
              className={getButtonStyle('dashboard')}
              onClick={() => setActivePage('dashboard')}
            >
              Dashboard
            </button>
            <button
              className={getButtonStyle('cashier')}
              onClick={() => setActivePage('cashier')}
            >
              Cashier
            </button>
            <button
              className={getButtonStyle('online-orders')}
              onClick={() => setActivePage('online-orders')}
            >
              Online Orders
            </button>
            <button
              className={getButtonStyle('staff-reservasi')}
              onClick={() => setActivePage('staff-reservasi')}
            >
              Staff Reservasi
            </button>
            <button
              className={getButtonStyle('history')}
              onClick={() => setActivePage('history')}
            >
              History
            </button>
          </div>
        </div>

        {/* Sign Out Button */}
        <div className="flex flex-col items-center">
          <div className="flex items-center justify-center w-12 h-12 mb-3 bg-gray-300 rounded-full">
            <User size={24} className="text-gray-600" />
          </div>
          <button className="w-full px-4 py-2 font-medium text-white transition-colors bg-orange-400 rounded-lg shadow-sm hover:bg-orange-500">
            Sign Out
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex flex-1">
        {renderContent()}
      </div>
    </div>
  );
};

export default StaffPage;
