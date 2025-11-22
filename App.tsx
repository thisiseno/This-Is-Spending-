
import React, { useState, useEffect, createContext, useContext } from 'react';
import { Asset, Goal, Transaction, BudgetConfig, ViewState, Category } from './types';
import { INITIAL_ASSETS, INITIAL_GOALS, INITIAL_TRANSACTIONS, DEFAULT_CATEGORIES } from './constants';
import DashboardView from './views/DashboardView';
import AssetsView from './views/AssetsView';
import LogView from './views/LogView';
import HistoryView from './views/HistoryView';
import GoalsView from './views/GoalsView';
import JudgeView from './views/JudgeView';
import ChatView from './views/ChatView';
import AnalyticsView from './views/AnalyticsView';
import ProfileView from './views/ProfileView';
import BottomNav from './components/BottomNav';

// --- Context Setup ---
interface FinanceContextType {
  assets: Asset[];
  goals: Goal[];
  transactions: Transaction[];
  budget: BudgetConfig;
  categories: Category[];
  view: ViewState;
  setView: (view: ViewState) => void;
  addTransaction: (t: Transaction) => void;
  deleteTransaction: (id: number) => void;
  addAsset: (a: Asset) => void;
  updateAsset: (a: Asset) => void;
  deleteAsset: (id: number) => void;
  addGoal: (g: Goal) => void;
  updateGoal: (g: Goal) => void;
  deleteGoal: (id: number) => void;
  addCategory: (c: Category) => void;
  resetData: () => void;
  clearData: () => void;
  updateBudget: (config: BudgetConfig) => void;
}

const FinanceContext = createContext<FinanceContextType | undefined>(undefined);

export const useFinance = () => {
  const context = useContext(FinanceContext);
  if (!context) throw new Error('useFinance must be used within a FinanceProvider');
  return context;
};

const App: React.FC = () => {
  // State
  const [assets, setAssets] = useState<Asset[]>(() => {
    const saved = localStorage.getItem('assets');
    return saved ? JSON.parse(saved) : INITIAL_ASSETS;
  });
  const [goals, setGoals] = useState<Goal[]>(() => {
    const saved = localStorage.getItem('goals');
    return saved ? JSON.parse(saved) : INITIAL_GOALS;
  });
  const [transactions, setTransactions] = useState<Transaction[]>(() => {
    const saved = localStorage.getItem('transactions');
    return saved ? JSON.parse(saved) : INITIAL_TRANSACTIONS;
  });
  const [budget, setBudget] = useState<BudgetConfig>(() => {
    const saved = localStorage.getItem('budget');
    const today = new Date();
    const firstDay = new Date(today.getFullYear(), today.getMonth(), 1).toISOString().split('T')[0];
    const lastDay = new Date(today.getFullYear(), today.getMonth() + 1, 0).toISOString().split('T')[0];
    return saved ? JSON.parse(saved) : { limit: 5000000, startDate: firstDay, endDate: lastDay };
  });
  const [categories, setCategories] = useState<Category[]>(() => {
    const saved = localStorage.getItem('categories');
    return saved ? JSON.parse(saved) : DEFAULT_CATEGORIES;
  });

  const [view, setView] = useState<ViewState>('dashboard');

  // Persistence
  useEffect(() => { localStorage.setItem('assets', JSON.stringify(assets)); }, [assets]);
  useEffect(() => { localStorage.setItem('goals', JSON.stringify(goals)); }, [goals]);
  useEffect(() => { localStorage.setItem('transactions', JSON.stringify(transactions)); }, [transactions]);
  useEffect(() => { localStorage.setItem('budget', JSON.stringify(budget)); }, [budget]);
  useEffect(() => { localStorage.setItem('categories', JSON.stringify(categories)); }, [categories]);

  // Actions
  const addTransaction = (t: Transaction) => {
    setTransactions(prev => [t, ...prev]);
    
    // Smart Routing Logic
    if (t.type === 'income' && t.destinationId) {
      const amount = Number(t.amount);
      if (t.destinationType === 'Asset') {
        setAssets(prev => prev.map(a => {
          if (a.id === t.destinationId) {
            return { 
              ...a, 
              amount: a.amount + amount,
              history: [...a.history, { date: t.date, amount: a.amount + amount, type: 'Top Up' }]
            };
          }
          return a;
        }));
      } else if (t.destinationType === 'Goal') {
        setGoals(prev => prev.map(g => {
          if (g.id === t.destinationId) {
            return { 
              ...g, 
              current: g.current + amount,
              history: [...g.history, { date: t.date, amount: amount, type: 'Deposit' }]
            };
          }
          return g;
        }));
      }
    }
    // Expense logic for Assets (Withdrawal)
    if (t.type === 'expense' && t.destinationType === 'Asset' && t.destinationId) {
         const amount = Number(t.amount);
         setAssets(prev => prev.map(a => {
          if (a.id === t.destinationId) {
            return { 
              ...a, 
              amount: a.amount - amount,
              history: [...a.history, { date: t.date, amount: a.amount - amount, type: 'Withdraw' }]
            };
          }
          return a;
        }));
    }
    // Expense logic for Goals (Withdrawal)
    if (t.type === 'expense' && t.destinationType === 'Goal' && t.destinationId) {
        const amount = Number(t.amount);
        setGoals(prev => prev.map(g => {
         if (g.id === t.destinationId) {
           return { 
             ...g, 
             current: g.current - amount,
             history: [...g.history, { date: t.date, amount: amount, type: 'Withdraw' }]
           };
         }
         return g;
       }));
   }
  };

  const deleteTransaction = (id: number) => {
    const t = transactions.find(tr => tr.id === id);
    if (!t) return;

    // Reverse Balance Logic
    if (t.type === 'income' && t.destinationId) {
       const amount = Number(t.amount);
       if (t.destinationType === 'Asset') {
          setAssets(prev => prev.map(a => a.id === t.destinationId ? { ...a, amount: a.amount - amount } : a));
       } else if (t.destinationType === 'Goal') {
          setGoals(prev => prev.map(g => g.id === t.destinationId ? { ...g, current: g.current - amount } : g));
       }
    }
    if (t.type === 'expense' && t.destinationType === 'Asset' && t.destinationId) {
        const amount = Number(t.amount);
        setAssets(prev => prev.map(a => a.id === t.destinationId ? { ...a, amount: a.amount + amount } : a));
    }
    if (t.type === 'expense' && t.destinationType === 'Goal' && t.destinationId) {
        const amount = Number(t.amount);
        setGoals(prev => prev.map(g => g.id === t.destinationId ? { ...g, current: g.current + amount } : g));
    }

    setTransactions(prev => prev.filter(tr => tr.id !== id));
  };

  const addAsset = (a: Asset) => setAssets(prev => [...prev, a]);
  const updateAsset = (updated: Asset) => setAssets(prev => prev.map(a => a.id === updated.id ? updated : a));
  const deleteAsset = (id: number) => setAssets(prev => prev.filter(a => a.id !== id));
  
  const addGoal = (g: Goal) => setGoals(prev => [...prev, g]);
  const updateGoal = (updated: Goal) => setGoals(prev => prev.map(g => g.id === updated.id ? updated : g));
  const deleteGoal = (id: number) => setGoals(prev => prev.filter(g => g.id !== id));

  const updateBudget = (config: BudgetConfig) => setBudget(config);
  const addCategory = (c: Category) => setCategories(prev => [...prev, c]);

  // Restore Factory Defaults (Demo Data)
  const resetData = () => {
    setAssets(INITIAL_ASSETS);
    setGoals(INITIAL_GOALS);
    setTransactions(INITIAL_TRANSACTIONS);
    const today = new Date();
    const firstDay = new Date(today.getFullYear(), today.getMonth(), 1).toISOString().split('T')[0];
    const lastDay = new Date(today.getFullYear(), today.getMonth() + 1, 0).toISOString().split('T')[0];
    setBudget({ limit: 5000000, startDate: firstDay, endDate: lastDay });
    setCategories(DEFAULT_CATEGORIES);
  };

  // Wipe Everything (Empty State)
  const clearData = () => {
    setAssets([]);
    setGoals([]);
    setTransactions([]);
    const today = new Date();
    const firstDay = new Date(today.getFullYear(), today.getMonth(), 1).toISOString().split('T')[0];
    const lastDay = new Date(today.getFullYear(), today.getMonth() + 1, 0).toISOString().split('T')[0];
    setBudget({ limit: 5000000, startDate: firstDay, endDate: lastDay });
    // We keep categories default for usability
    setCategories(DEFAULT_CATEGORIES);
  };

  return (
    <FinanceContext.Provider value={{
      assets, goals, transactions, budget, categories,
      view, setView,
      addTransaction, deleteTransaction,
      addAsset, updateAsset, deleteAsset, 
      addGoal, updateGoal, deleteGoal,
      addCategory, resetData, clearData, updateBudget
    }}>
      <div className="min-h-screen bg-gray-50 text-gray-900 flex justify-center font-sans antialiased selection:bg-violet-200">
        {/* Mobile Container */}
        <div className="w-full max-w-md bg-gray-50 min-h-screen relative shadow-2xl pb-24 overflow-x-hidden">
          
          {/* View Routing */}
          <main className="p-6 animate-fade-in">
            {view === 'dashboard' && <DashboardView />}
            {view === 'assets' && <AssetsView />}
            {view === 'log' && <LogView />}
            {view === 'history' && <HistoryView />}
            {view === 'goals' && <GoalsView />}
            {view === 'judge' && <JudgeView />}
            {view === 'chat' && <ChatView />}
            {view === 'analytics' && <AnalyticsView />}
            {view === 'profile' && <ProfileView />}
          </main>

          {/* Sticky Bottom Nav */}
          {(view !== 'judge' && view !== 'chat' && view !== 'profile' && view !== 'history') && (
             <BottomNav activeTab={view} onTabChange={setView} />
          )}
          
        </div>
      </div>
    </FinanceContext.Provider>
  );
};

export default App;
