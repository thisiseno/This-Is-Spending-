import React, { useState } from 'react';
import { useFinance } from '../App';
import { Transaction, Category } from '../types';
import { formatIDR, generateId } from '../utils';
import { ArrowLeft, Plus, Calendar, Repeat } from 'lucide-react';
import { Modal } from '../components/ui/Modal';

const LogView: React.FC = () => {
  const { setView, addTransaction, assets, goals, categories, addCategory } = useFinance();
  
  // Log State
  const [amount, setAmount] = useState('');
  const [title, setTitle] = useState('');
  const [type, setType] = useState<'expense' | 'income'>('expense');
  const [selectedCategory, setSelectedCategory] = useState(categories[0].name);
  const [destinationType, setDestinationType] = useState<'Asset' | 'Goal' | 'Budget'>('Budget');
  const [destinationId, setDestinationId] = useState<number | ''>('');

  // Recurring State
  const [isRecurring, setIsRecurring] = useState(false);
  const [recurringDate, setRecurringDate] = useState(new Date().toISOString().split('T')[0]);

  // New Category State
  const [isCatModalOpen, setIsCatModalOpen] = useState(false);
  const [newCatName, setNewCatName] = useState('');
  const [newCatIcon, setNewCatIcon] = useState('🏷️');

  const handleSubmit = () => {
    if (!amount || !title) return;
    if (type === 'income' && destinationType !== 'Budget' && !destinationId) {
      alert('Please select a destination account.');
      return;
    }

    const transaction: Transaction = {
      id: generateId(),
      title,
      amount: Number(amount),
      type,
      category: type === 'income' ? 'Income' : selectedCategory,
      date: new Date().toISOString().split('T')[0],
      timestamp: Date.now(),
      icon: type === 'expense' ? categories.find(c => c.name === selectedCategory)?.icon : '💰',
      destinationId: destinationId ? Number(destinationId) : undefined,
      destinationType: type === 'income' ? destinationType : undefined
    };

    addTransaction(transaction);
    setView('dashboard');
  };

  const handleAddCategory = (e: React.FormEvent) => {
    e.preventDefault();
    if (newCatName) {
       addCategory({ name: newCatName, icon: newCatIcon, custom: true });
       setIsCatModalOpen(false);
       setNewCatName('');
    }
  };

  return (
    // Added -m-6 for full screen effect
    <div className="min-h-[calc(100vh-2rem)] -m-6 bg-gray-50 flex flex-col relative pb-24">
      {/* Header */}
      <div className="flex justify-between items-center p-6 pb-2">
        <button onClick={() => setView('dashboard')} className="p-2 -ml-2 bg-white rounded-full shadow-sm text-gray-600 hover:bg-gray-100 active:scale-95 transition-transform">
          <ArrowLeft size={20} />
        </button>
        <h2 className="font-bold text-lg text-gray-900">New Transaction</h2>
        <div className="w-10" /> 
      </div>

      <div className="flex-1 px-6 pt-4 space-y-6 overflow-y-auto pb-12">
          {/* Type Toggle */}
          <div className="flex bg-gray-200 p-1 rounded-[20px]">
            {['expense', 'income'].map((t) => (
               <button
                 key={t}
                 onClick={() => setType(t as any)}
                 className={`flex-1 py-3.5 rounded-2xl text-sm font-bold capitalize transition-all duration-300 ${type === t ? 'bg-gray-900 text-white shadow-md transform scale-[1.02]' : 'text-gray-500 hover:text-gray-700'}`}
               >
                 {t}
               </button>
            ))}
          </div>

          {/* Amount Input */}
          <div className="text-center py-8">
            <p className="text-[10px] text-gray-400 uppercase font-bold mb-3 tracking-widest">Enter Amount</p>
            <div className="flex items-center justify-center gap-1 text-gray-900 relative">
               <span className="text-3xl font-black text-gray-300 absolute left-0 w-full text-center pointer-events-none opacity-0">Rp</span>
               <input 
                 type="number" 
                 value={amount}
                 onChange={e => setAmount(e.target.value)}
                 placeholder="0"
                 className="text-6xl font-black bg-transparent border-none text-center w-full focus:ring-0 p-0 placeholder-gray-200 tracking-tight text-gray-900 caret-violet-500"
                 autoFocus
               />
            </div>
          </div>

          {/* Form Fields */}
          <div className="space-y-5">
            <div>
               <label className="block text-[10px] font-bold text-gray-400 uppercase mb-2 ml-1">Title</label>
               <input 
                 type="text" 
                 value={title} 
                 onChange={e => setTitle(e.target.value)}
                 placeholder={type === 'expense' ? "e.g. Dinner at McD" : "e.g. Freelance Project"}
                 className="w-full p-4 bg-white rounded-2xl border-none shadow-sm focus:ring-2 focus:ring-violet-500 text-gray-800 font-bold text-lg placeholder-gray-300"
               />
            </div>

            {/* Category Selector (Expense Only) */}
            {type === 'expense' && (
              <div className="animate-in fade-in slide-in-from-bottom-4">
                 <div className="flex justify-between items-center mb-3 ml-1">
                    <label className="text-[10px] font-bold text-gray-400 uppercase">Category</label>
                    <button onClick={() => setIsCatModalOpen(true)} className="text-violet-600 text-xs font-bold flex items-center gap-1 hover:bg-violet-50 px-2 py-1 rounded-lg transition-colors">
                       <Plus size={14} /> Add New
                    </button>
                 </div>
                 <div className="grid grid-cols-3 gap-3">
                   {categories.map(cat => (
                     <button
                       key={cat.name}
                       onClick={() => setSelectedCategory(cat.name)}
                       className={`flex flex-col items-center justify-center p-4 rounded-2xl border-2 transition-all duration-200 ${
                         selectedCategory === cat.name 
                           ? 'bg-violet-50 border-violet-500 shadow-md scale-[1.02]' 
                           : 'bg-white border-transparent hover:border-gray-200 hover:bg-gray-50'
                       }`}
                     >
                       <span className="text-3xl mb-2 filter drop-shadow-sm">{cat.icon}</span>
                       <span className={`text-[10px] font-bold uppercase tracking-wide ${selectedCategory === cat.name ? 'text-violet-700' : 'text-gray-400'}`}>{cat.name}</span>
                     </button>
                   ))}
                 </div>
              </div>
            )}

            {/* Recurring Option */}
            {type === 'expense' && (
                <div className="bg-white p-4 rounded-2xl flex items-center justify-between shadow-sm border border-gray-50">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-blue-50 text-blue-600 rounded-xl">
                            <Repeat size={20} />
                        </div>
                        <div>
                            <p className="text-sm font-bold text-gray-900">Recurring Payment</p>
                            <p className="text-[10px] text-gray-400">Auto-record this expense</p>
                        </div>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" className="sr-only peer" checked={isRecurring} onChange={(e) => setIsRecurring(e.target.checked)} />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                </div>
            )}

            {isRecurring && (
                <div className="animate-in slide-in-from-top-2 fade-in bg-blue-50 p-4 rounded-2xl border border-blue-100">
                    <label className="block text-[10px] font-bold text-blue-400 uppercase mb-2 ml-1">Next Date</label>
                    <div className="relative">
                        <Calendar className="absolute left-4 top-3.5 text-blue-400" size={18} />
                        <input 
                            type="date" 
                            value={recurringDate}
                            onChange={(e) => setRecurringDate(e.target.value)}
                            className="w-full pl-12 p-3 bg-white rounded-xl border-none text-sm font-bold text-gray-700 focus:ring-2 focus:ring-blue-300"
                        />
                    </div>
                </div>
            )}

            {/* Income Destination */}
            {type === 'income' && (
              <div className="bg-green-50 p-5 rounded-[24px] border border-green-100 animate-in fade-in">
                <label className="block text-xs font-bold text-green-800 uppercase mb-3">Allocate To</label>
                <div className="flex gap-2 mb-4">
                  {['Budget', 'Asset', 'Goal'].map(d => (
                     <button 
                       key={d} 
                       onClick={() => setDestinationType(d as any)} 
                       className={`flex-1 py-2.5 text-xs font-bold rounded-xl transition-all ${destinationType === d ? 'bg-green-600 text-white shadow-md' : 'bg-white text-green-600'}`}
                     >
                       {d === 'Budget' ? 'Spending' : d + 's'}
                     </button>
                  ))}
                </div>
                
                {destinationType === 'Budget' ? (
                   <p className="text-xs text-green-700 font-medium bg-white/50 p-3 rounded-xl leading-relaxed">
                      This income will be added to your "Spending Limit" for this month, increasing your budget.
                   </p>
                ) : (
                  <select 
                    value={destinationId} 
                    onChange={(e) => setDestinationId(Number(e.target.value))}
                    className="w-full p-3 bg-white rounded-xl border-none text-gray-800 font-bold focus:ring-2 focus:ring-green-500"
                  >
                    <option value="">Select {destinationType}</option>
                    {(destinationType === 'Asset' ? assets : goals).map(item => (
                      <option key={item.id} value={item.id}>{item.name}</option>
                    ))}
                  </select>
                )}
              </div>
            )}

            <div className="h-4"></div> {/* Spacer */}

            <button 
              onClick={handleSubmit}
              disabled={!amount || !title}
              className="w-full bg-gradient-to-r from-gray-900 to-gray-800 text-white py-4 rounded-[24px] font-bold text-lg shadow-xl shadow-gray-300 disabled:opacity-50 disabled:cursor-not-allowed active:scale-95 transition-transform flex items-center justify-center relative overflow-hidden group"
            >
              <div className="absolute inset-0 bg-white/10 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-500"></div>
              <span className="relative z-10">Slide to Save {type === 'income' ? 'Income' : 'Expense'}</span>
            </button>
          </div>
      </div>

      <Modal isOpen={isCatModalOpen} onClose={() => setIsCatModalOpen(false)} title="New Category">
         <form onSubmit={handleAddCategory} className="space-y-4">
            <div>
               <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Category Name</label>
               <input required type="text" value={newCatName} onChange={e => setNewCatName(e.target.value)} className="w-full p-3 bg-gray-50 rounded-xl border-none font-bold" placeholder="e.g. Hobbies" />
            </div>
            <div>
               <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Emoji Icon</label>
               <input required type="text" maxLength={2} value={newCatIcon} onChange={e => setNewCatIcon(e.target.value)} className="w-full p-3 bg-gray-50 rounded-xl border-none font-bold text-center text-2xl" />
            </div>
            <button type="submit" className="w-full bg-gray-900 text-white font-bold py-3 rounded-xl mt-2">Add Category</button>
         </form>
      </Modal>
    </div>
  );
};

export default LogView;