import React, { useMemo, useState } from 'react';
import { useFinance } from '../App';
import { formatIDR } from '../utils';
import { ChevronRight } from 'lucide-react';
import { Modal } from '../components/ui/Modal';

const DashboardView: React.FC = () => {
  const { transactions, budget, setView, updateBudget } = useFinance();
  const [isBudgetModalOpen, setIsBudgetModalOpen] = useState(false);
  
  // Budget Config State
  const [newLimit, setNewLimit] = useState(budget.limit.toString());
  const [newStartDate, setNewStartDate] = useState(budget.startDate);
  const [newEndDate, setNewEndDate] = useState(budget.endDate);

  // Calculate Spending within Date Range
  const { totalSpent, totalIncomeAllocated } = useMemo(() => {
    const start = new Date(budget.startDate);
    const end = new Date(budget.endDate);
    end.setHours(23, 59, 59); // Include end date fully

    let spent = 0;
    let budgetIncome = 0;

    transactions.forEach(t => {
      const d = new Date(t.date);
      if (d >= start && d <= end) {
        if (t.type === 'expense') {
          spent += t.amount;
        } else if (t.type === 'income' && t.destinationType === 'Budget') {
          budgetIncome += t.amount;
        }
      }
    });

    return { totalSpent: spent, totalIncomeAllocated: budgetIncome };
  }, [transactions, budget]);

  const effectiveLimit = budget.limit + totalIncomeAllocated;
  const percentage = Math.min(100, Math.round((totalSpent / effectiveLimit) * 100));
  const isOverBudget = totalSpent > effectiveLimit;
  const remaining = effectiveLimit - totalSpent;

  const handleSaveBudget = (e: React.FormEvent) => {
    e.preventDefault();
    updateBudget({
      limit: Number(newLimit),
      startDate: newStartDate,
      endDate: newEndDate
    });
    setIsBudgetModalOpen(false);
  };

  return (
    <div className="space-y-8 pb-20">
      {/* Header */}
      <div className="flex justify-between items-center">
        <button onClick={() => setView('profile')} className="flex items-center gap-2 group">
          <div className="w-10 h-10 bg-gray-900 rounded-full flex items-center justify-center text-white font-bold shadow-lg">
            TS
          </div>
          <div className="text-left">
            <p className="text-xs text-gray-400 font-bold uppercase">Welcome back</p>
            <p className="text-sm font-bold text-gray-900 group-hover:text-violet-600 transition-colors">User Profile</p>
          </div>
        </button>
        <button onClick={() => setView('chat')} className="p-2 bg-white rounded-full shadow-sm border border-gray-100 text-gray-500 hover:bg-gray-50">
           <span className="sr-only">Chat</span>
           🤖
        </button>
      </div>

      {/* Hero Card */}
      <div className="relative w-full rounded-[32px] p-8 text-white shadow-[0_20px_50px_rgba(124,58,237,0.25)] overflow-hidden
        bg-gradient-to-br from-violet-600 via-purple-600 to-indigo-600">
        
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -mr-20 -mt-20 blur-3xl pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 w-40 h-40 bg-orange-500/20 rounded-full -ml-10 -mb-10 blur-2xl pointer-events-none"></div>
        
        <div className="relative z-10">
          <div className="flex justify-between items-start mb-2">
            <div>
              <span className="text-white/70 text-sm font-medium block mb-1">Total Spending</span>
              <button 
                onClick={() => setIsBudgetModalOpen(true)}
                className="text-xs font-semibold bg-white/20 hover:bg-white/30 backdrop-blur-md px-3 py-1 rounded-full transition-colors flex items-center gap-1"
              >
                 {new Date(budget.startDate).toLocaleDateString('id-ID', {day: 'numeric', month: 'short'})} - {new Date(budget.endDate).toLocaleDateString('id-ID', {day: 'numeric', month: 'short'})}
                 <ChevronRight size={12} />
              </button>
            </div>
            <div className={`px-3 py-1 rounded-full text-xs font-bold backdrop-blur-md ${isOverBudget ? 'bg-red-500/80 text-white' : 'bg-emerald-500/80 text-white'}`}>
              {isOverBudget ? 'Over Budget' : 'On Track'}
            </div>
          </div>

          <h1 className="text-5xl font-bold mb-8 tracking-tight mt-4">{formatIDR(totalSpent)}</h1>

          <div className="space-y-3">
            <div className="flex justify-between text-sm font-medium text-white/90">
              <span>Limit: {formatIDR(effectiveLimit)}</span>
              <span>{isOverBudget ? 'Exceeded by' : 'Left'} {formatIDR(Math.abs(remaining))}</span>
            </div>
            <div className="h-4 bg-black/20 rounded-full overflow-hidden backdrop-blur-sm border border-white/10">
              <div 
                className={`h-full rounded-full transition-all duration-1000 ease-out shadow-[0_0_15px_rgba(255,255,255,0.5)] ${isOverBudget ? 'bg-red-400' : 'bg-white'}`}
                style={{ width: `${percentage}%` }}
              />
            </div>
          </div>
          
          <div className="mt-8 flex gap-4">
             <button onClick={() => setView('judge')} className="flex-1 bg-gradient-to-r from-orange-400 to-pink-500 text-white text-sm font-bold py-3.5 rounded-2xl shadow-lg shadow-orange-500/20 active:scale-95 transition-transform border border-white/20">
               Judge My Spending
             </button>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div>
        <div className="flex justify-between items-end mb-4 px-2">
          <h2 className="text-xl font-bold text-gray-900">Recent</h2>
          <button onClick={() => setView('history')} className="text-violet-600 text-sm font-bold hover:text-violet-700">See All</button>
        </div>
        
        <div className="space-y-4">
          {transactions.slice(0, 5).map(t => (
            <div key={t.id} className="bg-white p-4 rounded-3xl shadow-[0_2px_15px_rgba(0,0,0,0.03)] border border-gray-50 flex items-center justify-between transition-transform hover:scale-[1.02]">
              <div className="flex items-center gap-4">
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-xl shadow-sm ${t.type === 'income' ? 'bg-green-50 text-green-600' : 'bg-gray-50 text-gray-600'}`}>
                  {t.icon || (t.type === 'income' ? '💰' : '💸')}
                </div>
                <div>
                  <p className="font-bold text-gray-900 text-sm">{t.title}</p>
                  <p className="text-xs text-gray-400 font-medium mt-0.5">{t.category} • {t.date}</p>
                </div>
              </div>
              <span className={`font-bold text-sm ${t.type === 'income' ? 'text-green-600' : 'text-gray-900'}`}>
                {t.type === 'income' ? '+' : '-'}{formatIDR(t.amount)}
              </span>
            </div>
          ))}
          {transactions.length === 0 && (
              <div className="text-center p-6 text-gray-400 text-sm">No transactions yet. Add one!</div>
          )}
        </div>
      </div>

      <Modal isOpen={isBudgetModalOpen} onClose={() => setIsBudgetModalOpen(false)} title="Budget Settings">
        <form onSubmit={handleSaveBudget} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Spending Limit Amount</label>
            <div className="relative">
               <span className="absolute left-4 top-3.5 text-gray-400 font-bold">Rp</span>
               <input required type="number" value={newLimit} onChange={e => setNewLimit(e.target.value)} className="w-full pl-12 p-3 bg-gray-50 rounded-xl border-none focus:ring-2 focus:ring-violet-500 font-bold text-gray-900" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Start Date</label>
              <input required type="date" value={newStartDate} onChange={e => setNewStartDate(e.target.value)} className="w-full p-3 bg-gray-50 rounded-xl border-none focus:ring-2 focus:ring-violet-500 font-bold text-gray-900 text-xs" />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase mb-1">End Date</label>
              <input required type="date" value={newEndDate} onChange={e => setNewEndDate(e.target.value)} className="w-full p-3 bg-gray-50 rounded-xl border-none focus:ring-2 focus:ring-violet-500 font-bold text-gray-900 text-xs" />
            </div>
          </div>
          <p className="text-xs text-gray-400 leading-relaxed">
             Income allocated to "Monthly Budget" will automatically be added on top of this limit.
          </p>
          <button type="submit" className="w-full bg-gray-900 text-white font-bold py-3.5 rounded-xl shadow-lg active:scale-95 transition-transform">
            Update Period
          </button>
        </form>
      </Modal>
    </div>
  );
};

export default DashboardView;