import { Asset, Goal, Transaction, Category } from './types';

export const INITIAL_ASSETS: Asset[] = [
  {
    id: 1715439201,
    name: "BCA Savings",
    amount: 45000000,
    type: "Cash",
    icon: "💳",
    color: "bg-blue-600",
    history: [
      { date: "2023-10-01", amount: 45000000, type: "Initial" }
    ]
  },
  {
    id: 1715439202,
    name: "GoTo Stocks",
    amount: 12000000,
    type: "Stock",
    icon: "📈",
    color: "bg-emerald-600",
    history: [
        { date: "2023-11-01", amount: 12000000, type: "Initial" }
    ]
  }
];

export const INITIAL_GOALS: Goal[] = [
  {
    id: 202,
    name: "Wedding",
    target: 50000000,
    current: 15000000,
    deadline: "2025-12-31",
    icon: "💍",
    color: "bg-emerald-100",
    history: []
  },
  {
    id: 203,
    name: "New House",
    target: 500000000,
    current: 45000000,
    deadline: "2030-01-01",
    icon: "🏠",
    color: "bg-purple-100",
    history: []
  }
];

export const INITIAL_TRANSACTIONS: Transaction[] = [
  {
    id: 555,
    title: "Netflix",
    amount: 186000,
    type: "expense",
    category: "Entertainment",
    date: new Date().toISOString().split('T')[0],
    timestamp: Date.now(),
    icon: "🎬"
  },
  {
    id: 556,
    title: "Kopi Kenangan",
    amount: 25000,
    type: "expense",
    category: "Food",
    date: new Date().toISOString().split('T')[0],
    timestamp: Date.now() - 100000,
    icon: "☕"
  }
];

export const DEFAULT_CATEGORIES: Category[] = [
  { name: 'Food', icon: '🍔' },
  { name: 'Transport', icon: '🚗' },
  { name: 'Shopping', icon: '🛍️' },
  { name: 'Bills', icon: '🧾' },
  { name: 'Entertainment', icon: '🎬' },
  { name: 'Health', icon: '💊' },
];

export const ASSET_COLORS: Record<string, string> = {
  'Cash': 'bg-blue-600',
  'Stock': 'bg-emerald-600',
  'Crypto': 'bg-orange-500',
  'Gold': 'bg-yellow-500',
  'Other': 'bg-gray-600'
};