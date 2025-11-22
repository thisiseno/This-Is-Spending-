import React, { useState } from 'react';
import { useFinance } from '../App';
import { Goal, Transaction } from '../types';
import { formatIDR, generateId, getDaysRemaining } from '../utils';
import { Plus, Trash2, History } from 'lucide-react';
import { Modal } from '../components/ui/Modal';

const GoalsView: React.FC = () => {
  const { goals, addGoal, deleteGoal, addTransaction } = useFinance();
  
  // State
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [selectedGoal, setSelectedGoal] = useState<Goal | null>(null);
  
  // Create Form
  const [newGoalName, setNewGoalName] = useState('');
  const [newGoalTarget, setNewGoalTarget] = useState('');
  const [newGoalDeadline, setNewGoalDeadline] = useState('');
  const [newGoalIcon, setNewGoalIcon] = useState('🎯');

  // Action Form
  const [amount, setAmount] = useState('');
  const [actionType, setActionType] = useState<'Deposit' | 'Withdraw'>('Deposit');

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
    <div className="pb-24 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Saving Goals</h1>
        <button onClick={() => setIsAddModalOpen(true)} className="p-2 bg-gray-900 text-white rounded-full shadow-lg active:scale-95 transition-transform">
          <Plus size={20} />
        </button>
      </div>

      <div className="space-y-4">
        {goals.map(goal => {
          const percent = Math.min(100, Math.round((goal.current / goal.target) * 100));
          return (
            <div 
              key={goal.id} 
              onClick={() => { setSelectedGoal(goal); setIsDetailModalOpen(true); }}
              className="bg-white p-5 rounded-3xl shadow-sm border border-gray-100 relative overflow-hidden cursor-pointer hover:shadow-md transition-shadow"
            >
              <div className="flex justify-between items-start mb-4">
                 <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center text-xl ${goal.color}`}>
                       {goal.icon}
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900">{goal.name}</h3>
                      <p className="text-xs text-gray-400 font-bold">TARGET: {formatIDR(goal.target)}</p>
                    </div>
                 </div>
                 <div className="text-right">
                     <span className="bg-gray-900 text-white text-xs font-bold px-2 py-1 rounded-lg">{percent}%</span>
                     {goal.deadline && (
                         <p className="text-[10px] text-red-500 font-bold mt-1">{getDaysRemaining(goal.deadline)}</p>
                     )}
                 </div>
              </div>
              
              <div className="h-3 bg-gray-100 rounded-full overflow-hidden mb-2">
                 <div className="h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full" style={{ width: `${percent}%` }} />
              </div>
              
              <div className="flex justify-between text-xs font-medium text-gray-500">
                 <span className="text-gray-900 font-bold">{formatIDR(goal.current)} saved</span>
                 <span>{formatIDR(goal.target - goal.current)} left</span>
              </div>
            </div>
          );
        })}
        {goals.length === 0 && (
            <div className="text-center py-10 text-gray-400">
                No goals yet. Tap + to dream big!
            </div>
        )}
      </div>

      {/* Add Goal Modal */}
      <Modal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} title="New Goal">
        <form onSubmit={handleAddGoal} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Goal Name</label>
            <input required type="text" value={newGoalName} onChange={e => setNewGoalName(e.target.value)} className="w-full p-3 bg-gray-50 rounded-xl font-bold" placeholder="e.g. New Car" />
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Target Amount</label>
            <input required type="number" value={newGoalTarget} onChange={e => setNewGoalTarget(e.target.value)} className="w-full p-3 bg-gray-50 rounded-xl font-bold" placeholder="0" />
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Deadline (Optional)</label>
            <input type="date" value={newGoalDeadline} onChange={e => setNewGoalDeadline(e.target.value)} className="w-full p-3 bg-gray-50 rounded-xl font-bold" />
          </div>
          <div>
             <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Emoji Icon</label>
             <input type="text" maxLength={2} value={newGoalIcon} onChange={e => setNewGoalIcon(e.target.value)} className="w-12 p-3 bg-gray-50 rounded-xl font-bold text-center text-xl border-none" />
          </div>
          <button type="submit" className="w-full bg-gray-900 text-white font-bold py-3 rounded-xl mt-2">Start Saving</button>
        </form>
      </Modal>

      {/* Goal Detail / Action Modal */}
      {selectedGoal && (
        <Modal isOpen={isDetailModalOpen} onClose={() => setIsDetailModalOpen(false)} title={selectedGoal.name}>
            <div className="text-center mb-6">
                <div className="text-4xl mb-2">{selectedGoal.icon}</div>
                <p className="text-xs text-gray-400 font-bold">CURRENT BALANCE</p>
                <h2 className="text-3xl font-bold text-gray-900">{formatIDR(selectedGoal.current)}</h2>
                <p className="text-xs text-gray-500 mt-1">Target: {formatIDR(selectedGoal.target)}</p>
            </div>

            <div className="flex bg-gray-100 rounded-xl p-1 mb-4">
                <button onClick={() => setActionType('Deposit')} className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all ${actionType === 'Deposit' ? 'bg-white shadow text-green-600' : 'text-gray-500'}`}>Deposit</button>
                <button onClick={() => setActionType('Withdraw')} className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all ${actionType === 'Withdraw' ? 'bg-white shadow text-red-600' : 'text-gray-500'}`}>Withdraw</button>
            </div>

            <form onSubmit={handleTransaction} className="space-y-3 mb-6">
                 <input autoFocus required type="number" value={amount} onChange={e => setAmount(e.target.value)} className="w-full p-3 bg-gray-50 rounded-xl font-bold text-center text-lg" placeholder="0" />
                 <button type="submit" className="w-full bg-gray-900 text-white font-bold py-3 rounded-xl">
                     Confirm {actionType}
                 </button>
            </form>

            <div className="border-t border-gray-100 pt-4">
                <h4 className="text-xs font-bold text-gray-400 uppercase mb-2 flex items-center gap-1">
                    <History size={12} /> Recent History
                </h4>
                <div className="max-h-32 overflow-y-auto space-y-2">
                    {selectedGoal.history.slice().reverse().map((h, i) => (
                        <div key={i} className="flex justify-between text-xs font-medium">
                            <span className="text-gray-500">{h.date}</span>
                            <span className={h.type === 'Deposit' ? 'text-green-600' : 'text-red-600'}>
                                {h.type === 'Deposit' ? '+' : '-'} {formatIDR(h.amount)}
                            </span>
                        </div>
                    ))}
                    {selectedGoal.history.length === 0 && <p className="text-xs text-gray-300 italic">No transactions yet</p>}
                </div>
            </div>
            
            <button onClick={handleDelete} className="w-full mt-6 py-2 text-red-500 text-xs font-bold border border-red-100 rounded-xl hover:bg-red-50">
                Delete Goal
            </button>
        </Modal>
      )}
    </div>
  );
};

export default GoalsView;