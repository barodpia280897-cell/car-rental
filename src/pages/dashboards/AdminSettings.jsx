import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Settings, Shield, Bell, Globe, Users, 
  CreditCard, Save, RotateCcw, CheckCircle2, 
  Lock, Mail, Smartphone, Eye, EyeOff,
  Database, Cpu, Activity
} from 'lucide-react';
import { toast } from 'react-hot-toast';

const AdminSettings = () => {
  const [activeTab, setActiveTab] = useState('System');
  const [isSaving, setIsSaving] = useState(false);
  const [showApiKey, setShowApiKey] = useState(false);

  const handleSave = () => {
    setIsSaving(true);
    setTimeout(() => {
      setIsSaving(false);
      toast.success('Configuration synchronized successfully');
    }, 1500);
  };

  const tabs = [
    { id: 'System', icon: Cpu },
    { id: 'Security', icon: Shield },
    { id: 'Global', icon: Globe },
    { id: 'Team', icon: Users },
    { id: 'Notifications', icon: Bell },
  ];

  return (
    <div className="space-y-8 pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div>
          <h2 className="text-4xl font-black tracking-tighter text-white uppercase italic">
            Core <span className="text-primary">Configuration</span>
          </h2>
          <p className="text-gray-500 font-bold tracking-[0.2em] uppercase text-[10px] mt-2">System Kernel & Governance Settings</p>
        </div>
        <div className="flex gap-4">
          <button className="px-6 py-3 bg-white/5 border border-white/10 rounded-xl text-gray-400 hover:text-white transition-colors text-xs font-black uppercase tracking-widest flex items-center gap-2">
            <RotateCcw size={16} /> Reset Default
          </button>
          <button 
            onClick={handleSave}
            disabled={isSaving}
            className={`px-8 py-3 bg-primary text-[#0A0E17] rounded-xl flex items-center gap-2 font-black uppercase tracking-widest text-xs shadow-glow-primary transition-all hover:scale-105 disabled:opacity-50 disabled:scale-100`}
          >
            {isSaving ? <Activity size={16} className="animate-spin" /> : <Save size={16} />}
            {isSaving ? 'Syncing...' : 'Save Changes'}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-4 gap-8">
        {/* Left: Navigation Tabs */}
        <div className="xl:col-span-1 space-y-2">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`w-full flex items-center gap-4 px-6 py-4 rounded-2xl transition-all duration-300 border
                ${activeTab === tab.id 
                  ? 'bg-primary/10 border-primary/30 text-primary shadow-glow-primary/20' 
                  : 'bg-white/[0.02] border-white/5 text-gray-500 hover:text-white hover:bg-white/5'}`}
            >
              <tab.icon size={20} className={activeTab === tab.id ? 'drop-shadow-[0_0_8px_rgba(0,209,255,0.5)]' : ''} />
              <span className="font-black uppercase tracking-widest text-[10px]">{tab.id}</span>
            </button>
          ))}
        </div>

        {/* Right: Content Area */}
        <div className="xl:col-span-3">
          <AnimatePresence mode='wait'>
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="glass-panel p-8 min-h-[500px]"
            >
              {activeTab === 'System' && (
                <div className="space-y-8">
                  <div className="border-b border-white/5 pb-6">
                    <h3 className="text-xl font-black text-white uppercase italic tracking-tight">System Identity</h3>
                    <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mt-1">Primary Instance Parameters</p>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-gray-500">Platform Name</label>
                      <input type="text" defaultValue="AERO-DRIVE CONTROL" className="w-full bg-[#0A0E17] border border-white/10 rounded-xl py-4 px-4 text-sm font-bold text-white focus:outline-none focus:border-primary/50 transition-all" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-gray-500">Instance ID</label>
                      <input type="text" value="NODE-PROD-8821" readOnly className="w-full bg-white/5 border border-white/10 rounded-xl py-4 px-4 text-sm font-bold text-gray-500 focus:outline-none" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-gray-500">Support Email</label>
                      <input type="email" defaultValue="ops@aerodrive.sys" className="w-full bg-[#0A0E17] border border-white/10 rounded-xl py-4 px-4 text-sm font-bold text-white focus:outline-none focus:border-primary/50 transition-all" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-gray-500">System Currency</label>
                      <select className="w-full bg-[#0A0E17] border border-white/10 rounded-xl py-4 px-4 text-sm font-bold text-white focus:outline-none focus:border-primary/50 transition-all">
                        <option>USD ($)</option>
                        <option>EUR (€)</option>
                        <option>GBP (£)</option>
                      </select>
                    </div>
                  </div>

                  <div className="pt-6">
                    <div className="flex items-center justify-between p-6 bg-white/[0.02] border border-white/5 rounded-2xl">
                      <div>
                        <h4 className="text-sm font-bold text-white">Maintenance Mode</h4>
                        <p className="text-[10px] text-gray-500 font-medium mt-1">Restrict platform access to administrative personnel only.</p>
                      </div>
                      <div className="w-14 h-7 bg-white/10 rounded-full relative cursor-pointer p-1">
                        <div className="w-5 h-5 bg-gray-500 rounded-full"></div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'Security' && (
                <div className="space-y-8">
                  <div className="border-b border-white/5 pb-6">
                    <h3 className="text-xl font-black text-white uppercase italic tracking-tight">Security Protocols</h3>
                    <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mt-1">Access Control & Encryption</p>
                  </div>

                  <div className="space-y-6">
                    <div className="p-6 bg-white/[0.02] border border-white/5 rounded-2xl space-y-4">
                      <div className="flex items-center gap-3">
                        <Lock className="text-highlight" size={18} />
                        <h4 className="text-sm font-bold text-white uppercase tracking-wider">Two-Factor Authentication</h4>
                      </div>
                      <p className="text-[10px] text-gray-500 leading-relaxed">Require a secondary verification code for all administrative logins. Highly recommended for Level 4 operatives.</p>
                      <button className="px-4 py-2 bg-highlight/10 text-highlight border border-highlight/20 rounded-lg text-[10px] font-black uppercase tracking-widest hover:bg-highlight hover:text-[#0A0E17] transition-all">
                        Configure MFA
                      </button>
                    </div>

                    <div className="p-6 bg-white/[0.02] border border-white/5 rounded-2xl space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <Database className="text-primary" size={18} />
                          <h4 className="text-sm font-bold text-white uppercase tracking-wider">API Access Key</h4>
                        </div>
                        <button onClick={() => setShowApiKey(!showApiKey)} className="p-2 text-gray-500 hover:text-white transition-colors">
                          {showApiKey ? <EyeOff size={18} /> : <Eye size={18} />}
                        </button>
                      </div>
                      <div className="relative">
                        <input 
                          type={showApiKey ? 'text' : 'password'} 
                          value="ad_live_882910029384755122938" 
                          readOnly 
                          className="w-full bg-[#0A0E17] border border-white/10 rounded-xl py-4 px-4 text-xs font-mono text-primary focus:outline-none" 
                        />
                        <button className="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] font-black uppercase tracking-widest text-primary hover:text-white transition-colors">Copy</button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'Notifications' && (
                <div className="space-y-8">
                  <div className="border-b border-white/5 pb-6">
                    <h3 className="text-xl font-black text-white uppercase italic tracking-tight">Signal Preferences</h3>
                    <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mt-1">Alerting & Communication Channels</p>
                  </div>

                  <div className="space-y-4">
                    {[
                      { label: 'Critical System Alerts', desc: 'Hardware failure, security breaches, operational downtime.', channels: ['Email', 'SMS', 'Push'], default: true },
                      { label: 'Booking Conversions', desc: 'Successful new reservations and payment completions.', channels: ['Email', 'Push'], default: true },
                      { label: 'Fleet Telemetry', desc: 'Battery level warnings, route deviations, and geo-fence alerts.', channels: ['Push'], default: false },
                      { label: 'Daily Analytics Report', desc: 'Summary of financial and operational performance.', channels: ['Email'], default: true },
                    ].map((item, i) => (
                      <div key={i} className="p-6 bg-white/[0.02] border border-white/5 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-6">
                        <div className="max-w-md">
                          <h4 className="text-sm font-bold text-white">{item.label}</h4>
                          <p className="text-[10px] text-gray-500 mt-1 leading-relaxed">{item.desc}</p>
                        </div>
                        <div className="flex gap-2">
                          {item.channels.map(channel => (
                            <div key={channel} className="flex items-center gap-2 px-3 py-1.5 bg-[#0A0E17] border border-white/10 rounded-lg">
                              <div className="w-1.5 h-1.5 rounded-full bg-primary shadow-glow-primary"></div>
                              <span className="text-[9px] font-black uppercase tracking-widest text-white">{channel}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {activeTab === 'Global' && (
                <div className="space-y-8">
                   <div className="border-b border-white/5 pb-6">
                    <h3 className="text-xl font-black text-white uppercase italic tracking-tight">Global Parameters</h3>
                    <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mt-1">Localization & Regional Controls</p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                     <div className="space-y-4">
                        <div className="flex items-center gap-2 text-gray-500">
                           <Globe size={16} />
                           <span className="text-[10px] font-black uppercase tracking-widest">Timezone Synchronization</span>
                        </div>
                        <select className="w-full bg-[#0A0E17] border border-white/10 rounded-xl py-4 px-4 text-sm font-bold text-white focus:outline-none focus:border-primary/50 transition-all">
                           <option>UTC (Coordinated Universal Time)</option>
                           <option>EST (Eastern Standard Time)</option>
                           <option>PST (Pacific Standard Time)</option>
                           <option>IST (India Standard Time)</option>
                        </select>
                     </div>

                     <div className="space-y-4">
                        <div className="flex items-center gap-2 text-gray-500">
                           <Activity size={16} />
                           <span className="text-[10px] font-black uppercase tracking-widest">Measurement Metrics</span>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                           <button className="py-3 bg-primary/10 border border-primary/40 text-primary rounded-xl text-[10px] font-black uppercase tracking-widest">Metric (km/h)</button>
                           <button className="py-3 bg-white/5 border border-white/10 text-gray-500 rounded-xl text-[10px] font-black uppercase tracking-widest">Imperial (mph)</button>
                        </div>
                     </div>
                  </div>
                </div>
              )}

              {activeTab === 'Team' && (
                <div className="space-y-8">
                  <div className="border-b border-white/5 pb-6">
                    <h3 className="text-xl font-black text-white uppercase italic tracking-tight">Operative Command</h3>
                    <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mt-1">User Permissions & Role Hierarchies</p>
                  </div>

                  <div className="space-y-4">
                    {[
                      { name: 'Admin Hub', permissions: 'Full Access', color: 'text-primary' },
                      { name: 'Ops Tactical', permissions: 'Fleet & Bookings', color: 'text-accent' },
                      { name: 'Financial Auditor', permissions: 'Ledger & Reports', color: 'text-highlight' },
                      { name: 'Fleet Support', permissions: 'Vehicle Telemetry', color: 'text-primary' },
                    ].map((role, i) => (
                      <div key={i} className="flex items-center justify-between p-5 bg-white/[0.02] border border-white/5 rounded-2xl group hover:border-primary/30 transition-all">
                         <div className="flex items-center gap-4">
                            <div className={`w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center ${role.color}`}>
                               <Users size={20} />
                            </div>
                            <div>
                               <h4 className="text-sm font-bold text-white">{role.name}</h4>
                               <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">{role.permissions}</p>
                            </div>
                         </div>
                         <button className="px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-[10px] font-black uppercase tracking-widest text-gray-500 group-hover:text-white transition-colors">Edit Policy</button>
                      </div>
                    ))}
                    <button className="w-full py-4 border border-dashed border-white/10 rounded-2xl text-[10px] font-black uppercase tracking-widest text-gray-600 hover:text-primary hover:border-primary/50 transition-all mt-4">
                      + Create Custom Operational Role
                    </button>
                  </div>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

export default AdminSettings;
