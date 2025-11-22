import React, { useState, useRef, useEffect } from 'react';
import { useFinance } from '../App';
import { formatIDR } from '../utils';
import { ChatMessage } from '../types';
import { Send } from 'lucide-react';

const ChatView: React.FC = () => {
  const { assets, transactions, budget, goals } = useFinance();
  const [messages, setMessages] = useState<ChatMessage[]>([
    { id: 1, text: "Hi! I'm your financial assistant. Ask me about your assets, recent spending, or budget!", sender: 'bot', timestamp: new Date() }
  ]);
  const [input, setInput] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = () => {
    if (!input.trim()) return;
    
    const userMsg: ChatMessage = { id: Date.now(), text: input, sender: 'user', timestamp: new Date() };
    setMessages(prev => [...prev, userMsg]);
    setInput('');

    // Simple Regex Logic
    setTimeout(() => {
       let responseText = "I'm not sure about that. Try asking 'total assets' or 'spending'.";
       const lower = userMsg.text.toLowerCase();

       if (/total asset|have|net worth/.test(lower)) {
          const total = assets.reduce((a, b) => a + b.amount, 0);
          responseText = `Your total net worth is currently ${formatIDR(total)}.`;
       } else if (/spend|spending/.test(lower)) {
          const currentMonth = new Date().getMonth();
          const spent = transactions
            .filter(t => new Date(t.date).getMonth() === currentMonth && t.type === 'expense')
            .reduce((a, b) => a + b.amount, 0);
          const pct = Math.round((spent / budget.limit) * 100);
          responseText = `You've spent ${formatIDR(spent)} this month. That's ${pct}% of your budget.`;
       } else if (/budget/.test(lower)) {
          const currentMonth = new Date().getMonth();
          const spent = transactions
            .filter(t => new Date(t.date).getMonth() === currentMonth && t.type === 'expense')
            .reduce((a, b) => a + b.amount, 0);
          const remaining = budget.limit - spent;
          responseText = `You have ${formatIDR(remaining)} remaining in your monthly budget.`;
       } else if (/goal/.test(lower)) {
          if (goals.length > 0) {
            const g = goals[0];
            const pct = Math.round((g.current / g.target) * 100);
            responseText = `Your priority goal '${g.name}' is ${pct}% complete (${formatIDR(g.current)} / ${formatIDR(g.target)}).`;
          } else {
            responseText = "You haven't set any goals yet!";
          }
       }

       const botMsg: ChatMessage = { id: Date.now() + 1, text: responseText, sender: 'bot', timestamp: new Date() };
       setMessages(prev => [...prev, botMsg]);
    }, 600);
  };

  return (
    <div className="flex flex-col h-[85vh] pb-20">
      <h1 className="text-2xl font-bold text-gray-900 mb-4">Assistant</h1>
      
      <div className="flex-1 overflow-y-auto space-y-4 no-scrollbar pb-4">
         {messages.map(msg => (
           <div key={msg.id} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[80%] p-4 rounded-2xl text-sm leading-relaxed ${
                msg.sender === 'user' 
                  ? 'bg-gray-900 text-white rounded-br-sm' 
                  : 'bg-white text-gray-800 shadow-sm border border-gray-100 rounded-bl-sm'
              }`}>
                 {msg.text}
              </div>
           </div>
         ))}
         <div ref={scrollRef} />
      </div>

      <div className="mt-4 relative">
         <input 
           type="text" 
           value={input}
           onChange={e => setInput(e.target.value)}
           onKeyDown={e => e.key === 'Enter' && handleSend()}
           placeholder="Ask about your money..."
           className="w-full p-4 pr-12 bg-white rounded-full shadow-[0_4px_20px_rgba(0,0,0,0.05)] border-none focus:ring-2 focus:ring-violet-500 text-sm font-medium"
         />
         <button 
           onClick={handleSend}
           className="absolute right-2 top-2 p-2 bg-violet-600 text-white rounded-full hover:bg-violet-700 transition-colors"
         >
           <Send size={18} />
         </button>
      </div>
    </div>
  );
};

export default ChatView;
