import React, { useMemo, useState } from 'react';
import { useFinance } from '../App';
import { formatIDR } from '../utils';
import { PieChart, Pie, Tooltip, ResponsiveContainer, Cell } from 'recharts';

type Period = 'Week' | 'Month' | 'Year';

const AnalyticsView: React.FC = () => {
  const { transactions } = useFinance();
  const [period, setPeriod] = useState<Period>('Month');

  const { analyticsData, totalFiltered, comparisonPct } = useMemo(() => {
    const now = new Date();
    let start = new Date();
    let previousStart = new Date();
    let previousEnd = new Date();

    // Define Date Ranges
    if (period === 'Week') {
        start.setDate(now.getDate() - 7);
        previousStart.setDate(now.getDate() - 14);
        previousEnd.setDate(now.getDate() - 7);
    } else if (period === 'Month') {
        start = new Date(now.getFullYear(), now.getMonth(), 1);
        previousStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        previousEnd = new Date(now.getFullYear(), now.getMonth(), 0);
    } else {
        start = new Date(now.getFullYear(), 0, 1);
        previousStart = new Date(now.getFullYear() - 1, 0, 1);
        previousEnd = new Date(now.getFullYear() - 1, 11, 31);
    }

    // Filter Current
    const currentFiltered = transactions.filter(t => {
       const d = new Date(t.date);
       return d >= start && d <= now && t.type === 'expense';
    });

    // Filter Previous for Comparison
    const prevFiltered = transactions.filter(t => {
        const d = new Date(t.date);
        return d >= previousStart && d <= previousEnd && t.type === 'expense';
    });

    const currentTotal = currentFiltered.reduce((acc, t) => acc + t.amount, 0);
    const prevTotal = prevFiltered.reduce((acc, t) => acc + t.amount, 0);
    
    let compPct = 0;
    if (prevTotal > 0) {
        compPct = Math.round(((currentTotal - prevTotal) / prevTotal) * 100);
    }

    // Group By Category
    const categoryTotals: Record<string, number> = {};
    currentFiltered.forEach(t => {
      categoryTotals[t.category] = (categoryTotals[t.category] || 0) + t.amount;
    });

    const data = Object.keys(categoryTotals).map(cat => ({
      name: cat,
      value: categoryTotals[cat],
    })).sort((a, b) => b.value - a.value);

    return { analyticsData: data, totalFiltered: currentTotal, comparisonPct: compPct };
  }, [transactions, period]);

  const COLORS = ['#8b5cf6', '#ec4899', '#f59e0b', '#10b981', '#3b82f6', '#6366f1'];

  return (
    <div className="pb-20 space-y-6">
       <div className="flex justify-between items-center px-2">
          <h1 className="text-2xl font-bold text-gray-900">Analysis</h1>
          <div className="flex bg-gray-200 rounded-lg p-1">
             {['Week', 'Month', 'Year'].map(p => (
                <button 
                  key={p} 
                  onClick={() => setPeriod(p as Period)}
                  className={`px-3 py-1 rounded-md text-xs font-bold transition-all ${period === p ? 'bg-white shadow text-violet-600' : 'text-gray-500'}`}
                >
                    {p}
                </button>
             ))}
          </div>
       </div>

       {analyticsData.length === 0 ? (
         <div className="text-center py-20 text-gray-400 font-medium">
           No spending data for this {period.toLowerCase()}.
         </div>
       ) : (
         <>
           <div className="bg-white p-6 rounded-[32px] shadow-sm h-80 relative overflow-hidden">
              <h3 className="font-bold text-gray-800 mb-2">Spending Breakdown</h3>
              <ResponsiveContainer width="100%" height="85%">
                 <PieChart>
                    <Pie
                      data={analyticsData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {analyticsData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} stroke="none" />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value: number) => formatIDR(value)} contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px rgba(0,0,0,0.1)'}} />
                 </PieChart>
              </ResponsiveContainer>
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center mt-4">
                 <p className="text-xs text-gray-400 font-bold uppercase">Total</p>
                 <p className="text-sm font-bold text-gray-900">{formatIDR(totalFiltered)}</p>
                 <p className={`text-[10px] font-bold mt-1 ${comparisonPct > 0 ? 'text-red-500' : 'text-green-500'}`}>
                     {comparisonPct > 0 ? '↑' : '↓'} {Math.abs(comparisonPct)}% vs last {period.toLowerCase()}
                 </p>
              </div>
           </div>

           <div className="space-y-3">
             {analyticsData.map((item, index) => {
               const percent = Math.round((item.value / totalFiltered) * 100);
               return (
                <div key={item.name} className="flex items-center gap-4 bg-white p-4 rounded-2xl border border-gray-50 shadow-sm">
                   <div className="w-3 h-12 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }}></div>
                   <div className="flex-1">
                      <div className="flex justify-between items-center mb-1">
                        <span className="font-bold text-gray-800">{item.name}</span>
                        <span className="font-bold text-gray-900">{formatIDR(item.value)}</span>
                      </div>
                      <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden">
                         <div className="h-full rounded-full" style={{ width: `${percent}%`, backgroundColor: COLORS[index % COLORS.length] }}></div>
                      </div>
                   </div>
                   <span className="text-xs font-bold text-gray-400 w-8 text-right">{percent}%</span>
                </div>
               );
             })}
           </div>
         </>
       )}
    </div>
  );
};

export default AnalyticsView;