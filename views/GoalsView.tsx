import React, { useState } from 'react';
import { useFinance } from '../App';
import { Goal, Transaction } from '../types';
import { formatIDR, generateId, getDaysRemaining } from '../utils';
import { Plus, Trash2, History, Edit3, Save, X, ArrowRight, ChevronRight, Calendar, Clock } from 'lucide-react';
import { Modal } from '../components/ui/Modal';

const GoalsView: React.FC = () => {
  const { goals, addGoal, deleteGoal, updateGoal, addTransaction } = useFinance();
  
  // State
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [selectedGoal, setSelectedGoal] = useState<Goal | null>(null);
  
  // Edit State
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState('');
  const [editTarget, setEditTarget] = useState('');
  const [editDeadline, setEditDeadline] = useState('');

  // Create Form
  const [newGoalName, setNewGoalName] = useState('');
  const [newGoalTarget, setNewGoalTarget] = useState('');
  const [newGoalDeadline, setNewGoalDeadline] = useState('');
  const [newGoalIcon, setNewGoalIcon] = useState('🎯');

  // Action Form
  const [amount, setAmount] = useState('');
  const [actionType, setActionType] = useState<'Deposit' | 'Withdraw'>('Deposit');

  // Open Detail Modal and setup Edit state
  const openDetail = (goal: Goal) => {
      setSelectedGoal(goal);
      setEditName(goal.name);
      setEditTarget(goal.target.toString());
      setEditDeadline(goal.deadline || '');
      setIsEditing(false);
      setIsDetailModalOpen(true);
  };

  const handleAddGoal = (e: React.FormEvent) => {
    e.preventDefault();
    addGoal({
      id: generateId(),
      name: newGoalName,
      target: Number(newGoalTarget),
      current: 0,
      deadline: newGoalDeadline || undefined,
      icon: newGoalIcon,
      color: 'bg-blue-100',
      history: []
    });
    setIsAddModalOpen(false);
    setNewGoalName('');
    setNewGoalTarget('');
    setNewGoalDeadline('');
    setNewGoalIcon('🎯');
  };

  const handleUpdateGoal = (e: React.FormEvent) => {
      e.preventDefault();
      if (!selectedGoal) return;

      const updatedGoal = {
          ...selectedGoal,
          name: editName,
          target: Number(editTarget),
          deadline: editDeadline
      };

      updateGoal(updatedGoal);
      setSelectedGoal(updatedGoal);
      setIsEditing(false);
  };

  const handleTransaction = (e: React.FormEvent) => {
     e.preventDefault();
     if (!selectedGoal) return;

     const val = Number(amount);
     const t: Transaction = {
        id: generateId(),
        title: `${actionType} for ${selectedGoal.name}`,
        amount: val,
        type: actionType === 'Deposit' ? 'income' : 'expense',
        category: 'Goal Savings',
        date: new Date().toISOString().split('T')[0],
        timestamp: Date.now(),
        destinationId: selectedGoal.id,
        destinationType: 'Goal',
        icon: selectedGoal.icon
     };
     addTransaction(t);
     setAmount('');
     setIsDetailModalOpen(false);
  };

  const handleDelete = () => {
      if (selectedGoal && confirm('Delete this goal?')) {
          deleteGoal(selectedGoal.id);
          setIsDetailModalOpen(false);
      }
  };

  return (
    <div className="pb-24 space-y-8">
      {/* Header */}
      <div className="flex justify-between items-center px-2">
        <h1 className="text-3xl font-black text-gray-900 tracking-tight">Saving Goals</h1>
        <button 
            onClick={() => setIsAddModalOpen(true)} 
            className="w-12 h-12 bg-gray-900 text-white rounded-full shadow-xl shadow-gray-300 flex items-center justify-center active:scale-90 transition-transform hover:bg-gray-800"
        >
          <Plus size={24} strokeWidth={3} />
        </button>
      </div>

      <div className="space-y-5">
        {goals.map(goal => {
          const percent = Math.min(100, Math.round((goal.current / goal.target) * 100));
          const daysLeft = getDaysRemaining(goal.deadline);
          const isOverdue = daysLeft === 'Overdue';

          return (
            <div 
              key={goal.id} 
              onClick={() => openDetail(goal)}
              className="group bg-white p-6 rounded-[32px] shadow-[0_8px_30px_rgba(0,0,0,0.04)] border border-gray-50 relative overflow-hidden cursor-pointer transition-all hover:shadow-[0_12px_40px_rgba(0,0,0,0.08)] hover:-translate-y-1 active:scale-[0.98]"
            >
              {/* Card Header */}
              <div className="flex justify-between items-start mb-5">
                 <div className="flex items-center gap-4">
                    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-3xl shadow-sm ${goal.color} group-hover:scale-110 transition-transform duration-300`}>
                       {goal.icon}
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900 text-lg leading-tight">{goal.name}</h3>
                      <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mt-1">
                          Target: {formatIDR(goal.target)}
                      </p>
                    </div>
                 </div>
                 <div className="text-right">
                     <span className="bg-gray-900 text-white text-xs font-black px-3 py-1.5 rounded-full shadow-lg shadow-gray-200">
                         {percent}%
                     </span>
                     {goal.deadline && (
                         <p className={`text-[10px] font-bold mt-2 ${isOverdue ? 'text-red-500' : 'text-red-400'}`}>
                             {daysLeft}
                         </p>
                     )}
                 </div>
              </div>
              
              {/* Progress Bar */}
              <div className="h-3.5 bg-gray-100 rounded-full overflow-hidden mb-3 border border-gray-50">
                 <div 
                    className="h-full bg-gradient-to-r from-violet-500 via-purple-500 to-fuchsia-500 rounded-full shadow-[0_2px_10px_rgba(167,139,250,0.5)] transition-all duration-1000 ease-out" 
                    style={{ width: `${percent}%` }} 
                 />
              </div>
              
              {/* Footer Stats */}
              <div className="flex justify-between text-xs font-medium">
                 <span className="text-gray-900 font-bold">{formatIDR(goal.current)} <span className="text-gray-400 font-normal">saved</span></span>
                 <span className="text-gray-400">{formatIDR(goal.target - goal.current)} left</span>
              </div>

              <div className="absolute right-4 bottom-4 opacity-0 group-hover:opacity-100 transition-opacity text-violet-500">
                  <ChevronRight size={20} />
              </div>
            </div>
          );
        })}
        
        {goals.length === 0 && (
            <div className="text-center py-16 bg-white rounded-[32px] border border-dashed border-gray-200">
                <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4 text-3xl grayscale opacity-50">🏝️</div>
                <p className="text-gray-400 font-bold">No goals yet.</p>
                <p className="text-xs text-gray-300 mt-1">Tap + to create your first dream.</p>
            </div>
        )}
      </div>

      {/* Add Goal Modal */}
      <Modal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} title="New Dream">
        <form onSubmit={handleAddGoal} className="space-y-5">
          <div>
            <label className="block text-xs font-bold text-gray-400 uppercase mb-1 ml-1">Goal Name</label>
            <input required type="text" value={newGoalName} onChange={e => setNewGoalName(e.target.value)} className="w-full p-4 bg-gray-50 rounded-2xl border-none font-bold text-gray-900 focus:ring-2 focus:ring-violet-200" placeholder="e.g. Japan Trip" />
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-400 uppercase mb-1 ml-1">Target Amount</label>
            <div className="relative">
                <span className="absolute left-4 top-4 text-gray-400 font-bold">Rp</span>
                <input required type="number" value={newGoalTarget} onChange={e => setNewGoalTarget(e.target.value)} className="w-full pl-12 p-4 bg-gray-50 rounded-2xl border-none font-bold text-gray-900 focus:ring-2 focus:ring-violet-200" placeholder="0" />
            </div>
          </div>
          <div className="grid grid-cols-3 gap-3">
             <div className="col-span-2">
                <label className="block text-xs font-bold text-gray-400 uppercase mb-1 ml-1">Deadline</label>
                <input type="date" value={newGoalDeadline} onChange={e => setNewGoalDeadline(e.target.value)} className="w-full p-4 bg-gray-50 rounded-2xl border-none font-bold text-gray-900 focus:ring-2 focus:ring-violet-200 text-sm" />
             </div>
             <div>
                <label className="block text-xs font-bold text-gray-400 uppercase mb-1 ml-1">Icon</label>
                <input type="text" maxLength={2} value={newGoalIcon} onChange={e => setNewGoalIcon(e.target.value)} className="w-full p-4 bg-gray-50 rounded-2xl border-none font-bold text-center text-2xl focus:ring-2 focus:ring-violet-200" />
             </div>
          </div>
          <button type="submit" className="w-full bg-gray-900 text-white font-bold py-4 rounded-2xl shadow-xl shadow-gray-300 mt-2 active:scale-95 transition-transform">Start Saving</button>
        </form>
      </Modal>

      {/* Goal Detail / Edit Modal */}
      {selectedGoal && (
        <Modal isOpen={isDetailModalOpen} onClose={() => setIsDetailModalOpen(false)} title={isEditing ? "Edit Goal" : selectedGoal.name}>
            
            {/* Header Toggle (View/Edit) */}
            <div className="absolute top-6 right-6">
                {isEditing ? (
                    <button onClick={() => setIsEditing(false)} className="p-2 bg-gray-100 rounded-full text-gray-500 hover:bg-gray-200 transition-colors">
                        <X size={18} />
                    </button>
                ) : (
                    <button onClick={() => setIsEditing(true)} className="p-2 bg-violet-50 text-violet-600 rounded-full hover:bg-violet-100 transition-colors flex items-center gap-2 px-3">
                        <span className="text-xs font-bold">Edit</span>
                        <Edit3 size={14} />
                    </button>
                )}
            </div>

            {isEditing ? (
                // --- EDIT MODE ---
                <form onSubmit={handleUpdateGoal} className="space-y-5 mt-2 animate-in fade-in slide-in-from-bottom-4">
                    <div>
                        <label className="block text-xs font-bold text-gray-400 uppercase mb-1 ml-1">Goal Name</label>
                        <input required type="text" value={editName} onChange={e => setEditName(e.target.value)} className="w-full p-3 bg-gray-50 rounded-xl font-bold text-gray-900" />
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-gray-400 uppercase mb-1 ml-1">Target Amount</label>
                        <div className="relative">
                            <span className="absolute left-4 top-3.5 text-gray-400 font-bold">Rp</span>
                            <input required type="number" value={editTarget} onChange={e => setEditTarget(e.target.value)} className="w-full pl-12 p-3 bg-gray-50 rounded-xl font-bold text-gray-900" />
                        </div>
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-gray-400 uppercase mb-1 ml-1">Extend/Change Deadline</label>
                        <input type="date" value={editDeadline} onChange={e => setEditDeadline(e.target.value)} className="w-full p-3 bg-gray-50 rounded-xl font-bold text-gray-900" />
                    </div>
                    <button type="submit" className="w-full bg-gray-900 text-white font-bold py-3 rounded-xl flex items-center justify-center gap-2 mt-4">
                        <Save size={18} /> Save Changes
                    </button>
                </form>
            ) : (
                // --- VIEW MODE ---
                <>
                    <div className="text-center mb-8 mt-2">
                        <div className="text-5xl mb-3 animate-bounce-slow">{selectedGoal.icon}</div>
                        <p className="text-xs text-gray-400 font-bold uppercase tracking-widest">Current Balance</p>
                        <h2 className="text-4xl font-black text-gray-900 tracking-tight mt-1">{formatIDR(selectedGoal.current)}</h2>
                        
                        {/* Info Badges with Extend Action */}
                        <div className="flex flex-col items-center gap-2 mt-3">
                             <p className="text-xs font-medium text-gray-500 bg-gray-100 px-3 py-1 rounded-full inline-block">
                                Target: {formatIDR(selectedGoal.target)}
                            </p>
                            <button 
                                onClick={() => setIsEditing(true)}
                                className="text-[10px] font-bold text-violet-600 bg-violet-50 px-3 py-1 rounded-full hover:bg-violet-100 transition-colors flex items-center gap-1.5 active:scale-95"
                            >
                                <Clock size={12} /> 
                                {selectedGoal.deadline ? `Due: ${selectedGoal.deadline} (Extend)` : 'Set Deadline'}
                            </button>
                        </div>
                    </div>

                    <div className="flex bg-gray-100 rounded-2xl p-1.5 mb-6">
                        <button onClick={() => setActionType('Deposit')} className={`flex-1 py-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${actionType === 'Deposit' ? 'bg-white shadow text-green-600' : 'text-gray-400'}`}>
                            <ArrowRight size={14} className="rotate-[-45deg]" /> Deposit
                        </button>
                        <button onClick={() => setActionType('Withdraw')} className={`flex-1 py-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${actionType === 'Withdraw' ? 'bg-white shadow text-red-600' : 'text-gray-400'}`}>
                            <ArrowRight size={14} className="rotate-[45deg]" /> Withdraw
                        </button>
                    </div>

                    <form onSubmit={handleTransaction} className="space-y-4 mb-8">
                        <div className="relative">
                            <span className="absolute left-4 top-4 text-gray-400 font-bold text-lg">Rp</span>
                            <input autoFocus required type="number" value={amount} onChange={e => setAmount(e.target.value)} className="w-full pl-12 p-4 bg-gray-50 rounded-2xl font-bold text-center text-2xl text-gray-900 focus:ring-2 focus:ring-violet-100 outline-none" placeholder="0" />
                        </div>
                        <button type="submit" className={`w-full font-bold py-4 rounded-2xl shadow-lg transition-transform active:scale-95 ${actionType === 'Deposit' ? 'bg-gray-900 text-white' : 'bg-white border-2 border-red-100 text-red-500'}`}>
                            Confirm {actionType}
                        </button>
                    </form>

                    <div className="border-t border-gray-100 pt-6">
                        <h4 className="text-xs font-bold text-gray-400 uppercase mb-4 flex items-center gap-2">
                            <History size={14} /> Transaction History
                        </h4>
                        <div className="max-h-32 overflow-y-auto space-y-3 pr-2 custom-scrollbar">
                            {selectedGoal.history.slice().reverse().map((h, i) => (
                                <div key={i} className="flex justify-between text-sm font-medium">
                                    <span className="text-gray-500 text-xs">{h.date}</span>
                                    <span className={h.type === 'Deposit' ? 'text-green-600' : 'text-red-600'}>
                                        {h.type === 'Deposit' ? '+' : '-'} {formatIDR(h.amount)}
                                    </span>
                                </div>
                            ))}
                            {selectedGoal.history.length === 0 && <p className="text-xs text-gray-300 italic text-center py-2">No transactions yet</p>}
                        </div>
                    </div>
                    
                    <button onClick={handleDelete} className="w-full mt-8 py-3 text-red-500 text-xs font-bold hover:bg-red-50 rounded-xl transition-colors flex items-center justify-center gap-2">
                        <Trash2 size={14} /> Delete Goal
                    </button>
                </>
            )}
        </Modal>
      )}
    </div>
  );
};

export default GoalsView;