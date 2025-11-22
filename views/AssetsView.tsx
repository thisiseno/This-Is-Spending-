import React, { useState, useMemo } from 'react';
import { useFinance } from '../App';
import { Asset, Transaction } from '../types';
import { ASSET_COLORS } from '../constants';
import { formatIDR, generateId } from '../utils';
import { Plus, TrendingUp, Trash2, RefreshCw } from 'lucide-react';
import { Modal } from '../components/ui/Modal';
import { AreaChart, Area, XAxis, Tooltip, ResponsiveContainer } from 'recharts';

const AssetsView: React.FC = () => {
  const { assets, addAsset, deleteAsset, addTransaction } = useFinance();
  
  // Modal States
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isActionModalOpen, setIsActionModalOpen] = useState(false);
  const [isNetWorthModalOpen, setIsNetWorthModalOpen] = useState(false);
  const [selectedAsset, setSelectedAsset] = useState<Asset | null>(null);

  // Forms
  const [newAssetName, setNewAssetName] = useState('');
  const [newAssetAmount, setNewAssetAmount] = useState('');
  const [newAssetType, setNewAssetType] = useState<Asset['type']>('Cash');
  const [customTypeName, setCustomTypeName] = useState('');
  const [newAssetIcon, setNewAssetIcon] = useState('');
  
  // Transaction Form
  const [transactionAmount, setTransactionAmount] = useState('');
  const [transactionType, setTransactionType] = useState<'Top Up' | 'Withdraw'>('Top Up');

  // Chart State
  const [chartRange, setChartRange] = useState<'1M' | '6M' | '1Y'>('6M');

  const totalWealth = assets.reduce((acc, a) => acc + a.amount, 0);

  // Net Worth Chart Generation
  const chartData = useMemo(() => {
     const data = [];
     const today = new Date();
     const count = chartRange === '1M' ? 4 : chartRange === '6M' ? 6 : 12;
     
     // Helper to simulate logic
     const baseVal = totalWealth; 
     
     for (let i = 0; i < count; i++) {
        let label = '';
        if (chartRange === '1M') {
            // Weekly
            label = `W${4-i}`;
        } else {
            // Monthly
            const d = new Date(today.getFullYear(), today.getMonth() - i, 1);
            label = d.toLocaleString('default', { month: 'short' });
        }
        
        // Variance for visuals
        const variance = Math.random() * (baseVal * 0.05) * (i + 1);
        data.unshift({ name: label, value: Math.max(0, baseVal - variance) });
     }
     // Ensure last point is current
     if (data.length > 0) data[data.length - 1].value = totalWealth;
     return data;
  }, [totalWealth, chartRange]);

  const handleCreateAsset = (e: React.FormEvent) => {
    e.preventDefault();
    const asset: Asset = {
      id: generateId(),
      name: newAssetName,
      amount: Number(newAssetAmount),
      type: newAssetType,
      customType: newAssetType === 'Other' ? customTypeName : undefined,
      icon: newAssetIcon || (newAssetType === 'Cash' ? '💳' : newAssetType === 'Stock' ? '📈' : '💎'),
      color: ASSET_COLORS[newAssetType],
      history: [{ date: new Date().toISOString().split('T')[0], amount: Number(newAssetAmount), type: 'Initial' }]
    };
    addAsset(asset);
    setIsAddModalOpen(false);
    resetForm();
  };

  const handleTransaction = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAsset) return;
    
    const amount = Number(transactionAmount);
    const t: Transaction = {
       id: generateId(),
       title: `${transactionType} ${selectedAsset.name}`,
       amount: amount,
       type: transactionType === 'Top Up' ? 'income' : 'expense',
       category: 'Asset Transfer',
       date: new Date().toISOString().split('T')[0],
       timestamp: Date.now(),
       destinationId: selectedAsset.id,
       destinationType: 'Asset',
       icon: transactionType === 'Top Up' ? '📈' : '📉'
    };
    addTransaction(t);
    setTransactionAmount('');
    setIsActionModalOpen(false);
  };

  const handleDelete = () => {
    if (selectedAsset && confirm(`Delete ${selectedAsset.name}? This cannot be undone.`)) {
       deleteAsset(selectedAsset.id);
       setIsActionModalOpen(false);
    }
  };

  const resetForm = () => {
    setNewAssetName('');
    setNewAssetAmount('');
    setNewAssetType('Cash');
    setCustomTypeName('');
    setNewAssetIcon('');
  };

  return (
    <div className="pb-20 space-y-6">
      <div className="flex justify-between items-center px-2">
        <h1 className="text-2xl font-bold text-gray-900">Portfolio</h1>
        <button onClick={() => setIsAddModalOpen(true)} className="bg-gray-900 text-white p-2 rounded-full shadow-lg active:scale-95 transition-transform">
          <Plus size={20} />
        </button>
      </div>

      {/* Net Worth Card */}
      <div 
        onClick={() => setIsNetWorthModalOpen(true)}
        className="bg-gradient-to-r from-gray-900 to-gray-800 text-white p-6 rounded-[28px] shadow-xl cursor-pointer hover:scale-[1.02] transition-transform relative overflow-hidden"
      >
         <div className="relative z-10">
            <p className="text-gray-400 text-xs uppercase tracking-widest mb-2 font-bold">Net Worth</p>
            <h2 className="text-4xl font-bold tracking-tight">{formatIDR(totalWealth)}</h2>
            <div className="mt-4 flex items-center gap-2 text-emerald-400 text-xs font-bold bg-white/10 w-fit px-3 py-1 rounded-full">
               <TrendingUp size={14} />
               <span>Tap for insights</span>
            </div>
         </div>
         <div className="absolute right-0 bottom-0 opacity-10">
            <TrendingUp size={120} />
         </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {assets.map(asset => (
          <div 
            key={asset.id}
            onClick={() => { setSelectedAsset(asset); setIsActionModalOpen(true); }}
            className="bg-white p-5 rounded-[24px] shadow-sm border border-gray-100 relative overflow-hidden cursor-pointer hover:shadow-md transition-shadow group"
          >
             <div className={`w-10 h-10 ${asset.color} rounded-full flex items-center justify-center text-white text-lg mb-3 shadow-md group-hover:scale-110 transition-transform`}>
                {asset.icon}
             </div>
             <h3 className="font-bold text-gray-900 text-sm truncate">{asset.name}</h3>
             <p className="text-sm text-gray-500 font-medium truncate">{formatIDR(asset.amount)}</p>
             {asset.isRecurring && (
               <div className="absolute top-4 right-4 text-violet-500">
                  <RefreshCw size={14} />
               </div>
             )}
          </div>
        ))}
        
        {/* Add Button Small */}
        <button 
          onClick={() => setIsAddModalOpen(true)}
          className="bg-gray-50 border-2 border-dashed border-gray-200 rounded-[24px] flex flex-col items-center justify-center gap-2 text-gray-400 font-bold hover:bg-gray-100 hover:border-gray-300 transition-colors min-h-[140px]"
        >
          <Plus size={24} />
          <span className="text-xs">Add Asset</span>
        </button>
      </div>

      {/* Net Worth Chart Modal */}
      <Modal isOpen={isNetWorthModalOpen} onClose={() => setIsNetWorthModalOpen(false)} title="Growth Analysis">
         <div className="flex bg-gray-100 rounded-xl p-1 mb-4">
            {(['1M', '6M', '1Y'] as const).map(range => (
                <button 
                  key={range} 
                  onClick={() => setChartRange(range)}
                  className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all ${chartRange === range ? 'bg-white shadow text-violet-600' : 'text-gray-500 hover:bg-gray-200'}`}
                >
                    {range}
                </button>
            ))}
         </div>
         <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="name" fontSize={10} tickMargin={10} stroke="#e5e7eb" />
                <Tooltip contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)'}} formatter={(value: number) => formatIDR(value)} />
                <Area type="monotone" dataKey="value" stroke="#8b5cf6" strokeWidth={3} fillOpacity={1} fill="url(#colorValue)" />
              </AreaChart>
            </ResponsiveContainer>
         </div>
      </Modal>

      {/* Create Asset Modal */}
      <Modal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} title="Add New Asset">
        <form onSubmit={handleCreateAsset} className="space-y-4">
          <input required type="text" value={newAssetName} onChange={e => setNewAssetName(e.target.value)} className="w-full p-3 bg-gray-50 rounded-xl border-none font-bold text-gray-900 placeholder-gray-400" placeholder="Asset Name" />
          <input required type="number" value={newAssetAmount} onChange={e => setNewAssetAmount(e.target.value)} className="w-full p-3 bg-gray-50 rounded-xl border-none font-bold text-gray-900 placeholder-gray-400" placeholder="Current Value" />
          
          <div className="grid grid-cols-3 gap-2">
             {Object.keys(ASSET_COLORS).map(t => (
                <button type="button" key={t} onClick={() => setNewAssetType(t as any)} className={`p-2 rounded-xl text-xs font-bold border-2 ${newAssetType === t ? 'border-violet-500 bg-violet-50 text-violet-700' : 'border-transparent bg-gray-50 text-gray-500'}`}>
                   {t}
                </button>
             ))}
          </div>

          {newAssetType === 'Other' && (
             <input type="text" value={customTypeName} onChange={e => setCustomTypeName(e.target.value)} className="w-full p-3 bg-white border-2 border-gray-100 rounded-xl font-bold text-sm" placeholder="Type Name (e.g. Collectibles)" />
          )}

          <div>
             <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Custom Emoji (Optional)</label>
             <div className="flex gap-2">
                <input type="text" maxLength={2} value={newAssetIcon} onChange={e => setNewAssetIcon(e.target.value)} className="w-12 p-3 bg-gray-50 rounded-xl border-none font-bold text-center text-xl" placeholder="💰" />
                <span className="text-xs text-gray-400 self-center">Leave empty for default</span>
             </div>
          </div>

          <button type="submit" className="w-full bg-gray-900 text-white font-bold py-3 rounded-xl">Create Portfolio</button>
        </form>
      </Modal>

      {/* Action Modal */}
      {selectedAsset && (
        <Modal isOpen={isActionModalOpen} onClose={() => setIsActionModalOpen(false)} title={selectedAsset.name}>
           <div className="mb-6 text-center">
              <div className="text-4xl mb-2">{selectedAsset.icon}</div>
              <h2 className="text-3xl font-bold text-gray-900">{formatIDR(selectedAsset.amount)}</h2>
              {selectedAsset.customType && <span className="text-xs bg-gray-100 px-2 py-1 rounded text-gray-500 font-bold">{selectedAsset.customType}</span>}
           </div>

           <div className="grid grid-cols-2 gap-3 mb-6">
              <button onClick={() => setTransactionType('Top Up')} className={`p-4 rounded-2xl border-2 font-bold text-sm transition-colors ${transactionType === 'Top Up' ? 'border-green-500 bg-green-50 text-green-700' : 'border-gray-100 text-gray-500'}`}>
                 + Top Up
              </button>
              <button onClick={() => setTransactionType('Withdraw')} className={`p-4 rounded-2xl border-2 font-bold text-sm transition-colors ${transactionType === 'Withdraw' ? 'border-red-500 bg-red-50 text-red-700' : 'border-gray-100 text-gray-500'}`}>
                 - Withdraw
              </button>
           </div>

           <form onSubmit={handleTransaction} className="space-y-3">
              <div className="relative">
                 <span className="absolute left-4 top-3.5 text-gray-400 font-bold">Rp</span>
                 <input autoFocus required type="number" value={transactionAmount} onChange={e => setTransactionAmount(e.target.value)} className="w-full pl-12 p-3 bg-gray-50 rounded-xl font-bold text-gray-900" placeholder="0" />
              </div>
              <button type="submit" className="w-full bg-gray-900 text-white font-bold py-3 rounded-xl">
                 Confirm {transactionType}
              </button>
           </form>

           <div className="mt-6 pt-4 border-t border-gray-100">
             <button onClick={handleDelete} className="w-full flex items-center justify-center gap-2 text-red-500 font-bold text-sm py-2 hover:bg-red-50 rounded-xl transition-colors">
                <Trash2 size={16} /> Delete Portfolio
             </button>
           </div>
        </Modal>
      )}
    </div>
  );
};

export default AssetsView;