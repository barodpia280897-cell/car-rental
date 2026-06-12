import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, PieChart, Pie, Cell
} from 'recharts';
import {
  DollarSign, FileText, ArrowUpRight, ArrowDownRight,
  Plus, CreditCard, RefreshCw, X, CheckCircle2,
  Receipt, TrendingDown, BarChart2, Download,
  Eye, AlertTriangle, Clock, ChevronRight
} from 'lucide-react';
import { toast } from 'react-hot-toast';

const initialPayments = [
  { id: 'TXN-001', type: 'Rental Deposit', entity: 'John Smith', method: 'Stripe', date: '04 Jun 2026', status: 'Completed', amount: 2500 },
  { id: 'TXN-002', type: 'Daily Rental Fee', entity: 'Elena Rodriguez', method: 'Credit Card', date: '04 Jun 2026', status: 'Completed', amount: 800 },
  { id: 'TXN-003', type: 'Exotics Lease', entity: 'Marcus Chen', method: 'Wire Transfer', date: '03 Jun 2026', status: 'Completed', amount: 4500 }
];

/* ─── Static chart/KPI data ─── */
const revenueData = [
  { name: 'Jan', revenue: 45000, expenses: 22000 },
  { name: 'Feb', revenue: 52000, expenses: 25000 },
  { name: 'Mar', revenue: 48000, expenses: 21000 },
  { name: 'Apr', revenue: 61000, expenses: 28000 },
  { name: 'May', revenue: 55000, expenses: 26000 },
  { name: 'Jun', revenue: 67000, expenses: 29000 },
];

const paymentMethodsData = [
  { name: 'Stripe Payments',      value: 45, color: '#D4AF37' },
  { name: 'Credit Card Payments', value: 30, color: '#F3E5AB' },
  { name: 'Cash App Payments',    value: 15, color: '#A0A0A0' },
  { name: 'Zelle Payments',       value: 10, color: '#FFFFFF' },
];

/* ─── Helper ─── */
const StatusBadge = ({ status }) => {
  const map = {
    Completed: 'bg-primary/10 text-primary border-primary/20',
    Paid:      'bg-primary/10 text-primary border-primary/20',
    Pending:   'bg-amber-500/10 text-amber-500 border-amber-500/20',
    Overdue:   'bg-red-500/10 text-red-400 border-red-500/20',
  };
  return (
    <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border ${map[status] || 'bg-white/5 text-gray-400 border-white/10'}`}>
      {status}
    </span>
  );
};

/* ═══════════════════════════════════════════
   MAIN COMPONENT
═══════════════════════════════════════════ */
const AdminFinance = () => {
  const [transactions]          = useState(initialPayments);
  const [modalType, setModalType] = useState(null);
  const [activeTab, setActiveTab] = useState('Payments');
  const [selectedTrx, setSelectedTrx] = useState(null);

  /* form state */
  const [formEntity, setFormEntity] = useState('');
  const [formAmount, setFormAmount] = useState('');
  const [formDate,   setFormDate]   = useState('');
  const [formType,   setFormType]   = useState('');

  /* ── Mock data ── */
  const [invoices, setInvoices] = useState([
    { id: 'INV-0081', type: 'Exotics Lease',     customer: 'Elena Rodriguez', method: 'Stripe',      date: '05 Jun 2026', status: 'Completed', amount: 3500 },
    { id: 'INV-0082', type: 'Security Deposit',  customer: 'James Thompson',  method: 'Zelle',       date: '04 Jun 2026', status: 'Completed', amount: 500  },
    { id: 'INV-0083', type: 'Daily Rental',      customer: 'David Wilson',    method: 'Credit Card', date: '03 Jun 2026', status: 'Completed', amount: 600  },
    { id: 'INV-0084', type: 'Weekly Package',    customer: 'Sarah Miller',    method: 'Stripe',      date: '02 Jun 2026', status: 'Pending',   amount: 850  },
    { id: 'INV-0085', type: 'Corporate Lease',   customer: 'Marcus Chen',     method: 'Wire',        date: '01 Jun 2026', status: 'Overdue',   amount: 12000 },
  ]);

  const [expenses, setExpenses] = useState([
    { id: 'EXP-1091', category: 'Fleet Maintenance',  vendor: 'Apex Auto Repair', method: 'Wire Transfer', date: '04 Jun 2026', status: 'Completed', amount: 12500 },
    { id: 'EXP-1092', category: 'Fuel Charge',        vendor: 'Shell Stations',   method: 'Credit Card',  date: '03 Jun 2026', status: 'Completed', amount: 450   },
    { id: 'EXP-1093', category: 'Platform Hosting',   vendor: 'Vercel Inc.',      method: 'Credit Card',  date: '01 Jun 2026', status: 'Completed', amount: 120   },
    { id: 'EXP-1094', category: 'Marketing & Ads',    vendor: 'Google Ads',       method: 'Stripe',       date: '28 May 2026', status: 'Pending',   amount: 1500  },
    { id: 'EXP-1095', category: 'Office Supplies',    vendor: 'Staples',          method: 'Zelle',        date: '25 May 2026', status: 'Completed', amount: 320   },
  ]);

  const [reports] = useState([
    { id: 'REP-2011', name: 'Fleet Telemetry Analytics',   creator: 'System Auto',    format: 'PDF',  date: '05 Jun 2026', status: 'Completed', records: 48  },
    { id: 'REP-2012', name: 'Q2 Financial Audit',          creator: 'Marcus Chen',    format: 'CSV',  date: '04 Jun 2026', status: 'Completed', records: 124 },
    { id: 'REP-2013', name: 'Driver Earnings Summary',     creator: 'System Auto',    format: 'PDF',  date: '03 Jun 2026', status: 'Completed', records: 32  },
    { id: 'REP-2014', name: 'Customer Retention Matrix',   creator: 'Marketing Lead', format: 'XLSX', date: '02 Jun 2026', status: 'Completed', records: 15  },
    { id: 'REP-2015', name: 'Monthly Revenue Breakdown',   creator: 'System Auto',    format: 'PDF',  date: '01 Jun 2026', status: 'Completed', records: 88  },
  ]);

  /* ── Modal helpers ── */
  const openModal = (type) => {
    setFormEntity(''); setFormAmount('');
    setFormDate(new Date().toISOString().split('T')[0]);
    setFormType('');
    setModalType(type);
  };
  const closeModal = () => { setModalType(null); setSelectedTrx(null); };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    if (!formEntity || !formAmount) { toast.error('Required fields missing'); return; }
    const amt = parseFloat(formAmount);
    if (modalType === 'invoice') {
      setInvoices(prev => [{
        id: `INV-${Math.floor(1000 + Math.random() * 9000)}`,
        type: formType || 'Rental Payment',
        customer: formEntity, method: 'Stripe',
        date: formDate, status: 'Pending', amount: amt
      }, ...prev]);
      toast.success('Invoice generated & queued', { style: { background: '#111111', color: '#D4AF37', border: '1px solid rgba(212,175,55,0.2)' } });
      setActiveTab('Invoices');
    } else {
      setExpenses(prev => [{
        id: `EXP-${Math.floor(1000 + Math.random() * 9000)}`,
        category: formType || 'Fleet Maintenance',
        vendor: formEntity, method: 'Credit Card',
        date: formDate, status: 'Pending', amount: amt
      }, ...prev]);
      toast.success('Expense recorded successfully', { style: { background: '#111111', color: '#D4AF37', border: '1px solid rgba(212,175,55,0.2)' } });
      setActiveTab('Expenses');
    }
    closeModal();
  };

  /* ── Tab config ── */
  const tabs = [
    { key: 'Payments', icon: CreditCard },
    { key: 'Invoices', icon: Receipt },
    { key: 'Expenses', icon: TrendingDown },
    { key: 'Reports',  icon: BarChart2 },
  ];

  return (
    <div className="space-y-8 pb-12">

      {/* ── PAGE HEADER ── */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div>
          <h2 className="text-4xl font-black tracking-tighter text-white uppercase italic font-serif">
            Financial <span className="text-primary font-serif not-italic">Intelligence</span>
          </h2>
          <p className="text-gray-500 font-bold tracking-[0.2em] uppercase text-[10px] mt-2">Treasury & Ledger Analytics</p>
        </div>
        <div className="flex gap-3">
          <button onClick={() => openModal('invoice')}
            className="px-5 py-3 bg-[#111111] border border-white/10 rounded-xl flex items-center gap-2 text-white hover:bg-white/10 transition-colors text-xs font-black uppercase tracking-widest hover:border-primary/30">
            <FileText size={15} className="text-primary" /> Create Invoice
          </button>
          <button onClick={() => openModal('expense')}
            className="px-5 py-3 bg-primary/10 text-primary border border-primary/20 rounded-xl flex items-center gap-2 hover:bg-primary hover:text-black transition-all shadow-glow-primary text-xs font-black uppercase tracking-widest">
            <Plus size={15} /> Record Expense
          </button>
        </div>
      </div>

      {/* ── TABS ── */}
      <div className="flex gap-2 border-b border-white/10 pb-0 overflow-x-auto">
        {tabs.map(({ key, icon: Icon }) => (
          <button
            key={key}
            onClick={() => setActiveTab(key)}
            className={`px-6 py-3 flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] transition-all whitespace-nowrap border-b-2 -mb-px
              ${activeTab === key
                ? 'border-primary text-primary'
                : 'border-transparent text-gray-500 hover:text-white hover:border-white/20'}`}
          >
            <Icon size={13} />
            {key}
          </button>
        ))}
      </div>

      {/* ══════════════════════════════════
          TAB CONTENT
      ══════════════════════════════════ */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.22 }}
        >

          {/* ── PAYMENTS TAB ── */}
          {activeTab === 'Payments' && (
            <div className="space-y-8">
              {/* KPIs */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {[
                  { label: 'Total Revenue',   val: '$328,000', trend: '+14.2%', icon: DollarSign,    up: true  },
                  { label: 'Active Deposits', val: '$45,500',  trend: '+5.1%',  icon: CreditCard,    up: true  },
                  { label: 'Total Expenses',  val: '$151,000', trend: '-2.4%',  icon: ArrowDownRight, up: false },
                  { label: 'Net Profit',      val: '$177,000', trend: '+18.5%', icon: ArrowUpRight,  up: true  },
                ].map((kpi, i) => (
                  <motion.div key={i} whileHover={{ y: -4 }} className="glass-panel p-6 border-white/5 relative overflow-hidden group">
                    <div className="absolute -right-4 -top-4 w-20 h-20 bg-white/5 rounded-full blur-2xl group-hover:bg-white/10 transition-colors" />
                    <div className="flex justify-between items-start mb-4">
                      <div className={`p-3 rounded-xl bg-white/5 border border-white/10 ${kpi.up ? 'text-primary' : 'text-danger'}`}>
                        <kpi.icon size={20} />
                      </div>
                      <span className={`text-[10px] font-black px-2 py-1 rounded-lg border ${kpi.up ? 'bg-primary/10 text-primary border-primary/20' : 'bg-danger/10 text-danger border-danger/20'}`}>
                        {kpi.trend}
                      </span>
                    </div>
                    <p className="text-gray-500 text-[10px] font-black uppercase tracking-widest mb-1">{kpi.label}</p>
                    <h3 className="text-3xl font-black text-white tracking-tighter">{kpi.val}</h3>
                  </motion.div>
                ))}
              </div>

              {/* Charts */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 glass-panel p-8 border-white/5">
                  <h3 className="text-lg font-black text-white uppercase italic tracking-tight font-serif mb-1">Cash Flow Dynamics</h3>
                  <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mb-6">H1 2026 Analysis</p>
                  <div className="h-[260px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={revenueData}>
                        <defs>
                          <linearGradient id="cR" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%"  stopColor="#D4AF37" stopOpacity={0.3}/>
                            <stop offset="95%" stopColor="#D4AF37" stopOpacity={0}/>
                          </linearGradient>
                          <linearGradient id="cE" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%"  stopColor="#EF4444" stopOpacity={0.3}/>
                            <stop offset="95%" stopColor="#EF4444" stopOpacity={0}/>
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false}/>
                        <XAxis dataKey="name" stroke="#6B7280" fontSize={10} tickLine={false} axisLine={false}/>
                        <YAxis stroke="#6B7280" fontSize={10} tickLine={false} axisLine={false} tickFormatter={v => `$${v/1000}k`}/>
                        <Tooltip contentStyle={{ backgroundColor:'#111111', border:'1px solid rgba(255,255,255,0.1)', borderRadius:'12px' }} itemStyle={{ color:'#fff' }}/>
                        <Area type="monotone" dataKey="revenue"  stroke="#D4AF37" strokeWidth={3} fill="url(#cR)"/>
                        <Area type="monotone" dataKey="expenses" stroke="#EF4444" strokeWidth={3} fill="url(#cE)"/>
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                <div className="glass-panel p-8 border-white/5 flex flex-col">
                  <h3 className="text-lg font-black text-white uppercase italic tracking-tight font-serif">Payment Gateways</h3>
                  <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mt-1 mb-4">Stripe · Credit Card · Cash App · Zelle</p>
                  <div className="flex-1 min-h-[180px] relative">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie data={paymentMethodsData} cx="50%" cy="50%" innerRadius={55} outerRadius={75} paddingAngle={5} dataKey="value">
                          {paymentMethodsData.map((e, i) => <Cell key={i} fill={e.color} stroke="none"/>)}
                        </Pie>
                        <Tooltip contentStyle={{ backgroundColor:'#111111', border:'1px solid rgba(255,255,255,0.1)', borderRadius:'12px' }}/>
                      </PieChart>
                    </ResponsiveContainer>
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                      <span className="text-2xl font-black text-white font-serif">100%</span>
                    </div>
                  </div>
                  <div className="space-y-3 mt-4">
                    {paymentMethodsData.map((m, i) => (
                      <div key={i} className="flex justify-between items-center text-xs">
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 rounded-full" style={{ backgroundColor: m.color }}/>
                          <span className="text-gray-400 font-bold">{m.name}</span>
                        </div>
                        <span className="font-black text-white">{m.value}%</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Payments Table */}
              <div className="glass-panel overflow-hidden border-white/5">
                <div className="p-6 border-b border-white/5 flex justify-between items-center">
                  <h3 className="text-base font-black text-white uppercase italic tracking-tight font-serif">Recent Payments</h3>
                  <button className="text-primary text-[10px] font-black uppercase tracking-widest flex items-center gap-1">View All <RefreshCw size={11}/></button>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead>
                      <tr className="bg-[#111111] border-b border-white/5">
                        {['Transaction ID','Type','Entity','Method','Date','Status','Amount'].map((h, i) => (
                          <th key={i} className={`p-4 text-[10px] font-black uppercase tracking-widest text-primary ${i===6?'text-right':''}`}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {transactions.map((t, i) => (
                        <tr key={i} onClick={() => setSelectedTrx({...t, _tab:'pay'})} className="border-b border-white/5 hover:bg-white/5 cursor-pointer group">
                          <td className="p-4 text-xs font-bold text-white group-hover:text-primary transition-colors">{t.id}</td>
                          <td className="p-4 text-xs font-bold text-gray-400">{t.type}</td>
                          <td className="p-4 text-sm font-bold text-white uppercase italic">{t.entity}</td>
                          <td className="p-4 text-xs font-bold text-primary">{t.method}</td>
                          <td className="p-4 text-xs font-bold text-gray-500">{t.date}</td>
                          <td className="p-4"><StatusBadge status={t.status}/></td>
                          <td className="p-4 text-sm font-black text-primary text-right">+${t.amount?.toFixed(2)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ── INVOICES TAB ── */}
          {activeTab === 'Invoices' && (
            <div className="space-y-6">
              {/* Summary row */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                {[
                  { label: 'Total Invoiced', val: `$${invoices.reduce((a,b)=>a+b.amount,0).toLocaleString()}`, icon: Receipt, color:'text-primary' },
                  { label: 'Pending',         val: `${invoices.filter(i=>i.status==='Pending').length} invoices`, icon: Clock, color:'text-amber-400' },
                  { label: 'Overdue',         val: `${invoices.filter(i=>i.status==='Overdue').length} invoices`, icon: AlertTriangle, color:'text-red-400' },
                ].map((s,i) => (
                  <motion.div key={i} whileHover={{ y:-3 }} className="glass-panel p-5 border-white/5 flex items-center gap-4">
                    <div className={`p-3 rounded-xl bg-white/5 border border-white/10 ${s.color}`}><s.icon size={20}/></div>
                    <div>
                      <p className="text-[10px] text-gray-500 font-black uppercase tracking-widest">{s.label}</p>
                      <p className={`text-xl font-black ${s.color}`}>{s.val}</p>
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* Invoices table */}
              <div className="glass-panel overflow-hidden border-white/5">
                <div className="p-6 border-b border-white/5 flex justify-between items-center bg-[#111111]/60">
                  <div>
                    <h3 className="text-base font-black text-white uppercase italic tracking-tight font-serif">All Invoices</h3>
                    <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mt-0.5">{invoices.length} records found</p>
                  </div>
                  <button onClick={() => openModal('invoice')} className="px-5 py-2.5 bg-primary/10 text-primary border border-primary/20 rounded-xl flex items-center gap-2 hover:bg-primary hover:text-black transition-all text-xs font-black uppercase tracking-widest">
                    <Plus size={14}/> New Invoice
                  </button>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead>
                      <tr className="bg-[#111111] border-b border-white/5">
                        {['Invoice ID','Type','Customer','Method','Date','Status','Amount'].map((h,i)=>(
                          <th key={i} className={`p-4 text-[10px] font-black uppercase tracking-widest text-primary ${i===6?'text-right':''}`}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {invoices.map((inv, i) => (
                        <motion.tr
                          key={inv.id}
                          initial={{ opacity:0, x:-10 }}
                          animate={{ opacity:1, x:0 }}
                          transition={{ delay: i*0.07 }}
                          onClick={() => setSelectedTrx({ id:inv.id, type:inv.type, entity:inv.customer, method:inv.method, date:inv.date, status:inv.status, amount:inv.amount, _tab:'inv' })}
                          className="border-b border-white/5 hover:bg-white/5 cursor-pointer group"
                        >
                          <td className="p-4 text-xs font-bold text-white group-hover:text-primary transition-colors">{inv.id}</td>
                          <td className="p-4 text-xs font-bold text-gray-400">{inv.type}</td>
                          <td className="p-4 text-sm font-bold text-white italic uppercase">{inv.customer}</td>
                          <td className="p-4 text-xs font-bold text-primary">{inv.method}</td>
                          <td className="p-4 text-xs font-bold text-gray-500">{inv.date}</td>
                          <td className="p-4"><StatusBadge status={inv.status}/></td>
                          <td className="p-4 text-sm font-black text-primary text-right">+${inv.amount.toLocaleString()}</td>
                        </motion.tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ── EXPENSES TAB ── */}
          {activeTab === 'Expenses' && (
            <div className="space-y-6">
              {/* Summary row */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                {[
                  { label: 'Total Spent',   val: `$${expenses.reduce((a,b)=>a+b.amount,0).toLocaleString()}`, icon: TrendingDown, color:'text-red-400' },
                  { label: 'This Month',    val: '$14,890',  icon: DollarSign, color:'text-amber-400' },
                  { label: 'Pending',       val: `${expenses.filter(e=>e.status==='Pending').length} items`, icon: Clock, color:'text-gray-400' },
                ].map((s,i) => (
                  <motion.div key={i} whileHover={{ y:-3 }} className="glass-panel p-5 border-white/5 flex items-center gap-4">
                    <div className={`p-3 rounded-xl bg-white/5 border border-white/10 ${s.color}`}><s.icon size={20}/></div>
                    <div>
                      <p className="text-[10px] text-gray-500 font-black uppercase tracking-widest">{s.label}</p>
                      <p className={`text-xl font-black ${s.color}`}>{s.val}</p>
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* Expenses table */}
              <div className="glass-panel overflow-hidden border-white/5">
                <div className="p-6 border-b border-white/5 flex justify-between items-center bg-[#111111]/60">
                  <div>
                    <h3 className="text-base font-black text-white uppercase italic tracking-tight font-serif">All Expenses</h3>
                    <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mt-0.5">{expenses.length} records found</p>
                  </div>
                  <button onClick={() => openModal('expense')} className="px-5 py-2.5 bg-primary/10 text-primary border border-primary/20 rounded-xl flex items-center gap-2 hover:bg-primary hover:text-black transition-all text-xs font-black uppercase tracking-widest">
                    <Plus size={14}/> Record Expense
                  </button>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead>
                      <tr className="bg-[#111111] border-b border-white/5">
                        {['Expense ID','Category','Vendor','Method','Date','Status','Amount'].map((h,i)=>(
                          <th key={i} className={`p-4 text-[10px] font-black uppercase tracking-widest text-primary ${i===6?'text-right':''}`}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {expenses.map((exp, i) => (
                        <motion.tr
                          key={exp.id}
                          initial={{ opacity:0, x:-10 }}
                          animate={{ opacity:1, x:0 }}
                          transition={{ delay: i*0.07 }}
                          onClick={() => setSelectedTrx({ id:exp.id, type:exp.category, entity:exp.vendor, method:exp.method, date:exp.date, status:exp.status, amount:exp.amount, _tab:'exp' })}
                          className="border-b border-white/5 hover:bg-white/5 cursor-pointer group"
                        >
                          <td className="p-4 text-xs font-bold text-white group-hover:text-primary transition-colors">{exp.id}</td>
                          <td className="p-4 text-xs font-bold text-gray-400">{exp.category}</td>
                          <td className="p-4 text-sm font-bold text-white italic uppercase">{exp.vendor}</td>
                          <td className="p-4 text-xs font-bold text-primary">{exp.method}</td>
                          <td className="p-4 text-xs font-bold text-gray-500">{exp.date}</td>
                          <td className="p-4"><StatusBadge status={exp.status}/></td>
                          <td className="p-4 text-sm font-black text-red-400 text-right">-${exp.amount.toLocaleString()}</td>
                        </motion.tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ── REPORTS TAB ── */}
          {activeTab === 'Reports' && (
            <div className="space-y-6">
              {/* Summary row */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                {[
                  { label: 'Total Reports', val: `${reports.length} generated`, icon: BarChart2,   color:'text-primary' },
                  { label: 'Total Records', val: `${reports.reduce((a,b)=>a+b.records,0)} entries`, icon: FileText,   color:'text-amber-400' },
                  { label: 'Formats',       val: 'PDF · CSV · XLSX',              icon: Download, color:'text-gray-400' },
                ].map((s,i) => (
                  <motion.div key={i} whileHover={{ y:-3 }} className="glass-panel p-5 border-white/5 flex items-center gap-4">
                    <div className={`p-3 rounded-xl bg-white/5 border border-white/10 ${s.color}`}><s.icon size={20}/></div>
                    <div>
                      <p className="text-[10px] text-gray-500 font-black uppercase tracking-widest">{s.label}</p>
                      <p className={`text-xl font-black ${s.color}`}>{s.val}</p>
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* Reports table */}
              <div className="glass-panel overflow-hidden border-white/5">
                <div className="p-6 border-b border-white/5 flex justify-between items-center bg-[#111111]/60">
                  <div>
                    <h3 className="text-base font-black text-white uppercase italic tracking-tight font-serif">Generated Reports</h3>
                    <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mt-0.5">{reports.length} reports available</p>
                  </div>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead>
                      <tr className="bg-[#111111] border-b border-white/5">
                        {['Report ID','Report Name','Generated By','Format','Date','Status','Records'].map((h,i)=>(
                          <th key={i} className={`p-4 text-[10px] font-black uppercase tracking-widest text-primary ${i===6?'text-right':''}`}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {reports.map((rep, i) => (
                        <motion.tr
                          key={rep.id}
                          initial={{ opacity:0, x:-10 }}
                          animate={{ opacity:1, x:0 }}
                          transition={{ delay: i*0.07 }}
                          className="border-b border-white/5 hover:bg-white/5 cursor-pointer group"
                          onClick={() => setSelectedTrx({ id:rep.id, type:rep.name, entity:rep.creator, method:rep.format, date:rep.date, status:rep.status, amount:rep.records, _tab:'rep' })}
                        >
                          <td className="p-4 text-xs font-bold text-white group-hover:text-primary transition-colors">{rep.id}</td>
                          <td className="p-4 text-xs font-bold text-gray-300">{rep.name}</td>
                          <td className="p-4 text-xs font-bold text-gray-400 italic">{rep.creator}</td>
                          <td className="p-4">
                            <span className="px-2 py-1 bg-white/5 border border-white/10 rounded-lg text-[9px] font-black text-gray-300 uppercase tracking-widest">{rep.format}</span>
                          </td>
                          <td className="p-4 text-xs font-bold text-gray-500">{rep.date}</td>
                          <td className="p-4"><StatusBadge status={rep.status}/></td>
                          <td className="p-4 text-sm font-black text-gray-400 text-right">{rep.records} <span className="text-[9px] font-bold">recs</span></td>
                        </motion.tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                {/* Download row */}
                <div className="p-4 bg-[#111111]/60 border-t border-white/5 flex flex-wrap gap-3">
                  {reports.map(rep => (
                    <button key={rep.id} className="flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 hover:border-primary/30 hover:text-primary text-gray-400 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all">
                      <Download size={12}/> {rep.id} · {rep.format}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

        </motion.div>
      </AnimatePresence>

      {/* ── DETAIL DRAWER ── */}
      <AnimatePresence>
        {selectedTrx && (
          <div className="fixed inset-0 z-50 flex justify-end">
            <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}
              className="absolute inset-0 bg-[#0A0A0A]/80 backdrop-blur-sm" onClick={closeModal}/>
            <motion.div initial={{ x:'100%' }} animate={{ x:0 }} exit={{ x:'100%' }}
              transition={{ type:'spring', damping:28, stiffness:280 }}
              className="relative w-full sm:w-[440px] bg-[#0A0A0A] border-l border-white/10 h-full p-8 shadow-2xl flex flex-col">
              <div className="flex justify-between items-center mb-8 pb-6 border-b border-white/5">
                <div>
                  <h3 className="text-xl font-black text-white uppercase italic tracking-tight font-serif">
                    {selectedTrx._tab === 'inv' ? 'Invoice Detail' : selectedTrx._tab === 'exp' ? 'Expense Detail' : selectedTrx._tab === 'rep' ? 'Report Detail' : 'Transaction Detail'}
                  </h3>
                  <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mt-1">{selectedTrx.id}</p>
                </div>
                <button onClick={closeModal} className="p-2 text-gray-500 hover:text-white transition-colors"><X size={20}/></button>
              </div>
              <div className="flex-1 space-y-6 overflow-y-auto pr-1">
                <div className="p-6 bg-white/5 rounded-2xl border border-white/5 text-center">
                  <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-2">
                    {selectedTrx._tab === 'rep' ? 'Total Records' : 'Amount'}
                  </p>
                  <p className={`text-4xl font-black italic ${selectedTrx._tab==='exp' ? 'text-red-400' : selectedTrx._tab==='rep' ? 'text-gray-300' : 'text-primary'}`}>
                    {selectedTrx._tab === 'exp' ? `-$${selectedTrx.amount.toLocaleString()}` : selectedTrx._tab === 'rep' ? `${selectedTrx.amount} Records` : `+$${selectedTrx.amount.toLocaleString()}`}
                  </p>
                </div>
                <div className="glass-panel p-6 border-white/5 space-y-4">
                  {[
                    { label: 'Category / Name', val: selectedTrx.type },
                    { label: selectedTrx._tab==='exp' ? 'Vendor' : selectedTrx._tab==='rep' ? 'Generated By' : 'Customer / Entity', val: selectedTrx.entity },
                    { label: selectedTrx._tab==='rep' ? 'Format' : 'Method', val: selectedTrx.method },
                    { label: 'Date', val: selectedTrx.date },
                    { label: 'Status', val: selectedTrx.status },
                  ].map((r,i) => (
                    <div key={i} className="flex justify-between items-center">
                      <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">{r.label}</span>
                      <span className="text-[10px] font-black text-white italic uppercase">{r.val}</span>
                    </div>
                  ))}
                </div>
                {selectedTrx._tab !== 'rep' && (
                  <div className="p-4 bg-primary/5 border border-primary/10 rounded-2xl">
                    <p className="text-[9px] font-black text-primary uppercase tracking-widest mb-2 italic">Verification Hash</p>
                    <p className="text-[8px] font-mono text-gray-500 break-all">HASH: 0x72a1...9b2c | NONCE: 4209 | SIG: VRTX_0912_AC7</p>
                  </div>
                )}
              </div>
              <div className="mt-6 pt-6 border-t border-white/10 flex gap-3">
                <button className="flex-1 py-4 bg-white/5 border border-white/10 text-white rounded-xl font-black uppercase tracking-[0.2em] text-[10px] hover:bg-white/10 transition-all italic flex items-center justify-center gap-2">
                  <Download size={14}/> Export
                </button>
                {selectedTrx._tab !== 'rep' && (
                  <button className="flex-1 py-4 bg-primary text-black rounded-xl font-black uppercase tracking-[0.2em] text-[10px] shadow-glow-primary hover:scale-105 transition-all italic flex items-center justify-center gap-2">
                    <Eye size={14}/> View Full
                  </button>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ── FORM MODALS ── */}
      <AnimatePresence>
        {modalType && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}
              className="absolute inset-0 bg-[#0A0A0A]/80 backdrop-blur-sm" onClick={closeModal}/>
            <motion.div initial={{ opacity:0, scale:0.95, y:20 }} animate={{ opacity:1, scale:1, y:0 }} exit={{ opacity:0, scale:0.95, y:20 }}
              className="relative w-full max-w-lg bg-[#111111] border border-white/10 rounded-3xl p-8 shadow-2xl">
              <div className="flex justify-between items-center mb-8 border-b border-white/5 pb-4">
                <div>
                  <h3 className="text-2xl font-black text-white uppercase italic tracking-tight font-serif">
                    {modalType === 'invoice' ? 'Generate Invoice' : 'Record Expense'}
                  </h3>
                  <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mt-1">Financial Entry Protocol</p>
                </div>
                <button onClick={closeModal} className="p-2 bg-white/5 rounded-xl text-gray-400 hover:text-white transition-colors"><X size={20}/></button>
              </div>
              <form onSubmit={handleFormSubmit} className="space-y-5">
                <div>
                  <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 block mb-2">
                    {modalType === 'invoice' ? 'Customer Name' : 'Vendor Name'}
                  </label>
                  <input type="text" placeholder="Enter name..." value={formEntity}
                    onChange={e => setFormEntity(e.target.value)} required
                    className="w-full bg-[#0A0A0A] border border-white/10 rounded-xl py-4 px-4 text-sm font-bold text-white focus:outline-none focus:border-primary/50 transition-all"/>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 block mb-2">Amount ($)</label>
                    <div className="relative">
                      <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 w-4 h-4"/>
                      <input type="number" placeholder="0.00" value={formAmount} onChange={e => setFormAmount(e.target.value)}
                        required step="0.01"
                        className="w-full bg-[#0A0A0A] border border-white/10 rounded-xl py-4 pl-10 pr-4 text-sm font-bold text-white focus:outline-none focus:border-primary/50 transition-all"/>
                    </div>
                  </div>
                  <div>
                    <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 block mb-2">Date</label>
                    <input type="date" value={formDate} onChange={e => setFormDate(e.target.value)} required
                      className="w-full bg-[#0A0A0A] border border-white/10 rounded-xl py-4 px-4 text-sm font-bold text-gray-400 focus:outline-none focus:border-primary/50 transition-all"/>
                  </div>
                </div>
                <div>
                  <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 block mb-2">
                    {modalType === 'invoice' ? 'Invoice Type' : 'Expense Category'}
                  </label>
                  <input type="text" placeholder={modalType==='invoice' ? 'e.g. Daily Rental, Exotics Lease' : 'e.g. Fleet Maintenance, Fuel'}
                    value={formType} onChange={e => setFormType(e.target.value)}
                    className="w-full bg-[#0A0A0A] border border-white/10 rounded-xl py-4 px-4 text-sm font-bold text-white focus:outline-none focus:border-primary/50 transition-all"/>
                </div>
                <button type="submit"
                  className="w-full py-5 rounded-2xl font-black uppercase tracking-[0.2em] text-xs flex justify-center items-center gap-3 bg-primary text-black shadow-glow-primary hover:bg-[#F3E5AB] transition-all">
                  <CheckCircle2 size={18}/> {modalType === 'invoice' ? 'Generate & Send' : 'Save Expense Record'}
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
};

export default AdminFinance;
