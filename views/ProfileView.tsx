
import React, { useState } from 'react';
import { useFinance } from '../App';
import { Trash2, Bell, ArrowLeft, RefreshCw, Mail, Lock, FileSpreadsheet, Eraser } from 'lucide-react';
import { Modal } from '../components/ui/Modal';

const ProfileView: React.FC = () => {
  const { resetData, clearData, setView, transactions, assets, goals } = useFinance();
  const [profileEmoji, setProfileEmoji] = useState('👨‍🚀');
  
  // Modal States
  const [isCurrencyModalOpen, setIsCurrencyModalOpen] = useState(false);
  const [isEmailModalOpen, setIsEmailModalOpen] = useState(false);
  const [isPinModalOpen, setIsPinModalOpen] = useState(false);

  // Currency State
  const [currency, setCurrency] = useState(localStorage.getItem('app_currency') || 'IDR');

  // Mock Data Inputs
  const [newEmail, setNewEmail] = useState('');
  const [newPin, setNewPin] = useState('');

  const emojis = ['👨‍🚀', '👩‍💼', '🦁', '🦄', '🤖'];
  
  const CURRENCIES = [
    "IDR", "USD", "SGD", "EUR", "GBP", "JPY", "AUD", "MYR", "CNY", 
    "KRW", "THB", "VND", "INR", "CAD", "CHF", "HKD", "NZD", "PHP"
  ];

  // Restores Demo Data
  const handleFactoryReset = () => {
    if (confirm("WARNING: This will wipe your data and restore the Demo Data. Continue?")) {
      resetData();
      localStorage.removeItem('app_currency');
      setTimeout(() => window.location.reload(), 100);
    }
  };

  // Wipes Everything to Zero
  const handleClearAll = () => {
    if (confirm("WARNING: This will delete ALL transactions, assets, and goals. You will start fresh with 0 data. Continue?")) {
      clearData();
      localStorage.removeItem('app_currency');
      setTimeout(() => window.location.reload(), 100);
    }
  };

  const handleSaveCurrency = (e: React.FormEvent) => {
    e.preventDefault();
    localStorage.setItem('app_currency', currency);
    setIsCurrencyModalOpen(false);
    window.location.reload(); 
  };

  const handleSaveEmail = (e: React.FormEvent) => {
    e.preventDefault();
    alert(`Email updated to ${newEmail}`);
    setIsEmailModalOpen(false);
  };

  const handleSavePin = (e: React.FormEvent) => {
    e.preventDefault();
    alert("PIN updated successfully");
    setIsPinModalOpen(false);
  };

  const downloadFile = (content: string, fileName: string, type: string) => {
     const blob = new Blob([content], { type });
     const url = URL.createObjectURL(blob);
     const a = document.createElement('a');
     a.href = url;
     a.download = fileName;
     document.body.appendChild(a);
     a.click();
     document.body.removeChild(a);
  };

  const handleExportExcel = () => {
    const timestamp = new Date().toISOString().split('T')[0];
    
    // Generate a simple HTML Table which Excel can open natively
    let tableRows = '';
    
    transactions.forEach(t => {
        const time = t.timestamp ? new Date(t.timestamp).toLocaleTimeString('id-ID') : '-';
        const typeStyle = t.type === 'income' ? 'color:green;' : 'color:red;';
        const dest = t.destinationType ? `To ${t.destinationType}` : '-';
        
        tableRows += `
          <tr>
            <td style="padding:5px;">${t.date}</td>
            <td style="padding:5px;">${time}</td>
            <td style="padding:5px; ${typeStyle}"><b>${t.type.toUpperCase()}</b></td>
            <td style="padding:5px;">${t.category}</td>
            <td style="padding:5px;">${t.title}</td>
            <td style="padding:5px; font-weight:bold;">${t.amount}</td>
            <td style="padding:5px;">${dest}</td>
          </tr>
        `;
    });

    const htmlContent = `
      <html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40">
      <head>
        <meta http-equiv="content-type" content="application/vnd.ms-excel; charset=UTF-8"/>
        <!--[if gte mso 9]>
        <xml>
        <x:ExcelWorkbook>
          <x:ExcelWorksheets>
            <x:ExcelWorksheet>
              <x:Name>Transactions Log</x:Name>
              <x:WorksheetOptions><x:DisplayGridlines/></x:WorksheetOptions>
            </x:ExcelWorksheet>
          </x:ExcelWorksheets>
        </x:ExcelWorkbook>
        </xml>
        <![endif]-->
        <style>
          table { border-collapse: collapse; width: 100%; font-family: Calibri, sans-serif; }
          th { background-color: #4C1D95; color: white; font-weight: bold; text-align: left; border: 1px solid #ddd; padding: 8px; }
          td { border: 1px solid #ddd; padding: 8px; }
        </style>
      </head>
      <body>
        <h2>This Is Spending - Transaction Recap</h2>
        <table>
          <thead>
            <tr>
              <th>Date</th>
              <th>Time</th>
              <th>Type</th>
              <th>Category</th>
              <th>Description</th>
              <th>Amount</th>
              <th>Details</th>
            </tr>
          </thead>
          <tbody>
            ${tableRows}
          </tbody>
        </table>
      </body>
      </html>
    `;

    downloadFile(htmlContent, `ThisIsSpending_Recap_${timestamp}.xls`, 'application/vnd.ms-excel');
  };

  const MenuRow = ({ icon, label, sub, onClick, danger = false, warning = false }: any) => (
    <button 
      onClick={onClick}
      className={`w-full flex items-center justify-between p-4 bg-white rounded-2xl shadow-sm mb-3 transition-transform active:scale-98 border border-gray-50 group`}
    >
      <div className="flex items-center gap-4">
        <div className={`p-3 rounded-xl ${danger ? 'bg-red-50 text-red-500' : warning ? 'bg-orange-50 text-orange-500' : 'bg-gray-50 text-gray-600 group-hover:bg-violet-50 group-hover:text-violet-600'} transition-colors`}>
          {icon}
        </div>
        <div className="text-left">
          <span className={`font-bold text-sm block ${danger ? 'text-red-600' : warning ? 'text-orange-600' : 'text-gray-800'}`}>{label}</span>
          {sub && <span className="text-xs text-gray-400 font-medium">{sub}</span>}
        </div>
      </div>
      <div className="text-gray-300">›</div>
    </button>
  );

  return (
    <div className="pb-24 animate-in slide-in-from-right">
      <div className="flex items-center mb-6">
          <button onClick={() => setView('dashboard')} className="p-2 bg-white rounded-full shadow-sm text-gray-600 hover:bg-gray-50 mr-4">
             <ArrowLeft size={20} />
          </button>
          <span className="font-bold text-lg">Settings</span>
       </div>

      <div className="flex flex-col items-center mb-8">
         <div className="w-24 h-24 bg-gradient-to-br from-gray-800 to-black rounded-full flex items-center justify-center text-4xl text-white shadow-xl shadow-gray-300 mb-4 relative overflow-hidden">
           {profileEmoji}
         </div>
         <div className="flex gap-3 mb-4">
            {emojis.map(e => (
                <button key={e} onClick={() => setProfileEmoji(e)} className={`w-10 h-10 rounded-full bg-white shadow-sm flex items-center justify-center text-lg transition-transform hover:scale-110 ${profileEmoji === e ? 'ring-2 ring-violet-500' : ''}`}>{e}</button>
            ))}
         </div>
         <h1 className="text-2xl font-bold text-gray-900">Hi, Eno</h1>
      </div>

      <div className="space-y-8"> 
        <div>
            <h3 className="text-xs font-bold text-gray-400 uppercase px-2 mb-2 tracking-wider">Data Pribadi</h3>
            <MenuRow icon={<Mail size={18} />} label="Change Email" sub="Update email address" onClick={() => setIsEmailModalOpen(true)} />
            <MenuRow icon={<Lock size={18} />} label="Change PIN" sub="Security code" onClick={() => setIsPinModalOpen(true)} />
        </div>
        <div>
            <h3 className="text-xs font-bold text-gray-400 uppercase px-2 mb-2 tracking-wider">Finance</h3>
            <MenuRow icon={<RefreshCw size={18} />} label="Currency Settings" sub={`Current: ${currency}`} onClick={() => setIsCurrencyModalOpen(true)} />
            <MenuRow icon={<Bell size={18} />} label="Notifications" sub="Daily Reminders ON" />
        </div>
        <div>
            <h3 className="text-xs font-bold text-gray-400 uppercase px-2 mb-2 tracking-wider">Data Management</h3>
            <MenuRow icon={<FileSpreadsheet size={18} />} label="Export to Excel" sub="Recap all Expenses & Income" onClick={handleExportExcel} />
            
            <MenuRow icon={<Eraser size={18} />} label="Clear All Data" sub="Delete all transactions & assets (Start Fresh)" onClick={handleClearAll} warning />
            <MenuRow icon={<Trash2 size={18} />} label="Factory Reset" sub="Restore Demo Data" onClick={handleFactoryReset} danger />
        </div>
      </div>

      <div className="text-center mt-12">
         <p className="text-[10px] text-gray-300 font-bold tracking-widest">THIS IS SPENDING v2.3</p>
      </div>

      <Modal isOpen={isCurrencyModalOpen} onClose={() => setIsCurrencyModalOpen(false)} title="Currency Settings">
        <form onSubmit={handleSaveCurrency} className="space-y-4">
           <div className="bg-blue-50 p-4 rounded-xl text-xs text-blue-800 leading-relaxed font-medium mb-4"><span className="font-bold block mb-1">Note:</span>This only changes the currency symbol. It does <span className="font-bold">not</span> convert numbers.</div>
           <div>
             <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Display Currency</label>
             <select value={currency} onChange={e => setCurrency(e.target.value)} className="w-full p-3 bg-gray-50 rounded-xl font-bold border-none focus:ring-2 focus:ring-violet-500">
                {CURRENCIES.map(c => (<option key={c} value={c}>{c}</option>))}
             </select>
           </div>
           <button type="submit" className="w-full bg-gray-900 text-white font-bold py-3 rounded-xl">Save & Reload</button>
        </form>
      </Modal>
      <Modal isOpen={isEmailModalOpen} onClose={() => setIsEmailModalOpen(false)} title="Change Email">
        <form onSubmit={handleSaveEmail} className="space-y-4">
           <input required type="email" value={newEmail} onChange={e => setNewEmail(e.target.value)} className="w-full p-3 bg-gray-50 rounded-xl font-bold" placeholder="you@example.com" />
           <button type="submit" className="w-full bg-gray-900 text-white font-bold py-3 rounded-xl">Update Email</button>
        </form>
      </Modal>
      <Modal isOpen={isPinModalOpen} onClose={() => setIsPinModalOpen(false)} title="Change PIN">
        <form onSubmit={handleSavePin} className="space-y-4">
           <input required type="password" maxLength={6} value={newPin} onChange={e => setNewPin(e.target.value)} className="w-full p-3 bg-gray-50 rounded-xl font-bold text-center text-2xl tracking-widest" placeholder="••••••" />
           <button type="submit" className="w-full bg-gray-900 text-white font-bold py-3 rounded-xl">Update PIN</button>
        </form>
      </Modal>
    </div>
  );
};

export default ProfileView;
