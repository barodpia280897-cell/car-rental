import React from 'react';
import { motion } from 'framer-motion';
import { 
  CreditCard, Download, Plus, ArrowUpRight, 
  Zap, CheckCircle2, ShieldCheck, FileText,
  Clock, AlertCircle, RefreshCcw, DollarSign
} from 'lucide-react';

const CustomerPayments = () => {
  return (
    <div className="space-y-8 pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 px-2">
        <div>
          <h2 className="text-4xl font-black tracking-tighter text-white uppercase italic">
            Financial <span className="text-primary">Ledger</span>
          </h2>
          <p className="text-gray-500 font-bold tracking-[0.2em] uppercase text-[10px] mt-2">Billing & Payment Methods</p>
        </div>
        <div className="flex gap-3">
          <button className="px-6 py-3 bg-white/5 border border-white/10 rounded-xl text-white font-black uppercase tracking-widest text-[10px] hover:bg-white/10 transition-colors flex items-center gap-2">
            <Download size={16} /> Export CSV
          </button>
          <button className="px-6 py-3 bg-primary text-[#0A0E17] font-black uppercase tracking-widest text-[10px] rounded-xl shadow-glow-primary hover:scale-105 transition-all flex items-center gap-2">
            <Plus size={16} /> Add Method
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 px-2">
        {/* Main Content: Methods & Invoices */}
        <div className="lg:col-span-8 space-y-12">
          
          {/* Payment Methods */}
          <section className="space-y-6">
             <h3 className="text-lg font-black text-white uppercase italic tracking-tight">Active Instruments</h3>
             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <motion.div whileHover={{ y: -5 }} className="glass-panel p-8 border-primary/30 bg-gradient-to-br from-primary/10 to-transparent relative overflow-hidden group cursor-pointer">
                   <div className="absolute top-0 right-0 w-32 h-32 bg-primary/20 rounded-full blur-3xl -z-10"></div>
                   <div className="flex justify-between items-start mb-10">
                      <div className="p-3 bg-primary/20 rounded-2xl text-primary shadow-glow-primary">
                         <CreditCard size={24} />
                      </div>
                      <span className="text-[10px] font-black uppercase tracking-widest px-3 py-1 bg-primary/20 text-primary rounded-lg border border-primary/30 shadow-glow-primary">Primary</span>
                   </div>
                   <div>
                      <p className="text-2xl font-mono font-bold text-white tracking-[0.2em] mb-2">•••• •••• •••• 4242</p>
                      <div className="flex justify-between items-center">
                         <div>
                            <p className="text-[9px] font-black text-gray-500 uppercase tracking-widest">Card Holder</p>
                            <p className="text-xs font-black text-white uppercase">Alex Rivera</p>
                         </div>
                         <div className="text-right">
                            <p className="text-[9px] font-black text-gray-500 uppercase tracking-widest">Expires</p>
                            <p className="text-xs font-black text-white uppercase">12/28</p>
                         </div>
                      </div>
                   </div>
                </motion.div>

                <motion.div whileHover={{ y: -5 }} className="glass-panel p-8 border-white/5 bg-white/5 relative overflow-hidden group cursor-pointer hover:border-white/20 transition-all">
                   <div className="flex justify-between items-start mb-10">
                      <div className="p-3 bg-white/5 rounded-2xl text-gray-500">
                         <CreditCard size={24} />
                      </div>
                   </div>
                   <div>
                      <p className="text-2xl font-mono font-bold text-gray-400 tracking-[0.2em] mb-2">•••• •••• •••• 8812</p>
                      <div className="flex justify-between items-center text-gray-500">
                         <p className="text-[10px] font-black uppercase tracking-widest">Alex Rivera</p>
                         <p className="text-[10px] font-black uppercase tracking-widest">09/26</p>
                      </div>
                   </div>
                </motion.div>
             </div>
          </section>

          {/* Detailed Invoices Table */}
          <section className="space-y-6">
             <div className="flex justify-between items-center">
                <h3 className="text-lg font-black text-white uppercase italic tracking-tight">Invoice History</h3>
                <div className="flex gap-2">
                   {['All', 'Paid', 'Pending', 'Refunds'].map(f => (
                     <button key={f} className="px-4 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest bg-white/5 border border-white/5 text-gray-500 hover:text-white hover:bg-white/10 transition-all">{f}</button>
                   ))}
                </div>
             </div>
             <div className="space-y-3">
                {[
                  { id: 'INV-8829-01', type: 'Rental', unit: 'Tesla Model S', date: 'May 14, 2026', amount: '$2,550.00', status: 'Paid', method: 'Stripe' },
                  { id: 'INV-8829-02', type: 'Insurance', unit: 'Premium Pack', date: 'May 14, 2026', amount: '$150.00', status: 'Paid', method: 'Credit Card' },
                  { id: 'INV-7712-01', type: 'Refund', unit: 'Deposit Return', date: 'April 15, 2026', amount: '$500.00', status: 'Refunded', method: 'Zelle' },
                  { id: 'INV-9901-01', type: 'Pending', unit: 'Upcoming Trip', date: 'May 24, 2026', amount: '$3,580.00', status: 'Unpaid', method: 'Cash App' },
                ].map((inv, i) => (
                  <div key={i} className="flex flex-col md:flex-row md:items-center justify-between p-6 bg-white/5 border border-white/5 rounded-2xl hover:bg-white/10 transition-colors cursor-pointer group">
                     <div className="flex items-center gap-5 mb-4 md:mb-0">
                        <div className={`w-12 h-12 rounded-xl border flex items-center justify-center transition-all
                           ${inv.status === 'Paid' ? 'bg-accent/10 border-accent/20 text-accent' : 
                             inv.status === 'Unpaid' ? 'bg-highlight/10 border-highlight/20 text-highlight' : 
                             'bg-primary/10 border-primary/20 text-primary'}`}>
                           {inv.status === 'Refunded' ? <RefreshCcw size={18} /> : <FileText size={18} />}
                        </div>
                        <div>
                           <div className="flex items-center gap-2">
                              <h4 className="text-sm font-black text-white uppercase tracking-tight">{inv.unit}</h4>
                              <span className="text-[8px] font-black px-2 py-0.5 bg-white/10 text-gray-400 rounded uppercase">{inv.type}</span>
                           </div>
                           <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mt-1">
                             {inv.id} • {inv.date} • Method: <span className="text-primary">{inv.method}</span>
                           </p>
                        </div>
                     </div>
                     <div className="flex items-center justify-between md:justify-end gap-8">
                        <div className="text-right">
                           <p className="text-sm font-black text-white">{inv.amount}</p>
                           <p className={`text-[9px] font-black uppercase tracking-widest ${inv.status === 'Paid' ? 'text-accent' : inv.status === 'Unpaid' ? 'text-highlight' : 'text-primary'}`}>
                              {inv.status}
                           </p>
                        </div>
                        <div className="flex gap-2">
                           {inv.status === 'Unpaid' && (
                              <button className="px-4 py-2 bg-primary text-[#0A0E17] rounded-lg text-[9px] font-black uppercase tracking-widest shadow-glow-primary">Pay Now</button>
                           )}
                           <button className="p-3 bg-white/5 border border-white/10 rounded-xl text-gray-500 hover:text-white transition-all">
                              <Download size={16} />
                           </button>
                        </div>
                     </div>
                  </div>
                ))}
             </div>
          </section>
        </div>

        {/* Sidebar: Summary & Balances */}
        <div className="lg:col-span-4 space-y-8">
           
           {/* Ledger Summary */}
           <div className="glass-panel p-8 border-primary/20 bg-gradient-to-b from-primary/5 to-transparent relative overflow-hidden">
              <h3 className="text-lg font-black text-white uppercase italic tracking-tight mb-8">Summary</h3>
              
              <div className="space-y-6">
                 <div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-gray-500 mb-1">Account Balance</p>
                    <p className="text-5xl font-black text-white tracking-tighter italic">$3,580.00</p>
                    <div className="flex items-center gap-2 mt-2 text-highlight">
                       <AlertCircle size={14} />
                       <span className="text-[9px] font-black uppercase tracking-widest">Upcoming Transaction Required</span>
                    </div>
                 </div>
                 
                 <div className="h-px w-full bg-white/10"></div>
                 
                 <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 bg-white/5 rounded-2xl border border-white/5">
                       <p className="text-[8px] font-black uppercase tracking-widest text-gray-500 mb-1">Held Deposits</p>
                       <p className="text-sm font-black text-white">$1,200.00</p>
                    </div>
                    <div className="p-4 bg-white/5 rounded-2xl border border-white/5">
                       <p className="text-[8px] font-black uppercase tracking-widest text-gray-500 mb-1">Total Savings</p>
                       <p className="text-sm font-black text-accent">$420.00</p>
                    </div>
                 </div>

                 <button className="w-full py-5 bg-primary text-[#0A0E17] rounded-2xl font-black uppercase tracking-[0.2em] text-[10px] italic shadow-glow-primary hover:scale-105 transition-all flex items-center justify-center gap-3">
                    <Zap size={16} fill="currentColor" /> Authorize Payments
                 </button>
              </div>
           </div>

           {/* Security & Compliance */}
           <div className="space-y-4">
              <div className="p-6 bg-[#0A0E17] border border-white/5 rounded-[2rem] flex items-start gap-4">
                 <ShieldCheck size={24} className="text-primary shrink-0" />
                 <div>
                    <h4 className="text-xs font-black uppercase tracking-widest text-white mb-1">Security Verified</h4>
                    <p className="text-[10px] text-gray-500 leading-relaxed font-medium uppercase tracking-tight">
                       All transactions processed through AES-256 encrypted channels. PCI-DSS Level 1 Compliant.
                    </p>
                 </div>
              </div>
              
              <div className="p-6 bg-white/5 border border-dashed border-white/10 rounded-[2rem] text-center group cursor-pointer hover:border-primary/30 transition-all">
                 <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest group-hover:text-primary transition-colors">Need financial assistance?</p>
                 <button className="mt-2 text-[10px] font-black text-white uppercase tracking-widest underline decoration-primary decoration-2 underline-offset-4">Contact Billing Dept</button>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
};

export default CustomerPayments;
