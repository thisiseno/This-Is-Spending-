
import React, { useState } from 'react';
import { useFinance } from '../App';
import { formatIDR } from '../utils';
import { ArrowLeft, Trash2, Search, Calendar } from 'lucide-react';
import { Modal } from '../components/ui/Modal';
import { Transaction } from '../types';

const HistoryView: React.FC = () => {
  const { transactions, setView, deleteTransaction } = useFinance();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
  
  // Type Filters
  const [filterType, setFilterType] = useState<'All' | 'Expense' | 'Portfolio' | 'Goals'>('All');
  
  // Time Filters
  const [timeFilter, setTimeFilter] = useState<'All' | 'Day' | 'Month' | 'Range'>('Month');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().slice(0, 7));
  const [rangeStart, setRangeStart] = useState('');
  const [rangeEnd, setRangeEnd] = useState('');

  const filteredTransactions = transactions.filter(t => {
    // 1. Search Text
    const matchesSearch = t.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          t.category.toLowerCase().includes(searchTerm.toLowerCase());
    
    // 2. Type Filter
    let matchesType = true;
    if (filterType === 'Expense') {
        matchesType = !t.destinationType || t.destinationType === 'Budget';
    } else if (filterType === 'Portfolio') {
        matchesType = t.destinationType === 'Asset';
    } else if (filterType === 'Goals') {
        matchesType = t.destinationType === 'Goal';
    }

    // 3. Date Filter
    let matchesDate = true;
    if (timeFilter === 'Day' && selectedDate) {
        matchesDate = t.date === selectedDate;
    } else if (timeFilter === 'Month' && selectedMonth) {
        matchesDate = t.date.startsWith(selectedMonth);
    } else if (timeFilter === 'Range') {
        if (rangeStart) matchesDate = matchesDate && t.date >= rangeStart;
        if (rangeEnd) matchesDate = matchesDate && t.date <= rangeEnd;
    }

    return matchesSearch && matchesType && matchesDate;
  });

  const handleDelete = () => {
     if (selectedTransaction) {
        deleteTransaction(selectedTransaction.id);
        setSelectedTransaction(null);
     }
  };

  const formatTime = (timestamp?: number) => {
      if (!timestamp) return '';
      return new Date(timestamp).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
  };

  return (
    // Added -m-6 to break out of App.tsx padding for full screen width
    <div className="pb-24 min-h-[calc(100vh-2rem)] -m-6 flex flex-col bg-gray-50 relative">
       {/* Header */}
       <div className="flex items-center gap-3 px-6 py-5 bg-white sticky top-0 z-20 shadow-[0_4px_20px_rgba(0,0,0,0.02)]">
           <button onClick={() => setView('dashboard')} className="p-2 -ml-2 rounded-full text-gray-500 hover:bg-gray-50 transition-colors active:scale-95">
              <ArrowLeft size={22} />
           </button>
           <h1 className="text-2xl font-bold text-gray-900">History</h1>
       </div>

       {/* Filters Area */}
       <div className="bg-white px-6 pb-6 rounded-b-[32px] shadow-sm border-t border-gray-50 z-10 mb-4">
           
           {/* Search */}
           <div className="relative mb-6">
              <Search className="absolute left-4 top-3.5 text-gray-400" size={18} />
              <input 
                type="text" 
                placeholder="Search title or category..." 
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="w-full pl-12 p-3.5 bg-gray-50 rounded-2xl border-none text-sm font-bold text-gray-700 placeholder-gray-400 focus:ring-2 focus:ring-violet-100 transition-all"
              />
           </div>

           {/* Filter Groups */}
           <div className="space-y-6">
               
               {/* Type Filter */}
               <div>
                   <div className="flex justify-between items-center mb-3">
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider ml-1">Type</p>
                   </div>
                   <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
                       {['All', 'Expense', 'Portfolio', 'Goals'].map(type => (
                           <button
                             key={type}
                             onClick={() => setFilterType(type as any)}
                             className={`px-4 py-2.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all border ${
                                 filterType === type 
                                 ? 'bg-gray-900 text-white border-gray-900 shadow-lg shadow-gray-200 scale-105' 
                                 : 'bg-white text-gray-500 border-gray-100'
                             }`}
                           >
                               {type === 'Expense' ? 'Expense Log' : type}
                           </button>
                       ))}
                   </div>
               </div>

               {/* Time Filter Segmented Control */}
               <div>
                   <div className="flex justify-between items-center mb-3">
                       <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider ml-1">Time Period</p>
                   </div>
                   <div className="bg-gray-50 p-1.5 rounded-2xl flex gap-1">
                       {['All', 'Day', 'Month', 'Range'].map(mode => (
                           <button
                             key={mode}
                             onClick={() => setTimeFilter(mode as any)}
                             className={`flex-1 py-2 rounded-xl text-[10px] font-bold uppercase tracking-wide transition-all ${
                                 timeFilter === mode 
                                 ? 'bg-white text-violet-600 shadow-sm scale-100' 
                                 : 'text-gray-400 hover:text-gray-600 hover:bg-gray-100'
                             }`}
                           >
                               {mode}
                           </button>
                       ))}
                   </div>

                   {/* Active Date Inputs */}
                   <div className="mt-3 animate-in fade-in slide-in-from-top-2">
                       {timeFilter === 'Day' && (
                           <div className="relative">
                               <Calendar className="absolute left-4 top-3.5 text-violet-500 pointer-events-none" size={16} />
                               <input 
                                  type="date" 
                                  value={selectedDate}
                                  onChange={e => setSelectedDate(e.target.value)}
                                  className="w-full pl-12 p-3 bg-violet-50 border border-violet-100 rounded-xl text-sm font-bold text-violet-900 outline-none focus:ring-2 focus:ring-violet-200"
                               />
                           </div>
                       )}
                       {timeFilter === 'Month' && (
                           <div className="relative">
                               <Calendar className="absolute left-4 top-3.5 text-violet-500 pointer-events-none" size={16} />
                               <input 
                                  type="month" 
                                  value={selectedMonth}
                                  onChange={e => setSelectedMonth(e.target.value)}
                                  className="w-full pl-12 p-3 bg-violet-50 border border-violet-100 rounded-xl text-sm font-bold text-violet-900 outline-none focus:ring-2 focus:ring-violet-200"
                               />
                           </div>
                       )}
                       {timeFilter === 'Range' && (
                           <div className="flex gap-2 items-center bg-violet-50 p-2 rounded-xl border border-violet-100">
                               <input 
                                  type="date" 
                                  value={rangeStart}
                                  onChange={e => setRangeStart(e.target.value)}
                                  className="flex-1 p-2 bg-white rounded-lg text-xs font-bold text-gray-700 outline-none focus:ring-2 focus:ring-violet-200"
                               />
                               <span className="text-violet-300 font-bold">→</span>
                               <input 
                                  type="date" 
                                  value={rangeEnd}
                                  onChange={e => setRangeEnd(e.target.value)}
                                  className="flex-1 p-2 bg-white rounded-lg text-xs font-bold text-gray-700 outline-none focus:ring-2 focus:ring-violet-200"
                               />
                           </div>
                       )}
                   </div>
               </div>
           </div>
       </div>

       {/* List */}
       <div className="flex-1 px-6 pb-4 space-y-4">
          {filteredTransactions.length === 0 ? (
             <div className="text-center py-12 bg-white rounded-[32px] border border-gray-100 shadow-sm">
                 <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-3 text-3xl grayscale opacity-50">🕵️‍♂️</div>
                 <p className="text-gray-900 text-sm font-bold">No transactions found</p>
                 <p className="text-gray-400 text-xs mt-1">Try adjusting your filters</p>
                 {timeFilter !== 'All' && (
                     <button onClick={() => setTimeFilter('All')} className="mt-4 px-4 py-2 bg-violet-50 text-violet-600 rounded-lg text-xs font-bold">
                         Reset Dates
                     </button>
                 )}
             </div>
          ) : (
             filteredTransactions.map(t => (
                <div 
                  key={t.id} 
                  onClick={() => setSelectedTransaction(t)}
                  className="bg-white p-4 rounded-2xl shadow-sm border border-gray-50 flex justify-between items-center cursor-pointer active:scale-[0.98] transition-transform group hover:border-violet-100"
                >
                   <div className="flex items-center gap-4">
                      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-2xl shadow-sm transition-transform group-hover:scale-110 ${
                          t.destinationType === 'Asset' ? 'bg-blue-50 text-blue-600' :
                          t.destinationType === 'Goal' ? 'bg-purple-50 text-purple-600' :
                          t.type === 'income' ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'
                      }`}>
                         {t.icon || (t.type === 'income' ? '💰' : '💸')}
                      </div>
                      <div>
                         <h4 className="font-bold text-gray-900 text-sm">{t.title}</h4>
                         <p className="text-[10px] text-gray-400 font-bold flex items-center gap-1 mt-1">
                             <span className="bg-gray-100 px-1.5 py-0.5 rounded text-gray-500">{t.date}</span>
                             {t.timestamp && <span>{formatTime(t.timestamp)}</span>}
                         </p>
                      </div>
                   </div>
                   <div className="text-right">
                       <span className={`font-bold text-sm block ${t.type === 'income' ? 'text-green-600' : 'text-gray-900'}`}>
                          {t.type === 'income' ? '+' : '-'}{formatIDR(t.amount)}
                       </span>
                       <span className="text-[10px] text-gray-400 font-medium capitalize">{t.category}</span>
                   </div>
                </div>
             ))
          )}
       </div>

       {/* Detail Modal */}
       {selectedTransaction && (
          <Modal isOpen={!!selectedTransaction} onClose={() => setSelectedTransaction(null)} title="Transaction Details">
             <div className="text-center mb-6">
                <div className="text-5xl mb-4 filter drop-shadow-md">{selectedTransaction.icon}</div>
                <h2 className="text-xl font-bold text-gray-900 leading-tight px-4">{selectedTransaction.title}</h2>
                <p className="text-3xl font-black mt-2 text-violet-600 tracking-tight">{formatIDR(selectedTransaction.amount)}</p>
             </div>
             
             <div className="space-y-3 mb-8 bg-gray-50 p-5 rounded-2xl text-sm border border-gray-100">
                <div className="flex justify-between items-center border-b border-gray-200 pb-2">
                   <span className="text-gray-500 font-medium">Date & Time</span>
                   <span className="font-bold text-gray-900">
                       {selectedTransaction.date}
                       {selectedTransaction.timestamp && <span className="text-gray-400 font-normal ml-1">at {formatTime(selectedTransaction.timestamp)}</span>}
                   </span>
                </div>
                <div className="flex justify-between items-center border-b border-gray-200 pb-2">
                   <span className="text-gray-500 font-medium">Category</span>
                   <span className="font-bold text-gray-900 flex items-center gap-1">
                       {selectedTransaction.category}
                   </span>
                </div>
                <div className="flex justify-between items-center">
                   <span className="text-gray-500 font-medium">Flow Type</span>
                   <span className={`font-bold uppercase text-xs px-2 py-1 rounded ${selectedTransaction.type === 'income' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                       {selectedTransaction.type}
                   </span>
                </div>
             </div>

             <div className="p-4 bg-orange-50 text-orange-800 text-xs font-medium rounded-xl mb-4 leading-relaxed border border-orange-100 flex gap-3 items-start">
                 <div className="mt-0.5">⚠️</div>
                 Deleting this record will automatically reverse any balance adjustments made to your portfolios, goals, or monthly budget.
             </div>

             <button onClick={handleDelete} className="w-full flex items-center justify-center gap-2 bg-white border-2 border-red-100 text-red-600 font-bold py-4 rounded-xl hover:bg-red-50 transition-all active:scale-95">
                <Trash2 size={18} /> Delete Permanently
             </button>
          </Modal>
       )}
    </div>
  );
};

export default HistoryView;
