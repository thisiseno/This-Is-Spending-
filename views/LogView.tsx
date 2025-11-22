import React, { useState } from 'react';
import { useFinance } from '../App';
import { Transaction, Category } from '../types';
import { formatIDR, generateId } from '../utils';
import { ArrowLeft, Plus } from 'lucide-react';
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
    <div className="min-h-[80vh]">
      <div className="flex justify-between items-center mb-8">
        <button onClick={() => setView('dashboard')} className="p-2 bg-white rounded-full shadow-sm text-gray-600 hover:bg-gray-50">
          <ArrowLeft size={20} />
        </button>
        <h2 className="font-bold text-lg">New Transaction</h2>
        <div className="w-10" /> 
      </div>

      <div className="space-y-6 animate-in slide-in-from-bottom duration-300">
          {/* Type Toggle */}
          <div className="flex bg-white p-1 rounded-2xl shadow-sm border border-gray-100">
            {['expense', 'income'].map((t) => (
               <button
                 key={t}
                 onClick={() => setType(t as any)}
                 className={`flex-1 py-3 rounded-xl text-sm font-bold capitalize transition-all ${type === t ? 'bg-gray-900 text-white shadow-md' : 'text-gray-500 hover:bg-gray-50'}`}
               >
                 {t}
               </button>
            ))}
          </div>

          {/* Amount Input */}
          <div className="text-center py-6">
            <p className="text-xs text-gray-400 uppercase font-bold mb-2">Enter Amount</p>
            <div className="flex items-center justify-center gap-2 text-gray-900 relative">
               <span className="text-3xl font-bold text-gray-300 absolute left-0 w-full text-center pointer-events-none opacity-0">Rp</span>
               <input 
                 type="number" 
                 value={amount}
                 onChange={e => setAmount(e.target.value)}
                 placeholder="0"
                 className="text-6xl font-bold bg-transparent border-none text-center w-full focus:ring-0 p-0 placeholder-gray-200 tracking-tighter"
                 autoFocus
               />
            </div>
          </div>

          {/* Form Fields */}
          <div className="space-y-4">
            <div>
               <label className="block text-xs font-bold text-gray-400 uppercase mb-2 ml-1">Title</label>
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
              <div>
                 <div className="flex justify-between items-center mb-2 ml-1">
                    <label className="text-xs font-bold text-gray-400 uppercase">Category</label>
                    <button onClick={() => setIsCatModalOpen(true)} className="text-violet-600 text-xs font-bold flex items-center gap-1">
                       <Plus size={12} /> Add New
                    </button>
                 </div>
                 <div className="grid grid-cols-3 gap-3">
                   {categories.map(cat => (
                     <button
                       key={cat.name}
                       onClick={() => setSelectedCategory(cat.name)}
                       className={`flex flex-col items-center justify-center p-3 rounded-2xl border transition-all ${
                         selectedCategory === cat.name 
                           ? 'bg-violet-600 text-white border-violet-600 shadow-lg shadow-violet-200' 
                           : 'bg-white text-gray-500 border-gray-100 hover:border-violet-200'
                       }`}
                     >
                       <span className="text-2xl mb-1">{cat.icon}</span>
                       <span className="text-[10px] font-bold uppercase tracking-wide">{cat.name}</span>
                     </button>
                   ))}
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
                   <p className="text-xs text-green-700 font-medium bg-white/50 p-3 rounded-xl">
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

            <button 
              onClick={handleSubmit}
              disabled={!amount || !title}
              className="w-full bg-gray-900 text-white py-4 rounded-[24px] font-bold text-lg shadow-xl shadow-gray-300 mt-6 disabled:opacity-50 disabled:cursor-not-allowed active:scale-95 transition-transform"
            >
              Save {type === 'income' ? 'Income' : 'Expense'}
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