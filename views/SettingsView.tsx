import React from 'react';
import { useFinance } from '../App';
import { Trash2, User, Bell, Info } from 'lucide-react';

const SettingsView: React.FC = () => {
  const { resetData } = useFinance();

  const handleReset = () => {
    if (confirm("WARNING: This will delete all your data including assets and transactions. Are you sure?")) {
      resetData();
      alert("Data reset successfully.");
    }
  };

  const Option = ({ icon, label, onClick, danger = false }: any) => (
    <button 
      onClick={onClick}
      className={`w-full flex items-center gap-4 p-4 bg-white rounded-2xl shadow-sm mb-3 transition-transform active:scale-98 ${danger ? 'text-red-600' : 'text-gray-700'}`}
    >
      <div className={`p-2 rounded-xl ${danger ? 'bg-red-50' : 'bg-gray-50'}`}>
        {icon}
      </div>
      <span className="font-bold text-sm">{label}</span>
    </button>
  );

  return (
    <div className="pb-24">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Settings</h1>

      <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-50 mb-8 flex items-center gap-4">
         <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center text-2xl">
           👤
         </div>
         <div>
           <h2 className="font-bold text-gray-900">User Profile</h2>
           <p className="text-xs text-gray-400 uppercase font-bold">Pro Member</p>
         </div>
      </div>

      <div className="space-y-2">
        <div className="px-4 py-2">
          <h3 className="text-xs font-bold text-gray-400 uppercase">General</h3>
        </div>
        <div className="bg-white rounded-3xl p-2 shadow-sm border border-gray-50">
           <div className="flex justify-between items-center p-4 border-b border-gray-100">
              <div className="flex items-center gap-3">
                 <span className="text-gray-400 font-bold text-sm">$</span>
                 <span className="text-sm font-bold text-gray-700">Currency</span>
              </div>
              <span className="text-xs font-bold text-gray-400 bg-gray-100 px-2 py-1 rounded">IDR (Rp)</span>
           </div>
           <div className="flex justify-between items-center p-4">
              <div className="flex items-center gap-3">
                 <Bell size={16} className="text-gray-400" />
                 <span className="text-sm font-bold text-gray-700">Notifications</span>
              </div>
              <div className="w-10 h-6 bg-gray-200 rounded-full p-1 cursor-pointer">
                 <div className="w-4 h-4 bg-white rounded-full shadow-sm"></div>
              </div>
           </div>
        </div>
        
        <div className="px-4 py-2 mt-6">
          <h3 className="text-xs font-bold text-gray-400 uppercase">Data</h3>
        </div>
        <Option icon={<Trash2 size={18} />} label="Reset All Data" onClick={handleReset} danger />
        
        <div className="text-center mt-12">
           <p className="text-[10px] text-gray-300 font-medium">
             Version 1.0.2<br/>
             Made with ❤️ by RealCheck
           </p>
        </div>
      </div>
    </div>
  );
};

export default SettingsView;
