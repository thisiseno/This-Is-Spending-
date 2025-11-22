import React, { useState } from 'react';
import { useFinance } from '../App';
import { Trash2, Bell, ArrowLeft, RefreshCw, Mail, Lock, FileSpreadsheet } from 'lucide-react';
import { Modal } from '../components/ui/Modal';

const ProfileView: React.FC = () => {
  const { resetData, setView, transactions, assets, goals } = useFinance();
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

  const handleReset = () => {
    if (confirm("WARNING: This will wipe all local data. Continue?")) {
      resetData();
      localStorage.removeItem('app_currency');
      alert("App reset to factory settings.");
      window.location.reload();
    }
  };

  const handleSaveCurrency = (e: React.FormEvent) => {
    e.preventDefault();
    localStorage.setItem('app_currency', currency);
    setIsCurrencyModalOpen(false);
    window.location.reload(); // Force reload to apply new currency globally
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

  // --- EXCEL GENERATOR (XML SPREADSHEET 2003) ---
  const handleExportExcel = () => {
    const timestamp = new Date().toISOString().split('T')[0];
    
    // Helper to create a worksheet
    const createSheet = (name: string, headers: string[], rows: (string | number)[][]) => {
       const headerRow = `<Row>${headers.map(h => `<Cell><Data ss:Type="String">${h}</Data></Cell>`).join('')}</Row>`;
       const dataRows = rows.map(row => {
          return `<Row>${row.map(cell => {
             const type = typeof cell === 'number' ? 'Number' : 'String';
             return `<Cell><Data ss:Type="${type}">${cell}</Data></Cell>`;
          }).join('')}</Row>`;
       }).join('');
       
       return `
       <Worksheet ss:Name="${name}">
        <Table>
         ${headerRow}
         ${dataRows}
        </Table>
       </Worksheet>`;
    };

    // Sheet 1: Expense (Transactions)
    const transactionRows = transactions.map(t => [
         t.date,
         t.type,
         t.category,
         t.title,
         t.amount
    ]);
    const sheetTxn = createSheet("Expense", ["Date", "Type", "Category", "Title", "Amount"], transactionRows);

    // Sheet 2: Portfolio (Assets)
    const assetRows = assets.map(a => [a.name, a.type, a.amount]);
    const sheetAssets = createSheet("Portfolio", ["Asset Name", "Type", "Current Value"], assetRows);

    // Sheet 3: Goals
    const goalRows = goals.map(g => [g.name, g.target, g.current, g.deadline || 'None']);
    const sheetGoals = createSheet("Goals", ["Goal Name", "Target Amount", "Saved Amount", "Deadline"], goalRows);

    // Combine into Workbook
    const xmlContent = `<?xml version="1.0"?>
    <?mso-application progid="Excel.Sheet"?>
    <Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet"
     xmlns:o="urn:schemas-microsoft-com:office:office"
     xmlns:x="urn:schemas-microsoft-com:office:excel"
     xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet"
     xmlns:html="http://www.w3.org/TR/REC-html40">
     ${sheetTxn}
     ${sheetAssets}
     ${sheetGoals}
    </Workbook>`;

    downloadFile(xmlContent, `ThisIsSpending_Data_${timestamp}.xls`, 'application/vnd.ms-excel');
  };

  const MenuRow = ({ icon, label, sub, onClick, danger = false }: any) => (
    <button 
      onClick={onClick}
      className={`w-full flex items-center justify-between p-4 bg-white rounded-2xl shadow-sm mb-3 transition-transform active:scale-98 border border-gray-50 group`}
    >
      <div className="flex items-center gap-4">
        <div className={`p-3 rounded-xl ${danger ? 'bg-red-50 text-red-500' : 'bg-gray-50 text-gray-600 group-hover:bg-violet-50 group-hover:text-violet-600'} transition-colors`}>
          {icon}
        </div>
        <div className="text-left">
          <span className={`font-bold text-sm block ${danger ? 'text-red-600' : 'text-gray-800'}`}>{label}</span>
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
                <button 
                  key={e} 
                  onClick={() => setProfileEmoji(e)} 
                  className={`w-10 h-10 rounded-full bg-white shadow-sm flex items-center justify-center text-lg transition-transform hover:scale-110 ${profileEmoji === e ? 'ring-2 ring-violet-500' : ''}`}
                >
                    {e}
                </button>
            ))}
         </div>

         <h1 className="text-2xl font-bold text-gray-900">Hi, Eno</h1>
      </div>

      <div className="space-y-8"> 
        
        {/* Personal Data */}
        <div>
            <h3 className="text-xs font-bold text-gray-400 uppercase px-2 mb-2 tracking-wider">Data Pribadi</h3>
            <MenuRow icon={<Mail size={18} />} label="Change Email" sub="Update email address" onClick={() => setIsEmailModalOpen(true)} />
            <MenuRow icon={<Lock size={18} />} label="Change PIN" sub="Security code" onClick={() => setIsPinModalOpen(true)} />
        </div>

        {/* Finance Settings */}
        <div>
            <h3 className="text-xs font-bold text-gray-400 uppercase px-2 mb-2 tracking-wider">Finance</h3>
            <MenuRow 
              icon={<RefreshCw size={18} />} 
              label="Currency Settings" 
              sub={`Current: ${currency}`} 
              onClick={() => setIsCurrencyModalOpen(true)} 
            />
            <MenuRow icon={<Bell size={18} />} label="Notifications" sub="Daily Reminders ON" />
        </div>
        
        {/* Data Management */}
        <div>
            <h3 className="text-xs font-bold text-gray-400 uppercase px-2 mb-2 tracking-wider">Data Management</h3>
            <MenuRow icon={<FileSpreadsheet size={18} />} label="Export to Excel" sub="Expenses, Portfolio & Goals" onClick={handleExportExcel} />
            <MenuRow icon={<Trash2 size={18} />} label="Reset All Data" sub="Clear local storage" onClick={handleReset} danger />
        </div>

      </div>

      <div className="text-center mt-12">
         <p className="text-[10px] text-gray-300 font-bold tracking-widest">THIS IS SPENDING v2.2</p>
      </div>

      {/* --- MODALS --- */}

      <Modal isOpen={isCurrencyModalOpen} onClose={() => setIsCurrencyModalOpen(false)} title="Currency Settings">
        <form onSubmit={handleSaveCurrency} className="space-y-4">
           <div className="bg-blue-50 p-4 rounded-xl text-xs text-blue-800 leading-relaxed font-medium mb-4">
             <span className="font-bold block mb-1">Note:</span>
             This only changes the currency symbol and formatting style (e.g. comma vs dots). It does <span className="font-bold">not</span> mathematically convert your existing numbers.
           </div>
           
           <div>
             <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Display Currency</label>
             <select 
                value={currency} 
                onChange={e => setCurrency(e.target.value)}
                className="w-full p-3 bg-gray-50 rounded-xl font-bold border-none focus:ring-2 focus:ring-violet-500"
             >
                {CURRENCIES.map(c => (
                    <option key={c} value={c}>{c}</option>
                ))}
             </select>
           </div>

           <button type="submit" className="w-full bg-gray-900 text-white font-bold py-3 rounded-xl">Save & Reload</button>
        </form>
      </Modal>

      <Modal isOpen={isEmailModalOpen} onClose={() => setIsEmailModalOpen(false)} title="Change Email">
        <form onSubmit={handleSaveEmail} className="space-y-4">
           <div>
             <label className="block text-xs font-bold text-gray-500 uppercase mb-1">New Email Address</label>
             <input required type="email" value={newEmail} onChange={e => setNewEmail(e.target.value)} className="w-full p-3 bg-gray-50 rounded-xl font-bold" placeholder="you@example.com" />
           </div>
           <button type="submit" className="w-full bg-gray-900 text-white font-bold py-3 rounded-xl">Update Email</button>
        </form>
      </Modal>

      <Modal isOpen={isPinModalOpen} onClose={() => setIsPinModalOpen(false)} title="Change PIN">
        <form onSubmit={handleSavePin} className="space-y-4">
           <div>
             <label className="block text-xs font-bold text-gray-500 uppercase mb-1">New 6-Digit PIN</label>
             <input required type="password" maxLength={6} value={newPin} onChange={e => setNewPin(e.target.value)} className="w-full p-3 bg-gray-50 rounded-xl font-bold text-center text-2xl tracking-widest" placeholder="••••••" />
           </div>
           <button type="submit" className="w-full bg-gray-900 text-white font-bold py-3 rounded-xl">Update PIN</button>
        </form>
      </Modal>

    </div>
  );
};

export default ProfileView;