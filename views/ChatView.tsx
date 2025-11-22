import React, { useState, useRef, useEffect } from 'react';
import { useFinance } from '../App';
import { formatIDR } from '../utils';
import { ChatMessage } from '../types';
import { Send, ArrowLeft, Sparkles } from 'lucide-react';

const ChatView: React.FC = () => {
  const { assets, transactions, budget, goals, setView } = useFinance();
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
       } else if (/hello|hi|hey/.test(lower)) {
           responseText = "Hello there! Ready to manage your finances?";
       }

       const botMsg: ChatMessage = { id: Date.now() + 1, text: responseText, sender: 'bot', timestamp: new Date() };
       setMessages(prev => [...prev, botMsg]);
    }, 600);
  };

  return (
    // Using negative margins to break out of the parent p-6 padding for a full-screen experience
    <div className="flex flex-col h-[calc(100vh-2rem)] -m-6 bg-gray-50 relative">
      
      {/* Header */}
      <div className="bg-white px-4 py-3 shadow-sm flex items-center sticky top-0 z-10 border-b border-gray-100">
          <button 
            onClick={() => setView('dashboard')} 
            className="p-2 -ml-1 rounded-full text-gray-600 hover:bg-gray-50 active:scale-95 transition-transform"
          >
             <ArrowLeft size={22} />
          </button>
          <div className="flex-1 text-center mr-8">
             <h1 className="font-bold text-lg text-gray-900">Assistant</h1>
          </div>
      </div>
      
      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 pb-4">
         {messages.map(msg => (
           <div key={msg.id} className={`flex w-full ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`flex max-w-[85%] ${msg.sender === 'user' ? 'flex-row-reverse' : 'flex-row'} gap-2`}>
                 
                 {/* Avatar for Bot */}
                 {msg.sender === 'bot' && (
                   <div className="w-8 h-8 rounded-full bg-gradient-to-br from-violet-500 to-fuchsia-500 flex items-center justify-center text-white shadow-sm flex-shrink-0 mt-1">
                      <Sparkles size={14} />
                   </div>
                 )}

                 {/* Bubble */}
                 <div className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}>
                    <div className={`px-4 py-3 rounded-2xl text-sm font-medium leading-relaxed shadow-sm ${
                        msg.sender === 'user' 
                        ? 'bg-gray-900 text-white rounded-tr-sm' 
                        : 'bg-white text-gray-800 border border-gray-100 rounded-tl-sm'
                    }`}>
                        {msg.text}
                    </div>
                    <span className="text-[10px] text-gray-400 mt-1 px-1">
                        {msg.timestamp.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                    </span>
                 </div>
              </div>
           </div>
         ))}
         <div ref={scrollRef} />
      </div>

      {/* Input Area */}
      <div className="bg-white border-t border-gray-100 p-4 z-10 pb-6">
         <div className="relative flex items-center gap-2 bg-gray-100 rounded-full p-1 pr-1">
             <input 
               type="text" 
               value={input}
               onChange={e => setInput(e.target.value)}
               onKeyDown={e => e.key === 'Enter' && handleSend()}
               placeholder="Ask about your money..."
               className="flex-1 pl-5 py-3 bg-transparent border-none focus:ring-0 text-sm font-medium text-gray-900 placeholder-gray-400"
             />
             <button 
               onClick={handleSend}
               disabled={!input.trim()}
               className="p-3 bg-violet-600 text-white rounded-full hover:bg-violet-700 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-md"
             >
               <Send size={18} />
             </button>
         </div>
      </div>
    </div>
  );
};

export default ChatView;