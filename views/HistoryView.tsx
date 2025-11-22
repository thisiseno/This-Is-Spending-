import React, { useState } from 'react';
import { useFinance } from '../App';
import { formatIDR } from '../utils';
import { ArrowLeft, Trash2, Search, Clock } from 'lucide-react';
import { Modal } from '../components/ui/Modal';
import { Transaction } from '../types';

const HistoryView: React.FC = () => {
  const { transactions, setView, deleteTransaction } = useFinance();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);

  const filteredTransactions = transactions.filter(t => 
     t.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
     t.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
    <div className="pb-20 min-h-screen flex flex-col">
       <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
             <button onClick={() => setView('dashboard')} className="p-2 bg-white rounded-full shadow-sm text-gray-600 hover:bg-gray-50">
                <ArrowLeft size={20} />
             </button>
             <h1 className="text-2xl font-bold text-gray-900">History</h1>
          </div>
       </div>

       <div className="relative mb-6">
          <Search className="absolute left-4 top-3.5 text-gray-400" size={18} />
          <input 
            type="text" 
            placeholder="Search transactions..." 
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full pl-12 p-3 bg-white rounded-xl border-none shadow-sm focus:ring-2 focus:ring-violet-500"
          />
       </div>

       <div className="space-y-3 flex-1">
          {filteredTransactions.length === 0 ? (
             <div className="text-center text-gray-400 mt-10">No transactions found.</div>
          ) : (
             filteredTransactions.map(t => (
                <div 
                  key={t.id} 
                  onClick={() => setSelectedTransaction(t)}
                  className="bg-white p-4 rounded-2xl shadow-sm border border-gray-50 flex justify-between items-center cursor-pointer active:scale-[0.98] transition-transform"
                >
                   <div className="flex items-center gap-4">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center text-lg ${t.type === 'income' ? 'bg-green-50' : 'bg-red-50'}`}>
                         {t.icon || (t.type === 'income' ? '💰' : '💸')}
                      </div>
                      <div>
                         <h4 className="font-bold text-gray-900 text-sm">{t.title}</h4>
                         <p className="text-xs text-gray-400 flex items-center gap-1">
                             {t.date} 
                             {t.timestamp && <span className="text-gray-300">• {formatTime(t.timestamp)}</span>}
                             <span className="text-gray-300">• {t.category}</span>
                         </p>
                      </div>
                   </div>
                   <span className={`font-bold text-sm ${t.type === 'income' ? 'text-green-600' : 'text-gray-900'}`}>
                      {t.type === 'income' ? '+' : '-'}{formatIDR(t.amount)}
                   </span>
                </div>
             ))
          )}
       </div>

       {selectedTransaction && (
          <Modal isOpen={!!selectedTransaction} onClose={() => setSelectedTransaction(null)} title="Transaction Details">
             <div className="text-center mb-6">
                <div className="text-4xl mb-2">{selectedTransaction.icon}</div>
                <h2 className="text-xl font-bold text-gray-900">{selectedTransaction.title}</h2>
                <p className="text-2xl font-bold mt-2 text-violet-600">{formatIDR(selectedTransaction.amount)}</p>
             </div>
             
             <div className="space-y-2 mb-6 bg-gray-50 p-4 rounded-xl text-sm">
                <div className="flex justify-between">
                   <span className="text-gray-500">Date</span>
                   <span className="font-bold">
                       {selectedTransaction.date}
                       {selectedTransaction.timestamp && ` at ${formatTime(selectedTransaction.timestamp)}`}
                   </span>
                </div>
                <div className="flex justify-between">
                   <span className="text-gray-500">Category</span>
                   <span className="font-bold">{selectedTransaction.category}</span>
                </div>
                <div className="flex justify-between">
                   <span className="text-gray-500">Type</span>
                   <span className="font-bold capitalize">{selectedTransaction.type}</span>
                </div>
                {selectedTransaction.destinationType && (
                    <div className="flex justify-between">
                        <span className="text-gray-500">Destination</span>
                        <span className="font-bold capitalize">{selectedTransaction.destinationType}</span>
                    </div>
                )}
             </div>

             <div className="p-3 bg-yellow-50 text-yellow-700 text-xs rounded-xl mb-4 leading-relaxed">
                 Deleting this will automatically reverse the balance adjustment made to your assets, goals, or budget.
             </div>

             <button onClick={handleDelete} className="w-full flex items-center justify-center gap-2 bg-red-50 text-red-600 font-bold py-3 rounded-xl hover:bg-red-100 transition-colors">
                <Trash2 size={18} /> Delete Transaction
             </button>
          </Modal>
       )}
    </div>
  );
};

export default HistoryView;