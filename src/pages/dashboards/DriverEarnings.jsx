import React from 'react';
import { motion } from 'framer-motion';
import { DollarSign, TrendingUp, Calendar, ArrowUpRight, Activity, Zap } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Tooltip } from 'recharts';

const earningsData = [
  { day: 'Mon', amount: 120 },
  { day: 'Tue', amount: 180 },
  { day: 'Wed', amount: 150 },
  { day: 'Thu', amount: 220 },
  { day: 'Fri', amount: 280 },
  { day: 'Sat', amount: 310 },
  { day: 'Sun', amount: 250 },
];

const DriverEarnings = () => {
  return (
    <div className="w-full space-y-6 pb-24">
      {/* Header */}
      <div className="flex justify-between items-end px-2 mb-6">
        <div>
          <h2 className="text-3xl font-black tracking-tighter text-white uppercase italic font-serif">
            Ledger <span className="text-primary not-italic font-serif">Access</span>
          </h2>
          <p className="text-[10px] text-gray-500 font-bold uppercase tracking-[0.2em] mt-1">Financial Overview</p>
        </div>
        <div className="w-12 h-12 bg-white/5 border border-white/10 rounded-2xl flex items-center justify-center text-highlight shadow-glow-accent">
          <DollarSign size={24} />
        </div>
      </div>

      {/* Main KPI */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-panel p-8 border-highlight/30 bg-highlight/5 relative overflow-hidden"
      >
        <div className="absolute top-0 right-0 w-48 h-48 bg-highlight/10 rounded-full blur-3xl -z-10"></div>
        <div className="flex justify-between items-start mb-6">
          <div>
            <p className="text-[10px] font-black uppercase tracking-widest text-highlight mb-2">Available Balance</p>
            <h3 className="text-5xl font-black text-white tracking-tighter">$1,510.50</h3>
          </div>
          <span className="flex items-center gap-1 text-xs font-bold px-3 py-1.5 rounded-lg bg-accent/10 text-accent border border-accent/20">
            <ArrowUpRight size={14} /> 12%
          </span>
        </div>
        
        <button className="w-full py-4 bg-highlight text-black font-black uppercase tracking-widest rounded-xl shadow-[0_0_20px_rgba(253,186,116,0.3)] hover:scale-105 transition-transform text-xs">
          Initiate Payout
        </button>
      </motion.div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-4">
        <div className="glass-panel p-5 border-white/5 flex flex-col items-center justify-center text-center gap-2">
          <Activity size={20} className="text-accent" />
          <div>
            <p className="text-[10px] font-black uppercase tracking-widest text-gray-500 mb-1">Trips</p>
            <p className="text-2xl font-black text-white">42</p>
          </div>
        </div>
        <div className="glass-panel p-5 border-white/5 flex flex-col items-center justify-center text-center gap-2">
          <Zap size={20} className="text-primary" />
          <div>
            <p className="text-[10px] font-black uppercase tracking-widest text-gray-500 mb-1">Online Time</p>
            <p className="text-2xl font-black text-white">38h</p>
          </div>
        </div>
      </div>

      {/* Chart */}
      <div className="glass-panel p-6 border-white/5">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-sm font-black text-white uppercase tracking-widest flex items-center gap-2 font-serif">
            <TrendingUp size={16} className="text-highlight" /> 7-Day Trajectory
          </h3>
          <Calendar size={16} className="text-gray-500" />
        </div>
        
        <div className="h-48">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={earningsData}>
              <defs>
                <linearGradient id="colorAmount" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#FDBA74" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#FDBA74" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <XAxis dataKey="day" stroke="#6B7280" fontSize={10} tickLine={false} axisLine={false} />
              <YAxis hide />
              <Tooltip 
                contentStyle={{ backgroundColor: '#111111', border: '1px solid rgba(253,186,116,0.2)', borderRadius: '12px' }}
                itemStyle={{ color: '#FDBA74', fontWeight: 'bold' }}
              />
              <Area type="monotone" dataKey="amount" stroke="#FDBA74" strokeWidth={3} fill="url(#colorAmount)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
      
      {/* Recent Activity */}
      <div className="space-y-4">
         <h3 className="text-xs font-black uppercase tracking-[0.3em] text-gray-600 px-2 italic mt-4">Recent Deposits</h3>
         {[
           { id: 'PAY-102', amount: '+$42.50', desc: 'Airport Transfer', time: 'Today, 14:30' },
           { id: 'PAY-101', amount: '+$85.00', desc: 'VIP Concierge', time: 'Yesterday' },
           { id: 'PAY-100', amount: '+$24.00', desc: 'Standard Pickup', time: 'May 12' },
         ].map(tx => (
            <div key={tx.id} className="glass-panel p-5 flex items-center justify-between border-white/5">
               <div>
                  <h4 className="text-sm font-bold text-white tracking-tight">{tx.desc}</h4>
                  <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">{tx.time}</p>
               </div>
               <span className="text-highlight font-black">{tx.amount}</span>
            </div>
         ))}
      </div>
    </div>
  );
};

export default DriverEarnings;
