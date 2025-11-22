
export interface Transaction {
  id: number;
  title: string;
  amount: number;
  type: 'expense' | 'income';
  category: string;
  date: string; // ISO date string YYYY-MM-DD
  timestamp?: number;
  icon?: string;
  destinationId?: number; // ID of Asset or Goal if income
  destinationType?: 'Asset' | 'Goal' | 'Budget';
}

export interface Asset {
  id: number;
  name: string;
  amount: number;
  type: 'Cash' | 'Stock' | 'Crypto' | 'Gold' | 'Other';
  customType?: string;
  icon?: string; // User selected emoji
  color: string;
  isRecurring?: boolean;
  recurringAmount?: number;
  recurringDate?: number; // Day of month
  history: Array<{ date: string; amount: number; type: string }>;
}

export interface Goal {
  id: number;
  name: string;
  target: number;
  current: number;
  deadline?: string;
  icon: string;
  color: string;
  history: Array<{ date: string; amount: number; type: string }>;
}

export interface BudgetConfig {
  limit: number;
  startDate: string;
  endDate: string;
}

export interface ChatMessage {
  id: number;
  text: string;
  sender: 'user' | 'bot';
  timestamp: Date;
}

export interface Category {
  name: string;
  icon: string;
  custom?: boolean;
}

export type ViewState = 'dashboard' | 'assets' | 'log' | 'history' | 'goals' | 'analytics' | 'judge' | 'chat' | 'profile';
