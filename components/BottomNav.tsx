import React from 'react';
import { Home, Wallet, PlusCircle, Target, PieChart } from 'lucide-react';
import { ViewState } from '../types';

interface BottomNavProps {
  activeTab: ViewState;
  onTabChange: (tab: ViewState) => void;
}

const BottomNav: React.FC<BottomNavProps> = ({ activeTab, onTabChange }) => {
  const navItemClass = (tab: ViewState) => `
    flex flex-col items-center justify-center p-2 transition-all duration-300
    ${activeTab === tab ? 'text-violet-600 scale-110' : 'text-gray-400 hover:text-gray-600'}
  `;

  return (
    <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 w-[90%] max-w-sm bg-white/90 backdrop-blur-lg border border-white/40 shadow-[0_8px_30px_rgb(0,0,0,0.12)] rounded-full px-4 py-3 z-50 flex justify-between items-center">
      <button onClick={() => onTabChange('dashboard')} className={navItemClass('dashboard')}>
        <Home size={22} strokeWidth={2.5} />
      </button>
      <button onClick={() => onTabChange('assets')} className={navItemClass('assets')}>
        <Wallet size={22} strokeWidth={2.5} />
      </button>
      
      {/* FAB */}
      <button 
        onClick={() => onTabChange('log')} 
        className="bg-gray-900 text-white p-3.5 rounded-full shadow-lg shadow-gray-900/20 transform transition-transform hover:scale-105 active:scale-95 -mt-8 border-4 border-gray-50"
      >
        <PlusCircle size={28} strokeWidth={2.5} />
      </button>

      <button onClick={() => onTabChange('goals')} className={navItemClass('goals')}>
        <Target size={22} strokeWidth={2.5} />
      </button>
      <button onClick={() => onTabChange('analytics')} className={navItemClass('analytics')}>
        <PieChart size={22} strokeWidth={2.5} />
      </button>
    </div>
  );
};

export default BottomNav;