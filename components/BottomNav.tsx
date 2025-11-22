import React from 'react';
import { Home, Wallet, Plus, Target, PieChart } from 'lucide-react';
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
      
      {/* FAB (Floating Action Button) */}
      <button 
        onClick={() => onTabChange('log')} 
        className="bg-gradient-to-br from-gray-800 to-black text-white w-14 h-14 rounded-full shadow-[0_8px_20px_rgba(0,0,0,0.3)] transform transition-all duration-300 hover:scale-110 active:scale-95 active:rotate-90 -mt-10 border-[6px] border-gray-50 flex items-center justify-center group"
      >
        <Plus size={28} strokeWidth={3} className="transition-colors group-hover:text-gray-200" />
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