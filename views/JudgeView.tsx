import React, { useState } from 'react';
import { useFinance } from '../App';
import { Gavel, Sparkles, ArrowLeft } from 'lucide-react';
import { GoogleGenAI, Type } from '@google/genai';

// Initialize Gemini
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const JudgeView: React.FC = () => {
  const { assets, budget, setView } = useFinance();
  
  const [item, setItem] = useState('');
  const [price, setPrice] = useState('');
  const [reason, setReason] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('Cash');
  const [installment, setInstallment] = useState('');
  const [interest, setInterest] = useState('');
  
  const [loading, setLoading] = useState(false);
  const [verdict, setVerdict] = useState<{ decision: string; explanation: string } | null>(null);

  const totalAssets = assets.reduce((acc, a) => acc + a.amount, 0);

  const handleJudge = async () => {
    if (!item || !price || !reason) return;
    setLoading(true);

    let paymentDetails = `Payment Method: ${paymentMethod}.`;
    if (paymentMethod === 'Credit') {
        paymentDetails += ` Installment: ${installment} months. Interest Rate: ${interest}%.`;
    }

    const prompt = `
      Act as a strict but fair financial advisor. I want to buy: "${item}" for IDR ${price}.
      Reason: "${reason}". 
      ${paymentDetails}
      
      My Financial Context:
      - Total Liquid Assets: IDR ${totalAssets}
      - Monthly Spending Limit: IDR ${budget.limit}
      
      Evaluate this purchase.
    `;

    try {
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              decision: {
                type: Type.STRING,
                enum: ['APPROVED', 'DENIED', 'RISKY'],
              },
              explanation: {
                type: Type.STRING,
              },
            },
            required: ['decision', 'explanation'],
          },
        },
      });
      
      const text = response.text || '';
      let result;
      try {
        result = JSON.parse(text);
      } catch (e) {
        result = { decision: 'ERROR', explanation: "Couldn't analyze. Try again." };
      }
      
      setVerdict(result);
    } catch (error) {
      console.error(error);
      setVerdict({ decision: 'ERROR', explanation: "AI Service Unavailable." });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="pb-24">
       <div className="flex items-center mb-6">
          <button onClick={() => setView('dashboard')} className="p-2 bg-white rounded-full shadow-sm text-gray-600 hover:bg-gray-50 mr-4">
             <ArrowLeft size={20} />
          </button>
          <span className="font-bold text-lg">Judge My Spending</span>
       </div>

       <div className="text-center mb-8">
         <div className="w-16 h-16 bg-gradient-to-br from-pink-500 to-orange-400 rounded-2xl mx-auto flex items-center justify-center shadow-lg shadow-pink-200 mb-4 text-white animate-pulse">
           <Sparkles size={32} />
         </div>
         <h1 className="text-2xl font-bold text-gray-900">AI Financial Judge</h1>
         <p className="text-sm text-gray-500 mt-1">Tell me what you want, I'll tell you if you can.</p>
       </div>

       <div className="space-y-5 bg-white p-6 rounded-[32px] shadow-sm border border-gray-50">
          <div>
            <label className="label-text">What do you want to buy?</label>
            <input type="text" value={item} onChange={e => setItem(e.target.value)} className="input-field" placeholder="e.g. iPhone 15" />
          </div>

          <div>
            <label className="label-text">How much is it?</label>
            <div className="relative">
               <span className="absolute left-4 top-3.5 text-gray-400 font-bold z-10">Rp</span>
               <input type="number" value={price} onChange={e => setPrice(e.target.value)} className="input-field pl-14" placeholder="0" />
            </div>
          </div>
          
          <div>
            <label className="label-text">Why do you need it?</label>
            <textarea rows={2} value={reason} onChange={e => setReason(e.target.value)} className="input-field resize-none" placeholder="Be honest..." />
          </div>

          <div>
             <label className="label-text">Payment Method</label>
             <div className="flex gap-2 mt-2">
                {['Cash', 'Credit'].map(m => (
                   <button key={m} onClick={() => setPaymentMethod(m)} className={`flex-1 py-3 rounded-xl text-sm font-bold border transition-all ${paymentMethod === m ? 'bg-gray-900 text-white border-gray-900' : 'bg-white text-gray-500 border-gray-200'}`}>
                      {m}
                   </button>
                ))}
             </div>
          </div>

          {paymentMethod === 'Credit' && (
             <div className="grid grid-cols-2 gap-4 animate-in slide-in-from-top-2 fade-in">
                <div>
                    <label className="label-text">Installment (Months)</label>
                    <input type="number" value={installment} onChange={e => setInstallment(e.target.value)} className="input-field" placeholder="e.g. 12" />
                </div>
                <div>
                    <label className="label-text">Interest Rate (%)</label>
                    <input type="number" value={interest} onChange={e => setInterest(e.target.value)} className="input-field" placeholder="e.g. 2.5" />
                </div>
             </div>
          )}

          <button onClick={handleJudge} disabled={loading} className="w-full py-4 bg-gray-900 text-white font-bold rounded-2xl shadow-lg active:scale-95 transition-transform disabled:opacity-70 flex justify-center items-center gap-2 mt-4">
             {loading ? <span className="animate-spin">⏳</span> : <Gavel size={18} />}
             {loading ? 'Judging...' : 'Judge Me'}
          </button>
       </div>

       {/* Verdict Overlay */}
       {verdict && (
         <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-in fade-in">
            <div className={`w-full max-w-xs p-8 rounded-[32px] shadow-2xl text-center transform transition-all animate-in zoom-in-95 bg-white border-4 ${verdict.decision === 'APPROVED' ? 'border-green-400' : verdict.decision === 'DENIED' ? 'border-red-400' : 'border-yellow-400'}`}>
               <h2 className={`text-4xl font-black uppercase mb-4 ${verdict.decision === 'APPROVED' ? 'text-green-600' : verdict.decision === 'DENIED' ? 'text-red-600' : 'text-yellow-600'}`}>
                 {verdict.decision}
               </h2>
               <p className="text-gray-600 font-medium leading-relaxed mb-8">
                 {verdict.explanation}
               </p>
               <button onClick={() => setVerdict(null)} className="w-full py-3 bg-gray-100 hover:bg-gray-200 rounded-xl font-bold text-gray-900 transition-colors">
                 Close
               </button>
            </div>
         </div>
       )}

       <style>{`
         .label-text { display: block; font-size: 0.75rem; font-weight: 800; color: #9ca3af; text-transform: uppercase; margin-bottom: 0.5rem; letter-spacing: 0.05em; }
         .input-field { width: 100%; padding: 0.875rem 1rem; background-color: #f3f4f6; border-radius: 1rem; border: 2px solid transparent; font-weight: 600; color: #111827; transition: all 0.2s; }
         .input-field:focus { outline: none; background-color: white; border-color: #8b5cf6; box-shadow: 0 4px 20px rgba(139, 92, 246, 0.1); }
       `}</style>
    </div>
  );
};

export default JudgeView;